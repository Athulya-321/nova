import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowRight, X, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNova } from '../../context/NovaContext';

export default function HelpSignals() {
  const { visitorData, updateVisitorData, conversationId } = useNova();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Form state initialized / auto-filled from visitorData
  const [formData, setFormData] = useState({
    name: visitorData.name || '',
    age: visitorData.age || '',
    location: visitorData.location || '',
    email: visitorData.email || '',
    grievance: visitorData.problem || visitorData.grievance || ''
  });

  const handleOpenPopup = () => {
    // Re-sync with latest visitorData in case user chatted first
    setFormData({
      name: visitorData.name || formData.name || '',
      age: visitorData.age || formData.age || '',
      location: visitorData.location || formData.location || '',
      email: visitorData.email || formData.email || '',
      grievance: visitorData.problem || visitorData.grievance || formData.grievance || ''
    });
    setStatusMessage('');
    setIsError(false);
    setIsPopupOpen(true);
  };

  const handleDetach = () => {
    // Smoothly closes/detaches the popup modal
    setIsPopupOpen(false);
    setStatusMessage('');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    updateVisitorData(field, value);
  };

  const handleSubmitSignal = async (e) => {
    e.preventDefault();
    setStatusMessage('');
    setIsError(false);

    // Validation for mandatory fields
    const missing = [];
    if (!formData.name?.trim()) missing.push('name');
    if (!formData.age?.trim()) missing.push('age');
    if (!formData.location?.trim()) missing.push('location');
    if (!formData.email?.trim()) missing.push('email');

    if (missing.length > 0) {
      setIsError(true);
      setStatusMessage(`Please provide your ${missing.join(', ')} before transmitting.`);
      return;
    }

    // Begin signal transmission animation
    setIsSending(true);
    setIsPopupOpen(false); // Detach / close popup gracefully as signal shoots out

    try {
      const response = await fetch('http://localhost:3001/api/submit-grievance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversationId || ('direct_signal_' + Date.now()),
          name: formData.name.trim(),
          age: formData.age.trim(),
          location: formData.location.trim(),
          email: formData.email.trim(),
          grievance: formData.grievance?.trim() || 'Urgent assistance requested across the Starways.'
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Signal interrupted in the Starways.');
      }
    } catch (err) {
      console.error('Signal dispatch error:', err);
    } finally {
      setTimeout(() => {
        setIsSending(false);
      }, 2200); // Allow shooting star animation to complete
    }
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 60, background: '#000', overflow: 'hidden' }}>
      
      {/* Ultra High Quality Lossless Background Image */}
      <motion.div
        animate={
          isSending || isPopupOpen 
            ? { filter: 'brightness(0.55) blur(1px)' } 
            : { filter: 'brightness(1) blur(0px)' }
        }
        transition={{ duration: 0.4, ease: "easeInOut" }}
        style={{
          position: 'absolute', width: '100%', height: '100%', zIndex: 1,
          backgroundImage: 'url("/helpsignal.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          imageRendering: '-webkit-optimize-contrast',
          transformOrigin: 'center'
        }}
      />

      {/* Button Container (z-index higher than animation layers) */}
      <div style={{ position: 'absolute', top: '70%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 85 }}>
        <motion.button
          onClick={handleOpenPopup}
          animate={{
            boxShadow: isSending 
              ? '0 0 60px rgba(125, 226, 255, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.5)' 
              : '0 0 20px rgba(170, 59, 255, 0.5), inset 0 0 10px rgba(170, 59, 255, 0.3)',
            background: isSending 
              ? 'linear-gradient(90deg, rgba(120,40,200,1), rgba(60,20,150,1))' 
              : 'linear-gradient(90deg, rgba(80,20,150,0.9), rgba(40,10,100,0.9))',
            filter: isSending ? 'brightness(1.2)' : 'brightness(1)'
          }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'relative',
            zIndex: 90,
            width: '340px',
            height: '60px',
            borderRadius: '30px',
            border: '2px solid rgba(170, 59, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 25px',
            color: '#fff',
            fontFamily: 'var(--font-display)',
            letterSpacing: '2px',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            outline: 'none'
          }}
          whileHover={!isSending ? { scale: 1.02, boxShadow: '0 0 30px rgba(170, 59, 255, 0.8)' } : {}}
          whileTap={!isSending ? { scale: 0.98 } : {}}
        >
          <motion.div
            animate={isSending ? { x: [0, 5, 0] } : { x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Send size={22} color={isSending ? "#7DE2FF" : "rgba(255, 255, 255, 0.9)"} />
          </motion.div>
          
          <span style={{ fontSize: '0.9rem', fontWeight: '500', marginTop: '2px' }}>SEND YOUR SIGNAL</span>
          
          <ArrowRight size={22} color="rgba(255, 255, 255, 0.7)" />
        </motion.button>
      </div>

      {/* Creative Signal Transmission Form Modal */}
      <AnimatePresence>
        {isPopupOpen && (
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center',
            background: 'rgba(3, 2, 10, 0.75)', backdropFilter: 'blur(12px)',
            padding: '20px'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.75, y: -40, filter: 'blur(8px)' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'relative',
                width: '520px',
                maxWidth: '94vw',
                maxHeight: '90vh',
                overflowY: 'auto',
                background: 'radial-gradient(circle at 50% 0%, rgba(25, 20, 55, 0.95) 0%, rgba(10, 9, 24, 0.98) 100%)',
                border: '1px solid rgba(125, 226, 255, 0.35)',
                boxShadow: '0 0 45px rgba(125, 226, 255, 0.2), 0 0 90px rgba(170, 59, 255, 0.25)',
                borderRadius: '24px',
                padding: '30px',
                color: '#fff',
                fontFamily: 'var(--font-primary)'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%',
                    background: 'rgba(125, 226, 255, 0.12)', border: '1px solid #7de2ff66',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    boxShadow: '0 0 15px rgba(125, 226, 255, 0.4)'
                  }}>
                    <Sparkles size={20} color="#7de2ff" />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '18px', fontFamily: 'var(--font-display)', letterSpacing: '2px', color: '#fff' }}>
                      TRANSMIT SOS SIGNAL
                    </h2>
                    <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#a78bfa' }}>
                      Direct cosmic connection to Nova (nova0hero@gmail.com)
                    </p>
                  </div>
                </div>

                {/* Detach button */}
                <button
                  onClick={handleDetach}
                  title="Detach and return"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#cbd5e1',
                    borderRadius: '20px',
                    padding: '6px 12px',
                    fontSize: '11px',
                    letterSpacing: '1px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.borderColor = '#ef4444'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'; }}
                >
                  <X size={14} /> Detach
                </button>
              </div>

              {/* Status/Error alert */}
              {statusMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 14px', borderRadius: '10px',
                    marginBottom: '16px', fontSize: '13px',
                    background: isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                    border: `1px solid ${isError ? '#ef4444' : '#22c55e'}`,
                    color: isError ? '#fca5a5' : '#86efac'
                  }}
                >
                  {isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                  <span>{statusMessage}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmitSignal}>
                {/* 2-column grid for Name & Age */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', marginBottom: '6px' }}>
                      Name <span style={{ color: '#7de2ff' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      style={{
                        width: '100%', padding: '10px 14px',
                        background: 'rgba(10, 8, 25, 0.8)',
                        border: '1px solid rgba(125, 226, 255, 0.25)',
                        borderRadius: '10px', color: '#fff', fontSize: '14px',
                        outline: 'none', transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#7de2ff'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(125, 226, 255, 0.25)'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', marginBottom: '6px' }}>
                      Age <span style={{ color: '#7de2ff' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 21"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      style={{
                        width: '100%', padding: '10px 14px',
                        background: 'rgba(10, 8, 25, 0.8)',
                        border: '1px solid rgba(125, 226, 255, 0.25)',
                        borderRadius: '10px', color: '#fff', fontSize: '14px',
                        outline: 'none', transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#7de2ff'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(125, 226, 255, 0.25)'}
                    />
                  </div>
                </div>

                {/* 2-column grid for Location & Email */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', marginBottom: '6px' }}>
                      Location <span style={{ color: '#7de2ff' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="City / Country"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      style={{
                        width: '100%', padding: '10px 14px',
                        background: 'rgba(10, 8, 25, 0.8)',
                        border: '1px solid rgba(125, 226, 255, 0.25)',
                        borderRadius: '10px', color: '#fff', fontSize: '14px',
                        outline: 'none', transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#7de2ff'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(125, 226, 255, 0.25)'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', marginBottom: '6px' }}>
                      Email <span style={{ color: '#7de2ff' }}>*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="you@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      style={{
                        width: '100%', padding: '10px 14px',
                        background: 'rgba(10, 8, 25, 0.8)',
                        border: '1px solid rgba(125, 226, 255, 0.25)',
                        borderRadius: '10px', color: '#fff', fontSize: '14px',
                        outline: 'none', transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#7de2ff'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(125, 226, 255, 0.25)'}
                    />
                  </div>
                </div>

                {/* Content needed to be sent (Grievance / Problem) */}
                <div style={{ marginBottom: '22px' }}>
                  <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#a78bfa', marginBottom: '6px' }}>
                    Signal Content / Problem
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe what you are going through or the help you seek from Nova..."
                    value={formData.grievance}
                    onChange={(e) => handleInputChange('grievance', e.target.value)}
                    style={{
                      width: '100%', padding: '12px 14px',
                      background: 'rgba(10, 8, 25, 0.8)',
                      border: '1px solid rgba(170, 59, 255, 0.35)',
                      borderRadius: '10px', color: '#fff', fontSize: '14px',
                      outline: 'none', resize: 'vertical', lineHeight: '1.5',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#aa3bff'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(170, 59, 255, 0.35)'}
                  />
                </div>

                {/* Action buttons: Submit & Detach */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      flex: 1,
                      padding: '14px',
                      borderRadius: '12px',
                      background: 'linear-gradient(90deg, #7de2ff 0%, #aa3bff 100%)',
                      border: 'none',
                      color: '#06050e',
                      fontFamily: 'var(--font-display)',
                      fontWeight: '700',
                      letterSpacing: '2px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      boxShadow: '0 0 25px rgba(125, 226, 255, 0.4)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Send size={16} /> TRANSMIT SIGNAL
                  </motion.button>

                  <button
                    type="button"
                    onClick={handleDetach}
                    style={{
                      padding: '14px 20px',
                      borderRadius: '12px',
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: 'var(--text-dim)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      letterSpacing: '1px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
                  >
                    Detach
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Shooting Star Layer (Higher z-index than the button) */}
      <AnimatePresence>
        {isSending && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 120, pointerEvents: 'none' }}>
            
            <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
              {/* 1. The lingering path of the shooting star */}
              <motion.line
                x1="42%" y1="71%" x2="100%" y2="-10%"
                stroke="rgba(125, 226, 255, 0.5)"
                strokeWidth="2"
                strokeDasharray="4 6"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                transition={{ duration: 2.0, ease: "easeOut" }}
              />
              
              {/* 2. The Shooting Star Tail (Solid bright gradient line) */}
              <motion.line
                x1="42%" y1="71%" x2="100%" y2="-10%"
                stroke="url(#shootingStarGrad)"
                strokeWidth="6"
                strokeLinecap="round"
                initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }}
                animate={{ 
                  pathLength: [0, 0.3, 0], // Tail grows then shrinks
                  pathOffset: [0, 0.7, 1], // Tail moves along the path
                  opacity: [0, 1, 1, 0] 
                }}
                transition={{ duration: 1.2, ease: "easeIn" }}
                style={{ filter: 'drop-shadow(0 0 10px #7DE2FF)' }}
              />
              
              <defs>
                <linearGradient id="shootingStarGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="60%" stopColor="#7DE2FF" />
                  <stop offset="100%" stopColor="#fff" />
                </linearGradient>
              </defs>
            </svg>

            {/* 3. The Bright Head of the Shooting Star */}
            <motion.div
              initial={{ top: '71%', left: '42%', opacity: 0, scale: 0 }}
              animate={{ 
                top: '-10%', 
                left: '100%', 
                opacity: [0, 1, 1, 0], 
                scale: [0, 1, 1, 0] 
              }}
              transition={{ duration: 1.2, ease: "easeIn" }}
              style={{
                position: 'absolute',
                width: '16px', height: '16px',
                background: '#fff',
                borderRadius: '50%',
                boxShadow: '0 0 20px 10px #fff, 0 0 40px 20px #7DE2FF',
                transform: 'translate(-50%, -50%)',
                zIndex: 121
              }}
            />

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
