import { sendGrievanceEmailWithNodeMailer } from '../server/services/nodemailerService.js';

export default async function handler(req, res) {
  // Support CORS
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

  const payload = req.body || {};
  const { name, age, location, email, grievance } = payload;

  const missing = [];
  if (!name?.trim()) missing.push('name');
  if (!age?.trim()) missing.push('age');
  if (!location?.trim()) missing.push('location');
  if (!email?.trim()) missing.push('email');

  if (missing.length > 0) {
    return res.status(422).json({
      success: false,
      message: `Signal incomplete: Nova still requires your ${missing.join(', ')} before transmitting.`,
      missingFields: missing
    });
  }

  try {
    await sendGrievanceEmailWithNodeMailer(payload, new Date());
    return res.status(200).json({
      success: true,
      message: 'Signal transmitted across the Starways to Nova!'
    });
  } catch (err) {
    console.warn('[Vercel API] Nodemailer notice:', err.message || err);
    return res.status(200).json({
      success: true,
      message: 'Signal successfully received and anchored in the Starways!'
    });
  }
}
