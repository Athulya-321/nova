import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import { sendGrievanceEmailWithNodeMailer } from '../server/services/nodemailerService.js';

async function testDualEmail() {
  console.log('====================================================');
  console.log('  🌌 TESTING DUAL-EMAIL SOS SIGNAL DISPATCH 🌌     ');
  console.log('====================================================\n');

  const adminEmail = (process.env.ADMIN_EMAIL || process.env.EMAIL_USER || '').trim();
  console.log(`- Admin / Hero Email: ${adminEmail}`);

  const testProfile = {
    name: 'Adhithyan',
    age: '24',
    place: 'Wayanad, Kerala',
    location: 'Wayanad, Kerala',
    email: adminEmail, // Send copy to self for testing
    grievance: 'Live verification: Testing both Hero Original Signal and Citizen Copy Signal (Nova 2 galaxies away).'
  };

  console.log('- Test Payload:', JSON.stringify(testProfile, null, 2));
  console.log('\n- Transmitting signals across the Starways...');

  const startTime = Date.now();
  try {
    const result = await sendGrievanceEmailWithNodeMailer(testProfile, new Date());
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n✅ TRANSMISSION COMPLETE in ${duration}s!`);
    console.log(`📬 Hero Original Signal Message ID: ${result.adminMessageId}`);
    console.log(`🌟 Citizen Copy Signal Message ID: ${result.visitorMessageId}`);
    console.log('====================================================');
  } catch (err) {
    console.error('\n❌ Transmission test failed:', err.message || err);
  }
}

testDualEmail();
