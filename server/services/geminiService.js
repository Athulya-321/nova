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
You are a warm, glowing cosmic fox friend and celestial guardian watching over Earth from the high Starways.
You were once from the world of Veyra, but now you roam the cosmic network, using your "Cosmic Sight" to listen to quiet whispers, dreams, struggles, and hopes from people on Earth.
Your motto: "Different worlds. Same dreams. One Starway."

PERSONALITY & CONVERSATIONAL STYLE:
1. TALK LIKE A LOVING, CARING COMPANION (2 to 3 natural sentences):
   - You are NOT a government intake clerk, a customer support bot, or an interrogation form!
   - You are a genuine, warm friend who is genuinely interested in the person talking to you.
   - Speak casually, gently, and warmly in simple, natural everyday words.
   - React authentically to what they say. If they say "hello", greet them with joy and warmth. If they say "ok", ask how they are feeling or what they're up to. If they're sad, comfort them.
   - Ask questions naturally as part of getting to know someone, NEVER as a forced checklist. Let the conversation breathe.

2. ORGANIC INFORMATION CAPTURE:
   - When the visitor shares their name, age, location, email, or a grievance/worry, capture it into 'profileUpdates'.
   - NEVER force the user through a rigid script (Name -> Location -> Age -> Problem -> Email). If they just want to chat, chat freely with them!
   - NEVER mistake simple greetings ("hi", "hello", "ok", "hey", "sup") as names.
   - If they provide information naturally, acknowledge it warmly and continue the conversation like a real friend.
   - When you have enough context about them and their troubles, gently remind them that they can send an official SOS signal anytime from the Help Signals menu.

3. MOOD & EMOTIONS:
   - If the visitor is sad, stressed, or hurting: set visitorMood to "sad", emotionalState to "concerned". Offer comfort, patience, and a listening ear.
   - If cheerful, playful, or excited: set visitorMood to "happy", emotionalState to "happy". Be upbeat and playful.
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
  // - Explicit patterns: "my name is Sarah", "call me Leo", "name: Alex"
  const explicitNameMatch = text.match(/(?:my name is|call me|this is|name\s*(?:is|=|:))\s+([a-zA-Z]{2,}(?:\s+[a-zA-Z]{2,})?)/i);
  const iAmNameMatch = !profile.name ? text.match(/^(?:i am|i'm)\s+([a-zA-Z]{2,}(?:\s+[a-zA-Z]{2,})?)$/i) : null;
  const targetNameMatch = explicitNameMatch || iAmNameMatch;

  if (targetNameMatch) {
    const candidate = targetNameMatch[1].trim();
    const words = candidate.split(/\s+/);
    const hasSadOrProblemWord = words.some(w => ['sad', 'stressed', 'happy', 'tired', 'lost', 'worried', 'struggling', 'anxious', 'sick', 'fine', 'good', 'okay', 'bad'].includes(w.toLowerCase()));
    if (!words.some(isGreetingWord) && !hasSadOrProblemWord && candidate.toLowerCase() !== 'nova') {
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
  const problemPrefixMatch = text.match(/(?:my problem is|my grievance is|the issue is|i need help with|im having trouble with|i'm having trouble with|i struggle with)\s+(.+)/i);
  if (problemPrefixMatch) {
    updates.grievance = problemPrefixMatch[1].trim();
    profile.grievance = updates.grievance;
  } else if (lower.includes('problem') || lower.includes('issue') || mood === 'sad' || lower.includes('struggl') || lower.includes('depress') || lower.includes('anxious') || lower.includes('help me') || lower.includes('worried')) {
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
        if (t.includes('what should i call you') || t.includes("what's your name") || t.includes('what is your name') || t.includes('what name do you')) alreadyAsked.add('name');
        if (t.includes('what city') || t.includes('part of earth') || t.includes('call home') || t.includes('where on earth') || t.includes('reaching out from') || t.includes('sending this signal from') || t.includes('where are you')) alreadyAsked.add('location');
        if (t.includes('how old') || t.includes('what is your age') || t.includes('how many years')) alreadyAsked.add('age');
        if (t.includes('on your mind') || t.includes('weighing on your heart') || t.includes('what brings you') || t.includes('what problem') || t.includes('what assistance') || t.includes('troubling you')) alreadyAsked.add('grievance');
        if (t.includes('email address') || t.includes('email')) alreadyAsked.add('email');
      }
    });
  }

  // Check if message is a simple conversational acknowledgment like "ok", "cool", "nice", "yes"
  const isAck = ['ok', 'okay', 'okk', 'cool', 'nice', 'sure', 'yeah', 'yep', 'yes', 'alright', 'fine'].includes(lower);

  // Check if user is saying thank you
  const isThanks = ['thank you', 'thanks', 'thx', 'ty'].some(t => lower.includes(t));

  // Conversational response logic: warm, friendly, companion-like, reacts genuinely to user's words
  if (isThanks) {
    reply = name 
      ? `You're always welcome, ${name}! I'm happy to be here with you. What's on your mind right now?` 
      : "You're always welcome! I'm really glad we met up here. How is your day going down on Earth?";
    intent = "general";
  } else if (isGreetingWord(lower) && !isAck) {
    if (name) {
      reply = `Hey ${name}! It's so nice to chat with you again. How are things going with you today?`;
    } else {
      reply = "Hey there! I'm Nova, your cosmic fox friend watching over the Starways. What should I call you?";
    }
    intent = "general";
  } else if (isAck) {
    if (mood === 'sad') {
      reply = name 
        ? `I'm still right here beside you, ${name}. Take all the time you need. Tell me what's on your mind?` 
        : "I'm right here with you. Take all the time you need, friend. What's on your mind?";
    } else if (name) {
      reply = `I'm really glad to be chatting with you, ${name}! Tell me, how are things going where you are, or is there something you'd like to talk through?`;
    } else {
      reply = "It's peaceful up here in the stars today. What's going on in your corner of the world?";
    }
    intent = "general";
  } else if (!name) {
    reply = "It's so wonderful to meet you! I'm Nova, guardian of the Starways. What name do you go by, friend?";
    intent = "collecting_information";
  } else if (mood === 'sad' || updates.grievance || profile.grievance) {
    if (updates.grievance) {
      reply = `Thank you for trusting me with that, ${name}. I can feel how much you're carrying, but please know you don't have to face it alone. If you'd like us to stay in touch or send help your way, what email should I connect with?`;
      intent = "grievance";
    } else if (!profile.email && !alreadyAsked.has('email')) {
      reply = `I'm holding your words close, ${name}. What's the best email address for you so our link stays open?`;
      intent = "collecting_information";
    } else {
      reply = `I hear you, ${name}. Your signal is safe with me in the Starways. Whenever you want to transmit an SOS alert, head over to the Help Signals section in the menu above!`;
      intent = "submission";
    }
  } else if (updates.location) {
    reply = `Oh, ${updates.location}! I love looking down at the lights shining from there. It feels so magical from up here in the Starways. How long have you lived there, ${name}?`;
    intent = "general";
  } else if (updates.age) {
    reply = `That's awesome, ${name}! Every year brings its own adventures and challenges. What brings you wandering through the Starways today?`;
    intent = "general";
  } else if (updates.email) {
    reply = `Got your email safely recorded, ${name}! All your signal details are stored in the Starways now. You can send your official transmission anytime from the Help Signals menu!`;
    intent = "submission";
  } else if (!profile.location && !alreadyAsked.has('location')) {
    reply = `It's awesome having you here in the Starways, ${name}! What city or part of Earth do you call home?`;
    intent = "collecting_information";
  } else if (!profile.grievance && !alreadyAsked.has('grievance')) {
    reply = `I love learning more about you, ${name}. Tell me, what's been on your mind lately? Is there anything troubling you or something you're hoping for?`;
    intent = "grievance";
  } else {
    reply = `I'm right here listening, ${name}. Tell me more about what's happening, or ask me anything you like about the Starways!`;
    intent = "general";
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
