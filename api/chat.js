import { generateNovaResponse } from '../server/services/openrouterService.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message, visitorProfile, conversationHistory } = req.body || {};
    const result = await generateNovaResponse(
      message || '',
      conversationHistory || [],
      visitorProfile || {}
    );
    return res.status(200).json(result);
  } catch (err) {
    console.error('[Vercel API] chat error:', err.message || err);
    return res.status(500).json({ error: err.message || 'Interference in the Starways' });
  }
}
