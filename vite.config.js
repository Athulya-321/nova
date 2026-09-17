import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import dotenv from 'dotenv'
dotenv.config({ path: '.env' })

function novaApiPlugin() {
  return {
    name: 'nova-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';
        
        if (url === '/api/chat' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const { message, visitorProfile, conversationHistory } = JSON.parse(body || '{}');
              const { generateNovaResponse } = await import('./server/services/openrouterService.js');
              
              const history = Array.isArray(conversationHistory) ? [...conversationHistory] : [];
              const profile = { ...(visitorProfile || {}) };
              
              const novaResponse = await generateNovaResponse(message, history, profile);
              
              // Merge profile updates safely
              if (novaResponse.profileUpdates) {
                Object.keys(novaResponse.profileUpdates).forEach(key => {
                  const val = novaResponse.profileUpdates[key];
                  if (val !== null && val !== undefined && String(val).trim() !== '') {
                    profile[key] = String(val).trim();
                  }
                });
              }

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                reply: novaResponse.reply,
                profileUpdates: profile,
                emotionalState: novaResponse.emotionalState || 'neutral',
                visitorMood: novaResponse.visitorMood || 'neutral',
                conversationIntent: novaResponse.conversationIntent || 'general',
                needsFollowUp: novaResponse.needsFollowUp || false
              }));
            } catch (err) {
              console.error('Vite API /api/chat error:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Error generating response' }));
            }
          });
          return;
        }

        if (url === '/api/submit-grievance' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body || '{}');
              const { sendGrievanceEmailWithNodeMailer } = await import('./server/services/nodemailerService.js');
              
              const missing = [];
              if (!parsed.name?.trim()) missing.push('name');
              if (!parsed.age?.trim()) missing.push('age');
              if (!parsed.location?.trim()) missing.push('location');
              if (!parsed.email?.trim()) missing.push('email');

              if (missing.length > 0) {
                res.statusCode = 422;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({
                  success: false,
                  message: `Signal incomplete: Nova still requires your ${missing.join(', ')} before transmitting.`,
                  missingFields: missing
                }));
              }

              await sendGrievanceEmailWithNodeMailer(parsed, new Date());
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'Signal transmitted across the Starways to Nova!' }));
            } catch (err) {
              console.error('Vite API /api/submit-grievance error:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, message: err.message || 'Transmission failed' }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), novaApiPlugin()],
  server: {
    watch: {
      ignored: ['**/Downloads/**', '**/pics/**', '**/*.pka']
    }
  }
})
