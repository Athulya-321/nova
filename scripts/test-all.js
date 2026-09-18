import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import { generateNovaResponse } from '../server/services/openrouterService.js';
import { sendGrievanceEmailWithNodeMailer } from '../server/services/nodemailerService.js';
import nodemailer from 'nodemailer';

async function runVerification() {
  console.log('====================================================');
  console.log('       🌟 NOVA SYSTEM DIAGNOSTIC & VERIFICATION 🌟  ');
  console.log('====================================================\n');

  // ----------------------------------------------------
  // PART 1: CHATBOT / OPENROUTER VERIFICATION
  // ----------------------------------------------------
  console.log('▶ [1/2] TESTING NOVA CHATBOT & OPENROUTER CONNECTION...');
  const chatStartTime = Date.now();
  const testMessage = "Hello Nova! My name is Adhithyan, and I am reaching out from Kerala under the stars.";

  console.log(`- Sending test prompt to Nova: "${testMessage}"`);

  try {
    const response = await generateNovaResponse(testMessage, [], {});
    const chatDuration = ((Date.now() - chatStartTime) / 1000).toFixed(2);

    console.log(`\n✅ CHATBOT STATUS: ONLINE & RESPONSIVE (${chatDuration}s)`);
    console.log('----------------------------------------------------');
    console.log(`💬 Nova's Reply: "${response.reply}"`);
    console.log(`👤 Extracted Profile:`, JSON.stringify(response.profileUpdates, null, 2));
    console.log(`🎭 Emotional State: ${response.emotionalState}`);
    console.log(`✨ Visitor Mood: ${response.visitorMood}`);
    console.log('----------------------------------------------------\n');
  } catch (err) {
    console.error('\n❌ CHATBOT TEST FAILED:', err.message || err);
  }

  // ----------------------------------------------------
  // PART 2: EMAIL / NODEMAILER VERIFICATION
  // ----------------------------------------------------
  console.log('▶ [2/2] TESTING GMAIL SMTP & LIVE EMAIL TRANSMISSION...');
  
  const user = (process.env.EMAIL_USER || process.env.ADMIN_EMAIL || '').trim();
  const pass = (process.env.EMAIL_PASS || process.env.EMAIL_APP_PASSWORD || '').replace(/\s+/g, '').trim();

  console.log(`- Sender / Admin Account: ${user}`);
  console.log(`- Checking SMTP Authentication with smtp.gmail.com...`);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });

  try {
    await transporter.verify();
    console.log('✅ SMTP Connection & Credentials Verified with Google Gmail!\n');

    console.log('- Transmitting live SOS Star Signal email...');
    const mailStartTime = Date.now();

    const testProfile = {
      name: 'Adhithyan',
      age: '24',
      location: 'Kerala, India',
      email: user,
      grievance: 'Live verification test: Testing whether the Nova Starway SOS signal and two-way visitor reassurance emails are beamed into Gmail successfully!'
    };

    const mailResult = await sendGrievanceEmailWithNodeMailer(testProfile, new Date());
    const mailDuration = ((Date.now() - mailStartTime) / 1000).toFixed(2);

    console.log(`\n✅ EMAIL DISPATCH STATUS: DELIVERED (${mailDuration}s)`);
    console.log('----------------------------------------------------');
    console.log(`📬 Admin SOS Alert Message ID: ${mailResult.adminMessageId}`);
    if (mailResult.visitorMessageId) {
      console.log(`🌟 Visitor Reassurance Message ID: ${mailResult.visitorMessageId}`);
    }
    console.log(`📩 Recipient Inbox: ${user}`);
    console.log('----------------------------------------------------\n');

  } catch (err) {
    console.error('\n❌ EMAIL TEST FAILED:', err.message || err);
  }

  console.log('====================================================');
  console.log('               DIAGNOSTIC COMPLETE                  ');
  console.log('====================================================');
}

runVerification();
