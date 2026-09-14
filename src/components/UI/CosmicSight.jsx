import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNova, NovaStates } from '../../context/NovaContext';

export default function CosmicSight() {
  const { novaState } = useNova();
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    if (novaState === NovaStates.COSMIC_SIGHT) {
      setAnimationPhase(1); // Cosmic Energy
      const timers = [
        setTimeout(() => setAnimationPhase(2), 1000), // Rings
        setTimeout(() => setAnimationPhase(3), 2000), // Stars & Connections
        setTimeout(() => setAnimationPhase(4), 2500)  // Bright Central Star
      ];
      return () => timers.forEach(clearTimeout);
    } else {
      setAnimationPhase(0);
    }
  }, [novaState]);

  if (novaState !== NovaStates.COSMIC_SIGHT && novaState !== NovaStates.SUCCESS && novaState !== NovaStates.SERIOUS) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          zIndex: 14, pointerEvents: 'none',
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}
      >
        {/* Phase 1: Cosmic Energy */}
        <AnimatePresence>
          {animationPhase >= 1 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 2, 1.5], opacity: [0, 0.8, 0.4] }}
              transition={{ duration: 2, ease: "easeOut" }}
              style={{
                position: 'absolute',
                width: '300px', height: '300px',
                background: 'radial-gradient(circle, var(--nova-core) 0%, transparent 70%)',
                mixBlendMode: 'screen',
                filter: 'blur(20px)'
              }}
            />
          )}
        </AnimatePresence>

        {/* Phase 2: Expanding Rings */}
        <AnimatePresence>
          {animationPhase >= 2 && (
            <>
              {[1, 2, 3].map((ring) => (
                <motion.div
                  key={`ring-${ring}`}
                  initial={{ scale: 0, opacity: 1, borderWidth: '10px' }}
                  animate={{ scale: ring * 3, opacity: 0, borderWidth: '1px' }}
                  transition={{ duration: 2, delay: ring * 0.2, ease: "easeOut" }}
                  style={{
                    position: 'absolute',
                    width: '200px', height: '200px',
                    borderRadius: '50%',
                    borderStyle: 'solid',
                    borderColor: 'var(--nova-glow)',
                    mixBlendMode: 'screen'
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Phase 3: Stars and Connections */}
        <AnimatePresence>
          {animationPhase >= 3 && (
            <motion.svg 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              width="100%" height="100%" style={{ position: 'absolute' }}
            >
              {[
                { x1: '40%', y1: '40%', x2: '50%', y2: '50%' },
                { x1: '60%', y1: '30%', x2: '50%', y2: '50%' },
                { x1: '30%', y1: '60%', x2: '50%', y2: '50%' },
                { x1: '70%', y1: '70%', x2: '50%', y2: '50%' }
              ].map((line, i) => (
                <motion.line 
                  key={i}
                  x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} 
                  stroke="var(--nova-white)" strokeWidth="1" strokeDasharray="4,4"
                  initial={{ pathLength: 0, opacity: 0 }} 
                  animate={{ pathLength: 1, opacity: 0.6 }} 
                  transition={{ duration: 1, delay: i * 0.1 }}
                />
              ))}
              
              {[
                { cx: '40%', cy: '40%' },
                { cx: '60%', cy: '30%' },
                { cx: '30%', cy: '60%' },
                { cx: '70%', cy: '70%' }
              ].map((star, i) => (
                <motion.circle 
                  key={`star-${i}`}
                  cx={star.cx} cy={star.cy} r="3" fill="var(--nova-core)"
                  initial={{ scale: 0 }} animate={{ scale: [0, 1.5, 1] }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  style={{ filter: 'drop-shadow(0 0 5px var(--nova-glow))' }}
                />
              ))}
            </motion.svg>
          )}
        </AnimatePresence>

        {/* Phase 4: Bright Central Star */}
        <AnimatePresence>
          {animationPhase >= 4 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              style={{
                position: 'absolute',
                width: '10px', height: '10px',
                background: '#fff',
                borderRadius: '50%',
                boxShadow: '0 0 50px 20px var(--nova-white), 0 0 100px 40px var(--nova-glow)',
                zIndex: 15
              }}
            />
          )}
        </AnimatePresence>

      </motion.div>
    </AnimatePresence>
  );
}
