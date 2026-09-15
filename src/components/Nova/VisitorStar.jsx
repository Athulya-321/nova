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

  const getStarImageSrc = () => {
    if (isSad) return '/visitor_star_sad.png';
    if (isHappy) return '/visitor_star_happy.png';
    return '/visitor_star.png';
  };

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
            bottom: '20%',
            right: '4%',
            zIndex: 15,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            filter: style.filter
          }}
        >
          {/* Orbital Ring and Star */}
          <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

            {/* Custom Kawaii Celestial Star styled after reference with smooth floating motion & expression transitions */}
            <motion.div
              animate={style.pulse ? { 
                scale: isSad ? [0.97, 1.0, 0.97] : isHappy ? [1.02, 1.08, 1.02] : [1, 1.05, 1], 
                rotate: isSad ? [-1, 1, -1] : isHappy ? [-3, 4, -3] : [-2, 3, -2],
                y: isSad ? [0, 4, 0] : isHappy ? [0, -8, 0] : [0, -6, 0]
              } : { scale: 1, rotate: 0 }}
              transition={style.pulse ? { duration: isSad ? 4.5 : isHappy ? 2.8 : 3.5, repeat: Infinity, ease: 'easeInOut' } : {}}
              style={{ 
                position: 'relative', 
                zIndex: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <AnimatePresence mode="wait">
                <motion.img 
                  key={visitorMood || 'neutral'}
                  src={getStarImageSrc()} 
                  alt={`Visitor Star (${visitorMood || 'neutral'})`}
                  initial={{ opacity: 0.85, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0.85, scale: 0.96 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                    imageRendering: 'high-quality',
                    pointerEvents: 'none',
                    userSelect: 'none',
                    filter: isSad 
                      ? 'saturate(0.85) contrast(1.1) brightness(0.92) drop-shadow(0 0 14px rgba(100, 140, 255, 0.4))' 
                      : isHappy
                      ? 'contrast(1.1) saturate(1.2) brightness(1.1) drop-shadow(0 0 25px rgba(255, 210, 80, 0.55)) drop-shadow(0 0 45px rgba(130, 170, 255, 0.35))'
                      : 'contrast(1.08) saturate(1.15) brightness(1.05) drop-shadow(0 0 20px rgba(255, 200, 70, 0.35)) drop-shadow(0 0 35px rgba(100, 140, 255, 0.25))'
                  }} 
                />
              </AnimatePresence>
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
