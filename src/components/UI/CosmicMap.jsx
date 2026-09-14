import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNova } from '../../context/NovaContext';

export default function CosmicMap() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const { visitorData } = useNova();

  // Procedurally generate constellation data once on mount
  const { stars, connections, anchorNodes } = useMemo(() => {
    
    // Nova's World Anchor Nodes
    const anchors = [
      { id: 'sanctuary', label: "NOVA'S SANCTUARY", x: 50, y: 50, size: 8, color: '#B388FF', desc: "The heart of the Starways." },
      { id: 'veyra', label: "VEYRA", x: 20, y: 30, size: 5, color: '#FF5252', desc: "Nova's fallen home world." },
      { id: 'earth', label: "EARTH", x: 75, y: 65, size: 6, color: '#7DE2FF', desc: "A bright new connection." },
      { id: 'deep_space', label: "THE OUTER REACHES", x: 80, y: 20, size: 4, color: '#FFF59D', desc: "Unknown distant signals." },
    ];

    if (visitorData?.location) {
      anchors.push({ id: 'visitor', label: `${visitorData.name.toUpperCase()}'S SIGNAL`, x: 30, y: 75, size: 5, color: '#fff', desc: `Transmitting from ${visitorData.location}.` });
    }

    const numStars = 60;
    const generatedStars = [];

    // 1. Generate random background stars
    for (let i = 0; i < numStars; i++) {
      generatedStars.push({
        id: `star-${i}`,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 4,
        duration: 3 + Math.random() * 5,
        brightness: 0.2 + Math.random() * 0.6,
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
      // Anchors connect to more things to look like hubs
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
              isAnchorConn: nodeA.isAnchor || allNodes[target.index].isAnchor
            });
            connectionsMade++;
          }
        }
      }
    }

    return { stars: generatedStars, connections: generatedConnections, anchorNodes: anchors };
  }, [visitorData]);

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
          style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50%', height: '50%', background: '#7DE2FF', filter: 'blur(120px)', borderRadius: '50%', mixBlendMode: 'screen' }} 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.2, 0.15] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60%', height: '60%', background: '#AA3BFF', filter: 'blur(150px)', borderRadius: '50%', mixBlendMode: 'screen' }} 
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
        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, filter: 'drop-shadow(0 0 8px rgba(125,226,255,0.4))' }}>
          
          {/* Render Connections */}
          {connections.map((conn) => (
            <motion.line
              key={conn.id}
              x1={`${conn.x1}%`} y1={`${conn.y1}%`}
              x2={`${conn.x2}%`} y2={`${conn.y2}%`}
              stroke={conn.isAnchorConn ? "rgba(170, 59, 255, 0.4)" : "rgba(125, 226, 255, 0.15)"}
              strokeWidth={conn.isAnchorConn ? "1.5" : "0.5"}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 3, delay: 0.5 + Math.random() * 2, ease: "easeOut" }}
            />
          ))}

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

        {/* Render Anchor Nodes (Nova Lore) */}
        {anchorNodes.map((anchor) => (
          <motion.div
            key={anchor.id}
            onMouseEnter={() => setHoveredNode(anchor)}
            onMouseLeave={() => setHoveredNode(null)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: 1 }}
            style={{
              position: 'absolute', left: `${anchor.x}%`, top: `${anchor.y}%`,
              transform: 'translate(-50%, -50%)', zIndex: 10, cursor: 'pointer'
            }}
          >
            {/* Core Glow */}
            <motion.div
              animate={{ 
                boxShadow: [`0 0 20px 5px ${anchor.color}`, `0 0 40px 15px ${anchor.color}`, `0 0 20px 5px ${anchor.color}`] 
              }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                width: anchor.size * 3, height: anchor.size * 3,
                background: '#fff', borderRadius: '50%',
                display: 'flex', justifyContent: 'center', alignItems: 'center'
              }}
            >
              {/* Inner Core */}
              <div style={{ width: '50%', height: '50%', background: anchor.color, borderRadius: '50%' }} />
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Info Panel for Hovered Anchor */}
      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              position: 'absolute', bottom: '100px', left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(10, 5, 25, 0.8)', border: `1px solid ${hoveredNode.color}`,
              padding: '15px 30px', borderRadius: '15px', backdropFilter: 'blur(10px)',
              textAlign: 'center', zIndex: 20, boxShadow: `0 0 30px ${hoveredNode.color}40`
            }}
          >
            <h3 style={{ color: '#fff', margin: '0 0 5px 0', fontFamily: 'var(--font-display)', letterSpacing: '2px' }}>
              {hoveredNode.label}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '0.9rem' }}>
              {hoveredNode.desc}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Title */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 1 }}
        style={{ position: 'absolute', bottom: '30px', width: '100%', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-primary)', letterSpacing: '10px', zIndex: 2, pointerEvents: 'none' }}
      >
        NOVA'S STARWAYS
      </motion.div>

    </div>
  );
}
