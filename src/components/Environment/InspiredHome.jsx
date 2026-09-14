import React from 'react';
import { useNova, AppModes, NovaStates } from '../../context/NovaContext';
import '../../styles/inspired.css';

export default function InspiredHome() {
  const { appMode, novaState } = useNova();
  
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

  return (
    <div className="inspired-home-container">
      
      {/* Atmosphere Background */}
      <div className="inspired-atmosphere" />
      
      {/* Classy Cosmic Elements */}
      <div className="classy-cosmic-bg">
        <div className="hero-beam" />
        <div className="starfield-overlay" />
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
