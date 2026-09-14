import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const storySlides = [
  { 
    id: 1, 
    bg: '/slide 1.png',
    title: 'THE FALLEN HOME',
    text: 'On a distant world orbiting a dying star, lived the Starforged.'
  },
  { 
    id: 2, 
    bg: '/slide 2.png',
    title: 'A CURIOUS SPIRIT',
    text: 'Among them was Nova, curious and adventurous, dreaming of exploring new worlds.'
  },
  { 
    id: 3, 
    bg: '/slide 3.png',
    title: 'THE MENTOR\'S LESSON',
    text: 'Nova was trained by a wise guardian who taught her that true strength is in compassion.'
  },
  { 
    id: 4, 
    bg: '/slide 4.png',
    title: 'THE SHADOW REACHES',
    text: 'One day, a powerful enemy attacked, seeking to steal the energy of their dying star.'
  },
  { 
    id: 5, 
    bg: '/slide 5.png',
    title: 'THE LAST LIGHT',
    text: 'As the world collapsed, Nova’s mentor transferred the last fragment of his Star Core into her.'
  },
  { 
    id: 6, 
    bg: '/slide 6.png',
    title: 'THE JOURNEY BEGINS',
    text: 'Alone but not defeated, she traveled from planet to planet, bringing hope to places others had forgotten.'
  },
  { 
    id: 7, 
    bg: '/slide 7.png',
    title: 'GUARDIAN OF THE STARWAYS',
    text: 'Eventually, Nova discovered Earth. Now, she listens and watches over those who feel lost or alone.'
  }
];

export default function StoryExperience() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const next = () => setCurrentSlide(prev => Math.min(prev + 1, storySlides.length - 1));
  const prev = () => setCurrentSlide(p => Math.max(p - 1, 0));

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 60, background: '#070514', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Blurred background of the current slide for aesthetic depth */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${currentSlide}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          style={{
            position: 'absolute', width: '100%', height: '100%',
            backgroundImage: `url('${storySlides[currentSlide].bg}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(40px) brightness(0.6)',
            zIndex: 1
          }}
        />
      </AnimatePresence>

      {/* 3D Card Carousel */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '70%', display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: '1200px' }}>
        {storySlides.map((slide, index) => {
          const isActive = index === currentSlide;
          const offset = index - currentSlide; // -1 means left, +1 means right
          const absOffset = Math.abs(offset);
          const isVisible = absOffset <= 2; // only render nearby cards

          // Base calculation for responsive cards
          const baseWidth = 800; // max width
          
          return (
            <motion.div
              key={slide.id}
              initial={false}
              animate={{
                x: offset * 500, // Distance between cards
                scale: isActive ? 1 : 0.85 - (absOffset * 0.05),
                opacity: isVisible ? (isActive ? 1 : 0.5 - (absOffset * 0.2)) : 0,
                zIndex: 10 - absOffset,
                rotateY: offset * -15 // Adds a beautiful 3D cover-flow rotation
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'absolute',
                width: '70vw',
                maxWidth: `${baseWidth}px`,
                height: '60vh',
                maxHeight: '550px',
                borderRadius: '30px',
                backgroundImage: `url('${slide.bg}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: isActive ? '0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(125, 226, 255, 0.4)' : '0 10px 30px rgba(0,0,0,0.6)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                pointerEvents: isActive ? 'auto' : 'none'
              }}
            >
              {/* Dark gradient overlay on the card for text readability */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, width: '100%', height: '60%',
                background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 100%)',
                zIndex: 1
              }} />
              
              {/* Text Content inside Card */}
              <div style={{ position: 'relative', zIndex: 2, padding: '40px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', color: 'var(--nova-white)', marginBottom: '15px', letterSpacing: '3px', fontFamily: 'var(--font-display)', textShadow: '0 5px 15px rgba(0,0,0,0.9)' }}>
                  {slide.title}
                </h2>
                <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.95)', lineHeight: 1.6, fontFamily: 'var(--font-primary)', textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}>
                  {slide.text}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div style={{ position: 'absolute', bottom: '8%', zIndex: 3, display: 'flex', gap: '50px', alignItems: 'center' }}>
        <button onClick={prev} disabled={currentSlide === 0} style={{ ...btnStyle, opacity: currentSlide === 0 ? 0 : 1, pointerEvents: currentSlide === 0 ? 'none' : 'auto' }}>
          <ChevronLeft size={35}/>
        </button>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          {storySlides.map((_, i) => (
            <div 
              key={`dot-${i}`} 
              onClick={() => setCurrentSlide(i)}
              style={{ 
                width: '12px', height: '12px', borderRadius: '50%', cursor: 'pointer',
                background: i === currentSlide ? 'var(--nova-core)' : 'rgba(255,255,255,0.3)',
                boxShadow: i === currentSlide ? '0 0 15px var(--nova-glow)' : 'none',
                transition: 'all 0.3s ease'
              }} 
            />
          ))}
        </div>

        <button onClick={next} disabled={currentSlide === storySlides.length - 1} style={{ ...btnStyle, opacity: currentSlide === storySlides.length - 1 ? 0 : 1, pointerEvents: currentSlide === storySlides.length - 1 ? 'none' : 'auto' }}>
          <ChevronRight size={35}/>
        </button>
      </div>
    </div>
  );
}

const btnStyle = {
  background: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  color: 'var(--nova-white)',
  borderRadius: '50%',
  width: '70px', height: '70px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
};
