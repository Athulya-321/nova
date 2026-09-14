import React from 'react';
import { Sparkles } from 'lucide-react';
import { useNova, AppModes, NovaStates } from '../../context/NovaContext';

export default function HomeOverlay() {
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
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 15 }}>
      
      {/* Top Left Text */}
      <div style={{ position: 'absolute', top: '150px', left: '50px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <span style={{ color: 'var(--text-dim)', fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase' }}>DIFFERENT WORLDS</span>
        <span style={{ color: 'var(--text-dim)', fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase' }}>SAME DREAMS</span>
        <span style={{ color: 'var(--text-dim)', fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase' }}>ONE STARWAY</span>
      </div>

      {/* Mid Right Text */}
      <div style={{ position: 'absolute', top: '30%', right: '50px', display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-start' }}>
        <span style={{ color: '#fff', fontSize: '14px', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>THE STARWAYS</span>
        <span style={{ color: 'var(--text-dim)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>A BRIGHTER TOMORROW<br/>FOR EVERY SIGNAL</span>
      </div>

      {/* Bottom Left Text */}
      <div style={{ position: 'absolute', bottom: '40px', left: '50px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#fff', fontSize: '24px', fontFamily: '"Playfair Display", serif', fontStyle: 'italic', letterSpacing: '1px' }}>Every signal matters</span>
          <Sparkles size={20} color="var(--nova-glow)" />
        </div>
        <span style={{ color: '#fff', fontSize: '18px', fontFamily: '"Playfair Display", serif', fontStyle: 'italic', paddingRight: '30px' }}>— Nova</span>
      </div>

      {/* Bottom Right Text */}
      <div style={{ position: 'absolute', bottom: '40px', right: '50px' }}>
        <span style={{ color: 'var(--text-dim)', fontSize: '11px', letterSpacing: '5px', textTransform: 'uppercase' }}>
          EXPLORE ✦ SHARE ✦ BELONG
        </span>
      </div>

    </div>
  );
}
