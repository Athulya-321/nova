import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

export async function sendGrievanceEmail(profile, submittedAt) {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.warn("EmailJS credentials are missing. Signal not transmitted.");
    throw new Error("Email service is not yet configured.");
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

  const subject = 'Someone asked for novas help';
  
  const messageBody = `NOVA — NEW HELP SIGNAL
================================

VISITOR INFORMATION

Name: ${profile.name || 'Not provided'}
Age: ${profile.age || 'Not provided'}
Location: ${profile.location || 'Not provided'}
Email: ${profile.email || 'Not provided'}

GRIEVANCE

${profile.grievance || 'Not provided'}

SUBMISSION DETAILS
Date: ${formattedDate}
Time: ${formattedTime}
Timezone: ${timeZone}

================================
Received through Nova
The Starbound Guardian
================================`;

  const payload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    accessToken: privateKey,
    template_params: {
      subject: subject,
      message: messageBody,
      admin_email: process.env.ADMIN_EMAIL
    }
  };

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("EmailJS API Error:", errorText);
      throw new Error("The signal could not be delivered.");
    }

    return { success: true };
  } catch (error) {
    console.error("EmailJS Service Error:", error);
    throw error;
  }
}
