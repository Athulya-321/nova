import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useNova, NovaStates, AppModes } from '../../context/NovaContext';
import NovaCharacter from '../Nova/NovaCharacter';
import '../../styles/starways.css';

const nodes = [
  { id: 'core', label: 'THE CORE', tag: '[ ENERGY SOURCE ]', desc: 'The beating heart of the Starways.', x: 50, y: 50, visualClass: 'node-core' },
  { id: 'veyra', label: 'VEYRA', tag: '[ ORIGIN WORLD ]', desc: "Nova's lost home.", x: 20, y: 30, visualClass: 'node-planet' },
  { id: 'earth', label: 'EARTH', tag: '[ HUMANITY ]', desc: "Where Nova discovered humanity.", x: 80, y: 30, visualClass: 'node-planet' },
  { id: 'passage', label: 'THE PASSAGE', tag: '[ GATEWAY ]', desc: 'The cosmic gateways connecting worlds.', x: 50, y: 15, visualClass: 'node-portal' },
  { id: 'echo', label: 'ECHO REALM', tag: '[ TRACES ]', desc: 'Traces left by travelers who passed through.', x: 25, y: 75, visualClass: 'node-crystal' },
  { id: 'unknown', label: 'THE UNKNOWN', tag: '[ MYSTERY ]', desc: 'Signals Nova cannot yet understand.', x: 75, y: 75, visualClass: 'node-vortex' },
  { id: 'horizon', label: 'THE NEXT HORIZON', tag: '[ FUTURE ]', desc: 'Where future journeys may lead.', x: 50, y: 85, visualClass: 'node-horizon' }
];

export default function Starways({ isExploreMode = false }) {
  const { novaState, appMode } = useNova();
  const containerRef = useRef(null);
  const [activeNode, setActiveNode] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [starPos, setStarPos] = useState({ x: 50, y: 50 });
  const [activityLogs, setActivityLogs] = useState([
    "Gateway stabilized",
    "Traveler crossed the Passage",
    "Signal detected in The Unknown"
  ]);
  const [novaDialogue, setNovaDialogue] = useState("Every path has a story.");

  const isDarkened = [NovaStates.SERIOUS, NovaStates.COSMIC_SIGHT].includes(novaState) && appMode === AppModes.HOME;

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      
      const layers = containerRef.current.querySelectorAll('.parallax-layer');
      layers.forEach((layer, index) => {
        const speed = (index + 1) * 10;
        layer.style.transform = `translate(calc(-10% + ${x * speed}px), calc(-10% + ${y * speed}px))`;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivityLogs(prev => {
        const newLogs = [...prev.slice(1)];
        const possibleLogs = ["Core pulse detected", "Veyra orbital shift", "Earth signal received", "Echo resonance detected", "Unknown anomaly forming"];
        newLogs.push(possibleLogs[Math.floor(Math.random() * possibleLogs.length)]);
        return newLogs;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleFollowStarway = () => {
    if (isFollowing) return;
    setIsFollowing(true);
    setNovaDialogue("Let's see where this leads...");
    
    // Simulate journey
    const journeySequence = [
      { id: 'core', x: 50, y: 50, time: 0 },
      { id: 'passage', x: 50, y: 15, time: 1000 },
      { id: 'earth', x: 80, y: 30, time: 2500 },
      { id: 'unknown', x: 75, y: 75, time: 4000 },
    ];
    
    journeySequence.forEach((step, index) => {
      setTimeout(() => {
        setActiveNode(step.id);
        setStarPos({ x: step.x, y: step.y });
        
        if (index === journeySequence.length - 1) {
          setTimeout(() => {
            setIsFollowing(false);
            setActiveNode(null);
            setStarPos({ x: 50, y: 50 }); // return to core
            setNovaDialogue("Where do you want to go?");
          }, 2000);
        }
      }, step.time);
    });
  };

  const helpSignals = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${3 + Math.random() * 4}s`
  }));

  return (
    <div ref={containerRef} className={`starways-background ${isDarkened ? 'darkened' : ''}`}>
      <div className="parallax-layer layer-stars" />
      <div className="parallax-layer layer-nebula" />
      <div className="parallax-layer layer-structures" />
      
      <div className="starways-layer foreground-dust" />
      
      {(!isExploreMode || appMode !== AppModes.STARWAYS) && helpSignals.map(signal => (
        <div 
          key={signal.id} 
          className="help-signal" 
          style={{
            left: signal.left,
            top: signal.top,
            animationDelay: signal.animationDelay,
            animationDuration: signal.animationDuration
          }}
        />
      ))}

      {isExploreMode && appMode === AppModes.STARWAYS && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
          className="cosmic-network-container"
        >

          <div className="starway-activity-hud">
            <div className="hud-title">STARWAY ACTIVITY</div>
            {activityLogs.map((log, i) => (
              <motion.div key={i} className="hud-log" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                {log}
              </motion.div>
            ))}
          </div>

          <svg className="network-svg-layer">
            {nodes.map(node => {
              if (node.id === 'core') return null;
              return (
                <motion.line
                  key={`line-${node.id}`}
                  x1="50%" y1="50%"
                  x2={`${node.x}%`} y2={`${node.y}%`}
                  stroke={activeNode === node.id || activeNode === 'core' || isFollowing ? 'rgba(179, 136, 255, 0.6)' : 'rgba(179, 136, 255, 0.15)'}
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: 0.5 }}
                />
              );
            })}
          </svg>

          <div className="network-nodes-layer">
            {nodes.map(node => (
              <div
                key={node.id}
                className={`cosmic-node ${activeNode === node.id ? 'active' : ''}`}
                style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
                onMouseEnter={() => !isFollowing && setActiveNode(node.id)}
                onMouseLeave={() => !isFollowing && setActiveNode(null)}
              >
                <div className={`node-visual ${node.visualClass}`}>
                  <div className="node-ring" />
                </div>
                <div className="holo-label">
                  <div className="holo-title">{node.label}</div>
                  <span className="holo-tag">{node.tag}</span>
                  <div className="holo-desc">{node.desc}</div>
                </div>
              </div>
            ))}

            {isFollowing && (
              <motion.div
                style={{
                  position: 'absolute',
                  width: '20px', height: '20px',
                  background: '#fff',
                  borderRadius: '50%',
                  boxShadow: '0 0 20px 10px #fff, 0 0 40px 20px var(--nova-core)',
                  zIndex: 20
                }}
                animate={{
                  left: `${starPos.x}%`,
                  top: `${starPos.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            )}
          </div>



          <div className="action-control-container">
            <button className="follow-starway-btn" onClick={handleFollowStarway} disabled={isFollowing}>
              FOLLOW A STARWAY
            </button>
          </div>
        </motion.div>
      )}
      
      <div className="starways-overlay" />
    </div>
  );
}
