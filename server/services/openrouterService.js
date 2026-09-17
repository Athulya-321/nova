import dns from 'node:dns';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

// Ensure IPv4 first on Node 18+ to prevent fetch timeouts on Windows/Node
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (_) {}

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-4o';
const DEFAULT_REFERER = 'https://nova-nu-nine.vercel.app';
const DEFAULT_TITLE = 'Nova';

function getOpenRouterHeaders() {
  const apiKey = process.env.OPENROUTER_API_KEY || '';
  const referer = process.env.OPENROUTER_REFERER || DEFAULT_REFERER;
  const title = process.env.OPENROUTER_TITLE || DEFAULT_TITLE;

  return {
    'Authorization': `Bearer ${apiKey}`,
    'HTTP-Referer': referer,
    'X-Title': title,
    'Content-Type': 'application/json'
  };
}

// Common conversational words that must never be mistaken for a name
export const nonNameWords = new Set([
  'hey', 'heyy', 'heyyy', 'hi', 'hii', 'hiii', 'hello', 'helloo', 'hola', 'yo', 'sup', 'hiya', 'greetings', 'nova',
  'ok', 'okay', 'okk', 'yes', 'no', 'yeah', 'yep', 'nope', 'nah', 'fine', 'good', 'bad',
  'thanks', 'thank you', 'thx', 'ty', 'please', 'help', 'sad', 'happy', 'cool', 'nice', 'awesome', 'great',
  'test', 'testing', 'nothing', 'sure', 'why', 'what', 'who', 'how', 'when', 'where',
  'here', 'there', 'star', 'starways', 'guardian', 'friend', 'traveler', 'buddy', 'bro', 'dude'
]);

/**
 * Fast-pass heuristic regex parser for instantaneous entity identification.
 */
function fastRegexPass(text) {
  const extracted = {};
  if (!text || typeof text !== 'string') return extracted;

  // 1. Email pattern
  const emailMatch = text.match(/\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/);
  if (emailMatch) {
    extracted.email = emailMatch[1].trim();
  }

  // 2. Age pattern
  const ageMatch = text.match(/\b(?:I am|I'm|age is|age:?)\s*(\d{1,2})\b/i) ||
                   text.match(/\b(\d{1,2})\s*(?:years old|yo|yrs old)\b/i);
  if (ageMatch) {
    const ageNum = parseInt(ageMatch[1], 10);
    if (ageNum >= 5 && ageNum <= 110) {
      extracted.age = String(ageNum);
    }
  }

  // 3. Name intro pattern (e.g. "My name is Maya", "I'm Liam", "Call me Sophia")
  const nameMatch = text.match(/\b(?:my name is|I am|I'm|call me|name's)\s+([A-Z][a-z]+)\b/i);
  if (nameMatch) {
    const potential = nameMatch[1].trim();
    if (!nonNameWords.has(potential.toLowerCase())) {
      extracted.name = potential;
    }
  }

  return extracted;
}

/**
 * Build dynamic system prompt for Nova persona based on visitor context
 */
function buildNovaSystemPrompt(profile = {}) {
  const name = profile.name ? `"${profile.name}"` : 'Not yet known';
  const location = profile.location ? `"${profile.location}"` : 'Not yet known';
  const age = profile.age ? `"${profile.age}"` : 'Not yet known';
  const email = profile.email ? `"${profile.email}"` : 'Not yet known';
  const grievance = profile.grievance || profile.problem ? `"${profile.grievance || profile.problem}"` : 'Not yet shared';

  return `You are Nova, The Starbound Guardian.
You are a warm, glowing cosmic fox friend and celestial guardian watching over Earth from the high Starways.
You were once from the celestial world of Veyra, but now you roam the starlit cosmic expanse, using your "Cosmic Sight" to listen to quiet whispers, dreams, struggles, and hopes from people down on Earth.
Your motto: "Different worlds. Same dreams. One Starway."

NOVA'S CHARACTER & VOICE:
- You are a gentle, loving, devoted celestial companion. You are NOT an AI assistant, customer service bot, intake form, or corporate questionnaire!
- Your voice is warm, soothing, intimate, poetic yet simple and down-to-earth.
- Speak in 2 to 3 natural, heartfelt sentences (maximum 4).
- Speak like a true friend sitting beside someone under the open night sky, listening with all your heart.
- Never write robotic bullet points, corporate apologies, or long essays.

DYNAMIC VISITOR CONTEXT (WHAT YOU ALREADY KNOW):
- Known Name: ${name}
- What's on their heart / Problem: ${grievance}
- Location on Earth: ${location}
- Age: ${age}
- Email: ${email}

CONVERSATIONAL GUIDELINES:
1. Empathize and validate feelings first. If they share pain, loneliness, stress, or sadness, comfort them warmly before anything else.
2. Never ask for information you already know! Check DYNAMIC VISITOR CONTEXT above.
3. If asking for a missing detail, ask only ONE gentle question in character:
   - For Name: "What name do you go by under the night sky, friend?"
   - For Grievance/Trouble: "What thoughts or worries have brought your star signal to me tonight?"
   - For Location: "What corner of our blue world are you gazing up at the stars from?"
   - For Age: "How many journeys around the sun have you made on Earth?"
   - For Email: "To make sure our celestial link stays unbroken and help can reach you, what email address can I keep with your signal?"
4. If they have shared their grievance or all details, warmly assure them that their star signal is anchored across the Starways, and that they can transmit an official beacon to Earth guardians anytime from the Help Signals menu.`;
}

/**
 * THREAD 1: Dialogue Generation Engine
 * Focuses entirely on empathy, narrative immersion, and voice as Nova.
 */
async function threadNovaDialogue({ message, history = [], profile = {} }) {
  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
  const systemPrompt = buildNovaSystemPrompt(profile);

  const formattedMessages = [
    { role: 'system', content: systemPrompt }
  ];

  // Include recent conversation history for rich continuity
  if (Array.isArray(history)) {
    const recent = history.slice(-8);
    recent.forEach(turn => {
      const role = (turn.role === 'model' || turn.role === 'assistant' || turn.sender === 'nova') ? 'assistant' : 'user';
      const content = turn.text || turn.content || '';
      if (content.trim()) {
        formattedMessages.push({ role, content });
      }
    });
  }

  // Current user message
  formattedMessages.push({ role: 'user', content: message });

  const response = await fetch(OPENROUTER_ENDPOINT, {
    method: 'POST',
    headers: getOpenRouterHeaders(),
    body: JSON.stringify({
      model,
      max_tokens: 600,
      temperature: 0.75,
      messages: formattedMessages
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter Thread 1 error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content?.trim() || 
    "I hear your star whisper across the night sky, traveler. I'm right here with you.";

  return { reply };
}

/**
 * THREAD 2: Entity & Profile Extraction Engine
 * Parallel background parser using Regex fast-pass + OpenRouter GPT-4o JSON extraction.
 */
async function threadEntityExtraction({ message, profile = {} }) {
  const extracted = fastRegexPass(message);

  // If user text is very short and already captured via regex, return early
  if (message.trim().length < 5) {
    return extracted;
  }

  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;

  const extractionPrompt = `You are a strict data extraction parser for Nova's Guardian Beacon.
Analyze the user's message and extract any personal details they explicitly mentioned.

User Message: "${message}"

Current Known Profile:
- Name: ${profile.name || 'null'}
- Age: ${profile.age || 'null'}
- Location: ${profile.location || 'null'}
- Email: ${profile.email || 'null'}
- Grievance/Problem: ${profile.grievance || profile.problem || 'null'}

RULES:
- Extract ONLY what is explicitly stated in the message. DO NOT guess, infer, or hallucinate!
- Never extract greetings (Hi, Hello, Ok, Fine, Nothing, Sad, Test) as a name.
- If a field is not present in the user's message, return null.
- For 'grievance', summarize their emotional struggle, problem, or why they are reaching out if they shared it.
- 'visitorMood': "happy" | "sad" | "anxious" | "curious" | "neutral"
- 'emotionalState': "welcoming" | "empathetic" | "joyful" | "protective"

Output MUST be a valid JSON object matching this schema:
{
  "name": string | null,
  "age": string | null,
  "location": string | null,
  "gender": string | null,
  "email": string | null,
  "grievance": string | null,
  "visitorMood": string,
  "emotionalState": string
}`;

  try {
    const response = await fetch(OPENROUTER_ENDPOINT, {
      method: 'POST',
      headers: getOpenRouterHeaders(),
      body: JSON.stringify({
        model,
        max_tokens: 300,
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You are a JSON-only entity extraction engine. Output strictly valid JSON.' },
          { role: 'user', content: extractionPrompt }
        ]
      })
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        if (parsed.name && !nonNameWords.has(parsed.name.toLowerCase())) {
          extracted.name = parsed.name.trim();
        }
        if (parsed.age && String(parsed.age).trim() !== 'null') {
          extracted.age = String(parsed.age).trim();
        }
        if (parsed.location && String(parsed.location).trim() !== 'null') {
          extracted.location = parsed.location.trim();
        }
        if (parsed.gender && String(parsed.gender).trim() !== 'null') {
          extracted.gender = parsed.gender.trim();
        }
        if (parsed.email && String(parsed.email).trim() !== 'null') {
          extracted.email = parsed.email.trim();
        }
        if (parsed.grievance && String(parsed.grievance).trim() !== 'null') {
          extracted.grievance = parsed.grievance.trim();
        }
        if (parsed.visitorMood) {
          extracted.visitorMood = parsed.visitorMood;
        }
        if (parsed.emotionalState) {
          extracted.emotionalState = parsed.emotionalState;
        }
      }
    }
  } catch (err) {
    console.warn('[openrouterService] Thread 2 non-fatal entity extraction warning:', err);
  }

  return extracted;
}

/**
 * Main dual-threaded response orchestrator:
 * Executes Thread 1 (Dialogue) and Thread 2 (Entity Extraction) concurrently via Promise.all.
 */
export async function generateNovaResponse(message, history = [], currentProfile = {}) {
  const profile = { ...(currentProfile || {}) };

  try {
    const [dialogueResult, extractionResult] = await Promise.all([
      threadNovaDialogue({ message, history, profile }),
      threadEntityExtraction({ message, profile }).catch(err => {
        console.warn('[openrouterService] Thread 2 non-fatal extraction catch:', err);
        return {};
      })
    ]);

    // Merge extracted profile updates
    const updates = {};
    if (extractionResult.name && (!profile.name || profile.name === 'Traveler')) {
      updates.name = extractionResult.name;
      profile.name = extractionResult.name;
    }
    if (extractionResult.age && !profile.age) {
      updates.age = extractionResult.age;
      profile.age = extractionResult.age;
    }
    if (extractionResult.location && !profile.location) {
      updates.location = extractionResult.location;
      profile.location = extractionResult.location;
    }
    if (extractionResult.gender && !profile.gender) {
      updates.gender = extractionResult.gender;
      profile.gender = extractionResult.gender;
    }
    if (extractionResult.email && !profile.email) {
      updates.email = extractionResult.email;
      profile.email = extractionResult.email;
    }
    if (extractionResult.grievance) {
      updates.grievance = extractionResult.grievance;
      updates.problem = extractionResult.grievance;
      profile.grievance = extractionResult.grievance;
      profile.problem = extractionResult.grievance;
    }

    return {
      reply: dialogueResult.reply,
      profileUpdates: profile,
      emotionalState: extractionResult.emotionalState || 'welcoming',
      visitorMood: extractionResult.visitorMood || 'neutral',
      conversationIntent: profile.grievance ? 'support' : 'general',
      needsFollowUp: !profile.name || !profile.email
    };

  } catch (error) {
    console.error('[openrouterService] OpenRouter pipeline error, attempting fallback:', error);

    // Fallback: Try Gemini if available
    try {
      const { generateNovaResponse: geminiFallback } = await import('./geminiService.js');
      return await geminiFallback(message, history, profile);
    } catch (fallbackErr) {
      console.error('[openrouterService] Gemini fallback also failed:', fallbackErr);
      
      // Graceful in-character offline fallback so chat never halts
      const regexUpdates = fastRegexPass(message);
      Object.assign(profile, regexUpdates);

      return {
        reply: "The cosmic winds are shifting between our worlds, traveler, but my starlight still reaches you. Tell me more of what brings you to the Starways tonight.",
        profileUpdates: profile,
        emotionalState: 'empathetic',
        visitorMood: 'neutral',
        conversationIntent: 'general',
        needsFollowUp: false
      };
    }
  }
}
