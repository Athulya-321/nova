import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowRight } from 'lucide-react';

export default function HelpSignals() {
  const [isSending, setIsSending] = useState(false);

  const handleSendSignal = () => {
    if (isSending) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
    }, 2000); // 2s to allow the path to linger and fade
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 60, background: '#000', overflow: 'hidden' }}>
      
      {/* Background Image */}
      <motion.div
        animate={
          isSending 
            ? { filter: 'brightness(0.7)' } 
            : { filter: 'brightness(1)' }
        }
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{
          position: 'absolute', width: '100%', height: '100%', zIndex: 1,
          backgroundImage: 'url("/media_1789286908868.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transformOrigin: 'center'
        }}
      />

      {/* Button Container */}
      <div style={{ position: 'absolute', top: '70%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
        <motion.button
          onClick={handleSendSignal}
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

      {/* Shooting Star Layer */}
      <AnimatePresence>
        {isSending && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 15, pointerEvents: 'none' }}>
            
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
                zIndex: 16
              }}
            />

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
