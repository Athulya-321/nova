import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNova, ConversationPhases } from '../../context/NovaContext';

export default function VisitorStar() {
  const { visitorData, conversationPhase, visitorMood } = useNova();

  // The visitor star should appear if we are not in the opening sequence or finished state.
  const isVisible = conversationPhase !== ConversationPhases.NONE && conversationPhase !== ConversationPhases.FINISHED;

  const displayName = visitorData.name?.trim() ? visitorData.name.toUpperCase() : 'VISITOR';

  // Evolve the star based on phase & mood
  const getStarStyle = () => {
    let scale = 1;
    let brightness = visitorMood === 'sad' ? 0.75 : visitorMood === 'happy' ? 1.25 : 1;
    let y = 0;
    let x = 0;
    let rotate = 0;
    let pulse = true;

    if (conversationPhase === ConversationPhases.SIGNAL_RECEIVED) {
      scale = [1, 0.5, 0];
      brightness = 3;
      y = [0, -800]; // Launches into space
    } else if (conversationPhase === ConversationPhases.FINISHED) {
      scale = 0;
    }

    return {
      scale,
      filter: `brightness(${brightness})`,
      y,
      x,
      rotate,
      pulse
    };
  };

  const style = getStarStyle();
  const isSad = visitorMood === 'sad';
  const isHappy = visitorMood === 'happy';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="visitor-star-container"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: style.scale, y: style.y, x: style.x, rotate: style.rotate }}
          transition={{ duration: 1.5, type: 'spring', bounce: 0.5 }}
          style={{
            position: 'absolute',
            bottom: '40%',
            right: '5%',
            zIndex: 15,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            filter: style.filter
          }}
        >
          {/* Orbital Ring and Star */}
          <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            
            {/* Tilted Orbital Ring */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: isSad ? 30 : 20, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                width: '180px',
                height: '60px',
                borderRadius: '50%',
                border: isSad ? '2px solid rgba(125, 226, 255, 0.25)' : '2px solid rgba(125, 226, 255, 0.5)',
                boxShadow: isSad 
                  ? '0 0 10px rgba(125, 226, 255, 0.2)' 
                  : '0 0 20px rgba(125, 226, 255, 0.6), inset 0 0 10px rgba(170, 59, 255, 0.3)',
                transform: 'rotate(-15deg)',
              }}
            >
              {/* Little orbiting star/dot */}
              <div style={{ position: 'absolute', top: '-4px', left: '20px', width: '8px', height: '8px', background: '#fff', borderRadius: '50%', boxShadow: '0 0 10px #7DE2FF, 0 0 20px #fff' }} />
            </motion.div>

            {/* Glowing Center Star */}
            <motion.div
              animate={style.pulse ? { scale: isSad ? [1, 1.05, 1] : [1, 1.2, 1], opacity: isSad ? [0.7, 0.85, 0.7] : [0.85, 1, 0.85] } : { scale: 1 }}
              transition={style.pulse ? { duration: isSad ? 4.5 : 3, repeat: Infinity, ease: 'easeInOut' } : {}}
              style={{ 
                position: 'relative', 
                zIndex: 2, 
                filter: isSad 
                  ? 'drop-shadow(0 0 12px rgba(100, 160, 240, 0.6))' 
                  : 'drop-shadow(0 0 18px rgba(125, 226, 255, 0.9)) drop-shadow(0 0 35px rgba(36, 92, 241, 0.5))' 
              }}
            >
              <svg width="100" height="100" viewBox="0 0 100 100">
                <defs>
                  <radialGradient id="starGlowVisitor" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="35%" stopColor={isSad ? "#dbeafe" : "#E0F7FF"} />
                    <stop offset="75%" stopColor={isSad ? "#60a5fa" : "#7DE2FF"} />
                    <stop offset="100%" stopColor={isSad ? "#2563eb" : "#245CF1"} />
                  </radialGradient>
                </defs>
                <path 
                  d="M50 5 L61 35 L95 35 L67 55 L78 85 L50 65 L22 85 L33 55 L5 35 L39 35 Z" 
                  fill="url(#starGlowVisitor)" 
                  stroke={isSad ? "#93c5fd" : "#B3E5FC"} 
                  strokeWidth="2.5" 
                  strokeLinejoin="round" 
                />
                {/* Eyes */}
                <ellipse cx="40" cy="50" rx="4" ry={isSad ? "3" : "6"} fill="#060515" />
                <ellipse cx="60" cy="50" rx="4" ry={isSad ? "3" : "6"} fill="#060515" />
                {/* Eye highlights */}
                <circle cx="39" cy="48" r="1.5" fill="#fff" />
                <circle cx="59" cy="48" r="1.5" fill="#fff" />
                {/* Smile / Gentle mouth */}
                {isSad ? (
                  <path d="M 45 64 Q 50 59 55 64" fill="transparent" stroke="#060515" strokeWidth="2.5" strokeLinecap="round" />
                ) : (
                  <path d="M 45 60 Q 50 66 55 60" fill="transparent" stroke="#060515" strokeWidth="2.5" strokeLinecap="round" />
                )}
                {/* Cute Cosmic Blush */}
                <ellipse cx="32" cy="56" rx="4.5" ry="2.5" fill={isSad ? "rgba(96, 165, 250, 0.4)" : "rgba(125, 226, 255, 0.6)"} />
                <ellipse cx="68" cy="56" rx="4.5" ry="2.5" fill={isSad ? "rgba(96, 165, 250, 0.4)" : "rgba(125, 226, 255, 0.6)"} />
              </svg>
            </motion.div>
          </div>

          {/* Text Information below Star */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
            marginTop: '10px', zIndex: 3
          }}>
            <span style={{ color: '#fff', fontSize: '14px', fontFamily: 'var(--font-display)', letterSpacing: '3px', fontWeight: 'bold' }}>
              {displayName}
            </span>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
