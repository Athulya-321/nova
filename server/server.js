import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateNovaResponse } from './services/geminiService.js';
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
    
    // Add user message to history
    session.history.push({ role: 'user', text: message });

    // Call Gemini
    const geminiResponse = await generateNovaResponse(message, session.history, session.profile);

    // Merge profile updates
    if (geminiResponse.profileUpdates) {
      Object.keys(geminiResponse.profileUpdates).forEach(key => {
        if (geminiResponse.profileUpdates[key] !== null) {
          session.profile[key] = geminiResponse.profileUpdates[key];
        }
      });
    }

    // Add Nova's response to history
    session.history.push({ role: 'model', text: geminiResponse.reply });

    res.json({
      reply: geminiResponse.reply,
      profileUpdates: session.profile,
      emotionalState: geminiResponse.emotionalState || 'neutral',
      visitorMood: geminiResponse.visitorMood || 'neutral',
      conversationIntent: geminiResponse.conversationIntent || 'general',
      needsFollowUp: geminiResponse.needsFollowUp || false
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: 'Nova is currently experiencing interference in the Starways.' });
  }
});

app.post('/api/submit-grievance', async (req, res) => {
  try {
    const { conversationId } = req.body;
    
    if (!conversationId || !sessions.has(conversationId)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing conversation session.' });
    }

    const session = sessions.get(conversationId);
    
    if (session.emailNotificationSent) {
      return res.status(400).json({ success: false, message: 'Signal already submitted.' });
    }

    // Merge any explicit fields passed in req.body into session profile
    const profile = session.profile || {};
    ['name', 'age', 'location', 'email', 'grievance'].forEach(field => {
      if (req.body[field] && !profile[field]) {
        profile[field] = req.body[field];
      }
    });

    // Verification check: ensure we have visitor's name, age, location, and email
    const missingFields = [];
    if (!profile.name || !String(profile.name).trim()) missingFields.push('name');
    if (!profile.age || !String(profile.age).trim()) missingFields.push('age');
    if (!profile.location || !String(profile.location).trim()) missingFields.push('location');
    if (!profile.email || !String(profile.email).trim()) missingFields.push('email');

    if (missingFields.length > 0) {
      return res.status(422).json({
        success: false,
        message: `Signal incomplete: Nova still requires your ${missingFields.join(', ')} before transmitting across the Starways.`,
        missingFields
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
