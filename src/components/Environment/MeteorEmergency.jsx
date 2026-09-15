import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import '../../styles/meteorEmergency.css';

// Constellation target nodes (Guardian Shield shape)
const CONSTELLATION_NODES = [
  { id: 1, x: 38, y: 35, label: 'Alpha' },
  { id: 2, x: 50, y: 22, label: 'Crown' },
  { id: 3, x: 62, y: 35, label: 'Beta' },
  { id: 4, x: 56, y: 55, label: 'Delta' },
  { id: 5, x: 44, y: 55, label: 'Gamma' },
];

// Web Audio API subtle emergency alert beep generator
function triggerEmergencyBeep() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(740, ctx.currentTime);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {
    // Graceful fallback if audio is restricted
  }
}

export default function MeteorEmergency() {
  // Event state: 'IDLE' | 'PRE_WARNING' | 'NOTIFICATION' | 'MISSION' 
  //             | 'WATCH_PROMPT' | 'WATCH_COUNTDOWN' | 'WATCH_AFTERMATH'
  //             | 'FAILURE_WARNING' | 'FINAL_WARNING' | 'METEOR_VIDEO' | 'AFTERMATH' | 'RECOGNITION'
  const [eventState, setEventState] = useState('IDLE');
  const [countdown, setCountdown] = useState(10);
  const [connectedCount, setConnectedCount] = useState(0);
  const [novaDialogue, setNovaDialogue] = useState('');
  
  // Progression steps in the Success Recognition stage (1 to 6)
  const [recognitionPhase, setRecognitionPhase] = useState(0);
  const [recognitionNovaMsg, setRecognitionNovaMsg] = useState('');
  const [isDiverting, setIsDiverting] = useState(false);

  // Failure state tracking
  const [failureNovaMsg, setFailureNovaMsg] = useState('');
  const [aftermathNovaMsg, setAftermathNovaMsg] = useState('');
  
  // Spectator "Watch What Happens" tracking
  const [spectatorNovaMsg, setSpectatorNovaMsg] = useState('');
  const [spectatorCount, setSpectatorCount] = useState(null);
  const [showWatchReturnBtn, setShowWatchReturnBtn] = useState(false);
  const videoOriginRef = useRef('FAILURE'); // 'FAILURE' or 'WATCH'
  
  const meteorVideoStartedRef = useRef(false);
  const videoElementRef = useRef(null);

  // 30-Second Trigger running on page load
  useEffect(() => {
    const preWarnTimer = setTimeout(() => {
      setEventState('PRE_WARNING');
    }, 27000);

    const notifyTimer = setTimeout(() => {
      setEventState('NOTIFICATION');
      document.body.classList.add('meteor-subtle-shake');
      setTimeout(() => {
        document.body.classList.remove('meteor-subtle-shake');
      }, 700);
    }, 30000);

    return () => {
      clearTimeout(preWarnTimer);
      clearTimeout(notifyTimer);
      document.body.classList.remove('meteor-subtle-shake');
    };
  }, []);

  // 10-Second Mission Countdown Timer (Starts exactly at 10)
  useEffect(() => {
    if (eventState !== 'MISSION' || isDiverting) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleMissionFailure();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [eventState, isDiverting]);

  // Handle Action: HELP NOVA
  const handleStartMission = () => {
    setEventState('MISSION');
    setConnectedCount(0);
    setCountdown(10);
    setIsDiverting(false);
    meteorVideoStartedRef.current = false;
    setNovaDialogue("Traveler, the meteor is almost here. Connect the stars to redirect its path. You have 10 seconds.");
  };

  // ==========================================
  // "WATCH WHAT HAPPENS" SPECTATOR FLOW
  // ==========================================
  const handleWatchCinematic = () => {
    // 1. Visitor chooses NOT to help Nova. Close modal smoothly.
    setEventState('WATCH_PROMPT');
    videoOriginRef.current = 'WATCH';
    meteorVideoStartedRef.current = false;
    setShowWatchReturnBtn(false);
    setSpectatorCount(null);

    // 2. Nova dialogue
    setSpectatorNovaMsg("“Then watch carefully, traveler...”");

    setTimeout(() => {
      setSpectatorNovaMsg("“This is what happens when no one answers the signal.”");
    }, 1400);

    // 3. Short countdown: 3 -> 2 -> 1 (0.6s each)
    setTimeout(() => {
      setEventState('WATCH_COUNTDOWN');
      setSpectatorCount(3);
    }, 3000);

    setTimeout(() => {
      setSpectatorCount(2);
    }, 3600);

    setTimeout(() => {
      setSpectatorCount(1);
    }, 4200);

    // 4. Immediately play existing meteor video at 4.8s
    setTimeout(() => {
      setSpectatorCount(null);
      startMeteorVideo('WATCH');
    }, 4800);
  };

  // Handle Clicking a Constellation Star Node
  const handleStarClick = (nodeIndex) => {
    if (eventState !== 'MISSION' || isDiverting || countdown <= 0) return;

    if (nodeIndex === connectedCount) {
      const nextCount = connectedCount + 1;
      setConnectedCount(nextCount);

      if (nextCount === CONSTELLATION_NODES.length) {
        // SUCCESS: Stop countdown immediately & alter trajectory
        setIsDiverting(true);
        setNovaDialogue("You did it! Trajectory altered.");
        
        // Begin "The Starways Remember You" recognition sequence after trajectory completes
        setTimeout(() => {
          startRecognitionSequence();
        }, 2800);
      }
    }
  };

  // ==========================================
  // FAILURE SEQUENCE CONTROLLERS
  // ==========================================
  const handleMissionFailure = () => {
    setEventState('FAILURE_WARNING');
    videoOriginRef.current = 'FAILURE';
    setFailureNovaMsg("“Traveler... we ran out of time.”");

    setTimeout(() => {
      setFailureNovaMsg("“You couldn't redirect the meteor.”");
    }, 2200);

    setTimeout(() => {
      setFailureNovaMsg("“It's coming straight toward us.”");
    }, 4400);

    setTimeout(() => {
      setFailureNovaMsg("“Brace yourself.”");
    }, 6600);

    // After Nova failure dialogues finish (~8.8s), trigger the 2-second blinking warning
    setTimeout(() => {
      startFinalWarning();
    }, 8800);
  };

  // 2-Second Blinking Emergency Warning
  const startFinalWarning = () => {
    setEventState('FINAL_WARNING');
    triggerEmergencyBeep();

    // Subtle audio beeps synchronized with blinking intervals
    setTimeout(() => triggerEmergencyBeep(), 700);
    setTimeout(() => triggerEmergencyBeep(), 1400);

    // EXACTLY AT 2.0 SECONDS -> Start the meteor video
    setTimeout(() => {
      startMeteorVideo('FAILURE');
    }, 2000);
  };

  // Start Full-Screen Meteor Attack Video
  const startMeteorVideo = (origin = 'FAILURE') => {
    if (meteorVideoStartedRef.current) return;
    meteorVideoStartedRef.current = true;
    videoOriginRef.current = origin;
    setEventState('METEOR_VIDEO');
  };

  // After Video Reaches End
  const handleVideoEnded = () => {
    if (videoOriginRef.current === 'WATCH') {
      // Transition into "WATCH WHAT HAPPENS" Aftermath
      setEventState('WATCH_AFTERMATH');
      setSpectatorNovaMsg("“Earth needed a guardian.”");

      setTimeout(() => {
        setSpectatorNovaMsg("“You chose to watch.”");
      }, 1400);

      setTimeout(() => {
        setSpectatorNovaMsg("“But every signal is an invitation.”");
      }, 2800);

      setTimeout(() => {
        setShowWatchReturnBtn(true);
      }, 4000);
    } else {
      // Transition into Standard Failure Aftermath
      setEventState('AFTERMATH');
      setAftermathNovaMsg("“We were too late.”");

      setTimeout(() => {
        setAftermathNovaMsg("“But the Starways remember every signal...”");
      }, 2600);

      // Return to original website smoothly
      setTimeout(() => {
        sessionStorage.setItem('meteorMissionCompleted', 'true');
        sessionStorage.setItem('nova_meteor_event_completed', 'true');
        setEventState('IDLE');
      }, 7500);
    }
  };

  // Handle Spectator Return Button
  const handleSpectatorReturn = () => {
    sessionStorage.setItem('meteorMissionCompleted', 'true');
    sessionStorage.setItem('nova_meteor_event_completed', 'true');
    setEventState('IDLE');
  };

  // ==========================================
  // SUCCESS: "THE STARWAYS REMEMBER YOU"
  // ==========================================
  const startRecognitionSequence = () => {
    setEventState('RECOGNITION');
    setRecognitionPhase(1); // 1: Panel appears

    // Phase 2: Details appear (SIGNAL STRENGTH +1, WORLD PROTECTED: EARTH)
    setTimeout(() => {
      setRecognitionPhase(2);
    }, 1500);

    // Phase 3: Traveler -> Ally progression illuminates
    setTimeout(() => {
      setRecognitionPhase(3);
    }, 3200);

    // Phase 4: Nova speaks in dialogue
    setTimeout(() => {
      setRecognitionPhase(4);
      setRecognitionNovaMsg("“I couldn't have done that without you.”");
    }, 5000);

    setTimeout(() => {
      setRecognitionNovaMsg("“You're more than a traveler now.”");
    }, 7200);

    setTimeout(() => {
      setRecognitionNovaMsg("“The Starways know your signal.”");
    }, 9400);

    // Phase 5: The Starway Acknowledgement (The Traveler's Star awakens & connects)
    setTimeout(() => {
      setRecognitionPhase(5);
    }, 11600);

    // Phase 6: Final Message ("✦ YOUR SIGNAL HAS BEEN RECORDED")
    setTimeout(() => {
      setRecognitionPhase(6);
    }, 13800);

    // Return to website gracefully
    setTimeout(() => {
      sessionStorage.setItem('meteorMissionCompleted', 'true');
      sessionStorage.setItem('nova_meteor_event_completed', 'true');
      setEventState('IDLE');
    }, 17500);
  };

  // Canvas for Earth and Meteor trajectory animation
  const stageCanvasRef = useRef(null);
  useEffect(() => {
    if (eventState !== 'MISSION' && eventState !== 'RECOGNITION') return;
    const canvas = stageCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let meteorProgress = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const earthX = width * 0.82;
      const earthY = height * 0.52;
      const earthRadius = Math.min(width, height) * 0.16;

      // 1. Draw Earth with subtle glowing atmospheric rim
      const earthGlow = ctx.createRadialGradient(earthX, earthY, earthRadius * 0.8, earthX, earthY, earthRadius * 1.35);
      earthGlow.addColorStop(0, 'rgba(100, 180, 255, 0.45)');
      earthGlow.addColorStop(0.6, 'rgba(80, 140, 255, 0.15)');
      earthGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = earthGlow;
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthRadius * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // Earth body
      const earthGrad = ctx.createRadialGradient(earthX - earthRadius * 0.3, earthY - earthRadius * 0.3, 10, earthX, earthY, earthRadius);
      earthGrad.addColorStop(0, '#3a88e9');
      earthGrad.addColorStop(0.5, '#1b4d8c');
      earthGrad.addColorStop(1, '#0b1d3a');
      ctx.fillStyle = earthGrad;
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthRadius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw Meteor Trajectory
      meteorProgress = (meteorProgress + 0.003) % 1;
      let meteorX, meteorY;

      if (!isDiverting) {
        // Approaching Earth directly from top-left
        const startX = width * 0.1;
        const startY = height * 0.18;
        meteorX = startX + (earthX - startX) * (0.15 + meteorProgress * 0.65);
        meteorY = startY + (earthY - startY) * (0.15 + meteorProgress * 0.65);

        // Trajectory dashed line (Threat)
        ctx.strokeStyle = 'rgba(255, 80, 60, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(earthX, earthY);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // Diverted into Starway (curves smoothly upward into deep cosmos)
        const startX = width * 0.25;
        const startY = height * 0.4;
        const cpX = width * 0.6;
        const cpY = height * 0.45;
        const endX = width * 0.85;
        const endY = height * 0.08;

        const t = Math.min(meteorProgress * 1.5, 1);
        meteorX = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * cpX + t * t * endX;
        meteorY = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * cpY + t * t * endY;

        // Safe diverted trajectory line (Cyan Starway)
        ctx.strokeStyle = 'rgba(125, 226, 255, 0.55)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(cpX, cpY, endX, endY);
        ctx.stroke();
      }

      // 3. Draw Meteor Flame & Glowing Core
      ctx.shadowColor = isDiverting ? 'rgba(125, 226, 255, 1)' : 'rgba(255, 100, 30, 1)';
      ctx.shadowBlur = 15;
      ctx.fillStyle = isDiverting ? '#ffffff' : '#ffd060';
      ctx.beginPath();
      ctx.arc(meteorX, meteorY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Meteor Tail Flame
      const tailLength = 40;
      const angle = isDiverting ? -Math.PI / 4 : Math.atan2(earthY - meteorY, earthX - meteorX) + Math.PI;
      const tailX = meteorX + Math.cos(angle) * tailLength;
      const tailY = meteorY + Math.sin(angle) * tailLength;
      const tailGrad = ctx.createLinearGradient(meteorX, meteorY, tailX, tailY);
      tailGrad.addColorStop(0, isDiverting ? 'rgba(125, 226, 255, 0.85)' : 'rgba(255, 120, 40, 0.85)');
      tailGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.strokeStyle = tailGrad;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(meteorX, meteorY);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [eventState, isDiverting]);

  return (
    <>
      {/* 1. Pre-Warning Atmosphere & Diagonal Streak */}
      {eventState === 'PRE_WARNING' && (
        <>
          <div className="meteor-prewarning-glow" />
          <div className="meteor-prewarning-streak" />
        </>
      )}

      {/* 2. Emergency Red/Orange Ambient Hue */}
      {(eventState === 'NOTIFICATION' || (eventState === 'MISSION' && !isDiverting) || eventState === 'FAILURE_WARNING' || eventState === 'WATCH_PROMPT') && (
        <div className="meteor-emergency-ambient" />
      )}

      {/* 3. Center Glassmorphic Emergency Modal */}
      <AnimatePresence>
        {eventState === 'NOTIFICATION' && (
          <div className="meteor-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="meteor-glass-card"
            >
              <div className="meteor-alert-tag">
                <AlertTriangle size={16} />
                <span>INCOMING SIGNAL</span>
              </div>

              <h2 className="meteor-card-title">
                A METEOR IS APPROACHING EARTH
              </h2>

              <p className="meteor-card-desc">
                Nova has detected an incoming meteor on a collision course with Earth.
                <br /><br />
                She needs your help.
              </p>

              <div className="meteor-card-question">
                WILL YOU HELP NOVA PROTECT EARTH?
              </div>

              <div className="meteor-button-group">
                <button 
                  className="meteor-btn-primary"
                  onClick={handleStartMission}
                >
                  [ HELP NOVA ]
                </button>
                <button 
                  className="meteor-btn-secondary"
                  onClick={handleWatchCinematic}
                >
                  [ WATCH WHAT HAPPENS ]
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. WATCH WHAT HAPPENS — SPECTATOR NOVA DIALOGUE & COUNTDOWN */}
      <AnimatePresence>
        {(eventState === 'WATCH_PROMPT' || eventState === 'WATCH_COUNTDOWN') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="spectator-stage-overlay"
          >
            {/* Nova Speech in Spectator Mode */}
            {eventState === 'WATCH_PROMPT' && (
              <motion.div
                key={spectatorNovaMsg}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="meteor-nova-dialogue"
              >
                <div className="meteor-nova-name">✦ NOVA</div>
                <p className="meteor-nova-text">{spectatorNovaMsg}</p>
              </motion.div>
            )}

            {/* Cinematic Countdown 3 -> 2 -> 1 */}
            {eventState === 'WATCH_COUNTDOWN' && spectatorCount !== null && (
              <div className="spectator-count-container">
                <motion.div
                  key={spectatorCount}
                  className="spectator-count-num"
                >
                  {spectatorCount}
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Full-Screen Interactive Mission & Constellation Game (10s Countdown) */}
      <AnimatePresence>
        {eventState === 'MISSION' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="meteor-mission-container"
          >
            {/* Top Status HUD */}
            <div className="meteor-top-hud">
              <div className="meteor-hud-title">
                {isDiverting ? (
                  <span style={{ color: '#7de2ff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={18} />
                    TRAJECTORY ALTERED • EARTH IS SAFE
                  </span>
                ) : (
                  <span>⚠ METEOR TRAJECTORY DETECTED</span>
                )}
              </div>

              {!isDiverting && (
                <div className="meteor-countdown">
                  IMPACT IN: 00:{countdown < 10 ? `0${countdown}` : countdown}
                </div>
              )}
            </div>

            {/* Earth & Meteor Canvas Stage */}
            <canvas ref={stageCanvasRef} className="meteor-space-stage" />

            {/* Constellation Connecting SVG Lines */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 22 }}>
              {CONSTELLATION_NODES.map((node, i) => {
                if (i === 0 || i > connectedCount) return null;
                const prevNode = CONSTELLATION_NODES[i - 1];
                return (
                  <line
                    key={`line-${i}`}
                    x1={`${prevNode.x}vw`}
                    y1={`${prevNode.y}vh`}
                    x2={`${node.x}vw`}
                    y2={`${node.y}vh`}
                    stroke="rgba(125, 226, 255, 0.9)"
                    strokeWidth="3"
                    filter="drop-shadow(0 0 8px rgba(125, 226, 255, 1))"
                  />
                );
              })}
              {connectedCount >= 5 && (
                <line
                  x1={`${CONSTELLATION_NODES[4].x}vw`}
                  y1={`${CONSTELLATION_NODES[4].y}vh`}
                  x2={`${CONSTELLATION_NODES[0].x}vw`}
                  y2={`${CONSTELLATION_NODES[0].y}vh`}
                  stroke="rgba(125, 226, 255, 0.9)"
                  strokeWidth="3"
                  filter="drop-shadow(0 0 8px rgba(125, 226, 255, 1))"
                />
              )}
            </svg>

            {/* Constellation Star Nodes */}
            {CONSTELLATION_NODES.map((node, idx) => {
              const isConnected = idx < connectedCount;
              const isTarget = idx === connectedCount && !isDiverting && countdown > 0;

              return (
                <div
                  key={node.id}
                  className={`constellation-star-node ${isConnected ? 'connected' : ''} ${isTarget ? 'target' : ''}`}
                  style={{ left: `${node.x}vw`, top: `${node.y}vh` }}
                  onClick={() => handleStarClick(idx)}
                >
                  <div className="constellation-star-core" />
                  {isTarget && <div className="constellation-hint-ring" />}
                </div>
              );
            })}

            {/* Nova Speech Box in Emergency Mode */}
            <motion.div
              key={novaDialogue}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="meteor-nova-dialogue"
            >
              <div className="meteor-nova-name">✦ NOVA</div>
              <p className="meteor-nova-text">{novaDialogue}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. FAILURE NOTIFICATION (00:00 REACHED) */}
      <AnimatePresence>
        {eventState === 'FAILURE_WARNING' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="meteor-failure-overlay"
          >
            <div className="meteor-failure-card">
              <div className="meteor-failure-tag">
                <AlertTriangle size={18} />
                <span>⚠ SIGNAL LOST</span>
              </div>

              <h2 className="meteor-failure-title">
                EARTH COULD NOT BE PROTECTED
              </h2>

              <p className="meteor-failure-desc">
                You ran out of time.
                <br /><br />
                The meteor has reached Earth's atmosphere.
              </p>

              <motion.div
                key={failureNovaMsg}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="recognition-nova-box"
                style={{ borderColor: 'rgba(255, 80, 60, 0.4)' }}
              >
                <div className="meteor-nova-name" style={{ color: '#ff7055' }}>✦ NOVA</div>
                <p className="recognition-nova-text">{failureNovaMsg}</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. FINAL 2-SECOND BLINKING EMERGENCY WARNING */}
      <AnimatePresence>
        {eventState === 'FINAL_WARNING' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="meteor-blinking-warning-overlay"
          >
            <div className="meteor-blinking-warning-panel">
              <div className="warning-blink-tag">
                <AlertTriangle size={20} />
                <span>⚠ INCOMING IMPACT</span>
              </div>

              <div className="warning-blink-title">
                THE METEOR IS APPROACHING
              </div>

              <div className="warning-blink-sub">
                EARTH IS IN DANGER
              </div>

              <div className="warning-nova-callout">
                “Look up, traveler. There's no time left. IT'S COMING.”
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 8. FULL-SCREEN METEOR ATTACK VIDEO */}
      {eventState === 'METEOR_VIDEO' && (
        <div className="meteor-video-overlay">
          <video
            ref={videoElementRef}
            src="/meteor.mp4"
            className="meteor-video-player"
            autoPlay
            playsInline
            onEnded={handleVideoEnded}
            onError={() => {
              // Fallback safety if video encounters unexpected playback issue
              handleVideoEnded();
            }}
          />
        </div>
      )}

      {/* 9. WATCH WHAT HAPPENS AFTERMATH PANEL */}
      <AnimatePresence>
        {eventState === 'WATCH_AFTERMATH' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="spectator-stage-overlay"
          >
            <div className="spectator-aftermath-panel">
              <h1 className="spectator-main-title">THE SIGNAL WENT UNANSWERED</h1>

              <motion.div
                key={spectatorNovaMsg}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="recognition-nova-box"
              >
                <div className="meteor-nova-name">✦ NOVA</div>
                <p className="recognition-nova-text">{spectatorNovaMsg}</p>
              </motion.div>

              {showWatchReturnBtn && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <button
                    className="spectator-return-btn"
                    onClick={handleSpectatorReturn}
                  >
                    [ RETURN TO THE STARWAYS ]
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 10. FAILURE AFTERMATH (WHEN 00:00 EXPIRES) */}
      <AnimatePresence>
        {eventState === 'AFTERMATH' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="recognition-stage-container"
          >
            <div className="aftermath-failure-panel">
              <h1 className="recognition-main-title">THE STARWAYS REMEMBER</h1>
              <div className="aftermath-outcome-badge">MISSION OUTCOME</div>
              <p className="aftermath-outcome-desc">Earth was not protected in time.</p>

              <motion.div
                key={aftermathNovaMsg}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="recognition-nova-box"
              >
                <div className="meteor-nova-name">✦ NOVA</div>
                <p className="recognition-nova-text">{aftermathNovaMsg}</p>
              </motion.div>

              <div className="recognition-final-note" style={{ marginTop: '20px' }}>
                ✦ SIGNAL RECORDED IN STARWAYS
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 11. "THE STARWAYS REMEMBER YOU" SUCCESS RECOGNITION STAGE */}
      <AnimatePresence>
        {eventState === 'RECOGNITION' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="recognition-stage-container"
          >
            {/* Background Constellation with Soft Radiance & Awakened Star */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
              {CONSTELLATION_NODES.map((node, i) => {
                const prevNode = i === 0 ? CONSTELLATION_NODES[4] : CONSTELLATION_NODES[i - 1];
                return (
                  <line
                    key={`rec-line-${i}`}
                    x1={`${prevNode.x}vw`}
                    y1={`${prevNode.y}vh`}
                    x2={`${node.x}vw`}
                    y2={`${node.y}vh`}
                    stroke="rgba(125, 226, 255, 0.45)"
                    strokeWidth="2"
                    filter="drop-shadow(0 0 10px rgba(125, 226, 255, 0.8))"
                  />
                );
              })}

              {/* Phase 5+: Light beam connecting the Traveler's Star to the Constellation */}
              {recognitionPhase >= 5 && (
                <motion.line
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.8, ease: 'easeInOut' }}
                  x1="62vw"
                  y1="42vh"
                  x2={`${CONSTELLATION_NODES[2].x}vw`}
                  y2={`${CONSTELLATION_NODES[2].y}vh`}
                  stroke="rgba(180, 240, 255, 0.85)"
                  strokeWidth="2.5"
                  filter="drop-shadow(0 0 12px rgba(125, 226, 255, 1))"
                />
              )}
            </svg>

            {/* The Awakened Traveler's Star in the background */}
            {recognitionPhase >= 5 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.2 }}
                style={{
                  position: 'absolute',
                  left: '62vw',
                  top: '42vh',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 12
                }}
              >
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  boxShadow: '0 0 20px rgba(125, 226, 255, 1), 0 0 40px rgba(125, 226, 255, 0.8)',
                  animation: 'starTargetPulse 2s ease-in-out infinite alternate'
                }} />
              </motion.div>
            )}

            {/* Recognition Glass Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="recognition-panel"
            >
              {/* Main Title & Subtitle */}
              <h1 className="recognition-main-title">THE STARWAYS REMEMBER YOU</h1>
              <div className="recognition-subtitle">GUARDIAN ASSISTANCE RECORDED</div>
              <p className="recognition-help-text">You helped Nova protect Earth.</p>

              {/* Cosmic Records Grid */}
              {recognitionPhase >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="recognition-records-grid"
                >
                  {/* Record 1: Signal Strength */}
                  <div className="record-item">
                    <span className="record-label">SIGNAL STRENGTH</span>
                    <div className="record-value-container">
                      <div className="record-star-icon" />
                      <span>+1</span>
                    </div>
                  </div>

                  {/* Record 2: World Protected */}
                  <div className="record-item">
                    <span className="record-label">WORLD PROTECTED</span>
                    <div className="record-value-container">
                      <div className="record-earth-sphere" />
                      <span>EARTH</span>
                    </div>
                  </div>

                  {/* Record 3: Guardian Status Progression */}
                  <div className="record-item">
                    <span className="record-label">GUARDIAN STATUS</span>
                    <div className="guardian-status-flow">
                      <span className="status-traveler">TRAVELER</span>
                      {recognitionPhase >= 3 ? (
                        <>
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: 24 }} 
                            transition={{ duration: 0.6 }}
                            className="status-arrow-line" 
                          />
                          <motion.span 
                            initial={{ opacity: 0, scale: 0.9 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="status-ally"
                          >
                            ALLY
                          </motion.span>
                        </>
                      ) : (
                        <span style={{ opacity: 0.3 }}>→ ALLY</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Nova Dialogue Recognition Message */}
              {recognitionPhase >= 4 && (
                <motion.div
                  key={recognitionNovaMsg}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="recognition-nova-box"
                >
                  <p className="recognition-nova-text">{recognitionNovaMsg}</p>
                </motion.div>
              )}

              {/* Final Starway Acknowledgement */}
              {recognitionPhase >= 6 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="recognition-final-note">✦ YOUR SIGNAL HAS BEEN RECORDED</div>
                  <p className="recognition-final-subtext">The Starways will remember your light.</p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
