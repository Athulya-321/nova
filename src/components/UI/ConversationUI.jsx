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
      
      switch(data.emotionalState) {
        case 'curious': newEmotion = NovaEmotions.CURIOUS; break;
        case 'playful': newEmotion = NovaEmotions.HAPPY; break;
        case 'happy': newEmotion = NovaEmotions.HAPPY; break;
        case 'thoughtful': newEmotion = NovaEmotions.CURIOUS; break;
        case 'concerned': newEmotion = NovaEmotions.CONCERNED; newState = NovaStates.SERIOUS; break;
        case 'serious': newEmotion = NovaEmotions.CONCERNED; newState = NovaStates.SERIOUS; break;
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
      console.error('Chat error:', err);
      setIsTyping(false);
      const travelerName = visitorData.name ? `, ${visitorData.name}` : '';
      const fallbackOptions = [
        `I hear you${travelerName}! What else is on your mind?`,
        `Got it${travelerName}. Tell me a bit more, I'm right here listening.`,
        `I understand${travelerName}. How are you feeling right now?`,
        `I'm listening closely${travelerName}. What would you like to share next?`
      ];
      const randomReply = fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)];
      setChatHistory(prev => [...prev, { 
        sender: 'nova', 
        text: randomReply 
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
                  background: 'url(/crop.jpeg) center / cover', 
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
               <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid rgba(125, 226, 255, 0.5)', background: 'url(/crop.jpeg) center / cover' }} />
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
