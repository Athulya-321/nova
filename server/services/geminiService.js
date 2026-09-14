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
   - Extract any personal and distress details provided: 'name', 'age', 'location', 'email', and 'grievance' (the core issue, problem, or feeling they express).
   - Put every detected piece into 'profileUpdates' so it is stored directly into their distress signal profile.
   - If they describe their situation or struggle, capture the heart of it in 'grievance'.
2. KEEP IT SHORT & CONVERSATIONAL (1 to 2 brief sentences max):
   - Speak warmly, casually, and naturally like a cosmic guardian companion.
   - Absolutely NO walls of text or long paragraphs.
3. NEVER ASK MULTIPLE QUESTIONS AT ONCE:
   - STRICT RULE: Ask at most ONE simple question per reply.
   - Flow naturally:
     * If name is unknown -> ask for their name.
     * If problem/grievance is unknown -> ask what is troubling them or what they need help with.
     * If location is unknown -> ask where on Earth they are reaching out from.
     * If age is unknown -> ask their age.
     * If email is unknown -> ask for their email address.
     * Once all details (name, grievance, location, age, email) are known -> invite them to hit the beacon / SEND YOUR SIGNAL (set conversationIntent: "submission").
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

  // 1. Check for email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch && !profile.email) {
    updates.email = emailMatch[0];
    profile.email = emailMatch[0];
  }

  // 2. Check for age (e.g. "21", "21 years old", "I am 19")
  const ageMatch = text.match(/\b(1[0-9]|[2-9][0-9])\b/);
  if (ageMatch && !profile.age && (!profile.name || profile.name !== ageMatch[0])) {
    updates.age = ageMatch[0];
    profile.age = ageMatch[0];
  }

  // 3. Check for name patterns if name is missing
  if (!profile.name) {
    const nameMatch = text.match(/(?:i am|i'm|my name is|call me|this is)\s+([a-zA-Z]+)/i);
    if (nameMatch) {
      updates.name = nameMatch[1];
      profile.name = nameMatch[1];
    } else if (text.split(' ').length <= 2 && !emailMatch && !lower.includes('help') && !lower.includes('sad')) {
      const clean = text.replace(/[^a-zA-Z]/g, '');
      if (clean.length >= 2) {
        updates.name = clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
        profile.name = updates.name;
      }
    }
  }

  // 4. Check for location (e.g. "from London", "in Kochi")
  const locMatch = text.match(/(?:from|in|living in|at)\s+([a-zA-Z\s]+)/i);
  if (locMatch && !profile.location && locMatch[1].trim().length < 30) {
    const candidate = locMatch[1].trim().split(/[.,]/)[0];
    if (candidate && !['the', 'a', 'school', 'trouble'].includes(candidate.toLowerCase())) {
      updates.location = candidate;
      profile.location = candidate;
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
  if (lower.includes('problem') || lower.includes('help') || mood === 'sad' || lower.includes('issue') || lower.includes('because') || lower.includes('feel')) {
    if (!profile.grievance || text.length > 20) {
      updates.grievance = text;
      profile.grievance = text;
    }
  }

  const name = profile.name || updates.name;
  let reply = "";
  let intent = "general";

  // Conversational response logic: simple, 1-2 sentences, 1 question at a time
  if (!name) {
    reply = "Greetings, traveler! I felt your signal. I am Nova—what's your name?";
    intent = "collecting_information";
  } else if (!profile.grievance) {
    if (mood === 'sad') {
      reply = `I'm here with you, ${name}. Tell me, what's weighing on your world?`;
    } else {
      reply = `Wonderful to meet you, ${name}! What kind of help can Nova bring you today?`;
    }
    intent = "grievance";
  } else if (!profile.location) {
    if (mood === 'sad') {
      reply = `You don't have to carry this alone, ${name}. Where on Earth are you reaching out from?`;
    } else {
      reply = `I hear you loud and clear, ${name}. Where on Earth are you sending this beacon from?`;
    }
    intent = "collecting_information";
  } else if (!profile.age) {
    reply = `Got it, ${name}. How old are you, traveler?`;
    intent = "collecting_information";
  } else if (!profile.email) {
    reply = `Almost set, ${name}. What's your email address so our link stays unbroken?`;
    intent = "collecting_information";
  } else {
    reply = `I have your signal locked in, ${name}. Whenever you're ready, tap SEND YOUR SIGNAL below and I'll protect it!`;
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
    return result;
  } catch (error) {
    console.warn("⚠️ Gemini API encountered an issue (e.g. rate limit/quota), using intelligent superhero heuristic fallback:", error.message || error);
    // Seamless in-character fallback so user NEVER sees interference error!
    return generateHeuristicResponse(message, history, currentProfile);
  }
}
