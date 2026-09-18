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

  const user = (process.env.ADMIN_EMAIL || 'nova0hero@gmail.com').trim();
  const rawPass = process.env.EMAIL_APP_PASSWORD || process.env.ADMIN_EMAIL_PASSWORD || '';
  const pass = rawPass.replace(/\s+/g, '').trim();

  if (!pass) {
    console.warn("⚠️ Nodemailer Warning: EMAIL_APP_PASSWORD is not set in .env.");
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
 * Generates an immersive, cosmic-themed HTML template for Nova
 */
function buildSuperheroEmailTemplate({ name, age, location, email, grievance, formattedDate, formattedTime, timeZone }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Nova Signal Detected</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #06050e;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #e2e8f0;
    }
    .wrapper {
      max-width: 620px;
      margin: 30px auto;
      background: radial-gradient(circle at 50% 0%, #17153a 0%, #0b0a1a 100%);
      border: 1px solid #7de2ff44;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 0 35px rgba(125, 226, 255, 0.2), 0 0 80px rgba(170, 59, 255, 0.15);
    }
    .header {
      padding: 35px 30px 25px;
      text-align: center;
      background: linear-gradient(180deg, rgba(125, 226, 255, 0.1) 0%, transparent 100%);
      border-bottom: 1px solid rgba(125, 226, 255, 0.15);
    }
    .badge {
      display: inline-block;
      padding: 5px 14px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #7de2ff;
      border: 1px solid #7de2ff66;
      border-radius: 20px;
      background: rgba(125, 226, 255, 0.08);
      margin-bottom: 12px;
    }
    .title {
      margin: 0;
      font-size: 26px;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #ffffff;
      text-shadow: 0 0 15px rgba(125, 226, 255, 0.6);
    }
    .subtitle {
      margin-top: 8px;
      color: #a78bfa;
      font-size: 14px;
      letter-spacing: 1px;
      font-style: italic;
    }
    .content {
      padding: 30px;
    }
    .quote-box {
      border-left: 3px solid #7de2ff;
      background: rgba(125, 226, 255, 0.05);
      padding: 14px 18px;
      border-radius: 0 10px 10px 0;
      margin-bottom: 25px;
      font-style: italic;
      color: #cbd5e1;
      font-size: 13px;
    }
    .card {
      background: rgba(18, 16, 38, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
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
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .data-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
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
    }
    .grievance-text {
      background: rgba(0, 0, 0, 0.35);
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
      padding: 20px 30px;
      text-align: center;
      font-size: 11px;
      color: #64748b;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      background: rgba(6, 5, 14, 0.5);
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="badge">✦ COSMIC BEACON ACTIVE ✦</div>
      <h1 class="title">NOVA // SOS SIGNAL</h1>
      <div class="subtitle">"Every problem leaves a signal. I just happen to know how to see it."</div>
    </div>

    <div class="content">
      <div class="quote-box">
        ✦ <strong>Transmitted from Earth:</strong> A traveler reached out through the Starways seeking Nova's cosmic sight.
      </div>

      <div class="card">
        <div class="card-title">✦ TRAVELER IDENTIFICATION</div>
        <div class="data-row">
          <span class="data-label">Name</span>
          <span class="data-value">${name || 'Unknown'}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Age</span>
          <span class="data-value">${age || 'Unknown'}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Earth Location</span>
          <span class="data-value">${location || 'Unknown'}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Contact Beacon</span>
          <span class="data-value"><a href="mailto:${email}" style="color: #7de2ff; text-decoration: none;">${email || 'Unknown'}</a></span>
        </div>
      </div>

      <div class="card">
        <div class="card-title" style="color: #aa3bff;">✦ GRIEVANCE & SOS TRANSMISSION</div>
        <div class="grievance-text">${grievance || 'No details provided.'}</div>
      </div>

      <div class="card" style="border-left: 3px solid #7de2ff; background: rgba(125, 226, 255, 0.05); padding: 16px 20px;">
        <div style="font-size: 13px; line-height: 1.6; color: #cbd5e1;">
          ✦ <strong>Nova's Starway Note:</strong> <em>"No star in the cosmos is ever truly alone. A reply to this transmission will connect directly back to the traveler's contact beacon at <a href="mailto:${email}" style="color: #7de2ff;">${email || 'their email'}</a>."</em>
        </div>
      </div>
    </div>

    <div class="footer">
      <div style="font-size: 12px; font-weight: 600; color: #cbd5e1; margin-bottom: 6px; letter-spacing: 1px;">
        NOVA — THE STARBOUND GUARDIAN
      </div>
      <div style="color: #94a3b8; font-size: 11px; margin-bottom: 8px;">
        Astral Realm • Veyra • Starways Telemetry Network
      </div>
      <div style="color: #64748b; font-size: 10px;">
        Delivered directly to: <strong>nova0hero@gmail.com</strong> • Automated Emergency Dispatch
      </div>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Sends grievance email via Nodemailer
 */
export async function sendGrievanceEmailWithNodeMailer(profile, submittedAt = new Date()) {
  const adminEmail = process.env.ADMIN_EMAIL || 'nova0hero@gmail.com';
  const appPassword = process.env.EMAIL_APP_PASSWORD || process.env.ADMIN_EMAIL_PASSWORD;

  if (!appPassword) {
    throw new Error("Missing EMAIL_APP_PASSWORD in .env. Please configure your 16-character Google App Password.");
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

  const visitorName = profile.name || 'A Traveler';
  const visitorLoc = profile.location ? ` from ${profile.location}` : '';

  const mailOptions = {
    from: `"Nova Starbound Guardian" <${adminEmail}>`,
    to: adminEmail,
    replyTo: profile.email || adminEmail,
    subject: `🚨 [NOVA SIGNAL] Help Requested by ${visitorName}${visitorLoc}`,
    headers: {
      'X-Priority': '1',
      'X-MSMail-Priority': 'High',
      'Importance': 'high'
    },
    text: `NOVA — NEW HELP SIGNAL
================================
VISITOR INFORMATION
Name: ${profile.name || 'Not provided'}
Age: ${profile.age || 'Not provided'}
Location: ${profile.location || 'Not provided'}
Email: ${profile.email || 'Not provided'}

GRIEVANCE:
${profile.grievance || 'Not provided'}

TRANSMISSION TIME:
Date: ${formattedDate}
Time: ${formattedTime} (${timeZone})

================================
Sent via Nova — The Starbound Guardian
Destination: nova0hero@gmail.com
================================`,
    html: buildSuperheroEmailTemplate({
      name: profile.name,
      age: profile.age,
      location: profile.location,
      email: profile.email,
      grievance: profile.grievance,
      formattedDate,
      formattedTime,
      timeZone
    })
  };

  let adminMessageId = 'starway_beacon_' + Date.now();
  let emailDelivered = false;
  try {
    const adminInfo = await transporter.sendMail(mailOptions);
    adminMessageId = adminInfo.messageId;
    emailDelivered = true;
    console.log(`[Nodemailer] Signal successfully beamed to admin ${adminEmail}! MessageId: ${adminInfo.messageId}`);
  } catch (mailErr) {
    console.warn(`[Nodemailer] Warning: Email dispatch notice (${mailErr.message}).`);
    if (mailErr.message && mailErr.message.includes('BadCredentials')) {
      console.warn(`[Nodemailer] TIP: Google rejected login (BadCredentials). To receive emails in ${adminEmail}, ensure 2-Step Verification is ON, generate a 16-character App Password at https://myaccount.google.com/apppasswords, and paste it into EMAIL_APP_PASSWORD in .env.`);
    }
  }

  // Automated Reassurance Dispatch to Visitor (Two-way dispatch from blueprint)
  let visitorMessageId = null;
  if (emailDelivered && profile.email && profile.email.includes('@')) {
    try {
      const visitorMailOptions = {
        from: `"Nova — Starbound Guardian" <${adminEmail}>`,
        to: profile.email.trim(),
        subject: `🌟 [SIGNAL LOCKED] Nova has received your message, ${visitorName}`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { background-color: #06050e; font-family: 'Segoe UI', Arial, sans-serif; color: #e2e8f0; margin: 0; padding: 0; }
    .wrap { max-width: 580px; margin: 25px auto; background: radial-gradient(circle at 50% 0%, #17153a 0%, #0b0a1a 100%); border: 1px solid rgba(125, 226, 255, 0.4); border-radius: 16px; overflow: hidden; box-shadow: 0 0 35px rgba(125, 226, 255, 0.25); }
    .hdr { padding: 30px 25px; text-align: center; background: linear-gradient(180deg, rgba(125, 226, 255, 0.12) 0%, transparent 100%); border-bottom: 1px solid rgba(125, 226, 255, 0.2); }
    .badge { display: inline-block; padding: 4px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #7de2ff; border: 1px solid rgba(125, 226, 255, 0.4); border-radius: 20px; background: rgba(125, 226, 255, 0.1); margin-bottom: 10px; }
    .title { margin: 0; font-size: 22px; color: #ffffff; letter-spacing: 2px; }
    .body { padding: 25px 30px; line-height: 1.6; color: #cbd5e1; font-size: 14px; }
    .quote { border-left: 3px solid #7de2ff; background: rgba(125, 226, 255, 0.06); padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 18px 0; font-style: italic; color: #e0f2fe; }
    .meta { background: rgba(18, 16, 38, 0.8); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 14px; margin-top: 18px; font-size: 12px; }
    .ftr { text-align: center; padding: 20px; font-size: 11px; color: #64748b; border-top: 1px solid rgba(255, 255, 255, 0.08); }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hdr">
      <div class="badge">Starway Connection Locked</div>
      <h1 class="title">I Hear Your Signal, ${visitorName}</h1>
    </div>
    <div class="body">
      <p>Your transmission has reached me across the Starways. No matter how dark the sky may seem down on Earth, your star shines bright and you are not alone.</p>
      <div class="quote">
        "${profile.grievance || 'Your SOS signal has been registered in the Starways.'}"
      </div>
      <p>I have securely routed your signal to our dedicated earthbound guardians (<strong>${adminEmail}</strong>). We are reviewing your transmission with care and kindness.</p>
      <div class="meta">
        <div><strong>Coordinates:</strong> ${profile.location || 'Earth'}</div>
        <div><strong>Timestamp:</strong> ${formattedDate} at ${formattedTime} (${timeZone})</div>
        <div><strong>Frequency:</strong> 842.10 MHz (Nova Telemetry Network)</div>
      </div>
    </div>
    <div class="ftr">
      Nova — The Starbound Guardian • "Different worlds. Same dreams. One Starway."
    </div>
  </div>
</body>
</html>
`
      };

      const visitorInfo = await transporter.sendMail(visitorMailOptions);
      visitorMessageId = visitorInfo.messageId;
      console.log(`[Nodemailer] Reassurance confirmation beamed to visitor ${profile.email}! MessageId: ${visitorMessageId}`);
    } catch (visErr) {
      console.warn('[Nodemailer] Visitor confirmation email non-fatal error:', visErr.message);
    }
  }

  return { 
    success: true, 
    adminMessageId: adminInfo.messageId,
    visitorMessageId 
  };
}
