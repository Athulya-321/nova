import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import SlideAnimationLayer from './SlideAnimationLayer';
import FullScreenStoryCanvas from './FullScreenStoryCanvas';

const storySlides = [
  { 
    id: 1, 
    bg: '/slide 1.webp',
    tag: 'THE WORLD OF VEYRA',
    title: 'THE FALLEN HOME',
    text: 'On a distant world orbiting a dying star, lived the Starforged.'
  },
  { 
    id: 2, 
    bg: '/slide 2.webp',
    tag: 'THE GUARDIAN AND KAELEN',
    title: 'A CURIOUS SPIRIT',
    text: 'Among them was Nova, curious and adventurous, dreaming of exploring new worlds.'
  },
  { 
    id: 3, 
    bg: '/slide 3.webp',
    tag: 'THE FALL OF VEYRA',
    title: 'THE MENTOR\'S LESSON',
    text: 'Nova was trained by a wise guardian who taught her that true strength is in compassion.'
  },
  { 
    id: 4, 
    bg: '/slide 4.webp',
    tag: 'THE LAST LIGHT OF AURELIS',
    title: 'THE SHADOW REACHES',
    text: 'One day, a powerful enemy attacked, seeking to steal the energy of their dying star.'
  },
  { 
    id: 5, 
    bg: '/slide 5.webp',
    tag: 'THE GUARDIAN WITHOUT A HOME',
    title: 'THE LAST LIGHT',
    text: 'As the world collapsed, Nova’s mentor transferred the last fragment of his Star Core into her.'
  },
  { 
    id: 6, 
    bg: '/slide 6.webp',
    tag: 'EARTH, THE WORLD SHE CHOSE',
    title: 'THE JOURNEY BEGINS',
    text: 'Alone but not defeated, she traveled from planet to planet, bringing hope to places others had forgotten.'
  },
  { 
    id: 7, 
    bg: '/slide 7.webp',
    tag: 'NOVA TODAY',
    title: 'GUARDIAN OF THE STARWAYS',
    text: 'Eventually, Nova discovered Earth. Now, she listens and watches over those who feel lost or alone.'
  }
];

export default function StoryExperience() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const next = useCallback(() => {
    setCurrentSlide(prev => Math.min(prev + 1, storySlides.length - 1));
  }, []);

  const prev = useCallback(() => {
    setCurrentSlide(p => Math.max(p - 1, 0));
  }, []);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        next();
      } else if (e.key === 'ArrowLeft') {
        prev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [next, prev]);

  const slide = storySlides[currentSlide];

  return (
    <div className="fullscreen-story-container">
      
      {/* Full-Screen Crossfading Slide Viewport */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`slide-${slide.id}`}
          initial={{ opacity: 0, scale: 1.01 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.995 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="fullscreen-slide"
          style={{
            backgroundImage: `url('${slide.bg}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Subtle Ambient DOM Animation Layer (Atmosphere, Aurelis Pulse, Floating Islands, Mist) */}
          <SlideAnimationLayer slideId={slide.id} />

          {/* Full-Screen Precise Procedural Canvas (Exact Star Twinkles, Waterfalls, Embers) */}
          <FullScreenStoryCanvas slideId={slide.id} />

          {/* Cinematic Bottom Gradient for Content Contrast */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '50%',
            background: 'linear-gradient(to top, rgba(3, 2, 10, 0.92) 0%, rgba(3, 2, 10, 0.55) 45%, rgba(3, 2, 10, 0) 100%)',
            zIndex: 10,
            pointerEvents: 'none'
          }} />

          {/* Top Vignette */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '22%',
            background: 'linear-gradient(to bottom, rgba(3, 2, 10, 0.55) 0%, rgba(3, 2, 10, 0) 100%)',
            zIndex: 10,
            pointerEvents: 'none'
          }} />

          {/* Story Text Box Overlay */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            style={{
              position: 'absolute',
              bottom: '12%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '90%',
              maxWidth: '820px',
              zIndex: 15,
              textAlign: 'center',
              padding: '24px 36px',
              background: 'rgba(8, 6, 22, 0.48)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(120, 210, 255, 0.12)',
              pointerEvents: 'none'
            }}
          >
            <div style={{
              fontSize: '0.85rem',
              color: 'var(--nova-glow)',
              textTransform: 'uppercase',
              letterSpacing: '4px',
              marginBottom: '8px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}>
              <span>SLIDE {currentSlide + 1} OF {storySlides.length}</span>
              <span style={{ opacity: 0.4 }}>•</span>
              <span>{slide.tag}</span>
            </div>

            <h2 style={{
              fontSize: '2.3rem',
              color: 'var(--nova-white)',
              marginBottom: '10px',
              letterSpacing: '3px',
              fontFamily: 'var(--font-display)',
              textShadow: '0 4px 20px rgba(0,0,0,0.9)'
            }}>
              {slide.title}
            </h2>

            <p style={{
              fontSize: '1.18rem',
              color: 'rgba(255, 255, 255, 0.95)',
              lineHeight: 1.6,
              fontFamily: 'var(--font-primary)',
              textShadow: '0 2px 10px rgba(0,0,0,0.9)',
              margin: 0
            }}>
              {slide.text}
            </p>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Floating Side Navigation Buttons */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: 0,
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 40px',
        transform: 'translateY(-50%)',
        zIndex: 25,
        pointerEvents: 'none'
      }}>
        <button 
          onClick={prev} 
          disabled={currentSlide === 0} 
          style={{ 
            ...btnStyle, 
            opacity: currentSlide === 0 ? 0 : 1, 
            pointerEvents: currentSlide === 0 ? 'none' : 'auto' 
          }}
          aria-label="Previous Slide"
        >
          <ChevronLeft size={36}/>
        </button>

        <button 
          onClick={next} 
          disabled={currentSlide === storySlides.length - 1} 
          style={{ 
            ...btnStyle, 
            opacity: currentSlide === storySlides.length - 1 ? 0 : 1, 
            pointerEvents: currentSlide === storySlides.length - 1 ? 'none' : 'auto' 
          }}
          aria-label="Next Slide"
        >
          <ChevronRight size={36}/>
        </button>
      </div>

      {/* Bottom Progress Pill Indicators */}
      <div style={{
        position: 'absolute',
        bottom: '3.8%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 25,
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        padding: '8px 18px',
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: '30px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        {storySlides.map((_, i) => (
          <div 
            key={`dot-${i}`} 
            onClick={() => setCurrentSlide(i)}
            style={{ 
              width: i === currentSlide ? '28px' : '10px',
              height: '10px',
              borderRadius: '5px',
              cursor: 'pointer',
              background: i === currentSlide ? 'var(--nova-core)' : 'rgba(255,255,255,0.25)',
              boxShadow: i === currentSlide ? '0 0 15px var(--nova-glow)' : 'none',
              transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
            }} 
            title={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

const btnStyle = {
  background: 'rgba(15, 12, 35, 0.55)',
  border: '1px solid rgba(255, 255, 255, 0.25)',
  color: 'var(--nova-white)',
  borderRadius: '50%',
  width: '64px',
  height: '64px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  transition: 'all 0.3s ease',
  boxShadow: '0 8px 25px rgba(0,0,0,0.5), 0 0 15px rgba(120, 210, 255, 0.15)'
};
