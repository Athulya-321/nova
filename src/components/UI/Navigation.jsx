import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Zap, Map, Radio, BookOpen, Compass, Menu, X, Sparkles } from 'lucide-react';
import { useNova, AppModes, NovaStates } from '../../context/NovaContext';

export default function Navigation() {
  const { setAppMode, appMode, novaState } = useNova();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isOpening = [
    NovaStates.OPENING_BLACK,
    NovaStates.SIGNAL_DETECTED,
    NovaStates.STARS_AWAKEN,
    NovaStates.NOVA_FAR,
    NovaStates.NOVA_NOTICES,
    NovaStates.NOVA_APPROACHING,
    NovaStates.PORTAL_ENTRY,
    NovaStates.NOVA_LANDS
  ].includes(novaState);

  if (isOpening) return null;

  const navItems = [
    { mode: AppModes.HOME, icon: Home, label: 'Home' },
    { mode: AppModes.POWERS, icon: Sparkles, label: 'Powers' },
    { mode: AppModes.STARWAYS, icon: Compass, label: 'Starways' },
    { mode: AppModes.MAP, icon: Map, label: 'Cosmic Map' },
    { mode: AppModes.HELP_SIGNALS, icon: Radio, label: 'Help Signals' },
    { mode: AppModes.MEET_NOVA, icon: BookOpen, label: 'Meet Nova' }
  ];

  const isMobile = windowWidth <= 900;

  const NavContent = () => (
    <>
      {navItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = appMode === item.mode;
        return (
          <button
            key={index}
            onClick={() => {
              setAppMode(item.mode);
              if (isMobile) setIsMobileMenuOpen(false);
            }}
            title={item.label}
            className="nav-button"
            style={{
              background: 'transparent',
              border: 'none',
              color: isActive ? '#fff' : 'var(--text-dim)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s',
              padding: isMobile ? '15px' : '0',
              width: isMobile ? '100%' : 'auto',
              position: 'relative'
            }}
          >
            <div style={{
              position: 'relative',
              width: '45px', height: '45px',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              borderRadius: '50%',
              border: isActive ? '1px solid rgba(125, 226, 255, 0.4)' : '1px solid transparent',
              background: isActive ? 'radial-gradient(circle, rgba(125, 226, 255, 0.2) 0%, transparent 80%)' : 'transparent',
              boxShadow: isActive ? '0 0 15px rgba(125, 226, 255, 0.3)' : 'none'
            }}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} color={isActive ? '#fff' : 'var(--text-dim)'} />
            </div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-primary)', letterSpacing: '0.5px' }}>
              {item.label}
            </span>
          </button>
        )
      })}
    </>
  );

  return (
    <>
      {isMobile ? (
        <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 110 }}>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)',
              color: 'var(--nova-core)', padding: '10px', borderRadius: '50%',
              backdropFilter: 'blur(10px)', cursor: 'pointer'
            }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                style={{
                  position: 'absolute', top: '50px', right: '0',
                  background: 'rgba(11, 10, 26, 0.9)',
                  border: '1px solid rgba(125, 226, 255, 0.2)',
                  borderRadius: '20px', padding: '10px',
                  display: 'flex', flexDirection: 'column',
                  backdropFilter: 'blur(15px)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  minWidth: '200px'
                }}
              >
                <NavContent />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          style={{
            position: 'absolute',
            top: '0', left: '0', width: '100%',
            zIndex: 100,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '30px 50px',
            pointerEvents: 'none'
          }}
        >
          {/* Logo Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', pointerEvents: 'auto' }}>
            {/* 4-point star SVG */}
            <svg width="40" height="40" viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 0 10px var(--nova-glow))' }}>
              <path d="M50 0 L55 45 L100 50 L55 55 L50 100 L45 55 L0 50 L45 45 Z" fill="transparent" stroke="var(--nova-core)" strokeWidth="4" />
              <path d="M50 15 L52 48 L85 50 L52 52 L50 85 L48 52 L15 50 L48 48 Z" fill="var(--nova-core)" />
            </svg>
            <div>
              <div style={{ color: '#fff', fontSize: '28px', fontFamily: 'var(--font-display)', letterSpacing: '6px', fontWeight: 'bold' }}>NOVA</div>
              <div style={{ color: 'var(--text-dim)', fontSize: '10px', fontFamily: 'var(--font-primary)', letterSpacing: '3px', textTransform: 'uppercase' }}>GUARDIAN OF THE STARWAYS</div>
            </div>
          </div>

          {/* Navigation Links */}
          <div style={{ display: 'flex', gap: '40px', pointerEvents: 'auto' }}>
            <NavContent />
          </div>

          {/* Right Pill Button */}
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '15px', 
            background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(125, 226, 255, 0.3)',
            borderRadius: '30px', padding: '10px 20px',
            pointerEvents: 'auto', backdropFilter: 'blur(10px)',
            boxShadow: '0 0 20px rgba(125,226,255,0.1)'
          }}>
            <Sparkles size={18} color="var(--nova-white)" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>You're not alone</span>
              <span style={{ color: 'var(--text-dim)', fontSize: '10px' }}>Every star has a story</span>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
