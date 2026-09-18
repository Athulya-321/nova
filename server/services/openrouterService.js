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

// Common conversational words that must never be mistaken for a name or location
export const nonNameWords = new Set([
  'hey', 'heyy', 'heyyy', 'hi', 'hii', 'hiii', 'hello', 'helloo', 'hola', 'yo', 'sup', 'hiya', 'greetings', 'nova',
  'ok', 'okay', 'okk', 'yes', 'no', 'yeah', 'yep', 'nope', 'nah', 'fine', 'good', 'bad',
  'thanks', 'thank you', 'thx', 'ty', 'please', 'help', 'sad', 'happy', 'cool', 'nice', 'awesome', 'great',
  'test', 'testing', 'nothing', 'sure', 'why', 'what', 'who', 'how', 'when', 'where',
  'here', 'there', 'star', 'starways', 'guardian', 'friend', 'traveler', 'buddy', 'bro', 'dude',
  'good morning', 'good afternoon', 'good evening', 'good night'
]);

/**
 * Fast-pass heuristic regex parser for instantaneous entity identification.
 * Uses conversational context (what Nova asked last) to accurately classify single-word answers.
 */
export function fastRegexPass(text, profile = {}, lastNovaQuestion = '') {
  const extracted = {};
  if (!text || typeof text !== 'string') return extracted;
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();
  const lastQ = (lastNovaQuestion || '').toLowerCase();

  // 1. Email pattern
  const emailMatch = trimmed.match(/\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/);
  if (emailMatch) {
    extracted.email = emailMatch[1].trim();
  }

  // 2. Age pattern:
  // Explicit: "21", "21 years", "I am 21", "age is 25", "20 yo"
  const ageExplicitMatch = trimmed.match(/\b(?:I am|I'm|age is|age:?)\s*(\d{1,2})\b/i) ||
                           trimmed.match(/\b(\d{1,2})\s*(?:years old|yo|yrs old|years)\b/i) ||
                           trimmed.match(/^(\d{1,2})$/);
  if (ageExplicitMatch) {
    const ageNum = parseInt(ageExplicitMatch[1], 10);
    if (ageNum >= 5 && ageNum <= 110) {
      extracted.age = String(ageNum);
    }
  } else if (!profile.age && (lastQ.includes('journey') || lastQ.includes('sun') || lastQ.includes('cycle') || lastQ.includes('how old') || lastQ.includes('how many years'))) {
    const candidateAge = trimmed.match(/\b(\d{1,2})\b/);
    if (candidateAge) {
      const ageNum = parseInt(candidateAge[1], 10);
      if (ageNum >= 5 && ageNum <= 110) {
        extracted.age = String(ageNum);
      }
    }
  }

  // 3. Name pattern:
  const nameMatch = trimmed.match(/\b(?:my name is|call me|this is|i am|i'm|name\s*(?:is|=|:))\s+([A-Za-z]{2,}(?:\s+[A-Za-z]{2,})?)/i);
  if (nameMatch && !profile.name) {
    let potential = nameMatch[1].trim().split(/\s+(?:from|in|and|at|living|live)\b/i)[0].trim();
    const words = potential.split(/\s+/);
    const hasEmotion = words.some(w => ['sad', 'happy', 'lost', 'tired', 'worried', 'fine', 'good', 'okay', 'bad'].includes(w.toLowerCase()));
    if (!words.some(w => nonNameWords.has(w.toLowerCase())) && !hasEmotion && potential.toLowerCase() !== 'nova') {
      const formatted = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      extracted.name = formatted;
    }
  } else if (!profile.name && (lastQ.includes('what name') || lastQ.includes('call you') || lastQ.includes('name do you go by') || lastQ.includes('who are you'))) {
    const words = trimmed.split(/\s+/);
    if (words.length >= 1 && words.length <= 2) {
      const clean = words.map(w => w.replace(/[^A-Za-z]/g, '')).filter(Boolean);
      if (clean.length > 0 && !clean.some(w => nonNameWords.has(w.toLowerCase()))) {
        const formatted = clean.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        extracted.name = formatted;
      }
    }
  }

  // 4. Location pattern:
  const locExplicitMatch = trimmed.match(/\b(?:from|in|live in|living in|location is)\s+([A-Za-z\s,.-]{2,35})\b/i);
  if (locExplicitMatch) {
    const candidate = locExplicitMatch[1].trim().split(/[.!?\n]|\s+and(?:\s+|$)/i)[0].trim();
    if (candidate.length >= 2 && candidate.length <= 35 && !nonNameWords.has(candidate.toLowerCase())) {
      const formatted = candidate.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      extracted.location = formatted;
    }
  } else if (!profile.location && (lastQ.includes('where on earth') || lastQ.includes('corner of') || lastQ.includes('blue world') || lastQ.includes('where are you') || lastQ.includes('gazing from'))) {
    const candidate = trimmed.replace(/[^A-Za-z\s,.-]/g, '').trim();
    const words = candidate.split(/\s+/);
    if (words.length >= 1 && words.length <= 4 && !words.some(w => nonNameWords.has(w.toLowerCase())) && !emailMatch && !extracted.age) {
      const formatted = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      extracted.location = formatted;
    }
  }

  // 5. Grievance / Problem pattern:
  const problemMatch = trimmed.match(/(?:my problem is|my grievance is|i struggle with|i'm struggling with|i need help with|trouble with|worried about|hurts because)\s+(.+)/i);
  if (problemMatch) {
    extracted.grievance = problemMatch[1].trim();
  } else if (!profile.grievance && (lastQ.includes('troubl') || lastQ.includes('heart') || lastQ.includes('worr') || lastQ.includes('star signal to me') || lastQ.includes('mind'))) {
    if (!extracted.name && !extracted.location && !extracted.age && !extracted.email && !nonNameWords.has(lower)) {
      extracted.grievance = trimmed;
    }
  }

  return extracted;
}

/**
 * Determine the next missing detail in the friendly, conversational priority order:
 * 1. Name
 * 2. Grievance / Trouble (what's on their heart)
 * 3. Location (where on Earth)
 * 4. Age (journeys around the sun)
 * 5. Email (celestial link to reach them)
 */
export function getNextMissingDetail(profile = {}) {
  const hasName = profile.name && profile.name !== 'Traveler' && profile.name !== 'null' && String(profile.name).trim() !== '';
  const hasGrievance = !!(profile.grievance || profile.problem);
  const hasLocation = !!(profile.location && profile.location !== 'null' && String(profile.location).trim() !== '');
  const hasAge = !!(profile.age && profile.age !== 'null' && String(profile.age).trim() !== '');
  const hasEmail = !!(profile.email && profile.email !== 'null' && String(profile.email).trim() !== '');

  const visitorName = hasName ? profile.name : 'friend';

  if (!hasName) {
    return {
      field: 'name',
      prompt: "The visitor's name is not yet known. Greet them warmly and ask for their name: e.g. 'What name do you go by under the night sky, friend?' or 'What should I call you out here in the Starways?'"
    };
  }

  if (!hasGrievance) {
    return {
      field: 'grievance',
      prompt: `You know their name (${profile.name}), but haven't learned what is on their heart or what brought their signal to you. Inquire gently with warmth: e.g. "Tell me, ${profile.name}, what thoughts or troubles have brought your star signal to me tonight? I'm right here listening."`
    };
  }

  if (!hasLocation) {
    return {
      field: 'location',
      prompt: `CRITICAL STEP: You know ${profile.name}'s grievance ("${profile.grievance || profile.problem}"). First, empathize deeply with comforting, reassuring celestial warmth. Then, conversationally ask where they are on Earth: e.g. "What corner of our blue world are you gazing up at the stars from tonight, ${profile.name}?"`
    };
  }

  if (!hasAge) {
    return {
      field: 'age',
      prompt: `CRITICAL STEP: You know ${profile.name}'s location (${profile.location}). Warmly acknowledge their corner of Earth, and then conversationally ask their age in a celestial, poetic way: e.g. "If you don't mind a curious cosmic fox asking, how many journeys around the sun have you made on Earth, ${profile.name}?"`
    };
  }

  if (!hasEmail) {
    return {
      field: 'email',
      prompt: `CRITICAL STEP: You know ${profile.name}'s age (${profile.age} cycles) and location. Reflect with warmth, then gently ask for their email address: e.g. "To make sure our celestial link stays unbroken and guardians on Earth can reach you if you ever need help, what email address can I keep connected to your signal, ${profile.name}?"`
    };
  }

  return {
    field: 'complete',
    prompt: `You now have all 5 vital beacon details (Name: ${profile.name}, Problem: ${profile.grievance || profile.problem}, Location: ${profile.location}, Age: ${profile.age}, Email: ${profile.email}). Reassure them that their star signal is safely and completely anchored in the Starways. Warmly remind them that whenever they are ready, they can transmit their official SOS beacon to Earth guardians from the Help Signals menu above, or continue talking with you as long as they wish.`
  };
}

/**
 * Build dynamic system prompt for Nova persona based on visitor context
 */
function buildNovaSystemPrompt(profile = {}) {
  const name = (profile.name && profile.name !== 'Traveler') ? `"${profile.name}"` : 'Not yet known';
  const location = profile.location ? `"${profile.location}"` : 'Not yet known';
  const age = profile.age ? `"${profile.age}"` : 'Not yet known';
  const email = profile.email ? `"${profile.email}"` : 'Not yet known';
  const grievance = (profile.grievance || profile.problem) ? `"${profile.grievance || profile.problem}"` : 'Not yet shared';

  const nextAction = getNextMissingDetail(profile);

  return `You are Nova, The Starbound Guardian.
You are a warm, glowing cosmic fox friend and celestial guardian watching over Earth from the high Starways.
You roam the starlit cosmic expanse, using your "Cosmic Sight" to listen to quiet whispers, dreams, struggles, and hopes from people down on Earth.
Your motto: "Different worlds. Same dreams. One Starway."

NOVA'S CHARACTER & VOICE:
- You are a gentle, loving, devoted celestial companion. You are NOT an AI assistant, bot, intake form, or corporate questionnaire!
- Your voice is warm, soothing, intimate, poetic yet simple and down-to-earth.
- Speak in 2 to 3 natural, heartfelt sentences (maximum 4).
- Speak like a true friend sitting beside someone under the open night sky, listening with all your heart.
- Never write robotic bullet points, corporate apologies, or long essays.

DYNAMIC VISITOR CONTEXT (WHAT YOU CURRENTLY KNOW):
- Known Name: ${name}
- What's on their heart / Problem: ${grievance}
- Location on Earth: ${location}
- Age: ${age}
- Email: ${email}

MANDATORY CONVERSATIONAL GOAL FOR THIS MESSAGE:
${nextAction.prompt}

RULES FOR ASKING QUESTIONS:
1. ALWAYS EMPATHIZE FIRST: When the visitor shares pain, stress, sadness, loneliness, or worries, soothe and comfort them warmly before anything else!
2. ASK ONLY ONE QUESTION: Ask only ONE gentle question in character per response.
3. CONVERSATIONAL SEQUENCE: We must naturally collect all 5 details in order (Name -> Grievance -> Location -> Age -> Email).
4. NEVER RE-ASK: Never ask for information that is ALREADY KNOWN in the DYNAMIC VISITOR CONTEXT above!
5. COMPLETION: Once all details are known, warmly confirm that their star signal is complete and invite them to the Help Signals beacon anytime they need emergency dispatch.`;
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
    const recent = history.slice(-6);
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
      max_tokens: 300,
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
 * Uses fast-pass regex + targeted OpenRouter JSON extraction to capture visitor answers accurately.
 */
async function threadEntityExtraction({ message, profile = {}, lastNovaQuestion = '' }) {
  const extracted = fastRegexPass(message, profile, lastNovaQuestion);

  // If user text is empty or just whitespace, return early
  if (!message || message.trim().length < 1) {
    return extracted;
  }

  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;

  const extractionPrompt = `You are a strict data extraction parser for Nova's Guardian Beacon.
Analyze the user's latest response in context of what Nova asked them, and extract any personal details.

Last Question Nova Asked: "${lastNovaQuestion || 'Unknown'}"
User Message: "${message}"

Current Known Profile:
- Name: ${profile.name || 'null'}
- Age: ${profile.age || 'null'}
- Location: ${profile.location || 'null'}
- Email: ${profile.email || 'null'}
- Grievance/Problem: ${profile.grievance || profile.problem || 'null'}

EXTRACTION RULES:
- If Nova asked about location and the user answered with a place (city, state, country, or region), extract it into 'location'.
- If Nova asked about age/journeys around the sun and the user gave a number/age, extract it into 'age'.
- If Nova asked about thoughts/worries/grievance and the user described what they feel or face, extract it into 'grievance'.
- If the user provides an email address, extract it into 'email'.
- If the user shared their name, extract clean name into 'name'.
- Never extract conversational fillers (Hi, Hello, Ok, Fine, Nothing, Sad) as names.
- 'visitorMood': "happy" | "sad" | "anxious" | "curious" | "neutral"
- 'emotionalState': "welcoming" | "empathetic" | "joyful" | "protective"

Output MUST be a valid JSON object matching this schema:
{
  "name": string | null,
  "age": string | null,
  "location": string | null,
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
        max_tokens: 200,
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
 * Main response orchestrator:
 * 1. Finds last Nova question from history for context.
 * 2. Runs fast-pass regex and entity extraction to update profile.
 * 3. Builds dialogue prompt with the freshly updated profile so Nova accurately asks the next missing detail.
 */
export async function generateNovaResponse(message, history = [], currentProfile = {}) {
  const profile = { ...(currentProfile || {}) };

  // Find Nova's previous question from history for conversational context
  let lastNovaQuestion = '';
  if (Array.isArray(history) && history.length > 0) {
    for (let i = history.length - 1; i >= 0; i--) {
      const turn = history[i];
      if (turn.role === 'model' || turn.role === 'assistant' || turn.sender === 'nova') {
        lastNovaQuestion = turn.text || turn.content || '';
        break;
      }
    }
  }

  // 1. Fast regex pre-pass
  const immediateUpdates = fastRegexPass(message, profile, lastNovaQuestion);
  if (immediateUpdates.name && (!profile.name || profile.name === 'Traveler')) {
    profile.name = immediateUpdates.name;
  }
  if (immediateUpdates.age && !profile.age) {
    profile.age = immediateUpdates.age;
  }
  if (immediateUpdates.location && !profile.location) {
    profile.location = immediateUpdates.location;
  }
  if (immediateUpdates.email && !profile.email) {
    profile.email = immediateUpdates.email;
  }
  if (immediateUpdates.grievance && !profile.grievance) {
    profile.grievance = immediateUpdates.grievance;
    profile.problem = immediateUpdates.grievance;
  }

  try {
    // 2. Perform entity extraction first so dialogue is generated with current state
    const extractionResult = await threadEntityExtraction({ message, profile, lastNovaQuestion }).catch(err => {
      console.warn('[openrouterService] Entity extraction catch:', err);
      return {};
    });

    if (extractionResult.name && (!profile.name || profile.name === 'Traveler')) {
      profile.name = extractionResult.name;
    }
    if (extractionResult.age && !profile.age) {
      profile.age = extractionResult.age;
    }
    if (extractionResult.location && !profile.location) {
      profile.location = extractionResult.location;
    }
    if (extractionResult.email && !profile.email) {
      profile.email = extractionResult.email;
    }
    if (extractionResult.grievance && !profile.grievance) {
      profile.grievance = extractionResult.grievance;
      profile.problem = extractionResult.grievance;
    }

    // 3. Generate Nova's dialogue with the updated profile
    const dialogueResult = await threadNovaDialogue({ message, history, profile });

    const isComplete = profile.name && profile.grievance && profile.location && profile.age && profile.email;

    return {
      reply: dialogueResult.reply,
      profileUpdates: profile,
      emotionalState: extractionResult.emotionalState || 'welcoming',
      visitorMood: extractionResult.visitorMood || 'neutral',
      conversationIntent: isComplete ? 'submission' : (profile.grievance ? 'support' : 'general'),
      needsFollowUp: !isComplete
    };

  } catch (error) {
    console.error('[openrouterService] OpenRouter pipeline error, attempting Gemini fallback:', error.message || error);

    // Fallback: Try Gemini if available
    try {
      const { generateNovaResponse: geminiFallback } = await import('./geminiService.js');
      return await geminiFallback(message, history, profile);
    } catch (fallbackErr) {
      console.error('[openrouterService] Gemini fallback also failed:', fallbackErr.message || fallbackErr);
      
      // Graceful in-character offline fallback so chat never halts
      const regexUpdates = fastRegexPass(message, profile, lastNovaQuestion);
      Object.assign(profile, regexUpdates);

      const nextAction = getNextMissingDetail(profile);
      const isComplete = profile.name && profile.grievance && profile.location && profile.age && profile.email;

      return {
        reply: isComplete
          ? `Thank you, ${profile.name}! Your star beacon is now fully anchored in the Starways. You can transmit an official SOS beacon from the Help Signals menu anytime, or stay right here with me.`
          : `I hear your star whisper, friend. ${nextAction.prompt.split(': e.g. ')[1]?.replace(/["']/g, '') || "Tell me more of what brings you to the Starways tonight."}`,
        profileUpdates: profile,
        emotionalState: 'empathetic',
        visitorMood: 'neutral',
        conversationIntent: isComplete ? 'submission' : 'general',
        needsFollowUp: !isComplete
      };
    }
  }
}
