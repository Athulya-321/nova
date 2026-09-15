import React from 'react';
import { useNova, AppModes, NovaStates } from '../../context/NovaContext';
import '../../styles/inspired.css';

export default function InspiredHome() {
  const { appMode, novaState, visitorMood } = useNova();
  
  if (appMode !== AppModes.HOME) return null;
  
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

  // Atmosphere dynamic tinting based on mood
  const getAtmosphereGradient = () => {
    if (visitorMood === 'sad') {
      // Subdued, cool, melancholic deep indigo/gray
      return 'radial-gradient(circle at 30% 50%, rgba(18, 20, 35, 0.6) 0%, rgba(5, 6, 12, 0.95) 70%), linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(5,5,10,0.95) 100%)';
    }
    if (visitorMood === 'happy') {
      // Bright, vibrant, cosmic violet/cyan & gold glow
      return 'radial-gradient(circle at 30% 50%, rgba(70, 50, 130, 0.5) 0%, rgba(10, 8, 30, 0.7) 60%), radial-gradient(circle at 70% 30%, rgba(125, 226, 255, 0.2) 0%, transparent 60%)';
    }
    // Neutral default
    return 'radial-gradient(circle at 30% 50%, rgba(32, 45, 80, 0.4) 0%, transparent 60%), linear-gradient(135deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)';
  };

  const isDull = visitorMood === 'sad';
  const isHappy = visitorMood === 'happy';

  return (
    <div 
      className="inspired-home-container"
      style={{
        transition: 'all 1.5s ease',
        filter: isDull ? 'saturate(0.65) brightness(0.85)' : isHappy ? 'saturate(1.25) brightness(1.05)' : 'none'
      }}
    >
      
      {/* High Quality Cosmic Starways Background */}
      <div 
        className="inspired-bg-image"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url(/home_earth_bg_uhd.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          filter: isDull ? 'brightness(0.7) contrast(1.1) saturate(0.8)' : isHappy ? 'brightness(1.1) contrast(1.1) saturate(1.2)' : 'none',
          transition: 'filter 1.5s ease',
          zIndex: 1
        }}
      />
      
      {/* Atmosphere Background overlay for depth & mood */}
      <div 
        className="inspired-atmosphere" 
        style={{
          background: getAtmosphereGradient(),
          transition: 'background 2s ease',
          zIndex: 2,
          mixBlendMode: 'soft-light'
        }}
      />
      
      {/* Classy Cosmic Elements */}
      <div className="classy-cosmic-bg" style={{ zIndex: 3 }}>
        <div 
          className="hero-beam" 
          style={{
            opacity: isDull ? 0.01 : isHappy ? 0.06 : 0.02,
            transition: 'opacity 1.5s ease'
          }}
        />
        <div 
          className="starfield-overlay" 
          style={{
            opacity: isDull ? 0.1 : isHappy ? 0.35 : 0.2,
            transition: 'opacity 1.5s ease'
          }}
        />
      </div>

      {/* Left Content Area: Nova Cutout & Writing */}
      <div className="inspired-left-content">
        
        {/* Canonical Nova Image */}
        <div className="nova-cutout-wrapper">
          <img src="/crop.jpeg" alt="Nova Cosmic Guardian" className="nova-cutout-img" />
        </div>

        {/* Home Page Writing */}
        <div className="inspired-writing">
          <h1 className="inspired-title">NOVA</h1>
          <p className="inspired-subtitle">
            A Guardian without a home, wandering the cosmic network. 
            Once belonging to Veyra, Nova now watches over the Starways, 
            listening for signals from worlds like ours.
          </p>
          <div className="inspired-quote">
            "Different worlds. Same dreams. One Starway."
          </div>
        </div>

      </div>
    </div>
  );
}
