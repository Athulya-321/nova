import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [sprinkles, setSprinkles] = useState([]);
  const sprinkleIdCounter = useRef(0);
  const lastSprinkleTime = useRef(0);
  
  // Motion values for ultra-smooth trailing for the main star
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  // Spring configuration for the SVG star core
  const springConfigCore = { damping: 40, stiffness: 1000, mass: 0.05 }; 
  const coreX = useSpring(cursorX, springConfigCore);
  const coreY = useSpring(cursorY, springConfigCore);

  useEffect(() => {
    const updateMousePosition = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      const now = Date.now();
      // Emit sprinkles much more frequently
      if (now - lastSprinkleTime.current > 20) {
        lastSprinkleTime.current = now;
        
        // Emit 2 sprinkles at once for a dense, magical trail
        const newSprinkles = Array.from({ length: 2 }).map(() => ({
          id: sprinkleIdCounter.current++,
          x: e.clientX,
          y: e.clientY,
          angle: Math.random() * Math.PI * 2,
          distance: Math.random() * 50 + 10,
          size: Math.random() * 4 + 1,
          duration: Math.random() * 0.7 + 0.4
        }));
        
        // Keep max 60 sprinkles at a time
        setSprinkles(prev => [...prev.slice(-60), ...newSprinkles]); 
        
        // Clean up the sprinkles after their animation
        newSprinkles.forEach(sprinkle => {
          setTimeout(() => {
            setSprinkles(prev => prev.filter(s => s.id !== sprinkle.id));
          }, sprinkle.duration * 1000);
        });
      }
    };

    const handleMouseOver = (e) => {
      // Detect interactive elements
      if (
        e.target.tagName.toLowerCase() === 'button' ||
        e.target.tagName.toLowerCase() === 'a' ||
        e.target.tagName.toLowerCase() === 'input' ||
        e.target.closest('button') ||
        e.target.closest('a') ||
        e.target.getAttribute('role') === 'button' ||
        e.target.closest('[role="button"]') ||
        window.getComputedStyle(e.target).cursor === 'pointer'
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  const coreColor = isHovering ? '#FFD54F' : '#7DE2FF';
  
  return (
    <>
      {/* Emitted Glowing Sprinkles */}
      <AnimatePresence>
        {sprinkles.map(sprinkle => (
          <motion.div
            key={sprinkle.id}
            initial={{ 
              x: sprinkle.x - sprinkle.size / 2, 
              y: sprinkle.y - sprinkle.size / 2, 
              opacity: 1, 
              scale: 1 
            }}
            animate={{ 
              x: sprinkle.x - sprinkle.size / 2 + Math.cos(sprinkle.angle) * sprinkle.distance, 
              y: sprinkle.y - sprinkle.size / 2 + Math.sin(sprinkle.angle) * sprinkle.distance + 20, // drift downwards 
              opacity: 0,
              scale: 0 
            }}
            transition={{ duration: sprinkle.duration, ease: "easeOut" }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: sprinkle.size,
              height: sprinkle.size,
              backgroundColor: coreColor,
              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: 99998,
              boxShadow: `0 0 10px ${coreColor}, 0 0 20px ${coreColor}`,
              mixBlendMode: 'screen'
            }}
          />
        ))}
      </AnimatePresence>

      {/* Main SVG Star Core */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: coreX,
          y: coreY,
          pointerEvents: 'none',
          zIndex: 99999,
          mixBlendMode: 'screen',
          translateX: '-50%',
          translateY: '-50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <motion.svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24"
          animate={{
            rotate: 360,
            scale: isHovering ? 1.6 : 1,
            fill: coreColor,
            filter: `drop-shadow(0 0 ${isHovering ? 12 : 8}px ${coreColor})`
          }}
          transition={{
            rotate: { repeat: Infinity, duration: 4, ease: "linear" }, /* Continuous spinning */
            scale: { type: "spring", stiffness: 400, damping: 15 },
            fill: { duration: 0.2 },
            filter: { duration: 0.2 }
          }}
          style={{ width: 24, height: 24 }}
        >
          {/* 4-pointed star / spark path */}
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </motion.svg>
      </motion.div>
    </>
  );
}
