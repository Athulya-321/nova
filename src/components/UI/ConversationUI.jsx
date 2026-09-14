import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { useNova, ConversationPhases, NovaEmotions, NovaStates } from '../../context/NovaContext';
import { nanoid } from 'nanoid';
import '../../styles/ui.css';

export default function ConversationUI() {
  const { 
    conversationPhase, advanceConversation, 
    visitorData, updateVisitorData 
  } = useNova();
  
  const [inputValue, setInputValue] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [emailStatus, setEmailStatus] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const chatEndRef = useRef(null);

  // Initialize unique session ID
  useEffect(() => {
    if (!conversationId) {
      setConversationId(nanoid());
    }
  }, [conversationId]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  const addNovaMessage = async (texts, delayBetween = 1500) => {
    for (const text of texts) {
      setIsTyping(true);
      const typingTime = Math.min(1000 + text.length * 30, 2500);
      await new Promise(r => setTimeout(r, typingTime));
      setIsTyping(false);
      setChatHistory(prev => [...prev, { sender: 'nova', text }]);
      scrollToBottom();
      await new Promise(r => setTimeout(r, delayBetween));
    }
  };

  // Initial Nova greeting
  useEffect(() => {
    if (conversationPhase === ConversationPhases.INTRO && chatHistory.length === 0) {
      const runIntro = async () => {
        await addNovaMessage([
          "Oh... you found the portal.",
          "I was beginning to wonder if anyone from your world would find me.",
          "I'm Nova.",
          "Guardian of the Starways.",
          "And yes... I'm really talking to you.",
          "What's your name, traveler?"
        ], 1200);
        // We'll leave it in ASK_NAME so the UI remains active, but logic is handled by backend now
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
          // Extract just the role and text for the backend
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
      
      // Update Context Profile
      if (data.profileUpdates) {
        Object.entries(data.profileUpdates).forEach(([key, value]) => {
          if (value && visitorData[key] !== value) {
            updateVisitorData(key, value);
          }
        });
      }

      // Map Gemini emotion to Nova context emotion
      let newEmotion = NovaEmotions.NEUTRAL;
      let newState = NovaStates.IDLE;
      
      switch(data.emotionalState) {
        case 'curious': newEmotion = NovaEmotions.CURIOUS; break;
        case 'playful': newEmotion = NovaEmotions.HAPPY; break; // Map playful to happy
        case 'happy': newEmotion = NovaEmotions.HAPPY; break;
        case 'thoughtful': newEmotion = NovaEmotions.CURIOUS; break; // Map thoughtful to curious
        case 'concerned': newEmotion = NovaEmotions.CONCERNED; newState = NovaStates.SERIOUS; break;
        case 'serious': newEmotion = NovaEmotions.CONCERNED; newState = NovaStates.SERIOUS; break;
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
      console.error(err);
      setIsTyping(false);
      setChatHistory(prev => [...prev, { sender: 'nova', text: "There is interference in the Starways. I couldn't receive that." }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const confirmSignal = async () => {
    // Client-side completeness check
    const missing = [];
    if (!visitorData.name) missing.push('name');
    if (!visitorData.age) missing.push('age');
    if (!visitorData.location) missing.push('location');
    if (!visitorData.email) missing.push('email');

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
          name: visitorData.name,
          age: visitorData.age,
          location: visitorData.location,
          email: visitorData.email,
          grievance: visitorData.problem || visitorData.grievance
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

      {/* Confirmation Panel */}
      {conversationPhase === ConversationPhases.CONFIRMATION && !isTyping && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ position: 'absolute', top: '200px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(11, 10, 26, 0.8)', padding: '30px', borderRadius: '20px', border: '1px solid var(--nova-core)', width: '400px', pointerEvents: 'auto', backdropFilter: 'blur(15px)' }}>
          <h3 style={{ color: 'var(--nova-core)', marginBottom: '20px', fontFamily: 'var(--font-display)', textAlign: 'center' }}>SIGNAL SUMMARY</h3>
          
          {errorMsg && (
            <div style={{ color: '#ff6b6b', background: 'rgba(255,0,0,0.1)', padding: '10px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center', fontSize: '13px' }}>
              {errorMsg}
            </div>
          )}

          <div style={{ color: '#fff', fontSize: '14px', lineHeight: '2', marginBottom: '20px' }}>
            <p><strong>NAME:</strong> {visitorData.name}</p>
            <p><strong>AGE:</strong> {visitorData.age}</p>
            <p><strong>LOCATION:</strong> {visitorData.location}</p>
            <p><strong>EMAIL:</strong> {visitorData.email}</p>
            <p><strong>SIGNAL:</strong> {visitorData.grievance || visitorData.problem}</p>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={confirmSignal} disabled={emailStatus === 'sending'} style={{ flex: 1, padding: '12px', background: emailStatus === 'sending' ? '#555' : 'var(--nova-core)', color: '#000', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
              {emailStatus === 'sending' ? 'TRANSMITTING...' : 'SEND SIGNAL'}
            </button>
            <button onClick={cancelSignal} disabled={emailStatus === 'sending'} style={{ flex: 1, padding: '12px', background: 'transparent', color: 'var(--text-dim)', border: '1px solid var(--text-dim)', borderRadius: '10px', cursor: 'pointer' }}>GO BACK</button>
          </div>
        </motion.div>
      )}

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
