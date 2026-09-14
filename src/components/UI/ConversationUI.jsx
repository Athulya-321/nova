import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { useNova, ConversationPhases, NovaEmotions, NovaStates } from '../../context/NovaContext';
import { nanoid } from 'nanoid';
import '../../styles/ui.css';

export default function ConversationUI() {
  const { 
    conversationPhase, advanceConversation, 
    visitorData, updateVisitorData,
    visitorMood, setVisitorMood
  } = useNova();
  
  const [inputValue, setInputValue] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [emailStatus, setEmailStatus] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Local edit states for confirmation modal
  const [editFields, setEditFields] = useState({
    name: '',
    age: '',
    location: '',
    email: '',
    grievance: ''
  });

  const chatEndRef = useRef(null);

  // Initialize unique session ID
  useEffect(() => {
    if (!conversationId) {
      setConversationId(nanoid());
    }
  }, [conversationId]);

  // Sync confirmation modal fields with visitorData
  useEffect(() => {
    setEditFields({
      name: visitorData.name || '',
      age: visitorData.age || '',
      location: visitorData.location || '',
      email: visitorData.email || '',
      grievance: visitorData.problem || visitorData.grievance || ''
    });
  }, [visitorData, conversationPhase]);

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

  // Initial Nova greeting: simple, warm "Hi" and nice wording asking for their name 1st
  useEffect(() => {
    if (conversationPhase === ConversationPhases.INTRO && chatHistory.length === 0) {
      const runIntro = async () => {
        await addNovaMessage([
          "Hi! Welcome to the Starways.",
          "I'm Nova, watching across the cosmic beacon... what's your name, traveler?"
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
    setErrorMsg('');

    if (conversationPhase === ConversationPhases.CONFIRMATION) return;

    setIsTyping(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/chat', {
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

      if (!response.ok) {
        throw new Error('Signal interference');
      }

      const data = await response.json();
      
      // Update Context Profile immediately (e.g. name globally)
      if (data.profileUpdates) {
        Object.entries(data.profileUpdates).forEach(([key, value]) => {
          if (value && String(value).trim() !== '' && visitorData[key] !== value) {
            updateVisitorData(key, value);
          }
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

      // Check if we reached the submission intent
      if (data.conversationIntent === 'submission') {
        setTimeout(() => {
          advanceConversation(ConversationPhases.CONFIRMATION, NovaEmotions.POWER_ACTIVATION, NovaStates.COSMIC_SIGHT);
        }, 1500);
      }

    } catch (err) {
      console.error('Chat error:', err);
      setIsTyping(false);
      const travelerName = visitorData.name ? `, ${visitorData.name}` : '';
      setChatHistory(prev => [...prev, { 
        sender: 'nova', 
        text: `I'm right here with you${travelerName}. Take a deep breath and tell me once more—I am listening closely.` 
      }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const confirmSignal = async () => {
    // Client-side completeness check using latest editFields / visitorData
    const finalName = editFields.name?.trim() || visitorData.name?.trim();
    const finalAge = editFields.age?.trim() || visitorData.age?.trim();
    const finalLoc = editFields.location?.trim() || visitorData.location?.trim();
    const finalEmail = editFields.email?.trim() || visitorData.email?.trim();
    const finalGrievance = editFields.grievance?.trim() || visitorData.problem?.trim() || visitorData.grievance?.trim();

    const missing = [];
    if (!finalName) missing.push('name');
    if (!finalAge) missing.push('age');
    if (!finalLoc) missing.push('location');
    if (!finalEmail) missing.push('email');

    if (missing.length > 0) {
      setErrorMsg(`Please share your ${missing.join(', ')} with Nova before transmitting.`);
      return;
    }

    addNovaMessage(["Transmitting your signal across the Starways..."]);
    advanceConversation(ConversationPhases.SIGNAL_RECEIVED, NovaEmotions.POWER_ACTIVATION);
    setEmailStatus('sending');
    setErrorMsg('');
    
    try {
      const response = await fetch('http://localhost:3001/api/submit-grievance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          name: finalName,
          age: finalAge,
          location: finalLoc,
          email: finalEmail,
          grievance: finalGrievance
        })
      });
      
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'The signal could not be delivered.');
      }

      addNovaMessage([
        "Your signal has been received.",
        "Your star isn't lost, traveler. You just couldn't see it yet."
      ]);
      advanceConversation(ConversationPhases.FINISHED, NovaEmotions.SUCCESS, NovaStates.SUCCESS);
      setEmailStatus('sent');
      
    } catch (error) {
      console.error("Submission failed:", error);
      setEmailStatus('error');
      setErrorMsg(error.message || "The signal could not be delivered.");
      
      addNovaMessage(["I couldn't send your signal just yet. Something interrupted the Starway."]);
      advanceConversation(ConversationPhases.CONFIRMATION, NovaEmotions.CONCERNED, NovaStates.IDLE);
    }
  };

  const cancelSignal = () => {
    addNovaMessage(["Take your time. I will be here when you are ready."]);
    advanceConversation(ConversationPhases.ASK_PROBLEM, NovaEmotions.HAPPY, NovaStates.IDLE);
  };

  if (conversationPhase === ConversationPhases.NONE) return null;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 20, pointerEvents: 'none' }}>
      
      {/* Chat History Container */}
      <div style={{ 
        position: 'absolute', top: '150px', left: '45%', width: '40%', bottom: '150px',
        overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', paddingRight: '15px', pointerEvents: 'auto'
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
                maxWidth: '90%',
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

      {/* Interactive Signal Confirmation Panel */}
      <AnimatePresence>
        {conversationPhase === ConversationPhases.CONFIRMATION && !isTyping && (
          <motion.div 
            key="signal-modal"
            initial={{ opacity: 0, scale: 0.85, y: 30 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.75, y: -40, filter: 'blur(8px)' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ 
              position: 'absolute', top: '160px', left: '50%', transform: 'translateX(-50%)', 
              background: 'radial-gradient(circle at 50% 0%, rgba(25, 20, 55, 0.95) 0%, rgba(10, 9, 24, 0.98) 100%)', 
              padding: '28px', borderRadius: '22px', 
              border: '1px solid rgba(125, 226, 255, 0.4)', 
              width: '460px', maxWidth: '92vw', pointerEvents: 'auto', 
              backdropFilter: 'blur(16px)',
              boxShadow: '0 0 45px rgba(125, 226, 255, 0.25), 0 0 90px rgba(170, 59, 255, 0.2)'
            }}
          >
          {/* Header & Detach Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--nova-core)', fontSize: '18px' }}>✦</span>
              <h3 style={{ color: 'var(--nova-core)', margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '2px', fontSize: '16px' }}>
                SIGNAL BEACON
              </h3>
            </div>

            <button 
              onClick={cancelSignal}
              disabled={emailStatus === 'sending'}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#cbd5e1',
                borderRadius: '16px',
                padding: '4px 12px',
                fontSize: '11px',
                letterSpacing: '1px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'; e.currentTarget.style.color = '#cbd5e1'; }}
            >
              Detach
            </button>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: '0 0 16px', lineHeight: '1.4' }}>
            Details gathered by Nova are auto-filled below. You can refine any field before beaming your signal to <strong style={{ color: 'var(--nova-core)' }}>nova0hero@gmail.com</strong>.
          </p>
          
          {errorMsg && (
            <div style={{ color: '#ff6b6b', background: 'rgba(255,0,0,0.15)', border: '1px solid #ff6b6b', padding: '10px 12px', borderRadius: '10px', marginBottom: '15px', fontSize: '12px' }}>
              {errorMsg}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                  Name <span style={{ color: 'var(--nova-core)' }}>*</span>
                </label>
                <input 
                  type="text" 
                  value={editFields.name}
                  onChange={(e) => {
                    setEditFields(prev => ({ ...prev, name: e.target.value }));
                    updateVisitorData('name', e.target.value);
                  }}
                  placeholder="Your Name"
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: '8px',
                    background: 'rgba(5, 5, 15, 0.8)', border: '1px solid rgba(125, 226, 255, 0.25)',
                    color: '#fff', fontSize: '13px', outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                  Age <span style={{ color: 'var(--nova-core)' }}>*</span>
                </label>
                <input 
                  type="text" 
                  value={editFields.age}
                  onChange={(e) => {
                    setEditFields(prev => ({ ...prev, age: e.target.value }));
                    updateVisitorData('age', e.target.value);
                  }}
                  placeholder="e.g. 21"
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: '8px',
                    background: 'rgba(5, 5, 15, 0.8)', border: '1px solid rgba(125, 226, 255, 0.25)',
                    color: '#fff', fontSize: '13px', outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                  Location <span style={{ color: 'var(--nova-core)' }}>*</span>
                </label>
                <input 
                  type="text" 
                  value={editFields.location}
                  onChange={(e) => {
                    setEditFields(prev => ({ ...prev, location: e.target.value }));
                    updateVisitorData('location', e.target.value);
                  }}
                  placeholder="City / Country"
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: '8px',
                    background: 'rgba(5, 5, 15, 0.8)', border: '1px solid rgba(125, 226, 255, 0.25)',
                    color: '#fff', fontSize: '13px', outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                  Email <span style={{ color: 'var(--nova-core)' }}>*</span>
                </label>
                <input 
                  type="email" 
                  value={editFields.email}
                  onChange={(e) => {
                    setEditFields(prev => ({ ...prev, email: e.target.value }));
                    updateVisitorData('email', e.target.value);
                  }}
                  placeholder="you@email.com"
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: '8px',
                    background: 'rgba(5, 5, 15, 0.8)', border: '1px solid rgba(125, 226, 255, 0.25)',
                    color: '#fff', fontSize: '13px', outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '10px', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                Content to be Sent (Problem / Request)
              </label>
              <textarea 
                rows={3}
                value={editFields.grievance}
                onChange={(e) => {
                  setEditFields(prev => ({ ...prev, grievance: e.target.value }));
                  updateVisitorData('problem', e.target.value);
                  updateVisitorData('grievance', e.target.value);
                }}
                placeholder="Write or refine the problem you wish to transmit..."
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: '8px',
                  background: 'rgba(5, 5, 15, 0.8)', border: '1px solid rgba(170, 59, 255, 0.35)',
                  color: '#fff', fontSize: '13px', outline: 'none', resize: 'vertical'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={confirmSignal} 
              disabled={emailStatus === 'sending'} 
              style={{ 
                flex: 1, padding: '12px', 
                background: emailStatus === 'sending' ? '#555' : 'linear-gradient(90deg, var(--nova-core) 0%, var(--portal-core) 100%)', 
                color: '#06050e', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '1px' 
              }}
            >
              {emailStatus === 'sending' ? 'TRANSMITTING...' : 'SEND SIGNAL'}
            </button>
            <button 
              onClick={cancelSignal} 
              disabled={emailStatus === 'sending'} 
              style={{ 
                padding: '12px 18px', background: 'transparent', color: 'var(--text-dim)', 
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', cursor: 'pointer' 
              }}
            >
              Detach
            </button>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Input Bar */}
      {conversationPhase !== ConversationPhases.FINISHED && conversationPhase !== ConversationPhases.CONFIRMATION && (
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
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            disabled={emailStatus === 'sending' || isTyping}
            style={{
              flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: '15px', fontFamily: 'var(--font-primary)', outline: 'none'
            }}
          />
          <button onClick={handleSend} disabled={emailStatus === 'sending' || isTyping || !inputValue.trim()} style={{
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
