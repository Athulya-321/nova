import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';
import { useNova, AppModes } from '../../context/NovaContext';

// Nova's complete illustrated origin storybook (Chapters 1 to 7)
const storySlides = [
  { id: 1, src: '/slide1.0.webp', title: 'Chapter 1: The World of Veyra' },
  { id: 2, src: '/slide2.0.webp', title: 'Chapter 2: The Guardian and Kaelen' },
  { id: 3, src: '/slide3.0.webp', title: 'Chapter 3: The Fall of Veyra' },
  { id: 4, src: '/slide4.0.webp', title: 'Chapter 4: The Last Light of Aurelis' },
  { id: 5, src: '/slide5.0.webp', title: 'Chapter 5: The Guardian Without a Home' },
  { id: 6, src: '/slide6.0.webp', title: 'Chapter 6: Earth - The World She Chose' },
  { id: 7, src: '/slide7.0.webp', title: 'Chapter 7: Nova Today - The Starbound Guardian' }
];

export default function StoryExperience() {
  const { setAppMode } = useNova();
  const [currentSlide, setCurrentSlide] = useState(0);

  const next = useCallback(() => {
    setCurrentSlide(prev => {
      if (prev < storySlides.length - 1) {
        return prev + 1;
      }
      return prev;
    });
  }, []);

  const prev = useCallback(() => {
    setCurrentSlide(p => Math.max(p - 1, 0));
  }, []);

  const closeStory = useCallback(() => {
    setAppMode(AppModes.HOME);
  }, [setAppMode]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'd' || e.key === 'D') {
        if (currentSlide === storySlides.length - 1) {
          closeStory();
        } else {
          next();
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        prev();
      } else if (e.key === 'Escape') {
        closeStory();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [next, prev, closeStory, currentSlide]);

  const slide = storySlides[currentSlide];
  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === storySlides.length - 1;

  return (
    <div 
      className="fullscreen-story-container"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 60,
        background: 'radial-gradient(ellipse at center, #0b0c1b 0%, #03020a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        userSelect: 'none',
        paddingTop: '60px',
        paddingBottom: '50px'
      }}
    >
      {/* Top Bar Quick Exit */}
      <div style={{
        position: 'absolute',
        top: '24px',
        right: '40px',
        zIndex: 70,
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <button
          onClick={closeStory}
          style={{
            background: 'rgba(15, 18, 35, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            color: 'var(--text-dim)',
            borderRadius: '20px',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontFamily: 'var(--font-primary)',
            letterSpacing: '1px',
            cursor: 'pointer',
            backdropFilter: 'blur(12px)',
            transition: 'all 0.25s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.borderColor = 'var(--nova-glow)';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(125, 226, 255, 0.3)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--text-dim)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          title="Return to Home (Esc)"
        >
          <X size={16} />
          <span>Exit Story</span>
        </button>
      </div>

      {/* Main Illustrated Book Spread Display */}
      <div 
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 'min(92vw, calc((100vh - 140px) * 1.5))',
          height: 'min(calc(100vh - 140px), calc(92vw / 1.5))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`slide-${slide.id}`}
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.985 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(125, 226, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: '#04030a'
            }}
          >
            {/* The Pure Illustrated Storybook Slide (WebP) */}
            <img
              src={slide.src}
              alt={slide.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
                pointerEvents: 'none'
              }}
              draggable={false}
            />

            {/* Clickable Left Half to go Previous */}
            {!isFirstSlide && (
              <div
                onClick={prev}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '25%',
                  height: '100%',
                  cursor: 'pointer',
                  zIndex: 20
                }}
                title="Click left side to go back"
              />
            )}

            {/* Clickable Right Half to go Next */}
            {!isLastSlide && (
              <div
                onClick={next}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '25%',
                  height: '100%',
                  cursor: 'pointer',
                  zIndex: 20
                }}
                title="Click right side to go forward"
              />
            )}

            {/* Interactive 'Close the Story' button on Slide 7 */}
            {isLastSlide && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(125, 226, 255, 0.6)' }}
                whileTap={{ scale: 0.96 }}
                onClick={closeStory}
                style={{
                  position: 'absolute',
                  bottom: '3.6%',
                  right: '2.4%',
                  zIndex: 30,
                  background: 'rgba(15, 24, 60, 0.85)',
                  border: '1.5px solid rgba(125, 226, 255, 0.7)',
                  color: '#fff',
                  padding: '9px 24px',
                  borderRadius: '24px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.95rem',
                  letterSpacing: '1px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6), 0 0 15px rgba(125, 226, 255, 0.4)'
                }}
              >
                <span>Close the Story</span>
                <ChevronRight size={18} />
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Floating Side Arrow - Previous */}
        <button
          onClick={prev}
          disabled={isFirstSlide}
          style={{
            ...floatingNavBtnStyle,
            left: '-70px',
            opacity: isFirstSlide ? 0 : 1,
            pointerEvents: isFirstSlide ? 'none' : 'auto'
          }}
          aria-label="Previous Chapter"
          title="Previous Chapter"
        >
          <ChevronLeft size={30} />
        </button>

        {/* Floating Side Arrow - Next / Close */}
        <button
          onClick={isLastSlide ? closeStory : next}
          style={{
            ...floatingNavBtnStyle,
            right: '-70px',
            opacity: 1,
            pointerEvents: 'auto'
          }}
          aria-label={isLastSlide ? "Close Story" : "Next Chapter"}
          title={isLastSlide ? "Close Story" : "Next Chapter"}
        >
          {isLastSlide ? <X size={26} /> : <ChevronRight size={30} />}
        </button>
      </div>

      {/* Bottom Chapter Progress Indicators */}
      <div style={{
        position: 'absolute',
        bottom: '18px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '6px 18px',
        background: 'rgba(6, 8, 20, 0.65)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '30px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <span style={{
          fontSize: '11px',
          color: 'var(--text-dim)',
          letterSpacing: '1px',
          fontFamily: 'var(--font-primary)',
          marginRight: '4px'
        }}>
          CHAPTER {currentSlide + 1} OF {storySlides.length}
        </span>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {storySlides.map((_, i) => (
            <div
              key={`dot-${i}`}
              onClick={() => setCurrentSlide(i)}
              style={{
                width: i === currentSlide ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                cursor: 'pointer',
                background: i === currentSlide ? 'var(--nova-core)' : 'rgba(255, 255, 255, 0.25)',
                boxShadow: i === currentSlide ? '0 0 12px var(--nova-glow)' : 'none',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              title={`Jump to Chapter ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const floatingNavBtnStyle = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 35,
  background: 'rgba(12, 16, 32, 0.65)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  color: '#fff',
  borderRadius: '50%',
  width: '54px',
  height: '54px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  transition: 'all 0.25s ease',
  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(120, 210, 255, 0.15)'
};
