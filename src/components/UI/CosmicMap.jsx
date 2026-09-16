import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNova } from '../../context/NovaContext';
import { ShieldCheck, AlertCircle, EyeOff, Sparkles } from 'lucide-react';

export default function CosmicMap() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const { visitorData } = useNova();

  // Read outcome from localStorage
  const [outcome] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('meteorMissionOutcome') || null;
    }
    return null;
  });

  // Cinematic Transition Phases (Requirement 10):
  // 0: Initial render (normal constellation)
  // 1: Traveler's Star becomes visible (~0.5s)
  // 2: Light ray travels from Traveler's Star toward constellation (~1.1s)
  // 3: Constellation reveals outcome state (~1.8s)
  // 4: Earth node reveals status, text & Nova message fade in (~2.4s)
  const [revealPhase, setRevealPhase] = useState(() => (outcome ? 0 : 4));

  useEffect(() => {
    if (!outcome) return;
    const t1 = setTimeout(() => setRevealPhase(1), 500);
    const t2 = setTimeout(() => setRevealPhase(2), 1100);
    const t3 = setTimeout(() => setRevealPhase(3), 1800);
    const t4 = setTimeout(() => setRevealPhase(4), 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [outcome]);

  // Procedurally generate constellation data once on mount
  const { stars, connections, anchorNodes } = useMemo(() => {
    // Nova's World Anchor Nodes
    const earthStatus = outcome && revealPhase >= 3 ? (
      outcome === 'protected' ? 'EARTH PROTECTED' :
      outcome === 'timeout' ? 'EARTH NOT PROTECTED' :
      'EARTH LEFT UNPROTECTED'
    ) : null;

    const earthDesc = outcome && revealPhase >= 3 ? (
      outcome === 'protected' ? 'A signal that answered when Earth needed it. Safe and protected.' :
      outcome === 'timeout' ? 'The signal arrived too late. The stars remember your effort.' :
      'The signal was observed from afar, waiting for another dawn.'
    ) : 'A bright new connection.';

    const earthColor = outcome && revealPhase >= 3 ? (
      outcome === 'protected' ? '#7DE2FF' :
      outcome === 'timeout' ? '#FFB74D' :
      '#90A4AE'
    ) : '#7DE2FF';

    const anchors = [
      { id: 'sanctuary', label: "NOVA'S SANCTUARY", x: 50, y: 50, size: 8, color: '#B388FF', desc: "The heart of the Starways." },
      { id: 'veyra', label: "VEYRA", x: 20, y: 30, size: 5, color: '#FF5252', desc: "Nova's fallen home world." },
      { id: 'earth', label: "EARTH", x: 75, y: 65, size: 6, color: earthColor, statusTag: earthStatus, desc: earthDesc },
      { id: 'deep_space', label: "THE OUTER REACHES", x: 80, y: 20, size: 4, color: '#FFF59D', desc: "Unknown distant signals." },
    ];

    if (visitorData?.location) {
      anchors.push({ id: 'visitor', label: `${visitorData.name.toUpperCase()}'S SIGNAL`, x: 30, y: 75, size: 5, color: '#fff', desc: `Transmitting from ${visitorData.location}.` });
    }

    // Traveler's Star is persistent when outcome exists or mission was completed
    if (outcome || (typeof window !== 'undefined' && sessionStorage.getItem('meteorMissionCompleted'))) {
      const travelerDesc = outcome === 'protected'
        ? 'Awakened when you protected Earth together with Nova.'
        : outcome === 'timeout'
        ? 'Carries the quiet light of your attempt to answer the signal.'
        : outcome === 'watched'
        ? 'A distant observer in the Starways.'
        : 'Awakened when you visited the Starways.';

      const travelerColor = outcome === 'protected'
        ? '#7DE2FF'
        : outcome === 'timeout'
        ? '#B0BEC5'
        : outcome === 'watched'
        ? '#78909C'
        : '#7DE2FF';

      const travelerSize = outcome === 'protected' ? 7 : outcome === 'timeout' ? 5.5 : 4.5;

      anchors.push({
        id: 'traveler_star',
        label: "THE TRAVELER'S STAR",
        x: 62,
        y: 42,
        size: travelerSize,
        color: travelerColor,
        desc: travelerDesc,
        isTravelerStar: true
      });
    }

    const numStars = 60;
    const generatedStars = [];

    // 1. Generate random background stars
    for (let i = 0; i < numStars; i++) {
      const baseBrightness = outcome === 'watched' && revealPhase >= 3 ? 0.15 : 0.2;
      generatedStars.push({
        id: `star-${i}`,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 4,
        duration: 3 + Math.random() * 5,
        brightness: baseBrightness + Math.random() * (outcome === 'watched' && revealPhase >= 3 ? 0.35 : 0.6),
        isAnchor: false
      });
    }

    // Combine anchors and random stars for connection logic
    const allNodes = [...anchors.map(a => ({ ...a, isAnchor: true })), ...generatedStars];
    const generatedConnections = [];
    const maxDistance = 25; 

    // 2. Connect nodes
    for (let i = 0; i < allNodes.length; i++) {
      const nodeA = allNodes[i];
      let connectionsMade = 0;
      const maxConns = nodeA.isAnchor ? 6 : 3; 

      const distances = allNodes
        .map((nodeB, index) => {
          if (i === index) return null;
          const dx = nodeA.x - nodeB.x;
          const dy = nodeA.y - nodeB.y;
          return { index, distance: Math.sqrt(dx * dx + dy * dy) };
        })
        .filter(Boolean)
        .sort((a, b) => a.distance - b.distance);

      for (const target of distances) {
        if (target.distance < maxDistance && connectionsMade < maxConns) {
          const exists = generatedConnections.some(
            c => (c.a === i && c.b === target.index) || (c.a === target.index && c.b === i)
          );

          if (!exists) {
            generatedConnections.push({
              id: `${i}-${target.index}`,
              a: i,
              b: target.index,
              x1: nodeA.x,
              y1: nodeA.y,
              x2: allNodes[target.index].x,
              y2: allNodes[target.index].y,
              isAnchorConn: nodeA.isAnchor || allNodes[target.index].isAnchor,
              seed: (i * 17 + target.index * 31) % 100
            });
            connectionsMade++;
          }
        }
      }
    }

    return { stars: generatedStars, connections: generatedConnections, anchorNodes: anchors };
  }, [visitorData, outcome, revealPhase]);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 40; 
    const y = (clientY / innerHeight - 0.5) * 40;
    setMousePosition({ x, y });
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 60, background: '#02010a', overflow: 'hidden' }}
    >
      
      {/* Deep Galactic Nebula Background */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50%', height: '50%', background: outcome === 'timeout' ? '#FF9800' : '#7DE2FF', filter: 'blur(120px)', borderRadius: '50%', mixBlendMode: 'screen' }} 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.2, 0.15] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60%', height: '60%', background: outcome === 'watched' ? '#455A64' : '#AA3BFF', filter: 'blur(150px)', borderRadius: '50%', mixBlendMode: 'screen' }} 
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }} 
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          style={{ position: 'absolute', top: '30%', left: '40%', width: '40%', height: '40%', background: '#FF69B4', filter: 'blur(100px)', borderRadius: '50%', mixBlendMode: 'screen' }} 
        />
      </div>

      {/* Distant Background Stars (Cosmic Dust) */}
      <div style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 1, opacity: 0.6, pointerEvents: 'none' }}>
        {useMemo(() => Array.from({length: 150}).map((_, i) => (
          <div key={`bg-star-${i}`} style={{
            position: 'absolute',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 2}px`,
            height: `${Math.random() * 2}px`,
            background: '#fff',
            opacity: Math.random() * 0.7 + 0.1,
            borderRadius: '50%',
            boxShadow: Math.random() > 0.8 ? '0 0 4px #fff' : 'none'
          }}/>
        )), [])}
      </div>

      {/* Dynamic Constellation Layer */}
      <motion.div
        animate={{ x: mousePosition.x, y: mousePosition.y }}
        transition={{ type: 'spring', stiffness: 30, damping: 25 }}
        style={{ position: 'absolute', width: '110%', height: '110%', top: '-5%', left: '-5%', zIndex: 5 }}
      >
        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, filter: outcome === 'protected' ? 'drop-shadow(0 0 12px rgba(125,226,255,0.6))' : 'drop-shadow(0 0 8px rgba(125,226,255,0.3))' }}>
          <defs>
            {/* Gentle travelling light gradient for protected state */}
            <linearGradient id="travelLightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7DE2FF" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="100%" stopColor="#AA3BFF" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Render Connections */}
          {connections.map((conn) => {
            // Outcome filtering and styling
            let strokeColor = conn.isAnchorConn ? "rgba(170, 59, 255, 0.4)" : "rgba(125, 226, 255, 0.15)";
            let strokeWidth = conn.isAnchorConn ? 1.5 : 0.5;
            let strokeDash = undefined;
            let lineOpacity = 1;

            if (outcome && revealPhase >= 3) {
              if (outcome === 'protected') {
                strokeColor = conn.isAnchorConn ? "rgba(125, 226, 255, 0.65)" : "rgba(125, 226, 255, 0.28)";
                strokeWidth = conn.isAnchorConn ? 1.8 : 0.8;
              } else if (outcome === 'timeout') {
                // Incomplete constellation: some connections broken / dashed / missing
                if (conn.seed > 65) {
                  strokeDash = "3 8";
                  strokeColor = "rgba(255, 183, 77, 0.22)";
                  lineOpacity = 0.35;
                } else {
                  strokeColor = conn.isAnchorConn ? "rgba(170, 130, 220, 0.35)" : "rgba(125, 226, 255, 0.12)";
                }
              } else if (outcome === 'watched') {
                // Mostly disconnected constellation
                if (conn.seed > 25) {
                  return null; // Separated stars
                }
                strokeDash = "2 12";
                strokeColor = "rgba(144, 164, 174, 0.12)";
                strokeWidth = 0.5;
                lineOpacity = 0.25;
              }
            }

            return (
              <React.Fragment key={conn.id}>
                <motion.line
                  x1={`${conn.x1}%`} y1={`${conn.y1}%`}
                  x2={`${conn.x2}%`} y2={`${conn.y2}%`}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDash}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: lineOpacity }}
                  transition={{ duration: 2.5, delay: 0.2 + (conn.seed / 100) * 1.5, ease: "easeOut" }}
                />

                {/* Subtle travelling pulse light for protected outcome */}
                {outcome === 'protected' && revealPhase >= 3 && conn.isAnchorConn && conn.seed % 3 === 0 && (
                  <motion.line
                    x1={`${conn.x1}%`} y1={`${conn.y1}%`}
                    x2={`${conn.x2}%`} y2={`${conn.y2}%`}
                    stroke="url(#travelLightGrad)"
                    strokeWidth="2"
                    strokeDasharray="15 85"
                    animate={{ strokeDashoffset: [100, 0] }}
                    transition={{ duration: 4 + (conn.seed % 4), repeat: Infinity, ease: "linear" }}
                    style={{ filter: 'drop-shadow(0 0 4px #7DE2FF)' }}
                  />
                )}
              </React.Fragment>
            );
          })}

          {/* Cinematic Ethereal Ray travelling from Traveler's Star toward Earth (Transition Phase 2) */}
          {outcome && revealPhase >= 2 && (
            <motion.line
              x1="62%" y1="42%"
              x2="75%" y2="65%"
              stroke={outcome === 'protected' ? '#7DE2FF' : outcome === 'timeout' ? '#FFB74D' : '#90A4AE'}
              strokeWidth="2"
              strokeDasharray={outcome === 'watched' ? "3 10" : "8 8"}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: [0, 1, 1],
                opacity: revealPhase >= 3 ? (outcome === 'protected' ? 0.6 : 0.25) : [0, 0.9, 0.7]
              }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
              style={{ filter: outcome === 'protected' ? 'drop-shadow(0 0 8px #7DE2FF)' : 'drop-shadow(0 0 4px #FFA726)' }}
            />
          )}

          {/* Render Random Stars */}
          {stars.map((star) => (
            <motion.circle
              key={star.id}
              cx={`${star.x}%`} cy={`${star.y}%`}
              r={star.size}
              fill="#fff"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0.1, star.brightness, 0.1], scale: 1 }}
              transition={{ 
                opacity: { duration: star.duration, delay: star.delay, repeat: Infinity, ease: "easeInOut" },
                scale: { duration: 1, delay: star.delay * 0.5 }
              }}
              style={{ filter: `drop-shadow(0 0 ${star.size * 2}px rgba(125, 226, 255, 0.6))` }}
            />
          ))}
        </svg>

        {/* Render Anchor Nodes (Nova Lore & Dynamic Outcomes) */}
        {anchorNodes.map((anchor) => {
          // If it's the Traveler's Star and revealPhase < 1, hold entrance
          if (anchor.isTravelerStar && outcome && revealPhase < 1) {
            return null;
          }

          // Dynamic glow styling depending on outcome and node type
          let glowBoxShadow = [`0 0 20px 5px ${anchor.color}`, `0 0 40px 15px ${anchor.color}`, `0 0 20px 5px ${anchor.color}`];
          let pulseDuration = 3;

          if (anchor.id === 'earth' && outcome && revealPhase >= 3) {
            if (outcome === 'protected') {
              // Calm, protective stable glow
              glowBoxShadow = [`0 0 25px 8px #7DE2FF`, `0 0 45px 15px rgba(125, 226, 255, 0.75)`, `0 0 25px 8px #7DE2FF`];
              pulseDuration = 3.5;
            } else if (outcome === 'timeout') {
              // Subtle warm warning pulse (not aggressive red)
              glowBoxShadow = [`0 0 16px 4px #FFB74D`, `0 0 30px 8px rgba(255, 183, 77, 0.5)`, `0 0 16px 4px #FFB74D`];
              pulseDuration = 2.4;
            } else if (outcome === 'watched') {
              // Quiet dim state
              glowBoxShadow = [`0 0 10px 2px rgba(144, 164, 174, 0.3)`, `0 0 16px 3px rgba(144, 164, 174, 0.4)`, `0 0 10px 2px rgba(144, 164, 174, 0.3)`];
              pulseDuration = 4;
            }
          }

          if (anchor.isTravelerStar) {
            if (outcome === 'protected') {
              // Brightest state, subtle blue/cosmic glow
              glowBoxShadow = [`0 0 24px 8px #7DE2FF`, `0 0 48px 18px rgba(125, 226, 255, 0.85)`, `0 0 24px 8px #7DE2FF`];
            } else if (outcome === 'timeout') {
              // Dimmer glow with subtle intermittent pulse
              glowBoxShadow = [`0 0 10px 2px rgba(176, 190, 197, 0.35)`, `0 0 22px 6px rgba(176, 190, 197, 0.65)`, `0 0 10px 2px rgba(176, 190, 197, 0.35)`];
              pulseDuration = 4.5;
            } else if (outcome === 'watched') {
              // Very faint quiet glow
              glowBoxShadow = [`0 0 6px 1px rgba(120, 144, 156, 0.25)`, `0 0 12px 2px rgba(120, 144, 156, 0.35)`, `0 0 6px 1px rgba(120, 144, 156, 0.25)`];
              pulseDuration = 5;
            }
          }

          return (
            <motion.div
              key={anchor.id}
              onMouseEnter={() => setHoveredNode(anchor)}
              onMouseLeave={() => setHoveredNode(null)}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', delay: anchor.isTravelerStar ? 0.2 : 0.8 }}
              style={{
                position: 'absolute', left: `${anchor.x}%`, top: `${anchor.y}%`,
                transform: 'translate(-50%, -50%)', zIndex: 10, cursor: 'pointer'
              }}
            >
              {/* Core Glow */}
              <motion.div
                animate={{ 
                  boxShadow: glowBoxShadow
                }}
                transition={{ duration: pulseDuration, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  width: anchor.size * 3, height: anchor.size * 3,
                  background: '#fff', borderRadius: '50%',
                  display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}
              >
                {/* Inner Core */}
                <div style={{ width: '50%', height: '50%', background: anchor.color, borderRadius: '50%' }} />
              </motion.div>

              {/* Status Badge Pin for Earth when outcome is revealed */}
              {anchor.id === 'earth' && anchor.statusTag && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  style={{
                    position: 'absolute',
                    top: '120%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    whiteSpace: 'nowrap',
                    fontSize: '9px',
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '1.5px',
                    padding: '3px 8px',
                    borderRadius: '10px',
                    background: outcome === 'protected' ? 'rgba(125, 226, 255, 0.15)' : outcome === 'timeout' ? 'rgba(255, 183, 77, 0.15)' : 'rgba(144, 164, 174, 0.12)',
                    border: `1px solid ${anchor.color}50`,
                    color: anchor.color,
                    boxShadow: `0 0 10px ${anchor.color}30`,
                    pointerEvents: 'none'
                  }}
                >
                  {anchor.statusTag}
                </motion.div>
              )}

              {/* Traveler Star Label Indicator */}
              {anchor.isTravelerStar && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  transition={{ delay: 0.5 }}
                  style={{
                    position: 'absolute',
                    bottom: '120%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    whiteSpace: 'nowrap',
                    fontSize: '9px',
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '1.5px',
                    color: anchor.color,
                    pointerEvents: 'none'
                  }}
                >
                  ✦ TRAVELER'S STAR
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Floating Info Tooltip Anchored directly above Hovered Node (never overlaps bottom HUD) */}
      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              left: `${Math.min(82, Math.max(18, hoveredNode.x))}%`,
              top: `${hoveredNode.y > 60 ? hoveredNode.y - 12 : hoveredNode.y + 10}%`,
              transform: 'translate(-50%, -50%)',
              background: 'rgba(10, 5, 25, 0.92)',
              border: `1px solid ${hoveredNode.color}`,
              padding: '12px 22px',
              borderRadius: '16px',
              backdropFilter: 'blur(16px)',
              textAlign: 'center',
              zIndex: 50,
              boxShadow: `0 8px 32px ${hoveredNode.color}40`,
              maxWidth: '300px',
              pointerEvents: 'none'
            }}
          >
            <h3 style={{ color: '#fff', margin: '0 0 4px 0', fontSize: '0.95rem', fontFamily: 'var(--font-display)', letterSpacing: '2px' }}>
              {hoveredNode.label}
            </h3>
            {hoveredNode.statusTag && (
              <div style={{ color: hoveredNode.color, fontSize: '0.72rem', letterSpacing: '1.5px', fontWeight: 'bold', marginBottom: '4px' }}>
                [ {hoveredNode.statusTag} ]
              </div>
            )}
            <p style={{ color: 'rgba(255,255,255,0.75)', margin: 0, fontSize: '0.82rem', lineHeight: '1.35' }}>
              {hoveredNode.desc}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Outcome Cinematic Title & Status (Requirement 1, 2, 3, 8) */}
      {outcome && revealPhase >= 4 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          style={{
            position: 'absolute',
            bottom: '22px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            zIndex: 25,
            pointerEvents: 'none'
          }}
        >
          {/* Main Outcome Constellation Title */}
          <div style={{
            color: '#fff',
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',
            letterSpacing: '8px',
            fontWeight: 'bold',
            textShadow: outcome === 'protected' ? '0 0 20px rgba(125,226,255,0.7)' : outcome === 'timeout' ? '0 0 20px rgba(255,183,77,0.6)' : '0 0 15px rgba(144,164,174,0.4)',
            textTransform: 'uppercase'
          }}>
            {outcome === 'protected' && "THE GUARDIAN CONSTELLATION"}
            {outcome === 'timeout' && "THE UNFINISHED CONSTELLATION"}
            {outcome === 'watched' && "THE SILENT CONSTELLATION"}
          </div>

          {/* Subtitle Lore */}
          <div style={{
            color: 'rgba(255,255,255,0.65)',
            fontFamily: 'var(--font-primary)',
            fontSize: '0.82rem',
            letterSpacing: '1.8px',
            textAlign: 'center',
            maxWidth: '520px'
          }}>
            {outcome === 'protected' && "A signal that answered when Earth needed it."}
            {outcome === 'timeout' && "The signal was sent... but the stars were not aligned in time."}
            {outcome === 'watched' && "The signal was seen, but never answered."}
          </div>

          {/* Status Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 14px',
            borderRadius: '20px',
            background: outcome === 'protected' ? 'rgba(125, 226, 255, 0.12)' : outcome === 'timeout' ? 'rgba(255, 183, 77, 0.12)' : 'rgba(144, 164, 174, 0.1)',
            border: `1px solid ${outcome === 'protected' ? 'rgba(125,226,255,0.4)' : outcome === 'timeout' ? 'rgba(255,183,77,0.4)' : 'rgba(144,164,174,0.3)'}`,
            boxShadow: outcome === 'protected' ? '0 0 15px rgba(125,226,255,0.2)' : outcome === 'timeout' ? '0 0 15px rgba(255,183,77,0.2)' : 'none'
          }}>
            {outcome === 'protected' && <ShieldCheck size={13} color="#7DE2FF" />}
            {outcome === 'timeout' && <AlertCircle size={13} color="#FFB74D" />}
            {outcome === 'watched' && <EyeOff size={13} color="#90A4AE" />}
            
            <span style={{
              fontSize: '10.5px',
              fontFamily: 'var(--font-primary)',
              letterSpacing: '2px',
              fontWeight: 600,
              color: outcome === 'protected' ? '#7DE2FF' : outcome === 'timeout' ? '#FFB74D' : '#B0BEC5'
            }}>
              STATUS: {outcome === 'protected' ? 'EARTH PROTECTED' : outcome === 'timeout' ? 'EARTH NOT PROTECTED' : 'EARTH LEFT UNPROTECTED'}
            </span>
          </div>

          {/* Nova Voice Dialogue Box (Requirement 11) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            style={{
              marginTop: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(15, 12, 32, 0.85)',
              border: '1px solid rgba(179, 136, 255, 0.3)',
              borderRadius: '24px',
              padding: '6px 18px',
              backdropFilter: 'blur(12px)',
              pointerEvents: 'auto',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }}
          >
            <Sparkles size={13} color="#B388FF" />
            <div style={{
              color: 'rgba(255,255,255,0.9)',
              fontFamily: 'var(--font-primary)',
              fontStyle: 'italic',
              fontSize: '0.82rem',
              letterSpacing: '0.6px'
            }}>
              {outcome === 'protected' && "“Your constellation still carries the light of what you did.”"}
              {outcome === 'timeout' && "“Some signals arrive too late. The stars remember your attempt.”"}
              {outcome === 'watched' && "“You saw the signal, but chose not to answer. The constellation remembers that too.”"}
            </div>
          </motion.div>
        </motion.div>
      ) : (
        /* Original Decorative Title for First-Time Visitor */
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 1 }}
          style={{ position: 'absolute', bottom: '30px', width: '100%', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-primary)', letterSpacing: '10px', zIndex: 2, pointerEvents: 'none' }}
        >
          NOVA'S STARWAYS
        </motion.div>
      )}

    </div>
  );
}


