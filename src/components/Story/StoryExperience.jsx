import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';
import { useNova, AppModes } from '../../context/NovaContext';
import SlideAnimationLayer from './SlideAnimationLayer';
import StoryArtworkStage from './StoryArtworkStage';
import { preloadStoryImages } from '../../services/storyPreloader';
import '../../styles/slideAnimations.css';

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
  const [targetSlide, setTargetSlide] = useState(null);
  const [turnDirection, setTurnDirection] = useState(null); // 'next' | 'prev' | null
  const [isAnimating, setIsAnimating] = useState(false);

  // Ensure story images are preloaded and decoded
  useEffect(() => {
    preloadStoryImages();
  }, []);

  // Turn page forward (Next)
  const next = useCallback(() => {
    if (isAnimating) return;
    if (currentSlide < storySlides.length - 1) {
      setTargetSlide(currentSlide + 1);
      setTurnDirection('next');
      setIsAnimating(true);
    }
  }, [currentSlide, isAnimating]);

  // Turn page backward (Previous)
  const prev = useCallback(() => {
    if (isAnimating) return;
    if (currentSlide > 0) {
      setTargetSlide(currentSlide - 1);
      setTurnDirection('prev');
      setIsAnimating(true);
    }
  }, [currentSlide, isAnimating]);

  // Jump to specific chapter via indicator dots
  const jumpToSlide = useCallback((index) => {
    if (isAnimating || index === currentSlide) return;
    setTargetSlide(index);
    setTurnDirection(index > currentSlide ? 'next' : 'prev');
    setIsAnimating(true);
  }, [currentSlide, isAnimating]);

  const closeStory = useCallback(() => {
    setAppMode(AppModes.HOME);
  }, [setAppMode]);

  // Complete page-turn transition
  const handleAnimationEnd = useCallback(() => {
    if (targetSlide !== null) {
      setCurrentSlide(targetSlide);
    }
    setTargetSlide(null);
    setTurnDirection(null);
    setIsAnimating(false);
  }, [targetSlide]);

  // Safe fallback timer ensuring navigation is always unlocked
  useEffect(() => {
    if (!isAnimating) return;
    const timer = setTimeout(() => {
      handleAnimationEnd();
    }, 920);
    return () => clearTimeout(timer);
  }, [isAnimating, handleAnimationEnd]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isAnimating) return;
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
  }, [next, prev, closeStory, currentSlide, isAnimating]);

  const slide = storySlides[currentSlide];
  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === storySlides.length - 1;

  // Active page number to show in indicators (show target while turning)
  const activeDisplayIndex = isAnimating && targetSlide !== null ? targetSlide : currentSlide;

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
        userSelect: 'none'
      }}
    >
      {/* Top Bar Quick Exit */}
      <div style={{
        position: 'absolute',
        top: '24px',
        right: '28px',
        zIndex: 70,
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <button
          onClick={closeStory}
          style={{
            background: 'rgba(15, 18, 35, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.22)',
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
            transition: 'all 0.25s ease',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.borderColor = 'var(--nova-glow)';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(125, 226, 255, 0.3)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--text-dim)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.22)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.5)';
          }}
          title="Return to Home (Esc)"
        >
          <X size={16} />
          <span>Exit Story</span>
        </button>
      </div>

      {/* Full-Screen Illustrated Book Spread Display */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden'
        }}
      >
        {/* Real 3D Book Viewport */}
        <div className="book-viewport">
          {/* Subtle central spine shadow */}
          <div className="book-spine-crease" />

          {isAnimating ? (
            <>
              {/* Stationary Underneath Left Half */}
              <div className="book-page-half left">
                <img 
                  src={storySlides[turnDirection === 'next' ? currentSlide : targetSlide].src} 
                  alt="Left Page Spread" 
                  loading="eager"
                  decoding="async"
                  draggable={false} 
                />
              </div>

              {/* Stationary Underneath Right Half */}
              <div className="book-page-half right">
                <img 
                  src={storySlides[turnDirection === 'next' ? targetSlide : currentSlide].src} 
                  alt="Right Page Spread" 
                  loading="eager"
                  decoding="async"
                  draggable={false} 
                />
              </div>

              {/* Dynamic Cast Shadows on Stationary Pages */}
              <div className={`book-cast-shadow ${turnDirection === 'next' ? 'right' : 'left'}`} />
              <div className={`book-cast-shadow ${turnDirection === 'next' ? 'left' : 'right'}`} />

              {/* 3D Realistic Turning Leaf (rotates around spine) */}
              <div 
                className={`book-turning-leaf turning-${turnDirection}`}
                onAnimationEnd={handleAnimationEnd}
              >
                {/* Front face of turning page (current right illustrated page) */}
                <div className="leaf-face front">
                  <img 
                    src={storySlides[turnDirection === 'next' ? currentSlide : targetSlide].src} 
                    alt="Turning Page Front" 
                    loading="eager"
                    decoding="async"
                    draggable={false} 
                  />
                  <div className="leaf-shadow" />
                </div>

                {/* Back face of turning page (incoming left page) */}
                <div className="leaf-face back">
                  <img 
                    src={storySlides[turnDirection === 'next' ? targetSlide : currentSlide].src} 
                    alt="Turning Page Back" 
                    loading="eager"
                    decoding="async"
                    draggable={false} 
                  />
                  <div className="leaf-shadow" />
                </div>
              </div>
            </>
          ) : (
            /* Stationary Idle Open Book */
            <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
              <img
                src={slide.src}
                alt={slide.title}
                loading="eager"
                decoding="async"
                style={{
                  width: '100vw',
                  height: '100vh',
                  objectFit: 'cover',
                  objectPosition: 'center center',
                  display: 'block',
                  pointerEvents: 'none'
                }}
                draggable={false}
              />

              {/* Transparent Cinematic Story Animation Layer (locked to illustration stage) */}
              <StoryArtworkStage>
                <SlideAnimationLayer slideId={slide.id} />
              </StoryArtworkStage>

              {/* Clickable Left 25% to turn page back */}
              {!isFirstSlide && (
                <div
                  onClick={prev}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '25vw',
                    height: '100vh',
                    cursor: 'pointer',
                    zIndex: 20
                  }}
                  title="Click left page to turn back"
                />
              )}

              {/* Clickable Right 25% to turn page forward */}
              {!isLastSlide && (
                <div
                  onClick={next}
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '25vw',
                    height: '100vh',
                    cursor: 'pointer',
                    zIndex: 20
                  }}
                  title="Click right page to turn forward"
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
                    bottom: '28px',
                    right: '28px',
                    zIndex: 30,
                    background: 'rgba(15, 24, 60, 0.88)',
                    border: '1.5px solid rgba(125, 226, 255, 0.75)',
                    color: '#fff',
                    padding: '10px 26px',
                    borderRadius: '24px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.95rem',
                    letterSpacing: '1px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6), 0 0 15px rgba(125, 226, 255, 0.4)'
                  }}
                >
                  <span>Close the Story</span>
                  <ChevronRight size={18} />
                </motion.button>
              )}
            </div>
          )}
        </div>

        {/* Floating Side Arrow - Previous */}
        <button
          onClick={prev}
          disabled={isFirstSlide || isAnimating}
          style={{
            ...floatingNavBtnStyle,
            left: '28px',
            opacity: isFirstSlide ? 0 : isAnimating ? 0.4 : 1,
            pointerEvents: isFirstSlide || isAnimating ? 'none' : 'auto',
            cursor: isAnimating ? 'wait' : 'pointer'
          }}
          aria-label="Previous Chapter"
          title="Previous Chapter"
        >
          <ChevronLeft size={32} />
        </button>

        {/* Floating Side Arrow - Next / Close */}
        <button
          onClick={isLastSlide ? closeStory : next}
          disabled={isAnimating}
          style={{
            ...floatingNavBtnStyle,
            right: '28px',
            opacity: isAnimating ? 0.4 : 1,
            pointerEvents: isAnimating ? 'none' : 'auto',
            cursor: isAnimating ? 'wait' : 'pointer'
          }}
          aria-label={isLastSlide ? "Close Story" : "Next Chapter"}
          title={isLastSlide ? "Close Story" : "Next Chapter"}
        >
          {isLastSlide ? <X size={26} /> : <ChevronRight size={32} />}
        </button>
      </div>

      {/* Bottom Chapter Progress Indicators */}
      <div style={{
        position: 'absolute',
        bottom: '22px',
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
          CHAPTER {activeDisplayIndex + 1} OF {storySlides.length}
        </span>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {storySlides.map((_, i) => (
            <div
              key={`dot-${i}`}
              onClick={() => jumpToSlide(i)}
              style={{
                width: i === activeDisplayIndex ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                cursor: isAnimating ? 'default' : 'pointer',
                background: i === activeDisplayIndex ? 'var(--nova-core)' : 'rgba(255, 255, 255, 0.25)',
                boxShadow: i === activeDisplayIndex ? '0 0 12px var(--nova-glow)' : 'none',
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
