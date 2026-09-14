import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Star, Heart, Shield, Aperture, ArrowRight } from 'lucide-react';
import { useNova, NovaEmotions } from '../../context/NovaContext';
import NovaCharacter from '../Nova/NovaCharacter';
import Starways from '../Environment/Starways';

const powers = [
  { id: 'sight', title: 'COSMIC SIGHT', desc: 'See beyond\nthe surface.', icon: Eye, color: '#4da6ff', style: { top: '32%', left: '12%' } },
  { id: 'signal', title: 'SIGNAL DETECTION', desc: 'Find what\nmatters.', icon: Star, color: '#ffcc00', style: { top: '50%', left: '12%' } },
  { id: 'travel', title: 'STARWAY TRAVEL', desc: 'Go further\nacross worlds.', icon: Aperture, color: '#4da6ff', style: { top: '32%', right: '12%' } },
  { id: 'empathy', title: 'BOUNDLESS EMPATHY', desc: 'Feel. Understand.\nStand with you.', icon: Heart, color: '#d946ef', style: { top: '50%', right: '12%' } },
  { id: 'resolve', title: "GUARDIAN'S RESOLVE", desc: 'Turn hope\ninto action.', icon: Shield, color: '#4da6ff', style: { top: '72%', left: 'calc(50% - 160px)' } }
];

export default function PowersExperience() {
  const [activePower, setActivePower] = useState(null);
  const [powerActive, setPowerActive] = useState(false);
  const { setNovaEmotion } = useNova();

  const handleSelect = (power) => {
    if (powerActive) return; // Prevent clicking multiple while animating
    setActivePower(power);
    setPowerActive(true);
    setNovaEmotion(NovaEmotions.POWER_ACTIVATION);
    
    // Increased durations to allow full animations to play out beautifully
    const duration = 5000;

    setTimeout(() => {
      setNovaEmotion(NovaEmotions.CURIOUS);
      setPowerActive(false);
      setActivePower(null);
    }, duration);
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 60, background: '#000', overflow: 'hidden' }}>
      
      {/* High Definition Celestial Temple Background Image */}
      <motion.div
        animate={{ filter: powerActive ? 'brightness(0.35) contrast(1.2)' : 'brightness(1) contrast(1.05)' }}
        transition={{ duration: 1 }}
        style={{ 
          position: 'absolute', width: '100%', height: '100%',
          backgroundImage: 'url(/nova_powers_temple.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          imageRendering: '-webkit-optimize-contrast'
        }}
      />
      
      {/* Glassmorphic UI Cards */}
      <div style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 70 }}>
        {powers.map((power) => (
          <motion.div
            key={power.id}
            onClick={() => handleSelect(power)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{ scale: 1.03, boxShadow: `0 0 25px ${power.color}66`, backgroundColor: 'rgba(15, 20, 40, 0.7)' }}
            style={{
              position: 'absolute',
              top: power.style.top,
              left: power.style.left,
              right: power.style.right,
              transform: power.style.transform,
              width: '320px',
              height: '84px',
              borderRadius: '42px',
              background: 'rgba(5, 5, 20, 0.45)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: `1px solid ${power.color}aa`,
              boxShadow: `0 0 15px ${power.color}40, inset 0 0 10px ${power.color}20`,
              display: 'flex',
              alignItems: 'center',
              padding: '0 20px',
              cursor: 'pointer',
              overflow: 'hidden'
            }}
          >
            {/* Inner glowing icon circle */}
            <div style={{
              width: '46px', height: '46px', borderRadius: '50%',
              border: `1px solid ${power.color}`, display: 'flex',
              justifyContent: 'center', alignItems: 'center',
              marginRight: '15px', flexShrink: 0,
              boxShadow: `inset 0 0 10px ${power.color}80, 0 0 12px ${power.color}60`
            }}>
              <power.icon size={22} color={power.color} style={{ filter: `drop-shadow(0 0 5px ${power.color})` }} />
            </div>
            
            {/* Text Container */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
              <h3 style={{ margin: 0, fontSize: '13px', color: '#fff', letterSpacing: '1px', fontWeight: '500', fontFamily: 'Inter, sans-serif' }}>
                {power.title}
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.4', fontFamily: 'Inter, sans-serif', whiteSpace: 'pre-line' }}>
                {power.desc}
              </p>
            </div>
            
            {/* Arrow */}
            <ArrowRight size={18} color="rgba(255,255,255,0.5)" style={{ flexShrink: 0, marginLeft: '10px' }} />
          </motion.div>
        ))}
      </div>

      {/* Power Animations */}
      <AnimatePresence>
        {/* 1. COSMIC SIGHT */}
        {powerActive && activePower?.id === 'sight' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 2, 1.5], opacity: [0, 0.8, 0.4] }} transition={{ duration: 2, ease: "easeOut" }}
              style={{ position: 'absolute', width: '400px', height: '400px', background: 'radial-gradient(circle, var(--nova-core) 0%, transparent 70%)', mixBlendMode: 'screen', filter: 'blur(30px)' }}
            />
            {[1, 2, 3].map((ring) => (
              <motion.div key={`ring-${ring}`}
                initial={{ scale: 0, opacity: 1, borderWidth: '10px' }} animate={{ scale: ring * 4, opacity: 0, borderWidth: '1px' }} transition={{ duration: 2, delay: 0.5 + ring * 0.2, ease: "easeOut" }}
                style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', borderStyle: 'solid', borderColor: 'var(--nova-glow)', mixBlendMode: 'screen' }}
              />
            ))}
            <motion.svg initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} width="100%" height="100%" style={{ position: 'absolute' }}>
              {[ { x1: '20%', y1: '20%', x2: '50%', y2: '50%' }, { x1: '80%', y1: '30%', x2: '50%', y2: '50%' }, { x1: '30%', y1: '80%', x2: '50%', y2: '50%' }, { x1: '70%', y1: '70%', x2: '50%', y2: '50%' }
              ].map((line, i) => (
                <motion.line key={i} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="var(--nova-white)" strokeWidth="1" strokeDasharray="4,4"
                  initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.8 }} transition={{ duration: 1, delay: 1 + i * 0.1 }}
                />
              ))}
            </motion.svg>
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.5, 1], opacity: 1 }} transition={{ duration: 0.5, delay: 2, type: 'spring' }}
              style={{ position: 'absolute', width: '15px', height: '15px', background: '#fff', borderRadius: '50%', boxShadow: '0 0 50px 20px var(--nova-white), 0 0 100px 40px var(--nova-glow)', zIndex: 15 }}
            />
          </motion.div>
        )}

        {/* 2. STARWAY TRAVEL */}
        {powerActive && activePower?.id === 'travel' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none' }}
          >
            {/* Swirling Portal */}
            <motion.div 
              initial={{ scale: 0, rotate: 0, opacity: 0 }} 
              animate={{ scale: [0, 1.2, 1], rotate: 360, opacity: [0, 1, 0.8] }} 
              transition={{ duration: 4, ease: "easeOut" }}
              style={{ 
                position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', 
                width: '800px', height: '800px', borderRadius: '50%', 
                background: 'conic-gradient(from 0deg, transparent 0%, rgba(125, 226, 255, 0.2) 20%, rgba(170, 59, 255, 0.6) 50%, transparent 80%)',
                boxShadow: 'inset 0 0 150px rgba(170, 59, 255, 0.8), 0 0 100px rgba(125, 226, 255, 0.5)',
                mixBlendMode: 'screen',
                marginLeft: '-400px', marginTop: '-400px'
              }}
            />
            {/* Another world peek (Center of portal) */}
            <motion.div 
              initial={{ scale: 0, opacity: 0 }} 
              animate={{ scale: 1, opacity: 0.6 }} 
              transition={{ delay: 1, duration: 2 }}
              style={{ 
                position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', 
                width: '400px', height: '400px', borderRadius: '50%', 
                background: 'radial-gradient(circle, #fff 0%, rgba(125,226,255,0.8) 30%, transparent 70%)',
                mixBlendMode: 'overlay',
                marginLeft: '-200px', marginTop: '-200px'
              }}
            />
            {/* Stars pulled in */}
            {[...Array(10)].map((_, i) => (
              <motion.div key={i}
                initial={{ x: (Math.random() - 0.5) * 1000, y: (Math.random() - 0.5) * 1000, scale: 1, opacity: 0 }}
                animate={{ x: 0, y: 0, scale: 0, opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, delay: 0.5 + i * 0.2, ease: "easeIn" }}
                style={{ 
                  position: 'absolute', left: '50%', top: '50%', width: '4px', height: '4px', 
                  background: '#fff', borderRadius: '50%', boxShadow: '0 0 10px #fff' 
                }}
              />
            ))}
          </motion.div>
        )}

        {/* 3. SIGNAL DETECTION */}
        {powerActive && activePower?.id === 'signal' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none' }}
          >
            {/* Radar Waves from Nova (approx center-ish, top 45%) */}
            {[1, 2, 3].map(ring => (
              <motion.div key={ring}
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 10, opacity: 0 }}
                transition={{ duration: 3, delay: ring * 0.5, ease: "easeOut" }}
                style={{
                  position: 'absolute', left: '50%', top: '45%', width: '100px', height: '100px',
                  border: '2px solid rgba(125, 226, 255, 0.8)', borderRadius: '50%',
                  marginLeft: '-50px', marginTop: '-50px', mixBlendMode: 'screen'
                }}
              />
            ))}
            
            {/* Tiny stars appearing */}
            {[
              { top: '20%', left: '30%' }, { top: '70%', left: '20%' }, { top: '30%', left: '75%' }
            ].map((pos, i) => (
              <motion.div key={`s-${i}`}
                initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 0.5, scale: 1 }} transition={{ delay: 1 + i * 0.3 }}
                style={{ position: 'absolute', top: pos.top, left: pos.left, width: '6px', height: '6px', background: '#fff', borderRadius: '50%' }}
              />
            ))}

            {/* Bright target star (top right) */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 1], scale: [0, 2, 1.5], filter: ['blur(10px)', 'blur(2px)', 'blur(5px)'] }}
              transition={{ delay: 2, duration: 1 }}
              style={{ position: 'absolute', top: '25%', left: '80%', width: '12px', height: '12px', background: '#fff', borderRadius: '50%', boxShadow: '0 0 20px 5px var(--nova-glow)' }}
            />

            {/* Glowing connecting line */}
            <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
              <motion.line 
                x1="80%" y1="25%" x2="50%" y2="45%" 
                stroke="var(--nova-glow)" strokeWidth="3"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.8 }}
                transition={{ delay: 2.5, duration: 1, ease: "easeInOut" }}
              />
            </svg>

            {/* Nova's Core flashes */}
            <motion.div 
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: [0, 1, 0], scale: [1, 3, 1] }}
              transition={{ delay: 3.5, duration: 1 }}
              style={{ position: 'absolute', left: '50%', top: '45%', width: '20px', height: '20px', marginLeft: '-10px', marginTop: '-10px', background: '#fff', borderRadius: '50%', boxShadow: '0 0 50px 20px var(--nova-core)', mixBlendMode: 'screen' }}
            />
          </motion.div>
        )}

        {/* 4. BOUNDLESS EMPATHY */}
        {powerActive && activePower?.id === 'empathy' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none' }}
          >
            {/* Warm cosmic light around Nova */}
            <motion.div 
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: [1, 2], opacity: [0, 0.5, 0.2] }} transition={{ duration: 4, ease: "easeOut" }}
              style={{ position: 'absolute', left: '50%', top: '55%', width: '400px', height: '400px', marginLeft: '-200px', marginTop: '-200px', background: 'radial-gradient(circle, rgba(255, 105, 180, 0.6) 0%, transparent 70%)', borderRadius: '50%', mixBlendMode: 'screen' }}
            />
            
            {/* Glowing particles expanding */}
            {[...Array(15)].map((_, i) => {
              const angle = (i / 15) * Math.PI * 2;
              const dist = 300;
              return (
                <motion.div key={i}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, opacity: 0, scale: 0 }}
                  transition={{ duration: 2.5, delay: Math.random() * 0.5, ease: "easeOut" }}
                  style={{ position: 'absolute', left: '50%', top: '55%', width: '8px', height: '8px', background: '#FFB6C1', borderRadius: '50%', boxShadow: '0 0 10px #FF69B4' }}
                />
              )
            })}

            {/* Distant star pulsing (top left) */}
            <motion.div 
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0.8] }} transition={{ delay: 1.5, duration: 1 }}
              style={{ position: 'absolute', top: '30%', left: '25%', width: '15px', height: '15px', background: '#fff', borderRadius: '50%', boxShadow: '0 0 30px 10px rgba(255, 105, 180, 0.8)' }}
            />

            {/* Curved Luminous Connection */}
            <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
              <motion.path 
                d="M 25vw 30vh Q 40vw 10vh 50vw 45vh" 
                fill="transparent" stroke="rgba(255, 105, 180, 0.8)" strokeWidth="4" strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: 2, duration: 1.5, ease: "easeInOut" }}
                style={{ filter: 'drop-shadow(0 0 10px #FF69B4)' }}
              />
            </svg>
          </motion.div>
        )}

        {/* 5. GUARDIAN'S RESOLVE */}
        {powerActive && activePower?.id === 'resolve' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none' }}
          >
            {/* Forehead core flashes */}
            <motion.div 
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 4, 0], opacity: [0, 1, 0] }} transition={{ duration: 1 }}
              style={{ position: 'absolute', left: '50%', top: '45%', width: '20px', height: '20px', marginLeft: '-10px', marginTop: '-10px', background: '#fff', borderRadius: '50%', boxShadow: '0 0 50px 20px var(--nova-core)', mixBlendMode: 'screen' }}
            />
            
            {/* Energy gathers (particles pulling in) */}
            {[...Array(12)].map((_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              const dist = 200;
              return (
                <motion.div key={i}
                  initial={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, opacity: 0, scale: 0 }}
                  animate={{ x: 0, y: 0, opacity: [0, 1, 0], scale: 1 }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeIn" }}
                  style={{ position: 'absolute', left: '50%', top: '55%', width: '10px', height: '10px', background: 'var(--nova-glow)', borderRadius: '50%', boxShadow: '0 0 15px var(--nova-core)' }}
                />
              )
            })}

            {/* Transparent glowing cosmic shield forms and expands/pulses */}
            <motion.div 
              initial={{ scale: 0, opacity: 0, borderWidth: '0px' }}
              animate={{ scale: [0, 1.2, 1, 1.05], opacity: [0, 0.8, 0.5, 0.7], borderWidth: ['0px', '20px', '5px', '8px'] }}
              transition={{ delay: 1.5, duration: 2.5, times: [0, 0.4, 0.7, 1] }}
              style={{ position: 'absolute', left: '50%', top: '55%', width: '500px', height: '500px', marginLeft: '-250px', marginTop: '-250px', borderRadius: '50%', borderStyle: 'solid', borderColor: 'var(--nova-core)', background: 'radial-gradient(circle, rgba(125,226,255,0.1) 0%, transparent 80%)', boxShadow: '0 0 100px rgba(125,226,255,0.4), inset 0 0 50px rgba(125,226,255,0.3)', mixBlendMode: 'screen' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
