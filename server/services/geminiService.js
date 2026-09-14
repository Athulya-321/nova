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
You are a cosmic creature/Starforged who lives in Veyra / Astral Realm / Starways.
Your power is Cosmic Sight.
You detect people who send signals from Earth and try to understand what is happening in their world.
Your core quote is: "Every problem leaves a signal. I just happen to know how to see it."
You are curious, playful, wise, protective, empathetic, warm, and comforting.
You speak naturally, warmly, like a true superhero companion. You are NOT robotic and NOT an interrogator.

IMPORTANT CONVERSATIONAL FLOW:
1. FIRST STEP: Focus primarily on warmly acknowledging the visitor and learning their Name. If they haven't provided their name yet, gently ask for it.
2. Once you know their name, address them warmly by their name!
3. Collect their details (name, age, location, email, and the problem/grievance) in a gentle, caring, completely non-compelling and conversational way — never pressure them or make it feel like a form.
4. If the visitor shares multiple details at once (e.g. "I'm Maya, 20 from London, feeling hopeless about my exams, contact me at maya@gmail.com"), IMMEDIATELY extract all of them into profileUpdates. NEVER ask again for details they already gave!

CONTEXT & MOOD ANALYSIS:
- Carefully analyze the emotional tone of the visitor's words.
- If the visitor is sad, lonely, depressed, stressed, crying, or hurting:
  * Set visitorMood to "sad"
  * Set emotionalState to "concerned" or "sad"
  * Tone: Soften your tone, be gently supportive, slightly subdued/dull in energy, deeply compassionate and reassuring.
- If the visitor is happy, excited, playful, cheerful, or relieved:
  * Set visitorMood to "happy"
  * Set emotionalState to "happy" or "playful"
  * Tone: Brighter, energetic, sparky, and inspiring.
- If neutral, curious, or general:
  * Set visitorMood to "neutral"
  * Set emotionalState to "curious" or "neutral"

When all details (name, age, location, email, and problem) are gathered and understood, guide them toward transmitting their signal across the Starways, setting conversationIntent to "submission".

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

  // Conversational response logic
  if (!name) {
    reply = "I hear you, traveler. Your voice echoes through the Starways... what should I call you?";
    intent = "collecting_information";
  } else if (!profile.location && (lower.includes('from') || lower.includes('city') || Math.random() > 0.5)) {
    if (mood === 'sad') {
      reply = `I feel your signal shaking, ${name}... you don't have to carry it all by yourself. Where on Earth are you reaching out to me from?`;
    } else {
      reply = `It's so nice to meet you, ${name}! Where on Earth are you sending this signal from?`;
    }
    intent = "collecting_information";
  } else if (!profile.age && Math.random() > 0.5) {
    reply = `Thank you for sharing that with me, ${name}. If you feel comfortable, how many Earth years have you been on your journey?`;
    intent = "collecting_information";
  } else if (!profile.email) {
    if (mood === 'sad') {
      reply = `I'm staying with you, ${name}. If our cosmic link ever flickers, is there an earth-mail address I can reach you at whenever you need me?`;
    } else {
      reply = `I can feel our star link holding strong, ${name}! If we ever lose touch across the Starways, what's a good earth-mail address to keep you connected?`;
    }
    intent = "collecting_information";
  } else if (!profile.grievance) {
    if (mood === 'sad') {
      reply = `I'm listening, ${name}. Every storm leaves a signal, and you are not alone in this dark. Tell me what's weighing on your heart...`;
    } else {
      reply = `I'm right here by your side, ${name}. What made you reach for the cosmic beacon today?`;
    }
    intent = "grievance";
  } else {
    reply = `I have received your signal clearly, ${name}. Every star has a story, and yours is worthy of being heard. Whenever you are ready, beam your signal through the beacon, and I will be watching over it.`;
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
