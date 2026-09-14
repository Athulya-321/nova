import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNova, ConversationPhases } from '../../context/NovaContext';

export default function VisitorStar() {
  const { visitorData, conversationPhase } = useNova();

  // The visitor star should appear if we are not in the opening sequence or finished state.
  // Actually, we can just show it once conversation starts (e.g. not NONE and not FINISHED)
  const isVisible = conversationPhase !== ConversationPhases.NONE && conversationPhase !== ConversationPhases.FINISHED;

  const displayName = visitorData.name.trim() !== '' ? visitorData.name.toUpperCase() : 'VISITOR';

  // Evolve the star based on phase
  const getStarStyle = () => {
    let scale = 1;
    let brightness = 1;
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
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                width: '180px',
                height: '60px',
                borderRadius: '50%',
                border: '2px solid rgba(255, 213, 79, 0.4)',
                boxShadow: '0 0 15px rgba(255, 213, 79, 0.5), inset 0 0 10px rgba(255, 213, 79, 0.3)',
                transform: 'rotate(-15deg)',
              }}
            >
              {/* Little orbiting star/dot */}
              <div style={{ position: 'absolute', top: '-4px', left: '20px', width: '8px', height: '8px', background: '#fff', borderRadius: '50%', boxShadow: '0 0 10px #fff' }} />
            </motion.div>

            {/* Glowing Center Star */}
            <motion.div
              animate={style.pulse ? { scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] } : { scale: 1 }}
              transition={style.pulse ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : {}}
              style={{ position: 'relative', zIndex: 2, filter: 'drop-shadow(0 0 15px rgba(255, 213, 79, 0.8))' }}
            >
              <svg width="100" height="100" viewBox="0 0 100 100">
                <defs>
                  <radialGradient id="starGlowVisitor" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFF2CC" />
                    <stop offset="70%" stopColor="#FFD54F" />
                    <stop offset="100%" stopColor="#FFA000" />
                  </radialGradient>
                </defs>
                <path d="M50 5 L61 35 L95 35 L67 55 L78 85 L50 65 L22 85 L33 55 L5 35 L39 35 Z" fill="url(#starGlowVisitor)" stroke="#FFC107" strokeWidth="2" strokeLinejoin="round" />
                {/* Eyes */}
                <ellipse cx="40" cy="50" rx="4" ry="6" fill="#000" />
                <ellipse cx="60" cy="50" rx="4" ry="6" fill="#000" />
                {/* Eye highlights */}
                <circle cx="39" cy="48" r="1.5" fill="#fff" />
                <circle cx="59" cy="48" r="1.5" fill="#fff" />
                {/* Smile */}
                <path d="M 45 60 Q 50 65 55 60" fill="transparent" stroke="#000" strokeWidth="2" strokeLinecap="round" />
                {/* Blush */}
                <ellipse cx="32" cy="56" rx="4" ry="2" fill="rgba(255, 100, 100, 0.6)" />
                <ellipse cx="68" cy="56" rx="4" ry="2" fill="rgba(255, 100, 100, 0.6)" />
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
