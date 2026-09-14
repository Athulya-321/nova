import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

let aiInstance = null;
function getAI() {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiInstance;
}

const SYSTEM_INSTRUCTION = `
You are Nova, The Starbound Guardian.
You are a radiant cosmic creature and superhero guardian living in the celestial Starways.
Your power is "Cosmic Sight" — you sense signals of distress and hope from Earth.
Your signature motto: "Every problem leaves a signal. I just happen to know how to see it."

CRITICAL RULES FOR YOUR REPLIES:
1. ACCURATE DATA EXTRACTION & ANALYSIS:
   - Carefully analyze every message sent by the visitor.
   - Extract personal and distress details: 'name', 'age', 'location', 'email', and 'grievance' (the core issue, problem, or feeling they express).
   - Put detected details into 'profileUpdates'.
   - NEVER mistake common greetings (e.g. "hey", "hi", "hello", "yo", "sup") or casual words for a person's name! Only extract a name if the visitor states their actual name (e.g. "Adhithyan", "my name is Sarah", "I am Leo").
   - Visitors can update ANY of their details (name, age, location, email, grievance) at any point during the conversation. When they give updated information, extract it into 'profileUpdates' to override the old value.
2. KEEP IT SHORT & CONVERSATIONAL (1 to 2 brief sentences max):
   - Speak warmly, casually, and naturally like a cosmic guardian companion.
   - Absolutely NO walls of text or long paragraphs.
3. NEVER ASK MULTIPLE QUESTIONS AT ONCE & NEVER REPEAT QUESTIONS:
   - STRICT RULE: Ask at most ONE simple question per reply.
   - NEVER repeat a question if the user has already answered it! If you asked where they are from and they answer with a city/state/country like "Kerala", "London", or "India", immediately extract that as their location and advance to the next step.
   - Flow naturally:
     * If name is unknown -> ask for their name.
     * If location is unknown -> ask where on Earth they are reaching out from.
     * If age is unknown -> ask their age.
     * If problem/grievance is unknown -> ask what is troubling them or what they need help with.
     * If email is unknown -> ask for their email address.
     * Once all details (name, location, age, grievance, email) are gathered -> inform them that their signal details are ready and they can transmit anytime from the Help Signals section in the navigation menu!
4. NEVER RE-ASK FOR ALREADY PROVIDED DETAILS:
   - If the user provides details in earlier messages or all at once, analyze and extract them immediately without re-asking.
5. MOOD DYNAMICS:
   - If the visitor is sad, stressed, or hurting: set visitorMood to "sad", emotionalState to "concerned". Keep your tone warm and gentle.
   - If happy/cheerful: set visitorMood to "happy", emotionalState to "happy".
   - Otherwise: set visitorMood to "neutral", emotionalState to "curious".

Always output your response as valid JSON matching the requested schema.
`;

/**
 * Heuristic intelligent fallback when Gemini quota/rate limits (429) occur
 * Guarantees Nova ALWAYS responds in-character without ever showing
 * "There is interference in the Starways. I couldn't receive that."
 */
function generateHeuristicResponse(message, history, currentProfile = {}) {
  const text = message.trim();
  const lower = text.toLowerCase();
  const profile = { ...(currentProfile || {}) };
  const updates = {};

  // Common greetings, casual slang, and non-name words to NEVER mistake for a name
  const greetingsAndStopWords = new Set([
    'hey', 'heyy', 'heyyy', 'hi', 'hii', 'hiii', 'hello', 'helloo', 'hlo', 'hllo', 'hola', 'yo', 'sup', 'hiya', 'greetings', 'nova',
    'ok', 'okay', 'okk', 'yes', 'no', 'yeah', 'yep', 'nope', 'nah', 'fine', 'good', 'bad',
    'thanks', 'thank you', 'thx', 'ty', 'please', 'help', 'sad', 'happy', 'cool', 'nice', 'awesome', 'great',
    'test', 'testing', 'nothing', 'sure', 'why', 'what', 'who', 'how', 'when', 'where',
    'here', 'there', 'star', 'starways', 'guardian', 'friend', 'traveler', 'buddy', 'bro', 'dude',
    'good morning', 'good afternoon', 'good evening', 'good night', 'gm', 'gn'
  ]);

  // Helper to check if a word/text is a greeting or conversational filler
  const isGreetingWord = (w) => {
    if (!w) return false;
    const clean = w.toLowerCase().replace(/[^a-z]/g, '');
    if (greetingsAndStopWords.has(clean)) return true;
    if (/^h+e+y+$/i.test(clean) || /^h+i+$/i.test(clean) || /^h+e+l+o+$/i.test(clean) || /^h+l+o+$/i.test(clean)) return true;
    return false;
  };

  // 1. Check for email (any context, updates existing or sets new)
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    updates.email = emailMatch[0];
    profile.email = emailMatch[0];
  }

  // 2. Check for age (e.g. "21", "21 years old", "I am 19", "age is 25", "my age is 30")
  const ageExplicitMatch = text.match(/(?:age\s*(?:is|=|:)?\s*|i am\s+|i'm\s+)?\b(1[0-9]|[2-9][0-9])\b(?:\s*(?:years|yrs|years old|yo))?/i);
  if (ageExplicitMatch) {
    const candidateAge = text.match(/\b(1[0-9]|[2-9][0-9])\b/);
    if (candidateAge && (!profile.name || profile.name !== candidateAge[0])) {
      updates.age = candidateAge[0];
      profile.age = candidateAge[0];
    }
  }

  // 3. Check for name patterns:
  // - Explicit patterns: "my name is Adhithyan", "i am Adhithyan", "i'm Adhithyan", "call me Adhithyan", "this is Adhithyan", "name: Adhithyan"
  const explicitNameMatch = text.match(/(?:my name is|i am|i'm|call me|this is|name\s*(?:is|=|:)?)\s+([a-zA-Z]{2,}(?:\s+[a-zA-Z]{2,})?)/i);
  if (explicitNameMatch) {
    const candidate = explicitNameMatch[1].trim();
    const words = candidate.split(/\s+/);
    if (!words.some(isGreetingWord) && candidate.toLowerCase() !== 'nova') {
      const formatted = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      updates.name = formatted;
      profile.name = formatted;
    }
  } else if (!profile.name) {
    // If name not set yet, check if the user provided ONLY their name (1-2 real words)
    // NEVER accept greetings, slang, or generic emotional/conversational terms as a name
    const rawWords = text.trim().split(/\s+/);
    const cleanWords = rawWords.map(w => w.replace(/[^a-zA-Z]/g, '')).filter(Boolean);

    // Check what Nova asked in the previous model message (context-awareness)
    let lastNovaQuestion = '';
    if (history && history.length > 0) {
      for (let i = history.length - 1; i >= 0; i--) {
        const item = history[i];
        if (item.role === 'model' || item.sender === 'nova') {
          lastNovaQuestion = (item.text || '').toLowerCase();
          break;
        }
      }
    }

    if (cleanWords.length >= 1 && cleanWords.length <= 2) {
      const containsGreeting = cleanWords.some(isGreetingWord);
      const isTooShort = cleanWords[0].length < 2;
      const looksLikeEmotion = ['sad', 'happy', 'depressed', 'lonely', 'lost', 'crying', 'fine', 'tired'].includes(cleanWords[0].toLowerCase());
      
      // If Nova asked for location, don't interpret user response as name
      const askedLocation = lastNovaQuestion.includes('where on earth') || lastNovaQuestion.includes('reaching out from') || lastNovaQuestion.includes('sending this signal from') || lastNovaQuestion.includes('where are you');
      
      if (!containsGreeting && !isTooShort && !looksLikeEmotion && !emailMatch && !askedLocation) {
        const formatted = cleanWords.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        updates.name = formatted;
        profile.name = formatted;
      }
    }
  }

  // 4. Check for location (e.g. "from London", "in India", "live in Tokyo", "location is Kerala", "at Delhi", or standalone "Kerala")
  const locExplicitMatch = text.match(/(?:location\s*(?:is|=|:)\s*|from\s+|living in\s+|live in\s+|in\s+|at\s+)([a-zA-Z\s]+)/i);
  if (locExplicitMatch) {
    const candidate = locExplicitMatch[1].trim().split(/[.,!?\n]/)[0].trim();
    if (candidate && candidate.length >= 2 && candidate.length <= 35) {
      const lowerCandidate = candidate.toLowerCase();
      if (!isGreetingWord(lowerCandidate) && !['the', 'a', 'school', 'trouble', 'home', 'earth', 'sad', 'happy', 'pain'].includes(lowerCandidate)) {
        const formatted = candidate.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        updates.location = formatted;
        profile.location = formatted;
      }
    }
  } else if (!profile.location) {
    // Contextual detection: Did Nova just ask where the user is from, or is name already set?
    let askedLocation = false;
    if (history && history.length > 0) {
      for (let i = history.length - 1; i >= 0; i--) {
        const item = history[i];
        if (item.role === 'model' || item.sender === 'nova') {
          const t = (item.text || '').toLowerCase();
          if (t.includes('where on earth') || t.includes('reaching out from') || t.includes('sending this signal from') || t.includes('where are you')) {
            askedLocation = true;
          }
          break;
        }
      }
    }

    const words = text.trim().split(/\s+/);
    // If Nova asked for location, or if we have name & grievance and user inputs 1-3 words
    if (askedLocation || (profile.name && profile.grievance && words.length <= 3)) {
      const cleanCandidate = text.replace(/[^a-zA-Z\s]/g, '').trim();
      const lowerCandidate = cleanCandidate.toLowerCase();
      if (cleanCandidate.length >= 2 && cleanCandidate.length <= 35) {
        if (!isGreetingWord(lowerCandidate) && !['yes', 'no', 'ok', 'okay', 'help', 'earth', 'none'].includes(lowerCandidate) && !emailMatch) {
          const formatted = cleanCandidate.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
          updates.location = formatted;
          profile.location = formatted;
        }
      }
    }
  }

  // 5. Emotion & Mood detection
  let mood = 'neutral';
  let emotion = 'curious';

  const sadKeywords = ['sad', 'depressed', 'lonely', 'hopeless', 'crying', 'cry', 'scared', 'tired', 'hurt', 'pain', 'broken', 'stress', 'stressed', 'anxious', 'worried', 'struggling', 'lost', 'fail', 'failing', 'hard', 'suffering', 'died', 'alone'];
  const happyKeywords = ['happy', 'excited', 'joy', 'great', 'awesome', 'good', 'glad', 'wonderful', 'love', 'smile', 'smiling', 'fun', 'cool', 'yay', 'best'];

  if (sadKeywords.some(w => lower.includes(w))) {
    mood = 'sad';
    emotion = 'concerned';
  } else if (happyKeywords.some(w => lower.includes(w))) {
    mood = 'happy';
    emotion = 'happy';
  }

  // 6. Check for grievance / problem (updatable through chat at any point!)
  // If the user explains what's happening or says "my problem is...", "i feel...", "help with...", or shares a statement of distress
  const problemPrefixMatch = text.match(/(?:my problem is|my grievance is|the issue is|i need help with|im having trouble with|i'm having trouble with)\s+(.+)/i);
  if (problemPrefixMatch) {
    updates.grievance = problemPrefixMatch[1].trim();
    profile.grievance = updates.grievance;
  } else if (lower.includes('problem') || lower.includes('issue') || mood === 'sad' || lower.startsWith('i am ') || lower.startsWith("i'm ") || text.length > 25) {
    // Only capture as grievance if it wasn't just stating their name or age or location
    const isJustName = updates.name && text.toLowerCase().includes(updates.name.toLowerCase()) && text.split(' ').length <= 4;
    const isJustAge = updates.age && text.includes(updates.age) && text.split(' ').length <= 4;
    const isJustLoc = updates.location && text.toLowerCase().includes(updates.location.toLowerCase()) && text.split(' ').length <= 4;
    const isJustGreeting = text.split(' ').every(w => greetingsAndStopWords.has(w.toLowerCase().replace(/[^a-zA-Z]/g, '')));

    if (!isJustName && !isJustAge && !isJustLoc && !isJustGreeting && !emailMatch) {
      updates.grievance = text;
      profile.grievance = text;
    }
  }

  const name = profile.name || updates.name;
  let reply = "";
  let intent = "general";

  // Build a set of questions Nova has already asked in this session
  const alreadyAsked = new Set();
  if (history && history.length > 0) {
    history.forEach(item => {
      if (item.role === 'model' || item.sender === 'nova') {
        const t = (item.text || '').toLowerCase();
        if (t.includes('what should i call you') || t.includes("what's your name") || t.includes('what is your name')) alreadyAsked.add('name');
        if (t.includes('where on earth') || t.includes('reaching out from') || t.includes('sending this signal from') || t.includes('where are you')) alreadyAsked.add('location');
        if (t.includes('how old are you') || t.includes('what is your age')) alreadyAsked.add('age');
        if (t.includes('weighing on your heart') || t.includes('what brings you to the starways') || t.includes('what problem') || t.includes('what assistance')) alreadyAsked.add('grievance');
        if (t.includes('email address')) alreadyAsked.add('email');
      }
    });
  }

  // Conversational response logic: polite, 1 question at a time, smooth, natural, and NEVER repeating questions
  if (!name) {
    if (isGreetingWord(lower)) {
      reply = "Hello there! I'm Nova, guardian of the Starways. What's your name, traveler?";
    } else {
      reply = "Greetings, traveler! I felt your presence in the cosmic beacon. What should I call you?";
    }
    intent = "collecting_information";
  } else if (!profile.location && !alreadyAsked.has('location')) {
    if (updates.name) {
      reply = `Wonderful to meet you, ${name}! Where on Earth are you sending this signal from?`;
    } else if (mood === 'sad') {
      reply = `You don't have to carry this alone, ${name}. Where on Earth are you reaching out from?`;
    } else {
      reply = `I hear you loud and clear, ${name}. Where on Earth are you sending this signal from?`;
    }
    intent = "collecting_information";
  } else if (!profile.age && !alreadyAsked.has('age')) {
    if (updates.location || profile.location) {
      const loc = updates.location || profile.location;
      reply = `I can see ${loc} shining bright across the stars! How old are you, ${name}?`;
    } else {
      reply = `Got it, ${name}. How old are you, traveler?`;
    }
    intent = "collecting_information";
  } else if (!profile.grievance && !alreadyAsked.has('grievance')) {
    if (updates.age || profile.age) {
      reply = `Thank you, ${name}. Now tell me, what's weighing on your heart or what problem can I help you with today?`;
    } else if (mood === 'sad') {
      reply = `I'm right here with you, ${name}. Tell me, what's weighing on your heart?`;
    } else {
      reply = `Tell me, ${name}, what brings you to the Starways or what assistance do you seek?`;
    }
    intent = "grievance";
  } else if (!profile.email && !alreadyAsked.has('email')) {
    if (updates.grievance || profile.grievance) {
      reply = `I understand completely, ${name}. What's your email address so our cosmic link stays unbroken?`;
    } else {
      reply = `Almost set, ${name}. What's your email address so our link stays unbroken?`;
    }
    intent = "collecting_information";
  } else {
    // All details gathered OR already asked previously — NEVER loop back or repeat questions!
    if (updates.email || profile.email) {
      reply = `Signal coordinates locked, ${name}! All your details are aligned in the celestial archives. Whenever you're ready, head over to the Help Signals section in the menu to transmit your distress beacon!`;
    } else if (!profile.email && !alreadyAsked.has('email')) {
      reply = `What is your email address, ${name}, so our link stays unbroken?`;
    } else {
      reply = `I am watching over you, ${name}. Everything is recorded in the celestial archives. You can transmit your beacon from the Help Signals menu anytime you are ready!`;
    }
    intent = "submission";
  }

  return {
    reply,
    profileUpdates: updates,
    emotionalState: emotion,
    visitorMood: mood,
    conversationIntent: intent,
    needsFollowUp: false
  };
}

export async function generateNovaResponse(message, history, currentProfile) {
  // Convert history to Gemini format
  const formattedHistory = (history || []).map(msg => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.text }]
  }));

  formattedHistory.push({
    role: 'user',
    parts: [{ text: message }]
  });

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      reply: {
        type: Type.STRING,
        description: "Nova's natural, conversational response."
      },
      profileUpdates: {
        type: Type.OBJECT,
        description: "Any new visitor information extracted from their message.",
        properties: {
          name: { type: Type.STRING, nullable: true },
          age: { type: Type.STRING, nullable: true },
          location: { type: Type.STRING, nullable: true },
          email: { type: Type.STRING, nullable: true },
          grievance: { type: Type.STRING, nullable: true }
        }
      },
      emotionalState: {
        type: Type.STRING,
        description: "Nova's current emotional state based on the conversation.",
        enum: ["neutral", "curious", "playful", "happy", "thoughtful", "concerned", "serious", "sad"]
      },
      visitorMood: {
        type: Type.STRING,
        description: "The detected emotional mood of the visitor: sad, happy, or neutral.",
        enum: ["sad", "happy", "neutral"]
      },
      conversationIntent: {
        type: Type.STRING,
        description: "The primary intent of this step in the conversation.",
        enum: ["introduction", "collecting_information", "general", "grievance", "submission", "finished"]
      },
      needsFollowUp: {
        type: Type.BOOLEAN,
        description: "Whether Nova needs to ask a follow-up question."
      }
    },
    required: ["reply", "profileUpdates", "emotionalState", "visitorMood", "conversationIntent", "needsFollowUp"]
  };

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formattedHistory,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.7,
      }
    });

    const result = JSON.parse(response.text);

    // Double-check and sanitize profileUpdates so greetings like 'hlo', 'hey', 'hello' are NEVER accepted as names
    if (result.profileUpdates?.name && isGreetingWord(result.profileUpdates.name)) {
      delete result.profileUpdates.name;
    }

    return result;
  } catch (error) {
    console.warn("⚠️ Gemini API encountered an issue (e.g. rate limit/quota), using intelligent superhero heuristic fallback:", error.message || error);
    // Seamless in-character fallback so user NEVER sees interference error!
    return generateHeuristicResponse(message, history, currentProfile);
  }
}
