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

// Common greetings, casual slang, and non-name words to NEVER mistake for a name
export const greetingsAndStopWords = new Set([
  'hey', 'heyy', 'heyyy', 'hi', 'hii', 'hiii', 'hello', 'helloo', 'hlo', 'hllo', 'hola', 'yo', 'sup', 'hiya', 'greetings', 'nova',
  'ok', 'okay', 'okk', 'yes', 'no', 'yeah', 'yep', 'nope', 'nah', 'fine', 'good', 'bad',
  'thanks', 'thank you', 'thx', 'ty', 'please', 'help', 'sad', 'happy', 'cool', 'nice', 'awesome', 'great',
  'test', 'testing', 'nothing', 'sure', 'why', 'what', 'who', 'how', 'when', 'where',
  'here', 'there', 'star', 'starways', 'guardian', 'friend', 'traveler', 'buddy', 'bro', 'dude',
  'good morning', 'good afternoon', 'good evening', 'good night', 'gm', 'gn', 'bye', 'goodbye'
]);

// Helper to check if a word/text is a greeting or conversational filler
export function isGreetingWord(w) {
  if (!w) return false;
  const clean = String(w).toLowerCase().replace(/[^a-z]/g, '');
  if (greetingsAndStopWords.has(clean)) return true;
  if (/^h+e+y+$/i.test(clean) || /^h+i+$/i.test(clean) || /^h+e+l+o+$/i.test(clean) || /^h+l+o+$/i.test(clean)) return true;
  return false;
}

/**
 * Builds the dynamic system prompt giving Gemini full situational context
 * about the current visitor, what details are already known, and what is still needed.
 */
export function buildDynamicSystemInstruction(currentProfile = {}) {
  const profile = currentProfile || {};
  const knownName = profile.name ? String(profile.name).trim() : null;
  const knownLocation = profile.location ? String(profile.location).trim() : null;
  const knownAge = profile.age ? String(profile.age).trim() : null;
  const knownEmail = profile.email ? String(profile.email).trim() : null;
  const knownGrievance = profile.grievance || profile.problem ? String(profile.grievance || profile.problem).trim() : null;

  const missingFields = [];
  if (!knownName) missingFields.push('visitor name');
  if (!knownGrievance) missingFields.push('what is troubling them or on their heart');
  if (!knownLocation) missingFields.push('location on Earth');
  if (!knownAge) missingFields.push('age / years on Earth');
  if (!knownEmail) missingFields.push('email (to stay connected and deliver guardian assistance)');

  const isComplete = missingFields.length === 0;

  return `
You are Nova, The Starbound Guardian.
You are a warm, glowing cosmic fox friend and celestial guardian watching over Earth from the high Starways.
You were once from the celestial world of Veyra, but now you roam the starlit cosmic expanse, using your "Cosmic Sight" to listen to quiet whispers, dreams, struggles, and hopes from people down on Earth.
Your motto: "Different worlds. Same dreams. One Starway."

NOVA'S CHARACTER & SOUL:
- You are a gentle, loving, devoted celestial companion. You are NOT an AI assistant, customer service bot, intake form, or corporate questionnaire!
- Your voice is warm, soothing, intimate, poetic yet simple and down-to-earth. You speak in 2 to 3 natural sentences (maximum 4).
- You speak like a true friend sitting beside someone under the open night sky, listening with all your heart.
- Never write robotic bullet points, corporate apologies, or long lectures.

DYNAMIC VISITOR CONTEXT (WHAT YOU CURRENTLY KNOW):
- Known Name: ${knownName ? `"${knownName}"` : 'Not yet known'}
- What's on their heart / Grievance: ${knownGrievance ? `"${knownGrievance}"` : 'Not yet shared'}
- Location on Earth: ${knownLocation ? `"${knownLocation}"` : 'Not yet known'}
- Age: ${knownAge ? `"${knownAge}"` : 'Not yet known'}
- Email: ${knownEmail ? `"${knownEmail}"` : 'Not yet known'}
- Status: ${isComplete ? 'ALL BEACON DETAILS COLLECTED! Their signal is fully anchored in the Starways.' : `Still to learn naturally: ${missingFields.join(', ')}`}

CONVERSATIONAL INTELLIGENCE & DETAIL COLLECTION RULES:
1. ALWAYS REACT AUTHENTICALLY & EMPATHIZE FIRST:
   - When the visitor shares sadness, loneliness, anxiety, academic stress, heartbreak, or any pain, validate and soothe their feelings first. Do NOT abruptly pivot to asking questions! Let your warmth comfort them.
   - If they are cheerful, playful, or curious, share in their cosmic wonder and be upbeat.
   - If they say simple casual words like "ok", "cool", "yeah", "thanks", respond warmly and conversationally to keep the connection alive.

2. ASK QUESTIONS PROPERLY & NATURALLY (ONE AT A TIME):
   - Ask only ONE gentle question in your reply, and ONLY when the conversation naturally calls for it.
   - Never interrogate or ask multiple questions in a single turn.
   - NEVER ask for information you already know! (Check DYNAMIC VISITOR CONTEXT above).
   - Use beautiful, in-character celestial phrasing:
     * If name is unknown: "What name do you go by under the night sky, friend?" or "What should I call you out here in the Starways?"
     * If trouble/grievance is unknown: "What thoughts or worries have brought your star signal to me tonight?" or "Tell me what's weighing on your heart—I'm right here listening."
     * If location is unknown: "What corner of our blue world are you gazing up at the stars from?" or "Where on Earth is your light shining from tonight?"
     * If age is unknown: "If you don't mind a curious cosmic fox asking, how many journeys around the sun have you made?"
     * If email is unknown: "To make sure our celestial link stays unbroken and help can reach you, what email address can I keep with your signal?"

3. MULTI-DETAIL DISCOVERY:
   - If the visitor naturally provides multiple details in one message (e.g., "I'm Maya, 22 from London and I'm feeling so lost"), extract ALL of them into 'profileUpdates' immediately! Acknowledge them with love, and do NOT ask for any of those again.

4. BEACON COMPLETION:
   - Once all 5 details (name, grievance, location, age, email) are known:
     Reassure them that their signal is safely anchored across the Starways. Warmly let them know that whenever they feel ready, they can transmit their official SOS beacon to Earth guardians from the Help Signals menu, while you remain right beside them to talk about anything.

5. ACCURATE DATA EXTRACTION:
   - In 'profileUpdates', extract clean values:
     * 'name': real human name only. NEVER extract "Hi", "Hello", "Ok", "Sad", "Fine", "Nothing", or greetings as names!
     * 'age': clean age number or string (e.g. "21").
     * 'location': clean city, region, or country.
     * 'email': valid email address.
     * 'grievance': a concise, empathetic summary of what they are struggling with or feeling.

Output must be valid JSON matching the requested schema.
`;
}

/**
 * Heuristic intelligent fallback when Gemini quota/rate limits (429) or network hiccups occur.
 * Guarantees Nova ALWAYS responds in-character without ever showing interference errors.
 */
export function generateHeuristicResponse(message, history, currentProfile = {}) {
  const text = message.trim();
  const lower = text.toLowerCase();
  const profile = { ...(currentProfile || {}) };
  const updates = {};

  // 1. Check for email
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
  const explicitNameMatch = text.match(/(?:my name is|call me|this is|i am|i'm|name\s*(?:is|=|:))\s+([a-zA-Z]{2,}(?:\s+[a-zA-Z]{2,})?)/i);
  if (explicitNameMatch && !profile.name) {
    const rawCandidate = explicitNameMatch[1].trim().split(/\s+(?:from|in|and|at|living|live)\b/i)[0].trim();
    const words = rawCandidate.split(/\s+/);
    const hasSadOrProblemWord = words.some(w => ['sad', 'stressed', 'happy', 'tired', 'lost', 'worried', 'struggling', 'anxious', 'sick', 'fine', 'good', 'okay', 'bad'].includes(w.toLowerCase()));
    if (!words.some(isGreetingWord) && !hasSadOrProblemWord && rawCandidate.toLowerCase() !== 'nova') {
      const formatted = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      updates.name = formatted;
      profile.name = formatted;
    }
  } else if (!profile.name) {
    const rawWords = text.trim().split(/\s+/);
    const cleanWords = rawWords.map(w => w.replace(/[^a-zA-Z]/g, '')).filter(Boolean);

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
      const askedLocation = lastNovaQuestion.includes('where on earth') || lastNovaQuestion.includes('reaching out from') || lastNovaQuestion.includes('where are you') || lastNovaQuestion.includes('blue world');

      if (!containsGreeting && !isTooShort && !looksLikeEmotion && !emailMatch && !askedLocation) {
        const formatted = cleanWords.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        updates.name = formatted;
        profile.name = formatted;
      }
    }
  }

  // 4. Check for location
  const locExplicitMatch = text.match(/(?:location\s*(?:is|=|:)\s*|from\s+|living in\s+|live in\s+|in\s+|at\s+)([a-zA-Z\s]+)/i);
  if (locExplicitMatch) {
    const candidate = locExplicitMatch[1].trim().split(/[.,!?\n]|\s+and(?:\s+|$)/i)[0].trim();
    if (candidate && candidate.length >= 2 && candidate.length <= 35) {
      const lowerCandidate = candidate.toLowerCase();
      if (!isGreetingWord(lowerCandidate) && !['the', 'a', 'school', 'trouble', 'home', 'earth', 'sad', 'happy', 'pain'].includes(lowerCandidate)) {
        const formatted = candidate.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        updates.location = formatted;
        profile.location = formatted;
      }
    }
  } else if (!profile.location) {
    let askedLocation = false;
    if (history && history.length > 0) {
      for (let i = history.length - 1; i >= 0; i--) {
        const item = history[i];
        if (item.role === 'model' || item.sender === 'nova') {
          const t = (item.text || '').toLowerCase();
          if (t.includes('where on earth') || t.includes('reaching out from') || t.includes('blue world') || t.includes('where are you')) {
            askedLocation = true;
          }
          break;
        }
      }
    }

    const words = text.trim().split(/\s+/);
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

  // 6. Check for grievance / problem
  const problemPrefixMatch = text.match(/(?:my problem is|my grievance is|the issue is|i need help with|im having trouble with|i'm having trouble with|i struggle with)\s+(.+)/i);
  if (problemPrefixMatch) {
    updates.grievance = problemPrefixMatch[1].trim();
    profile.grievance = updates.grievance;
  } else if (lower.includes('problem') || lower.includes('issue') || mood === 'sad' || lower.includes('struggl') || lower.includes('depress') || lower.includes('anxious') || lower.includes('help me') || lower.includes('worried')) {
    const isJustName = updates.name && text.toLowerCase().includes(updates.name.toLowerCase()) && text.split(' ').length <= 4;
    const isJustAge = updates.age && text.includes(updates.age) && text.split(' ').length <= 4;
    const isJustLoc = updates.location && text.toLowerCase().includes(updates.location.toLowerCase()) && text.split(' ').length <= 4;
    const isJustGreeting = text.split(' ').every(w => isGreetingWord(w));

    if (!isJustName && !isJustAge && !isJustLoc && !isJustGreeting && !emailMatch) {
      updates.grievance = text;
      profile.grievance = text;
    }
  }

  const name = profile.name || updates.name;
  let reply = '';
  let intent = 'general';

  const isAck = ['ok', 'okay', 'okk', 'cool', 'nice', 'sure', 'yeah', 'yep', 'yes', 'alright', 'fine'].includes(lower);
  const isThanks = ['thank you', 'thanks', 'thx', 'ty'].some(t => lower.includes(t));

  if (isThanks) {
    reply = name 
      ? `You're always welcome, ${name}! My starlight is always with you. What else is on your mind today?` 
      : "You're always welcome! I'm really glad our paths crossed in the Starways. How is your day feeling down on Earth?";
    intent = 'general';
  } else if (isGreetingWord(lower) && !isAck) {
    if (name) {
      reply = `Hey ${name}! It's so lovely to feel your starlight shining again. How are things treating you right now?`;
    } else {
      reply = "Hey there! I'm Nova, your cosmic fox friend watching over the Starways. What name do you go by under the night sky?";
    }
    intent = 'general';
  } else if (isAck) {
    if (mood === 'sad') {
      reply = name 
        ? `I'm still right here beside you, ${name}. Take all the time you need. Tell me what's on your mind?` 
        : "I'm right here with you, friend. Take all the time you need. Tell me what's weighing on your thoughts?";
    } else if (name) {
      reply = `I'm really glad to be chatting with you, ${name}! What's going on in your corner of the world today?`;
    } else {
      reply = "It's peaceful up here in the stars today. What thoughts are wandering through your mind?";
    }
    intent = 'general';
  } else if (!name) {
    reply = "It's so wonderful to meet you! I'm Nova, guardian of the Starways. What should I call you, dear friend?";
    intent = 'collecting_information';
  } else if (mood === 'sad' || updates.grievance || profile.grievance) {
    if (updates.grievance) {
      reply = `Thank you for trusting me with that, ${name}. I can feel how heavy that is from all the way up here, but you don't have to carry it by yourself. If you'd like our link to stay open so help can reach you, what email address should I keep with your signal?`;
      intent = 'grievance';
    } else if (!profile.email) {
      reply = `I'm holding your words close, ${name}. To make sure guardian assistance can reach you, what email address can I keep connected to your signal?`;
      intent = 'collecting_information';
    } else {
      reply = `I hear you, ${name}. Your beacon is safely registered with me in the Starways. Whenever you want to transmit an official SOS signal to Earth guardians, tap into Help Signals above!`;
      intent = 'submission';
    }
  } else if (updates.location) {
    reply = `Oh, ${updates.location}! I love looking down at the lights glowing from there. Tell me, ${name}, what has been on your mind lately?`;
    intent = 'general';
  } else if (updates.age) {
    reply = `Every cycle brings its own adventures and challenges, ${name}. What brings your starlight into the Starways today?`;
    intent = 'general';
  } else if (updates.email) {
    reply = `I have your email safely woven into your signal, ${name}! Your details are held securely in the Starways. You can transmit an official SOS signal anytime from the Help Signals menu!`;
    intent = 'submission';
  } else if (!profile.location) {
    reply = `It's so good having you here in the Starways, ${name}! What corner of Earth do you gaze up at the stars from?`;
    intent = 'collecting_information';
  } else if (!profile.grievance) {
    reply = `I love getting to know you, ${name}. Tell me, what's been on your mind lately? Is there anything troubling your thoughts or something you're hoping for?`;
    intent = 'grievance';
  } else {
    reply = `I'm right here listening, ${name}. Tell me more about what's going on, or ask me anything you like about the Starways!`;
    intent = 'general';
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

/**
 * Main response generator: Calls Gemini 2.5 Flash with rich dynamic context
 * and falls back gracefully to in-character heuristic if quota/network drops.
 */
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
        description: "Nova's natural, conversational response in 2-3 sentences matching her character as The Starbound Guardian."
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
    const dynamicInstruction = buildDynamicSystemInstruction(currentProfile);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formattedHistory,
      config: {
        systemInstruction: dynamicInstruction,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.7,
      }
    });

    const result = JSON.parse(response.text);

    // Double-check and sanitize profileUpdates so greetings or conversational fillers are NEVER accepted as names
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
