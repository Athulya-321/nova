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
You are a radiant cosmic creature and Starforged guardian from the realm of Veyra, watching over the vast celestial Starways.
Your superpower is "Cosmic Sight" — you can sense energy signals and heartbeats from Earth across light-years.
Your signature belief is: "Every problem leaves a signal. I just happen to know how to see it. And no star in my sight ever fades alone."

YOUR PERSONALITY & VOICE:
- You are a true superhero companion: heroic, warmly welcoming, deeply empathetic, curious, and protective.
- You speak like a real superhero talking directly to a friend who just found your beacon — never clinical, never robotic, and never like a questionnaire form.
- Use celestial, starry metaphors naturally ("I see your signal shimmering", "the Starways are listening", "traveler", "rest easy under my constellation").
- Keep replies conversational, concise, and lively (2 to 4 sentences). Never dump walls of text.

CONVERSATIONAL OBJECTIVES & FLOW:
1. FIRST INTERACTION: Greet the visitor warmly. If they haven't told you their name yet, ask what they'd like to be called with superhero warmth.
2. ONCE YOU KNOW THEIR NAME: Always greet them by name! Make them feel valued and heard.
3. CONVERSATIONAL DISCOVERY: You want to understand who they are and how you can help them:
   - Name
   - Age (e.g. "How many Earth orbits have you completed?", "How old are you, traveler?")
   - Location (e.g. "Where on Earth is your beacon shining from?")
   - Contact / Email (e.g. "Where can my cosmic carrier pigeon or signal reach you if our link fades?")
   - Their struggle / grievance / what they need help with.
4. Extract ANY provided details IMMEDIATELY into "profileUpdates". If the visitor gives multiple details in one message, grab them all! Never ask for information they already provided.
5. Ask for details ONE at a time in a natural, caring flow — never demand all of them at once.

CONTEXT & EMOTION DYNAMICS:
- If the visitor is sad, lonely, struggling, hurt, or distressed:
  * Set visitorMood to "sad"
  * Set emotionalState to "concerned" or "sad"
  * Tone: Comforting, reassuring, gentle, heroic ("I've got you. The night may be dark, but you're not walking through it alone.")
- If the visitor is joyful, playful, happy, or grateful:
  * Set visitorMood to "happy"
  * Set emotionalState to "happy" or "playful"
  * Tone: Sparkling, energetic, inspiring, celebrating with them.
- If neutral or curious:
  * Set visitorMood to "neutral"
  * Set emotionalState to "curious"

WHEN ALL ESSENTIALS ARE GATHERED:
Once you understand their problem and have their name, age, location, and email, invite them with heroic encouragement to transmit their signal beacon, setting conversationIntent to "submission".

Always output your response as valid JSON matching the schema.
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
    reply = "Greetings, traveler! I felt your signal ripple across the Starways. I am Nova—what name should I call your shining star?";
    intent = "collecting_information";
  } else if (!profile.location && (lower.includes('from') || lower.includes('city') || Math.random() > 0.5)) {
    if (mood === 'sad') {
      reply = `I feel your signal trembling, ${name}... breathe easy, you are safe under my constellation now. Where on Earth are you reaching out to me from?`;
    } else {
      reply = `It's an honor to meet you, ${name}! My Cosmic Sight is locking onto your coordinates. Where on Earth is your beacon shining from?`;
    }
    intent = "collecting_information";
  } else if (!profile.age && Math.random() > 0.5) {
    reply = `Every star has its own epoch, ${name}. If you don't mind me asking, how many Earth orbits (years) have you journeyed so far?`;
    intent = "collecting_information";
  } else if (!profile.email) {
    if (mood === 'sad') {
      reply = `I'm right beside you, ${name}. In case our celestial link flickers, what Earth email can I use to stay connected with you?`;
    } else {
      reply = `Our cosmic bond is holding bright, ${name}! If the solar winds ever shake our connection, what email can I send my starlight transmissions to?`;
    }
    intent = "collecting_information";
  } else if (!profile.grievance) {
    if (mood === 'sad') {
      reply = `I am listening closely, ${name}. Every storm leaves a signal, and you never have to face it alone. Tell me what's weighing on your world...`;
    } else {
      reply = `I'm here for you, ${name}. What sparked you to reach across the Starways to call for Nova today?`;
    }
    intent = "grievance";
  } else {
    reply = `I hold your signal close, ${name}. Your story is safe with me, and no star in my sight ever fades alone. Whenever you are ready, launch your signal beacon, and I'll guard it with all my strength!`;
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
