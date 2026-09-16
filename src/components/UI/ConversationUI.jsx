import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { useNova, ConversationPhases, NovaEmotions, NovaStates } from '../../context/NovaContext';
import { nanoid } from 'nanoid';
import '../../styles/ui.css';

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

    setIsTyping(true);
    
    try {
      let response;
      try {
        response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            message: val,
            visitorProfile: visitorData,
            conversationHistory: chatHistory.map(msg => ({
              role: msg.sender === 'nova' ? 'model' : 'user',
              text: msg.text
            }))
          })
        });
      } catch (e) {
        // Fallback to direct backend URL if proxy is unavailable
        response = await fetch('http://localhost:3001/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            message: val,
            visitorProfile: visitorData,
            conversationHistory: chatHistory.map(msg => ({
              role: msg.sender === 'nova' ? 'model' : 'user',
              text: msg.text
            }))
          })
        });
      }

      if (!response.ok) {
        throw new Error('Signal interference');
      }

      const data = await response.json();
      
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

      const text = val.trim();
      const lower = text.toLowerCase();
      const name = visitorData.name;
      let reply = '';
      const updates = {};

      const greetings = ['hi', 'hii', 'hiii', 'hello', 'helloo', 'hlo', 'hllo', 'hey', 'heyy', 'sup', 'yo', 'greetings', 'nova'];
      const isGreeting = greetings.some(g => lower === g || lower.startsWith(g + ' '));

      // 1. Check for email
      const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) {
        updates.email = emailMatch[0];
        updateVisitorData('email', emailMatch[0]);
      }

      // 2. Check for age (e.g. "21", "21 years old", "I am 21", "21yo")
      const ageMatch = text.match(/\b(1[0-9]|[2-9][0-9])\b/);
      if (ageMatch && !emailMatch) {
        const hasAgeWord = lower.includes('age') || lower.includes('years') || lower.includes('yo') || lower.includes('turned') || lower.includes('old') || text.split(' ').length <= 2;
        if (hasAgeWord && (!name || name !== ageMatch[0])) {
          updates.age = ageMatch[0];
          updateVisitorData('age', ageMatch[0]);
        }
      }

      // 3. Check for name
      if (!name) {
        const nameMatch = text.match(/(?:my name is|call me|i am|i'm|this is)\s+([a-zA-Z]{2,}(?:\s+[a-zA-Z]{2,})?)/i);
        if (nameMatch) {
          const candidate = nameMatch[1].trim();
          const lowerCandidate = candidate.toLowerCase();
          if (!greetings.includes(lowerCandidate) && !['sad', 'lost', 'depressed', 'fine', 'good', 'okay', 'bad'].includes(lowerCandidate)) {
            const formatted = candidate.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
            updates.name = formatted;
            updateVisitorData('name', formatted);
          }
        } else if (!isGreeting && text.split(/\s+/).length <= 2 && !emailMatch && !ageMatch) {
          const cleanCandidate = text.replace(/[^a-zA-Z\s]/g, '').trim();
          if (cleanCandidate.length >= 2 && cleanCandidate.length <= 25 && !greetings.includes(cleanCandidate.toLowerCase())) {
            const formatted = cleanCandidate.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
            updates.name = formatted;
            updateVisitorData('name', formatted);
          }
        }
      }

      // 4. Check for location
      const locMatch = text.match(/(?:from|in|live in|living in|location is)\s+([a-zA-Z\s]+)/i);
      if (locMatch) {
        const candidate = locMatch[1].trim().split(/[.,!?\n]|\s+and\s+/i)[0].trim();
        if (candidate.length >= 2 && candidate.length <= 30 && !greetings.includes(candidate.toLowerCase())) {
          const formatted = candidate.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
          updates.location = formatted;
          updateVisitorData('location', formatted);
        }
      }

      // 5. Check for grievance / trouble
      const troubleWords = ['stress', 'sad', 'depressed', 'anxious', 'worried', 'struggle', 'struggling', 'exam', 'family', 'crying', 'lost', 'lonely', 'scared', 'hurt', 'fail', 'failing', 'problem', 'help'];
      const hasTrouble = troubleWords.some(w => lower.includes(w));
      if (hasTrouble && !emailMatch && text.split(' ').length > 2) {
        updates.grievance = text;
        updateVisitorData('grievance', text);
        updateVisitorData('problem', text);
      }

      const currentName = updates.name || visitorData.name;
      const currentLoc = updates.location || visitorData.location;
      const currentGrievance = updates.grievance || visitorData.grievance || visitorData.problem;
      const currentAge = updates.age || visitorData.age;

      if (updates.email) {
        reply = currentName
          ? `I've woven your email into your beacon signal, ${currentName}! All your details are safely held in the Starways. Whenever you want to transmit an official SOS signal, head into the Help Signals section in the menu above!`
          : `Thank you, friend! Your signal is now safe with me in the Starways. You can transmit an official SOS signal anytime from the Help Signals menu above!`;
      } else if (updates.grievance) {
        reply = currentName
          ? `Oh, dear ${currentName}, I can feel how heavy that is from all the way up here. Please know you don't have to carry this alone. If you'd like our link to stay open so help can find you, what email address can I keep connected to your signal?`
          : `I hear the weight in your words, friend, and I'm right here beside you. If you'd like our link to stay open so help can reach you, what email address should I keep with your signal?`;
      } else if (updates.age) {
        reply = currentName
          ? `Every cycle around the sun brings its own strength, ${currentName}. Tell me, what thoughts or troubles have brought your star signal to me tonight?`
          : `Thank you for sharing that with me! Tell me, what thoughts or worries have brought your star signal to me tonight?`;
      } else if (updates.location) {
        reply = currentName
          ? `Oh, ${currentLoc}! I love watching the lights glowing from there, ${currentName}. Tell me, what's been weighing on your heart lately?`
          : `Oh, ${currentLoc}! It feels so peaceful looking down at Earth from the stars. What has been on your mind lately, friend?`;
      } else if (updates.name) {
        reply = `It's so wonderful to meet you, ${updates.name}! What thoughts or worries have brought your star signal out to the Starways tonight?`;
      } else if (isGreeting) {
        if (currentName) {
          const friendlyGreetings = [
            `Hey ${currentName}! It's so lovely to feel your starlight shining again. How are things treating you right now?`,
            `Hello again, ${currentName}! I'm right here watching over the Starways. What's on your mind today?`,
            `Hey there, ${currentName}! Always happy to chat with you. How are you feeling right now?`
          ];
          reply = friendlyGreetings[Math.floor(Math.random() * friendlyGreetings.length)];
        } else {
          const namePrompts = [
            `Hello there, starry friend! I'm so glad your light found its way here. What name do you go by under the night sky?`,
            `Hey! It's peaceful out here in the Starways today. What should I call you, traveler?`,
            `Welcome, friend! I'm Nova, guardian of the Starways. What name shall I call you?`
          ];
          reply = namePrompts[Math.floor(Math.random() * namePrompts.length)];
        }
      } else if (!currentName) {
        reply = `I'm Nova, guardian of the Starways. What name do you go by under the night sky, friend?`;
      } else if (!currentGrievance) {
        reply = `I'm right here listening, ${currentName}. Tell me, what's been on your mind lately or weighing on your heart?`;
      } else if (!currentLoc) {
        reply = `I love getting to know you, ${currentName}. Where on Earth are you gazing up at the stars from tonight?`;
      } else if (!currentAge) {
        reply = `If you don't mind a curious cosmic fox asking, how many cycles around the sun have you seen, ${currentName}?`;
      } else {
        reply = `I'm right here beside you, ${currentName}. Tell me anything that's on your heart, or we can talk about the stars!`;
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
