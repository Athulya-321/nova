import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateNovaResponse } from './services/openrouterService.js';
import { sendGrievanceEmailWithNodeMailer } from './services/nodemailerService.js';

dotenv.config({ path: '.env' }); // Assuming server is run from server/ directory but .env is in root

const app = express();
app.use(cors());
app.use(express.json());

// In-memory store for visitor sessions (for a real app, use a DB or Redis)
const sessions = new Map();

app.post('/api/chat', async (req, res) => {
  try {
    const { conversationId, message, visitorProfile, conversationHistory } = req.body;

    if (!conversationId) {
      return res.status(400).json({ error: 'conversationId is required' });
    }

    // Initialize session if it doesn't exist
    if (!sessions.has(conversationId)) {
      sessions.set(conversationId, {
        profile: visitorProfile || { name: null, age: null, location: null, email: null, grievance: null },
        history: conversationHistory || []
      });
    }

    const session = sessions.get(conversationId);
    
    // Always merge latest visitorProfile from frontend into session profile
    if (visitorProfile && typeof visitorProfile === 'object') {
      Object.entries(visitorProfile).forEach(([k, v]) => {
        if (v !== null && v !== undefined && String(v).trim() !== '') {
          session.profile[k] = v;
        }
      });
    }

    // Always keep history in sync if frontend sent more recent history
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      session.history = [...conversationHistory];
    }
    
    // Add user message to history
    session.history.push({ role: 'user', text: message });

    // Call OpenRouter Multi-Threaded Engine (with Gemini fallback)
    const novaResponse = await generateNovaResponse(message, session.history, session.profile);

    // Merge profile updates safely without wiping out previously known fields
    if (novaResponse.profileUpdates) {
      Object.keys(novaResponse.profileUpdates).forEach(key => {
        const val = novaResponse.profileUpdates[key];
        if (val !== null && val !== undefined && String(val).trim() !== '') {
          session.profile[key] = String(val).trim();
        }
      });
    }

    // Add Nova's response to history
    session.history.push({ role: 'model', text: novaResponse.reply });

    res.json({
      reply: novaResponse.reply,
      profileUpdates: session.profile,
      emotionalState: novaResponse.emotionalState || 'neutral',
      visitorMood: novaResponse.visitorMood || 'neutral',
      conversationIntent: novaResponse.conversationIntent || 'general',
      needsFollowUp: novaResponse.needsFollowUp || false
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: 'Nova is currently experiencing interference in the Starways.' });
  }
});

app.post('/api/submit-grievance', async (req, res) => {
  try {
    const { conversationId } = req.body;
    
    if (!conversationId) {
      return res.status(400).json({ success: false, message: 'Invalid or missing conversation session ID.' });
    }

    // Initialize session if missing (e.g. direct transmission from Help Signals modal)
    if (!sessions.has(conversationId)) {
      sessions.set(conversationId, {
        profile: {},
        history: []
      });
    }

    const session = sessions.get(conversationId);
    
    if (session.emailNotificationSent) {
      return res.status(400).json({ success: false, message: 'Signal already submitted.' });
    }

    // Merge any explicit fields passed in req.body into session profile
    const profile = session.profile || {};
    ['name', 'age', 'location', 'place', 'email', 'grievance'].forEach(field => {
      if (req.body[field]) {
        profile[field] = req.body[field];
      }
    });

    const placeValue = String(profile.place || profile.location || '').trim();
    profile.place = placeValue;
    profile.location = placeValue;

    // Verification check: ensure we have visitor's name, age, place, and email (all mandatory)
    const missingFields = [];
    if (!profile.name || !String(profile.name).trim()) missingFields.push('name');
    if (!profile.age || !String(profile.age).trim()) missingFields.push('age');
    if (!placeValue) missingFields.push('place / location');
    if (!profile.email || !String(profile.email).trim()) missingFields.push('email address');

    if (missingFields.length > 0) {
      return res.status(422).json({
        success: false,
        message: `Signal incomplete: Nova requires your ${missingFields.join(', ')} before transmitting across the Starways. All details are mandatory.`,
        missingFields
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(profile.email).trim())) {
      return res.status(422).json({
        success: false,
        message: 'Invalid email address format. Please provide a valid email so Nova can send your copy signal.'
      });
    }

    // Generate submission timestamp in backend
    const submittedAt = new Date();
    
    // Send Email via Nodemailer to nova0hero@gmail.com
    await sendGrievanceEmailWithNodeMailer(profile, submittedAt);
    
    // Mark as sent
    session.emailNotificationSent = true;
    session.submissionStatus = 'submitted';

    res.json({ success: true, message: 'Signal transmitted across the Starways to Nova!' });
  } catch (error) {
    console.error('Submit API Error:', error);
    res.status(500).json({ success: false, message: error.message || 'The signal could not be delivered.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Nova Backend active on port ${PORT}`);
});
