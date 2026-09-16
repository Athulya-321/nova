import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNova, NovaStates } from '../../context/NovaContext';

export default function CinematicOpening() {
  const { novaState } = useNova();
  const [stars, setStars] = useState([]);
  const [trail, setTrail] = useState(false);

  // The overlay is visible until the portal entry, then fades out
  const isOpening = [
    NovaStates.OPENING_BLACK,
    NovaStates.SIGNAL_DETECTED,
    NovaStates.STARS_AWAKEN,
    NovaStates.NOVA_FAR,
    NovaStates.NOVA_NOTICES
  ].includes(novaState);

  const isBlack = novaState === NovaStates.OPENING_BLACK;
  const showSignal = novaState === NovaStates.SIGNAL_DETECTED;
  const showStars = [NovaStates.STARS_AWAKEN, NovaStates.NOVA_FAR, NovaStates.NOVA_NOTICES].includes(novaState);

  useEffect(() => {
    if (novaState === NovaStates.STARS_AWAKEN) {
      // One tiny star
      setStars([{ id: 0, x: 50, y: 50, delay: 0, scale: 1.5 }]);
      
      // Additional stars after a pause
      setTimeout(() => {
        const newStars = Array.from({ length: 40 }).map((_, i) => ({
          id: i + 1,
          x: Math.random() * 100,
          y: Math.random() * 100,
          delay: Math.random() * 2,
          scale: Math.random() * 0.8 + 0.2
        }));
        setStars(prev => [...prev, ...newStars]);
      }, 1500);

      // Luminous trail
      setTimeout(() => {
        setTrail(true);
      }, 2500);
    }
  }, [novaState]);

  return (
    <AnimatePresence>
      {isOpening && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: isBlack ? '#000' : 'rgba(11, 10, 26, 0.8)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            transition: 'background-color 3s ease',
            overflow: 'hidden'
          }}
        >
          {/* Subtle cosmic particles */}
          {isBlack && (
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 0.3 }}
               transition={{ duration: 2 }}
               style={{
                 position: 'absolute', width: '100%', height: '100%',
                 backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
                 backgroundSize: '30px 30px'
               }}
             />
          )}

          {/* Awaken Stars */}
          {showStars && stars.map(star => (
            <motion.div
              key={star.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: star.scale }}
              transition={{ delay: star.delay, duration: 1 }}
              style={{
                position: 'absolute',
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: '#fff',
                boxShadow: '0 0 10px 2px rgba(125, 226, 255, 0.8)'
              }}
            />
          ))}

          {/* Luminous Trail */}
          <AnimatePresence>
            {trail && showStars && (
              <motion.div
                initial={{ opacity: 0, left: '-10%', top: '30%', width: '0%', height: '2px' }}
                animate={{ opacity: 1, width: '120%', left: '110%', top: '70%' }}
                transition={{ duration: 2, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  background: 'linear-gradient(90deg, transparent, rgba(125, 226, 255, 1), transparent)',
                  boxShadow: '0 0 20px 5px rgba(125, 226, 255, 0.5)',
                  transformOrigin: 'left center',
                  transform: 'rotate(20deg)'
                }}
              />
            )}
          </AnimatePresence>

          {/* Nova Splash Image */}
          <AnimatePresence>
            {(isBlack || showSignal || showStars) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 0.8, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 3, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  zIndex: 5,
                  width: '300px',
                  height: '300px',
                  borderRadius: '50%',
                  backgroundImage: "url('/crop.webp')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  boxShadow: '0 0 50px rgba(125, 226, 255, 0.4)',
                  mixBlendMode: 'screen',
                  filter: 'contrast(1.2)'
                }}
              />
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {showSignal && (
              <motion.div
                key="signal-text"
                initial={{ opacity: 0, letterSpacing: '0px', y: 200 }}
                animate={{ opacity: 1, letterSpacing: '5px', y: 200 }}
                exit={{ opacity: 0, letterSpacing: '10px', y: 200 }}
                transition={{ duration: 2 }}
                style={{
                  color: 'var(--nova-core)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.2rem',
                  textTransform: 'uppercase',
                  textShadow: '0 0 20px var(--nova-glow)',
                  zIndex: 10
                }}
              >
                ...Signal Detected
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
