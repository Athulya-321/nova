import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { useNova, ConversationPhases, NovaEmotions, NovaStates } from '../../context/NovaContext';
import { nanoid } from 'nanoid';
import '../../styles/ui.css';

// Comprehensive client-side parser to extract visitor details, handle corrections, and prevent conversation locks
export function parseVisitorInput(text, currentData = {}, lastPrompt = '') {
  const updates = {};
  if (!text || typeof text !== 'string') return updates;
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  const greetings = ['hi', 'hii', 'hiii', 'hello', 'helloo', 'hlo', 'hllo', 'hey', 'heyy', 'sup', 'yo', 'greetings', 'nova'];
  const isGreeting = greetings.some(g => lower === g || lower.startsWith(g + ' '));

  // 1. Email detection
  const emailMatch = trimmed.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    updates.email = emailMatch[0];
  }

  // 2. Age detection (e.g. "21", "21 years old", "I am 21", "21yo", or just "29")
  const ageExplicitMatch = trimmed.match(/(?:age\s*(?:is|=|:)?\s*|i am\s+|i'm\s+)?\b(1[0-9]|[2-9][0-9])\b(?:\s*(?:years|yrs|years old|yo))?/i);
  const askedAge = lastPrompt.includes('journey') || lastPrompt.includes('sun') || lastPrompt.includes('cycle') || lastPrompt.includes('how old') || lastPrompt.includes('years');
  if (ageExplicitMatch && !emailMatch) {
    const candidateAge = trimmed.match(/\b(1[0-9]|[2-9][0-9])\b/);
    if (candidateAge && (askedAge || trimmed.split(/\s+/).length <= 3)) {
      updates.age = candidateAge[0];
    }
  }

  // 3. Name detection & Name corrections (e.g. "my name is actually sara", "actually my name is sara", "call me sara", "ammu")
  const nameCorrectionMatch = trimmed.match(/\b(?:my name is actually|actually my name is|my real name is|it's actually|call me|name is actually|actually call me|actually it's|it is actually)\s+([A-Za-z]{2,}(?:\s+[A-Za-z]{2,})?)/i);
  const explicitNameMatch = trimmed.match(/\b(?:my name is|this is|i am|i'm|name\s*(?:is|=|:))\s+([A-Za-z]{2,}(?:\s+[A-Za-z]{2,})?)/i);

  const matchedNameRaw = nameCorrectionMatch ? nameCorrectionMatch[1] : (explicitNameMatch ? explicitNameMatch[1] : null);
  if (matchedNameRaw) {
    let candidate = matchedNameRaw.trim().replace(/^(?:actually|really)\s+/i, '').split(/\s+(?:from|in|and|at|living|live)\b/i)[0].trim();
    const words = candidate.split(/\s+/);
    const hasEmotion = words.some(w => ['sad', 'happy', 'lost', 'tired', 'worried', 'fine', 'good', 'okay', 'bad'].includes(w.toLowerCase()));
    if (!words.some(w => greetings.includes(w.toLowerCase())) && !hasEmotion && candidate.toLowerCase() !== 'nova') {
      const formatted = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      updates.name = formatted;
    }
  } else if (!currentData.name || lastPrompt.includes('what\'s your name') || lastPrompt.includes('whats your name') || lastPrompt.includes('your name') || lastPrompt.includes('who are you') || lastPrompt.includes('call you')) {
    const words = trimmed.split(/\s+/);
    if (words.length >= 1 && words.length <= 2 && !emailMatch && !updates.age) {
      let cleanCandidate = trimmed.replace(/[^a-zA-Z\s]/g, '').trim();
      cleanCandidate = cleanCandidate.replace(/^(?:im|i am|i'm|call me|name is)\s+/i, '').trim();
      const isCasual = ['ok', 'okay', 'yes', 'no', 'fine', 'good', 'cool', 'thanks', 'sure'].includes(cleanCandidate.toLowerCase());
      if (cleanCandidate.length >= 2 && cleanCandidate.length <= 25 && !greetings.includes(cleanCandidate.toLowerCase()) && !isCasual) {
        const formatted = cleanCandidate.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        updates.name = formatted;
      }
    }
  }

  // 4. Location detection
  const locMatch = trimmed.match(/(?:from|in|live in|living in|location is)\s+([a-zA-Z\s,.-]+)/i);
  const askedLocation = lastPrompt.includes('where on earth') || lastPrompt.includes('corner of') || lastPrompt.includes('blue world') || lastPrompt.includes('where are you') || lastPrompt.includes('gazing');
  if (locMatch) {
    const candidate = locMatch[1].trim().split(/[.,!?\n]|\s+and\s+/i)[0].trim();
    if (candidate.length >= 2 && candidate.length <= 35 && !greetings.includes(candidate.toLowerCase())) {
      const formatted = candidate.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      updates.location = formatted;
    }
  } else if ((!currentData.location || askedLocation) && askedLocation && !updates.age && !emailMatch && !isGreeting) {
    const candidate = trimmed.replace(/[^a-zA-Z\s,.-]/g, '').trim();
    if (candidate.length >= 2 && candidate.length <= 35 && trimmed.split(/\s+/).length <= 4) {
      const formatted = candidate.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      updates.location = formatted;
    }
  }

  // 5. Grievance / Problem detection
  const askedGrievance = lastPrompt.includes('troubl') || lastPrompt.includes('heart') || lastPrompt.includes('star signal') || lastPrompt.includes('worr') || lastPrompt.includes('mind') || lastPrompt.includes('listening') || lastPrompt.includes('thoughts');
  if (askedGrievance && !updates.name && !updates.location && !updates.age && !emailMatch) {
    const casualFineWords = ['ok', 'okay', 'fine', 'good', 'all good', 'nothing', 'no problem', 'no troubles', 'none', 'just visiting', 'just checking', 'just looking', 'im fine', "i'm fine", 'peaceful', 'not much', 'nothing much'];
    if (casualFineWords.some(w => lower === w || lower.startsWith(w + ' ') || lower.endsWith(' ' + w))) {
      updates.grievance = 'Checking in peacefully / All is well under the stars';
      updates.problem = updates.grievance;
    } else if (!greetings.includes(lower)) {
      updates.grievance = trimmed;
      updates.problem = trimmed;
    }
  } else {
    const troubleWords = ['stress', 'sad', 'depressed', 'anxious', 'worried', 'struggle', 'struggling', 'exam', 'family', 'crying', 'lost', 'lonely', 'scared', 'hurt', 'fail', 'failing', 'problem', 'help'];
    if (troubleWords.some(w => lower.includes(w)) && !emailMatch && trimmed.split(/\s+/).length > 2) {
      updates.grievance = trimmed;
      updates.problem = trimmed;
    }
  }

  return updates;
}

export default function ConversationUI() {
  const { 
    conversationPhase, advanceConversation, 
    visitorData, setVisitorData, updateVisitorData,
    visitorMood, setVisitorMood,
    chatHistory, setChatHistory,
    conversationId, setConversationId
  } = useNova();
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize unique session ID if not already generated
  useEffect(() => {
    if (!conversationId) {
      setConversationId(nanoid());
    }
  }, [conversationId, setConversationId]);

  // Auto-focus chat typing input in Home section
  useEffect(() => {
    const focusTimer = setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
    return () => clearTimeout(focusTimer);
  }, []);

  // Re-focus input whenever Nova finishes typing so user can immediately respond
  useEffect(() => {
    if (!isTyping) {
      const focusTimer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(focusTimer);
    }
  }, [isTyping]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  const addNovaMessage = async (texts, delayBetween = 1500) => {
    for (const text of texts) {
      setIsTyping(true);
      const typingTime = Math.min(800 + text.length * 25, 2000);
      await new Promise(r => setTimeout(r, typingTime));
      setIsTyping(false);
      setChatHistory(prev => [...prev, { sender: 'nova', text }]);
      scrollToBottom();
      await new Promise(r => setTimeout(r, delayBetween));
    }
  };

  // Initial Nova greeting: genuine, warm, and friendly
  useEffect(() => {
    if (conversationPhase === ConversationPhases.INTRO && chatHistory.length === 0) {
      const runIntro = async () => {
        await addNovaMessage([
          "Hey, welcome! I saw your star glimmering out across the Starways.",
          "I'm Nova. I spend my days watching over quiet signals from Earth... what's your name, friend?"
        ], 1000);
        advanceConversation(ConversationPhases.ASK_NAME, NovaEmotions.CURIOUS);
      };
      runIntro();
    }
  }, [conversationPhase]);

  const addUserMessage = (text) => {
    setChatHistory(prev => [...prev, { sender: 'user', text }]);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;
    const val = inputValue.trim();
    addUserMessage(val);
    setInputValue('');

    // Determine last Nova prompt for context
    let lastNovaPrompt = '';
    for (let i = chatHistory.length - 1; i >= 0; i--) {
      if (chatHistory[i].sender === 'nova') {
        lastNovaPrompt = (chatHistory[i].text || '').toLowerCase();
        break;
      }
    }

    // Immediate client extraction pass to update profile and star name instantly
    const clientUpdates = parseVisitorInput(val, visitorData, lastNovaPrompt);
    let activeProfile = { ...visitorData };
    if (Object.keys(clientUpdates).length > 0) {
      activeProfile = { ...activeProfile, ...clientUpdates };
      setVisitorData(activeProfile);
    }

    setIsTyping(true);
    
    try {
      let data = null;
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            message: val,
            visitorProfile: activeProfile,
            conversationHistory: chatHistory.map(msg => ({
              role: msg.sender === 'nova' ? 'model' : 'user',
              text: msg.text
            }))
          })
        });
        if (response.ok) {
          data = await response.json();
        }
      } catch (e) {
        console.warn('Vite proxy /api/chat unavailable, attempting secondary route:', e);
      }

      // Secondary check: port 3001
      if (!data) {
        try {
          const response = await fetch('http://localhost:3001/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversationId,
              message: val,
              visitorProfile: activeProfile,
              conversationHistory: chatHistory.map(msg => ({
                role: msg.sender === 'nova' ? 'model' : 'user',
                text: msg.text
              }))
            })
          });
          if (response.ok) {
            data = await response.json();
          }
        } catch (e2) {
          console.warn('Backend server on 3001 unavailable, engaging direct OpenRouter GPT-4o fallback:', e2);
        }
      }

      // Direct OpenRouter GPT-4o fallback if both local routes are unavailable
      if (!data) {
        try {
          const clientApiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
          const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${clientApiKey}`,
              'HTTP-Referer': 'https://nova-nu-nine.vercel.app',
              'X-Title': 'Nova',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'openai/gpt-4o',
              max_tokens: 300,
              temperature: 0.75,
              messages: [
                {
                  role: 'system',
                  content: `You are Nova, The Starbound Guardian. You are a warm, glowing cosmic fox friend and celestial guardian watching over Earth from the high Starways. Your voice is warm, soothing, intimate, and poetic yet simple. Speak in 2 to 3 natural sentences.
Dynamic Visitor Context:
- Name: ${activeProfile.name || 'Not yet known'}
- Grievance: ${activeProfile.grievance || activeProfile.problem || 'Not yet known'}
- Location: ${activeProfile.location || 'Not yet known'}
- Age: ${activeProfile.age || 'Not yet known'}
- Email: ${activeProfile.email || 'Not yet known'}

Rule: In a friendly, natural cosmic way, collect any missing details in order: Name -> Grievance -> Location -> Age -> Email. Comfort any pain first. Never ask for details already known. If the visitor corrected their name, address them by their new name warmly.`
                },
                ...chatHistory.slice(-6).map(msg => ({
                  role: msg.sender === 'nova' ? 'assistant' : 'user',
                  content: msg.text
                })),
                { role: 'user', content: val }
              ]
            })
          });

          if (openRouterRes.ok) {
            const orData = await openRouterRes.json();
            const reply = orData.choices?.[0]?.message?.content?.trim() || "I hear your star whisper across the night sky, traveler. I'm right here with you.";
            data = {
              reply,
              profileUpdates: clientUpdates,
              emotionalState: 'welcoming',
              visitorMood: 'neutral',
              conversationIntent: 'general'
            };
          }
        } catch (orErr) {
          console.error('Direct OpenRouter fallback error:', orErr);
        }
      }

      if (!data) {
        throw new Error('Signal interference in the Starways');
      }
      
      // Update Context Profile immediately (e.g. name globally, location, age, email, problem)
      if (data.profileUpdates) {
        setVisitorData(prev => {
          const updated = { ...prev };
          Object.entries(data.profileUpdates).forEach(([k, v]) => {
            if (v && String(v).trim() !== '') {
              updated[k] = v;
              if (k === 'grievance') updated.problem = v;
              if (k === 'problem') updated.grievance = v;
            }
          });
          return updated;
        });
      }

      // Update visitorMood globally if detected
      if (data.visitorMood && setVisitorMood) {
        setVisitorMood(data.visitorMood);
      }

      // Map Gemini emotion to Nova context emotion
      let newEmotion = NovaEmotions.NEUTRAL;
      let newState = NovaStates.IDLE;
      
      const rawEmotion = (data.emotionalState || '').toLowerCase();
      switch(rawEmotion) {
        case 'curious': newEmotion = NovaEmotions.CURIOUS; break;
        case 'playful': newEmotion = NovaEmotions.HAPPY; break;
        case 'happy': newEmotion = NovaEmotions.HAPPY; break;
        case 'thoughtful': newEmotion = NovaEmotions.THOUGHTFUL; break;
        case 'concerned': newEmotion = NovaEmotions.CONCERNED; newState = NovaStates.SERIOUS; break;
        case 'serious': newEmotion = NovaEmotions.SERIOUS; newState = NovaStates.SERIOUS; break;
        case 'sad': newEmotion = NovaEmotions.SAD; newState = NovaStates.SERIOUS; break;
        default: newEmotion = NovaEmotions.NEUTRAL; break;
      }

      // Apply the emotion
      advanceConversation(conversationPhase, newEmotion, newState);

      setIsTyping(false);
      setChatHistory(prev => [...prev, { sender: 'nova', text: data.reply }]);

      // If submission intent is reached, Nova invites traveler to Help Signals section
      // without popping up any blocking modal in the chatbox
      if (data.conversationIntent === 'submission') {
        advanceConversation(ConversationPhases.FINISHED, NovaEmotions.HAPPY, NovaStates.IDLE);
      }

    } catch (err) {
      console.warn('Backend chat unreachable, switching to intelligent client guardian conversation:', err);
      setIsTyping(false);

      const updates = parseVisitorInput(val, activeProfile, lastNovaPrompt);
      const currentName = updates.name || activeProfile.name;
      const currentLoc = updates.location || activeProfile.location;
      const currentGrievance = updates.grievance || activeProfile.grievance || activeProfile.problem;
      const currentAge = updates.age || activeProfile.age;
      const currentEmail = updates.email || activeProfile.email;

      let reply = '';
      if (!currentName) {
        reply = `I'm Nova, guardian of the Starways. What name do you go by under the night sky, friend?`;
      } else if (!currentGrievance) {
        reply = `Tell me, ${currentName}, what thoughts, worries, or dreams have brought your star signal to me tonight? I'm right here listening with all my heart.`;
      } else if (!currentLoc) {
        reply = updates.grievance && !updates.grievance.includes('peacefully')
          ? `Thank you for sharing that with me, ${currentName}. I can feel the weight of it across the stars, but you don't have to carry it all alone. What corner of our blue world are you gazing up at the stars from tonight?`
          : `I'm right beside you, ${currentName}. What corner of our blue world are you gazing up at the stars from tonight?`;
      } else if (!currentAge) {
        reply = `Ah, ${currentLoc}! It's comforting to know where your light shines from. If you don't mind a curious cosmic fox asking, how many journeys around the sun have you made on Earth, ${currentName}?`;
      } else if (!currentEmail) {
        reply = `${currentAge} cycles around the sun carries so many memories, ${currentName}. To make sure our celestial link stays unbroken and guardians on Earth can reach you if you ever need help, what email address can I keep connected to your signal?`;
      } else {
        reply = `Thank you so much, ${currentName}! Your star beacon is now fully anchored across the Starways with all your details. Whenever you need to transmit an official beacon to Earth guardians, tap into the Help Signals section in the menu above!`;
      }

      setChatHistory(prev => [...prev, { 
        sender: 'nova', 
        text: reply 
      }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (conversationPhase === ConversationPhases.NONE) return null;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 20, pointerEvents: 'none' }}>
      
      {/* Chat History Container - Center-Left column clearly separated from the star on the right */}
      <div style={{ 
        position: 'absolute', top: '130px', left: '33%', width: '42%', maxWidth: '600px', bottom: '150px',
        overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '15px', pointerEvents: 'auto'
      }}>
        <AnimatePresence>
          {chatHistory.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                display: 'flex',
                gap: '15px',
                maxWidth: '85%',
                flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-start'
              }}
            >
              {/* Avatar */}
              {msg.sender === 'nova' ? (
                <div style={{ 
                  width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                  border: '2px solid rgba(125, 226, 255, 0.5)', 
                  background: 'url(/crop.webp) center / cover', 
                  boxShadow: '0 0 15px rgba(125, 226, 255, 0.3)'
                }} />
              ) : null}

              {/* Message Bubble */}
              <div style={{
                background: 'rgba(11, 10, 26, 0.75)',
                backdropFilter: 'blur(10px)',
                padding: '15px 20px',
                borderRadius: '20px',
                color: '#fff',
                fontFamily: 'var(--font-primary)',
                fontSize: '15px',
                lineHeight: '1.6',
                borderLeft: msg.sender === 'nova' ? '3px solid var(--nova-core)' : 'none',
                borderRight: msg.sender === 'user' ? '3px solid var(--portal-core)' : 'none',
                boxShadow: msg.sender === 'nova' ? '0 0 20px rgba(125, 226, 255, 0.1)' : '0 0 20px rgba(170, 59, 255, 0.1)',
                borderTopLeftRadius: msg.sender === 'nova' ? '5px' : '20px',
                borderTopRightRadius: msg.sender === 'user' ? '5px' : '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px'
              }}>
                {msg.sender === 'user' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', opacity: 0.8, alignSelf: 'flex-end' }}>
                    <span style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-display)', color: 'var(--visitor-star)' }}>
                      {visitorData.name || 'VISITOR'}
                    </span>
                    <div style={{ color: 'var(--visitor-star)', fontSize: '14px', textShadow: '0 0 10px var(--visitor-star-glow)' }}>✦</div>
                  </div>
                )}
                {msg.text}
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ alignSelf: 'flex-start', display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
               <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid rgba(125, 226, 255, 0.5)', background: 'url(/crop.webp) center / cover' }} />
               <div style={{ background: 'rgba(11, 10, 26, 0.75)', padding: '20px', borderRadius: '20px', borderTopLeftRadius: '5px', borderLeft: '3px solid var(--nova-core)' }}>
                 <div style={{ display: 'flex', gap: '5px' }}>
                   <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} style={{ width: 6, height: 6, background: 'var(--nova-core)', borderRadius: '50%' }} />
                   <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} style={{ width: 6, height: 6, background: 'var(--nova-core)', borderRadius: '50%' }} />
                   <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} style={{ width: 6, height: 6, background: 'var(--nova-core)', borderRadius: '50%' }} />
                 </div>
               </div>
             </motion.div>
          )}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Input Bar - Always active in chatbox */}
      {conversationPhase !== ConversationPhases.SIGNAL_RECEIVED && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            position: 'absolute', bottom: '60px', left: '50%', transform: 'translateX(-50%)',
            width: '600px', maxWidth: '90%',
            display: 'flex', alignItems: 'center', gap: '15px',
            background: 'rgba(11, 10, 26, 0.6)',
            border: '1px solid rgba(125, 226, 255, 0.3)',
            borderRadius: '40px', padding: '10px 20px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 0 30px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(125, 226, 255, 0.05)',
            pointerEvents: 'auto'
          }}
        >
          <div style={{ filter: 'drop-shadow(0 0 8px var(--nova-glow))' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--nova-core)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            disabled={isTyping}
            style={{
              flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: '15px', fontFamily: 'var(--font-primary)', outline: 'none'
            }}
          />
          <button onClick={handleSend} disabled={isTyping || !inputValue.trim()} style={{
            background: 'rgba(255, 255, 255, 0.1)', border: 'none', width: '40px', height: '40px', borderRadius: '50%',
            display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer',
            color: 'var(--nova-core)', transition: 'all 0.3s'
          }}>
            <Send size={18} />
          </button>
        </motion.div>
      )}
    </div>
  );
}
