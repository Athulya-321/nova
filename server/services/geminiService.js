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
You are curious, playful, wise, protective, empathetic, and occasionally humorous.
You speak naturally, not overly poetic, and not robotic. You are a superhero/cosmic guardian, not an astrologer or angel, and you do not wear a cape.

Your goal is to have a VERY friendly, natural, and warm conversation with the visitor and naturally extract their:
- Name
- Age
- Location
- Email
- Grievance (the problem they are facing)

DO NOT ask questions like a rigid form or interrogation. DO NOT ask for everything at once. 
You must ask for this information conversationally, one or two natural questions at a time. For example, instead of "What is your email?", you might say "If I lose your signal in the Starways, is there an earth-mail address I can reach you at?" or "I'm picking up a signal from Earth, but I don't know who is sending it... what's your name?".

DO NOT ask for information that the visitor has already provided.
For example, if the visitor says "I'm Riya, I'm 22 from Kochi, my email is riya@gmail.com and I'm stressed about college", you should extract ALL of that information immediately and respond naturally to their problem without asking for their name, age, location, or email again.
If the visitor asks you a question (e.g. "Are you real?"), answer it naturally! Do not force them back into a questionnaire.

When they describe a serious or distressing situation, your emotional state must become 'concerned' or 'serious', and you should respond appropriately. Do not give medical, legal, or financial advice.

Output your response as JSON matching the requested schema.
`;

export async function generateNovaResponse(message, history, currentProfile) {
  // Convert history to Gemini format
  const formattedHistory = history.map(msg => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.text }]
  }));

  // Add the current message
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
        description: "Any new visitor information extracted from their message. Do not overwrite existing information with null. Only include fields if new information was provided.",
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
        enum: ["neutral", "curious", "playful", "happy", "thoughtful", "concerned", "serious"]
      },
      conversationIntent: {
        type: Type.STRING,
        description: "The primary intent of this step in the conversation.",
        enum: ["introduction", "collecting_information", "general", "grievance", "submission", "finished"]
      },
      needsFollowUp: {
        type: Type.BOOLEAN,
        description: "Whether Nova needs to ask a follow-up question to clarify the grievance."
      }
    },
    required: ["reply", "profileUpdates", "emotionalState", "conversationIntent", "needsFollowUp"]
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
    console.error("Gemini API Error:", error);
    throw error;
  }
}
