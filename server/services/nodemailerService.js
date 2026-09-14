import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

/**
 * Creates and verifies a Nodemailer SMTP transporter using Gmail
 */
function createTransporter() {
  const user = process.env.ADMIN_EMAIL || 'nova0hero@gmail.com';
  const pass = process.env.EMAIL_APP_PASSWORD || process.env.ADMIN_EMAIL_PASSWORD;

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

      <div class="card" style="padding: 14px 20px;">
        <div class="data-row">
          <span class="data-label">Transmission Timestamp</span>
          <span class="data-value" style="font-size: 12px; color: #94a3b8;">${formattedDate} at ${formattedTime} (${timeZone})</span>
        </div>
      </div>
    </div>

    <div class="footer">
      NOVA • The Starbound Guardian • Astral Realm / Veyra<br>
      Automated Starway Telemetry • Dispatching to: nova0hero@gmail.com
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

  const info = await transporter.sendMail(mailOptions);
  console.log(`[Nodemailer] Signal successfully beamed to ${adminEmail}! MessageId: ${info.messageId}`);
  return { success: true, messageId: info.messageId };
}
