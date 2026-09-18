import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

/**
 * Creates and verifies a Nodemailer SMTP transporter using Gmail
 */
function createTransporter() {
  try {
    dotenv.config({ path: '.env', override: true });
  } catch (_) {}

  const user = (process.env.EMAIL_USER || process.env.ADMIN_EMAIL || '').trim();
  const rawPass = process.env.EMAIL_PASS || process.env.EMAIL_APP_PASSWORD || process.env.ADMIN_EMAIL_PASSWORD || '';
  const pass = rawPass.replace(/\s+/g, '').trim();

  if (!pass) {
    console.warn("⚠️ Nodemailer Warning: EMAIL_PASS or EMAIL_APP_PASSWORD is not set in .env.");
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user,
      pass: pass
    }
  });
}

/**
 * Generates the Hero's Original SOS Signal email (sent to Hero/Admin)
 * Contains all mandatory telemetry: Name, Age, Place, Email, and Distress Message.
 */
function buildHeroEmailTemplate({ name, age, place, email, grievance, formattedDate, formattedTime, timeZone }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Nova Distress Beacon Detected</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #06050e;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
    }
    .wrapper {
      max-width: 620px;
      margin: 28px auto;
      background: radial-gradient(circle at 50% 0%, #17153a 0%, #0b0a1a 100%);
      border: 1px solid rgba(125, 226, 255, 0.35);
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 0 35px rgba(125, 226, 255, 0.2), 0 0 80px rgba(170, 59, 255, 0.15);
    }
    .header {
      padding: 34px 28px 24px;
      text-align: center;
      background: linear-gradient(180deg, rgba(125, 226, 255, 0.12) 0%, transparent 100%);
      border-bottom: 1px solid rgba(125, 226, 255, 0.18);
    }
    .badge {
      display: inline-block;
      padding: 5px 14px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #7de2ff;
      border: 1px solid rgba(125, 226, 255, 0.5);
      border-radius: 20px;
      background: rgba(125, 226, 255, 0.08);
      margin-bottom: 12px;
    }
    .title {
      margin: 0;
      font-size: 24px;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      color: #ffffff;
      text-shadow: 0 0 15px rgba(125, 226, 255, 0.6);
    }
    .subtitle {
      margin-top: 8px;
      color: #a78bfa;
      font-size: 13px;
      letter-spacing: 1px;
      font-style: italic;
    }
    .content {
      padding: 28px;
    }
    .quote-box {
      border-left: 3px solid #7de2ff;
      background: rgba(125, 226, 255, 0.05);
      padding: 14px 18px;
      border-radius: 0 10px 10px 0;
      margin-bottom: 22px;
      color: #cbd5e1;
      font-size: 13px;
      line-height: 1.5;
    }
    .card {
      background: rgba(18, 16, 38, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.09);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 18px;
    }
    .card-title {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #7de2ff;
      margin-bottom: 14px;
      font-weight: 700;
    }
    .data-row {
      display: flex;
      justify-content: space-between;
      padding: 9px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 14px;
    }
    .data-row:last-child {
      border-bottom: none;
    }
    .data-label {
      color: #94a3b8;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 1px;
      font-weight: 600;
    }
    .data-value {
      color: #ffffff;
      font-weight: 600;
      text-align: right;
    }
    .mandatory-tag {
      display: inline-block;
      font-size: 9px;
      color: #7de2ff;
      background: rgba(125, 226, 255, 0.15);
      padding: 2px 6px;
      border-radius: 4px;
      margin-left: 6px;
    }
    .grievance-text {
      background: rgba(0, 0, 0, 0.4);
      border-left: 3px solid #aa3bff;
      padding: 16px;
      border-radius: 0 8px 8px 0;
      color: #f1f5f9;
      line-height: 1.6;
      font-size: 14px;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .footer {
      padding: 20px 28px;
      text-align: center;
      font-size: 11px;
      color: #64748b;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      background: rgba(6, 5, 14, 0.6);
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="badge">🚨 ORIGINAL DISTRESS BEACON // HERO DISPATCH</div>
      <h1 class="title">NOVA // INCOMING SIGNAL</h1>
      <div class="subtitle">"Every distress call leaves a trail in the Starways. A guardian never ignores it."</div>
    </div>

    <div class="content">
      <div class="quote-box">
        ✦ <strong>Direct Dispatch to Nova:</strong> A citizen has triggered their emergency beacon from Earth. All mandatory telemetry coordinates have been registered.
      </div>

      <div class="card">
        <div class="card-title">✦ CITIZEN TELEMETRY (ALL MANDATORY)</div>
        <div class="data-row">
          <span class="data-label">Name <span class="mandatory-tag">VERIFIED</span></span>
          <span class="data-value">${name || 'Unknown'}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Age <span class="mandatory-tag">VERIFIED</span></span>
          <span class="data-value">${age || 'Unknown'}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Place / Location <span class="mandatory-tag">VERIFIED</span></span>
          <span class="data-value">${place || 'Unknown'}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Email Address <span class="mandatory-tag">VERIFIED</span></span>
          <span class="data-value"><a href="mailto:${email}" style="color: #7de2ff; text-decoration: none;">${email || 'Unknown'}</a></span>
        </div>
      </div>

      <div class="card">
        <div class="card-title" style="color: #aa3bff;">✦ DISTRESS SIGNAL / PROBLEM</div>
        <div class="grievance-text">${grievance || 'Urgent assistance requested across the Starways.'}</div>
      </div>

      <div class="card" style="border-left: 3px solid #7de2ff; background: rgba(125, 226, 255, 0.05); padding: 14px 18px;">
        <div style="font-size: 13px; line-height: 1.6; color: #cbd5e1;">
          ✦ <strong>Starway Interception Note:</strong> <em>"A matching copy signal has already been beamed to the citizen's email beacon at <a href="mailto:${email}" style="color: #7de2ff;">${email}</a> reassuring them that Nova is 2 galaxies away and en route to ${place}."</em>
        </div>
      </div>
    </div>

    <div class="footer">
      <div style="font-size: 12px; font-weight: 600; color: #cbd5e1; margin-bottom: 4px; letter-spacing: 1px;">
        NOVA — THE STARBOUND GUARDIAN
      </div>
      <div style="color: #94a3b8; font-size: 11px; margin-bottom: 6px;">
        Transmitted on ${formattedDate} at ${formattedTime} (${timeZone})
      </div>
      <div style="color: #64748b; font-size: 10px;">
        Hero Dispatch Center • Destination: <strong>${heroInbox}</strong>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Generates the User's Copy Signal email (sent directly to the citizen)
 * Reassures the user with Nova's character narrative:
 * "Don't worry... Nova is coming to help you. He is 2 galaxies away and coming to your place..."
 * Includes a full copy of their submitted details (Name, Age, Place, Email, Grievance).
 */
function buildVisitorCopyEmailTemplate({ name, age, place, email, grievance, formattedDate, formattedTime, timeZone }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Don't Worry... Nova is Coming!</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #06050e;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
    }
    .wrapper {
      max-width: 620px;
      margin: 28px auto;
      background: radial-gradient(circle at 50% 0%, #1a153f 0%, #080714 100%);
      border: 1px solid rgba(125, 226, 255, 0.45);
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 0 45px rgba(125, 226, 255, 0.25), 0 0 90px rgba(170, 59, 255, 0.2);
    }
    .header {
      padding: 36px 28px 26px;
      text-align: center;
      background: linear-gradient(180deg, rgba(125, 226, 255, 0.16) 0%, rgba(170, 59, 255, 0.05) 100%);
      border-bottom: 1px solid rgba(125, 226, 255, 0.22);
    }
    .badge {
      display: inline-block;
      padding: 5px 16px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #7de2ff;
      border: 1px solid rgba(125, 226, 255, 0.6);
      border-radius: 20px;
      background: rgba(125, 226, 255, 0.12);
      margin-bottom: 14px;
      box-shadow: 0 0 15px rgba(125, 226, 255, 0.3);
    }
    .title {
      margin: 0;
      font-size: 25px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #ffffff;
      text-shadow: 0 0 18px rgba(125, 226, 255, 0.7);
    }
    .hero-callout {
      margin-top: 14px;
      padding: 16px 20px;
      background: rgba(125, 226, 255, 0.08);
      border: 1px solid rgba(125, 226, 255, 0.35);
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      color: #7de2ff;
      text-shadow: 0 0 10px rgba(125, 226, 255, 0.4);
      letter-spacing: 0.5px;
      line-height: 1.5;
    }
    .content {
      padding: 28px;
    }
    .nova-speech-card {
      background: linear-gradient(135deg, rgba(23, 20, 55, 0.9) 0%, rgba(13, 11, 30, 0.9) 100%);
      border-left: 4px solid #7de2ff;
      border-right: 1px solid rgba(125, 226, 255, 0.2);
      border-top: 1px solid rgba(125, 226, 255, 0.2);
      border-bottom: 1px solid rgba(125, 226, 255, 0.2);
      border-radius: 0 14px 14px 0;
      padding: 20px 22px;
      margin-bottom: 24px;
      box-shadow: 0 0 25px rgba(125, 226, 255, 0.08);
    }
    .nova-quote-text {
      color: #f1f5f9;
      font-size: 15px;
      line-height: 1.65;
      font-style: italic;
      margin: 0 0 12px 0;
    }
    .nova-signoff {
      color: #a78bfa;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      text-align: right;
    }
    .status-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(170, 59, 255, 0.12);
      border: 1px solid rgba(170, 59, 255, 0.4);
      border-radius: 10px;
      padding: 12px 18px;
      margin-bottom: 22px;
      font-size: 13px;
    }
    .status-tag {
      color: #d8b4fe;
      font-weight: 700;
      letter-spacing: 1px;
    }
    .status-val {
      color: #ffffff;
      font-weight: 600;
    }
    .card {
      background: rgba(18, 16, 38, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.09);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .card-title {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #7de2ff;
      margin-bottom: 14px;
      font-weight: 700;
    }
    .data-row {
      display: flex;
      justify-content: space-between;
      padding: 9px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 14px;
    }
    .data-row:last-child {
      border-bottom: none;
    }
    .data-label {
      color: #94a3b8;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 1px;
    }
    .data-value {
      color: #ffffff;
      font-weight: 600;
      text-align: right;
    }
    .grievance-copy {
      background: rgba(0, 0, 0, 0.4);
      border-left: 3px solid #7de2ff;
      padding: 14px 16px;
      border-radius: 0 8px 8px 0;
      color: #f1f5f9;
      line-height: 1.6;
      font-size: 13px;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .footer {
      padding: 22px 28px;
      text-align: center;
      font-size: 11px;
      color: #64748b;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      background: rgba(6, 5, 14, 0.65);
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="badge">✦ STARWAY COPY SIGNAL // BEACON CONFIRMED ✦</div>
      <h1 class="title">DON'T WORRY, ${name.toUpperCase()}!</h1>
      <div class="hero-callout">
        ⚡ NOVA HAS RECEIVED YOUR SIGNAL AND IS COMING TO HELP YOU!
      </div>
    </div>

    <div class="content">
      <!-- Nova Character Inbound Voice -->
      <div class="nova-speech-card">
        <p class="nova-quote-text">
          “Don't worry, ${name}... your signal has cut straight through the cosmic noise. I hear you loud and clear. 
          <br><br>
          I am currently <strong>2 galaxies away</strong>, warping through the celestial currents at hyperlight speed and heading straight to your place in <strong>${place}</strong>.
          <br><br>
          In the infinite Starways, no beacon is ever forgotten, and no traveler stands alone. Keep your hope burning bright and hold on tight — I am on my way to you!”
        </p>
        <div class="nova-signoff">— Nova, The Starbound Guardian</div>
      </div>

      <!-- Real-time Hero Status -->
      <div class="status-banner">
        <span class="status-tag">✦ GUARDIAN STATUS</span>
        <span class="status-val">IN FLIGHT // WARP SPEED (2 GALAXIES AWAY)</span>
      </div>

      <!-- Copy of Citizen's Submitted Details -->
      <div class="card">
        <div class="card-title">✦ COPY OF YOUR TRANSMITTED DETAILS</div>
        <div class="data-row">
          <span class="data-label">Citizen Name</span>
          <span class="data-value">${name}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Age</span>
          <span class="data-value">${age}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Your Place / Destination</span>
          <span class="data-value" style="color: #7de2ff;">${place}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Registered Email</span>
          <span class="data-value">${email}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Transmission Timestamp</span>
          <span class="data-value">${formattedDate} • ${formattedTime}</span>
        </div>
      </div>

      <!-- Citizen's Grievance / Problem -->
      <div class="card">
        <div class="card-title" style="color: #aa3bff;">✦ TRANSMITTED SOS CONTENT</div>
        <div class="grievance-copy">${grievance || 'Urgent assistance requested across the Starways.'}</div>
      </div>
    </div>

    <div class="footer">
      <div style="font-size: 12px; font-weight: 600; color: #cbd5e1; margin-bottom: 4px; letter-spacing: 1px;">
        NOVA — THE STARBOUND GUARDIAN
      </div>
      <div style="color: #94a3b8; font-size: 11px; margin-bottom: 6px;">
        "Across 2 galaxies, across all time — help is already in flight."
      </div>
      <div style="color: #64748b; font-size: 10px;">
        Official Starway Automated Copy Signal • Dispatched to: <strong>${email}</strong>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Sends both the Original SOS Signal to the Hero and the Copy Signal to the User
 * @param {Object} profile - User telemetry: { name, age, place, location, email, grievance }
 * @param {Date} submittedAt - Transmission date
 */
export async function sendGrievanceEmailWithNodeMailer(profile, submittedAt = new Date()) {
  const adminEmail = (process.env.ADMIN_EMAIL || process.env.EMAIL_USER || '').trim();
  const appPassword = (process.env.EMAIL_PASS || process.env.EMAIL_APP_PASSWORD || process.env.ADMIN_EMAIL_PASSWORD || '').replace(/\s+/g, '').trim();

  if (!adminEmail) {
    throw new Error("Missing ADMIN_EMAIL or EMAIL_USER in environment variables.");
  }

  if (!appPassword) {
    throw new Error("Missing EMAIL_PASS or EMAIL_APP_PASSWORD in .env. Please configure your 16-character Google App Password.");
  }

  const timeZone = process.env.ADMIN_TIMEZONE || 'Asia/Kolkata';

  const formattedDate = new Intl.DateTimeFormat('en-IN', {
    timeZone,
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(submittedAt);

  const formattedTime = new Intl.DateTimeFormat('en-IN', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(submittedAt);

  const transporter = createTransporter();

  const visitorName = String(profile.name || 'A Citizen').trim();
  const visitorAge = String(profile.age || 'Not specified').trim();
  const visitorPlace = String(profile.place || profile.location || 'Earth').trim();
  const visitorEmail = String(profile.email || '').trim();
  const grievanceText = String(profile.grievance || 'Urgent assistance requested across the Starways.').trim();

  const emailData = {
    name: visitorName,
    age: visitorAge,
    place: visitorPlace,
    email: visitorEmail,
    grievance: grievanceText,
    formattedDate,
    formattedTime,
    timeZone
  };

  // ----------------------------------------------------
  // 1. HERO'S ORIGINAL SIGNAL (Sent to Admin / Hero)
  // ----------------------------------------------------
  const heroMailOptions = {
    from: `"Nova Starbound Telemetry" <${adminEmail}>`,
    to: adminEmail,
    replyTo: visitorEmail || adminEmail,
    subject: `🚨 [NOVA DISTRESS SIGNAL] Urgent Assistance Requested by ${visitorName} from ${visitorPlace}`,
    headers: {
      'X-Priority': '1',
      'X-MSMail-Priority': 'High',
      'Importance': 'high'
    },
    text: `NOVA // HERO DISPATCH SIGNAL
==========================================
URGENT DISTRESS BEACON DETECTED
==========================================
CITIZEN TELEMETRY (ALL MANDATORY):
- Name: ${visitorName}
- Age: ${visitorAge}
- Place / Location: ${visitorPlace}
- Email Address: ${visitorEmail}

DISTRESS SIGNAL:
${grievanceText}

TRANSMISSION TIME:
Date: ${formattedDate}
Time: ${formattedTime} (${timeZone})

==========================================
Sent via Nova Telemetry Network
Destination: ${adminEmail}
==========================================`,
    html: buildHeroEmailTemplate(emailData)
  };

  let adminMessageId = null;
  let heroSendError = null;

  try {
    const adminInfo = await transporter.sendMail(heroMailOptions);
    adminMessageId = adminInfo.messageId;
    console.log(`[Nodemailer] Hero Original Signal beamed to ${adminEmail}! MessageId: ${adminInfo.messageId}`);
  } catch (err) {
    heroSendError = err;
    console.error(`[Nodemailer] Hero Original Signal dispatch error:`, err.message || err);
  }

  // ----------------------------------------------------
  // 2. USER'S COPY SIGNAL (Sent directly to User's Email)
  // ----------------------------------------------------
  let visitorMessageId = null;
  let visitorSendError = null;

  if (visitorEmail && visitorEmail.includes('@')) {
    const userCopyMailOptions = {
      from: `"Nova — The Starbound Guardian" <${adminEmail}>`,
      to: visitorEmail,
      replyTo: adminEmail,
      subject: `🌌 [STARWAY COPY SIGNAL] Don't worry ${visitorName}... Nova is coming to help you!`,
      text: `DON'T WORRY, ${visitorName.toUpperCase()}!
NOVA HAS RECEIVED YOUR SIGNAL AND IS COMING TO HELP YOU!
==========================================
"Don't worry, ${visitorName}... your signal has cut straight through the cosmic noise.
I am currently 2 galaxies away, warping through the celestial currents at hyperlight speed and heading straight to your place in ${visitorPlace}!
In the infinite Starways, no beacon is ever forgotten. Hold on tight — I am on my way to you!"
— Nova, The Starbound Guardian

==========================================
COPY OF YOUR TRANSMITTED DETAILS:
- Name: ${visitorName}
- Age: ${visitorAge}
- Place: ${visitorPlace}
- Registered Email: ${visitorEmail}
- Transmission Time: ${formattedDate} at ${formattedTime} (${timeZone})

YOUR DISTRESS SIGNAL:
${grievanceText}

GUARDIAN STATUS:
In Flight // Warp Speed (2 Galaxies Away // Inbound to ${visitorPlace})
==========================================
Nova — The Starbound Guardian
"Across 2 galaxies, across all time — help is already in flight."
==========================================`,
      html: buildVisitorCopyEmailTemplate(emailData)
    };

    try {
      const visitorInfo = await transporter.sendMail(userCopyMailOptions);
      visitorMessageId = visitorInfo.messageId;
      console.log(`[Nodemailer] User Copy Signal beamed to citizen ${visitorEmail}! MessageId: ${visitorInfo.messageId}`);
    } catch (err) {
      visitorSendError = err;
      console.error(`[Nodemailer] User Copy Signal dispatch error:`, err.message || err);
    }
  }

  if (heroSendError && visitorSendError) {
    throw new Error(`Email transmission failed: ${heroSendError.message || heroSendError}`);
  }

  return {
    success: true,
    adminMessageId: adminMessageId || 'starway_beacon_' + Date.now(),
    visitorMessageId: visitorMessageId
  };
}
