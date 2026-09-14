import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNova, NovaStates, NovaEmotions } from '../../context/NovaContext';

export default function NovaCharacter() {
  const { novaState, novaEmotion } = useNova();
  const [characterState, setCharacterState] = useState('hidden');

  useEffect(() => {
    switch (novaState) {
      case NovaStates.OPENING_BLACK:
      case NovaStates.SIGNAL_DETECTED:
      case NovaStates.STARS_AWAKEN:
        setCharacterState('hidden');
        break;
      case NovaStates.NOVA_FAR:
        setCharacterState('far');
        break;
      case NovaStates.NOVA_NOTICES:
        setCharacterState('notices');
        break;
      case NovaStates.NOVA_APPROACHING:
        setCharacterState('approaching');
        break;
      case NovaStates.PORTAL_ENTRY:
        setCharacterState('portal');
        break;
      case NovaStates.NOVA_LANDS:
        setCharacterState('lands');
        break;
      case NovaStates.IDLE:
      case NovaStates.LISTENING:
      case NovaStates.SUCCESS:
        setCharacterState('idle');
        break;
      case NovaStates.SERIOUS:
      case NovaStates.COSMIC_SIGHT:
        setCharacterState('serious');
        break;
      default:
        setCharacterState('hidden');
    }
  }, [novaState]);

  if (characterState === 'hidden') return null;

  const characterVariants = {
    hidden: { opacity: 0, scale: 0, y: -500 },
    far: {
      opacity: 0.3,
      scale: 0.05,
      y: -200,
      filter: 'brightness(0.3) blur(2px)',
      transition: { duration: 3, ease: 'easeOut' }
    },
    notices: {
      opacity: 1,
      scale: 0.1,
      y: -200,
      filter: 'brightness(0.8) blur(0px)',
      boxShadow: '0 0 50px rgba(125, 226, 255, 0.8)',
      transition: { duration: 0.5, ease: 'easeInOut' }
    },
    approaching: {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: 'brightness(1) blur(0px)',
      transition: {
        duration: 3,
        ease: 'easeIn',
      }
    },
    portal: {
      opacity: [1, 1, 0],
      scale: [1, 1.2, 0.5],
      y: [0, -50, 100],
      filter: ['brightness(1)', 'brightness(2) blur(5px)', 'brightness(3) blur(20px)'],
      transition: { duration: 0.8, ease: 'easeIn' }
    },
    lands: {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: 'brightness(1) blur(0px)',
      transition: { duration: 0.5, type: 'spring', bounce: 0.6 }
    },
    idle: {
      opacity: 1,
      scale: 1,
      y: [0, -10, 0],
      filter: 'brightness(1) blur(0px)',
      transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
    },
    serious: {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: 'brightness(0.7) contrast(1.2)',
      transition: { duration: 1 }
    }
  };

  const spriteVariants = {
    idle: {
      scaleY: [1, 1.03, 1], // Breathing
      scaleX: [1, 0.98, 1],
      rotate: [0, 1, -1, 0], // Subtle head/body movement
      transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
    },
    approaching: {
      // Simulate running with fast bobbing and alternating skew
      y: [0, -40, 0, -40, 0, -40, 0, -40, 0],
      skewX: [0, -5, 5, -5, 5, -5, 5, -5, 0],
      scaleY: [1, 0.9, 1.1, 0.9, 1.1, 0.9, 1.1, 0.9, 1],
      transition: { duration: 3, ease: 'linear' }
    }
  };

  const getCoreStyles = () => {
    switch (novaEmotion) {
      case NovaEmotions.SERIOUS:
      case NovaEmotions.CONCERNED:
        return { background: 'var(--portal-core)', boxShadow: '0 0 40px 15px var(--portal-glow)', scale: [1, 1.2, 1], transition: { repeat: Infinity, duration: 1 } };
      case NovaEmotions.POWER_ACTIVATION:
        return { background: '#fff', boxShadow: '0 0 80px 30px var(--nova-glow), 0 0 150px 50px var(--portal-core)', scale: [1, 2, 1], transition: { repeat: Infinity, duration: 0.5 } };
      default:
        return { background: 'var(--nova-core)', boxShadow: '0 0 20px 5px var(--nova-glow)', scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 2 } };
    }
  };

  return (
    <motion.div 
      className="nova-container"
      variants={characterVariants}
      initial="hidden"
      animate={characterState}
      style={{
        position: 'absolute',
        left: '25%',
        bottom: '5%',
        x: '-50%',
        zIndex: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        willChange: 'transform, filter, opacity'
      }}
    >
      {/* Motion trail during approach */}
      <AnimatePresence>
        {characterState === 'approaching' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -200 }}
            animate={{ opacity: [0, 0.8, 0], scale: [0.5, 2, 3], y: [-200, -100, 0] }}
            transition={{ duration: 3, times: [0, 0.5, 1] }}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              background: 'radial-gradient(circle, rgba(125, 226, 255, 0.6) 0%, transparent 60%)',
              zIndex: -1,
              mixBlendMode: 'screen'
            }}
          />
        )}
      </AnimatePresence>

      <motion.div 
        variants={spriteVariants}
        animate={characterState === 'approaching' ? 'approaching' : (characterState === 'idle' ? 'idle' : '')}
        style={{ position: 'relative', display: 'inline-block', transformOrigin: 'bottom center' }}
      >
        <img 
          src="/nova_character.png" 
          alt="Nova" 
          style={{
            height: '60vh',
            objectFit: 'contain',
            mixBlendMode: 'screen',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 90% at 50% 50%, black 50%, transparent 80%)',
            maskImage: 'radial-gradient(ellipse 70% 90% at 50% 50%, black 50%, transparent 80%)',
            transformOrigin: 'bottom center',
            filter: novaEmotion === NovaEmotions.HAPPY ? 'drop-shadow(0 0 30px rgba(255, 213, 79, 0.4))' : 'none'
          }}
        />
        {/* Pulsing Core */}
        <motion.div 
          animate={getCoreStyles()}
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            x: '-50%',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            zIndex: 2
          }}
        />
        
        {/* Blinking eyes simulation overlay (very subtle) */}
        {characterState === 'idle' && (
          <motion.div
            animate={{ opacity: [0, 0, 1, 0, 0] }}
            transition={{ duration: 5, repeat: Infinity, times: [0, 0.9, 0.95, 0.98, 1] }}
            style={{
              position: 'absolute',
              top: '25%', left: '40%', width: '20%', height: '5%',
              background: 'rgba(0,0,0,0.8)',
              borderRadius: '50%', filter: 'blur(2px)'
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
