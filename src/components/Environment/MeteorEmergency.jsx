import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldCheck, Sparkles, Radio } from 'lucide-react';
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

  // Demonstration (3 cycles) vs Real 10-Second Challenge
  const [isDemonstrating, setIsDemonstrating] = useState(false);
  const isDemonstratingRef = useRef(false);
  const [demoCycle, setDemoCycle] = useState(1);
  const [demoT, setDemoT] = useState(0); // 0.0 to 1.0 (interpolation from Star 1 to Star 2)
  const [isChallengeActive, setIsChallengeActive] = useState(false);
  const isChallengeActiveRef = useRef(false);

  // 10-Second Mission Countdown Timer (Starts ONLY after 3-cycle demonstration)
  const missionStartTimeRef = useRef(null);
  const isDivertingRef = useRef(false);
  const divertStartRef = useRef(null);
  const divertFromPosRef = useRef({ x: 0, y: 0 });
  const hasFailedRef = useRef(false);

  // Start the real 10-second challenge
  const startRealChallenge = () => {
    setIsDemonstrating(false);
    isDemonstratingRef.current = false;
    setIsChallengeActive(true);
    isChallengeActiveRef.current = true;
    missionStartTimeRef.current = performance.now();
    setConnectedCount(0);
    setCountdown(10);
    setNovaDialogue("Now it's your turn! Connect the stars. You have 10 seconds!");
  };

  // Automated 3-cycle demonstration of connecting Star 1 to Star 2
  useEffect(() => {
    if (eventState !== 'MISSION' || !isDemonstrating) return;

    let startTime = performance.now();
    const cycleDuration = 1600; // 1.6s per cycle, 4.8s total for 3 cycles

    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const cycleNum = Math.floor(elapsed / cycleDuration) + 1;
      const cycleTime = elapsed % cycleDuration;

      if (cycleNum > 3) {
        clearInterval(interval);
        startRealChallenge();
        return;
      }

      setDemoCycle(cycleNum);

      // Phase timing within each 1.6s cycle:
      // 0 - 300ms: Arrow at Star 1
      // 300 - 1300ms: Arrow travels from Star 1 to Star 2, line extends
      // 1300 - 1600ms: Arrow reaches Star 2, line connected
      if (cycleTime < 300) {
        setDemoT(0);
      } else if (cycleTime < 1300) {
        const moveProgress = (cycleTime - 300) / 1000;
        setDemoT(moveProgress);
      } else {
        setDemoT(1);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [eventState, isDemonstrating]);

  // 10-Second Countdown interval during active challenge
  useEffect(() => {
    if (eventState !== 'MISSION' || isDiverting || !isChallengeActive) return;

    const interval = setInterval(() => {
      if (!missionStartTimeRef.current) return;
      const elapsed = performance.now() - missionStartTimeRef.current;
      const remainingMs = Math.max(0, 10000 - elapsed);
      const secs = Math.ceil(remainingMs / 1000);
      setCountdown(secs);
      if (elapsed >= 10000) {
        clearInterval(interval);
        setCountdown(0);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [eventState, isDiverting, isChallengeActive]);

  // Handle Action: HELP NOVA (Starts with 3-cycle demonstration)
  const handleStartMission = () => {
    setIsDemonstrating(true);
    isDemonstratingRef.current = true;
    setDemoCycle(1);
    setDemoT(0);
    setIsChallengeActive(false);
    isChallengeActiveRef.current = false;
    missionStartTimeRef.current = null;
    isDivertingRef.current = false;
    divertStartRef.current = null;
    hasFailedRef.current = false;
    setEventState('MISSION');
    setConnectedCount(0);
    setCountdown(10);
    setIsDiverting(false);
    meteorVideoStartedRef.current = false;
    setNovaDialogue("Watch closely, traveler... connect the stars to form the cosmic shield.");
  };

  // ==========================================
  // "WATCH WHAT HAPPENS" SPECTATOR FLOW
  // ==========================================
  const handleWatchCinematic = () => {
    // 1. Visitor chooses NOT to help Nova. Close modal smoothly.
    if (typeof window !== 'undefined') {
      localStorage.setItem('meteorMissionOutcome', 'watched');
    }
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
    if (eventState !== 'MISSION' || isDiverting || hasFailedRef.current) return;

    // If visitor clicks while demonstration is running, start real challenge immediately
    if (isDemonstratingRef.current) {
      startRealChallenge();
      return;
    }

    // Disallow clicks if countdown expired during active challenge
    if (countdown <= 0) return;

    // Connect next star in sequence (or allow completing with Star 5 / loop back to Star 1)
    const isTarget = nodeIndex === connectedCount;
    const isClosingStep = connectedCount === 4 && (nodeIndex === 4 || nodeIndex === 0);

    if (isTarget || isClosingStep) {
      const nextCount = isClosingStep ? 5 : connectedCount + 1;
      setConnectedCount(nextCount);

      // All 5 stars connected: full Guardian Shield constellation complete!
      if (nextCount >= CONSTELLATION_NODES.length) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('meteorMissionOutcome', 'protected');
        }

        // Brief delay so traveler clearly sees the full shield glowing complete before meteor turns
        setTimeout(() => {
          isDivertingRef.current = true;
          setIsDiverting(true);

          if (missionStartTimeRef.current) {
            const elapsed = Math.max(0, performance.now() - missionStartTimeRef.current);
            const progress = Math.min(elapsed / 10000, 1.0);
            const width = window.innerWidth;
            const height = window.innerHeight;
            const startX = width * 0.08;
            const startY = height * 0.15;
            const earthX = width * 0.82;
            const earthY = height * 0.52;
            divertFromPosRef.current = {
              x: startX + (earthX - startX) * progress,
              y: startY + (earthY - startY) * progress
            };
          }

          setNovaDialogue("You did it! Trajectory altered.");
          
          // Begin "The Starways Remember You" recognition sequence after trajectory completes
          setTimeout(() => {
            startRecognitionSequence();
          }, 2800);
        }, 500);
      }
    }
  };

  // ==========================================
  // FAILURE SEQUENCE CONTROLLERS
  // ==========================================
  const handleMissionFailure = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('meteorMissionOutcome', 'timeout');
    }
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

  // Canvas for Earth and Single Continuous 10-Second Meteor Trajectory Animation
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

    const render = (currentTime) => {
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

      // 2. Draw Single Continuous 10-Second Meteor Trajectory
      const startX = width * 0.08;
      const startY = height * 0.15;
      let meteorX, meteorY;
      let progress = 0;

      if (isChallengeActiveRef.current && missionStartTimeRef.current) {
        const elapsed = Math.max(0, currentTime - missionStartTimeRef.current);
        progress = Math.min(elapsed / 10000, 1.0);
      } else {
        // In Phase 1 (Demonstration), meteor stays at starting position
        progress = 0;
      }

      if (!isDivertingRef.current) {
        // Approaching Earth directly along single continuous trajectory (0.0 to 1.0)
        meteorX = startX + (earthX - startX) * progress;
        meteorY = startY + (earthY - startY) * progress;

        // Trajectory dashed threat line
        ctx.strokeStyle = 'rgba(255, 80, 60, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(earthX, earthY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Handle mission failure trigger if timer reaches 10.0s (00:00) without completion in Phase 2
        if (isChallengeActiveRef.current && progress >= 1.0 && !hasFailedRef.current && !isDivertingRef.current) {
          hasFailedRef.current = true;
          handleMissionFailure();
        }
      } else {
        // Diverted smoothly into deep cosmos Starway
        if (!divertStartRef.current) {
          divertStartRef.current = currentTime;
        }
        const divertElapsed = currentTime - divertStartRef.current;
        const divertT = Math.min(divertElapsed / 2200, 1.0);

        const freezeX = divertFromPosRef.current.x || (startX + (earthX - startX) * 0.5);
        const freezeY = divertFromPosRef.current.y || (startY + (earthY - startY) * 0.5);
        const cpX = freezeX + (width * 0.85 - freezeX) * 0.4;
        const cpY = freezeY - height * 0.35;
        const endX = width * 0.92;
        const endY = height * 0.05;

        const t = divertT;
        meteorX = (1 - t) * (1 - t) * freezeX + 2 * (1 - t) * t * cpX + t * t * endX;
        meteorY = (1 - t) * (1 - t) * freezeY + 2 * (1 - t) * t * cpY + t * t * endY;

        // Safe diverted trajectory line (Cyan Starway)
        ctx.strokeStyle = 'rgba(125, 226, 255, 0.6)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(freezeX, freezeY);
        ctx.quadraticCurveTo(cpX, cpY, endX, endY);
        ctx.stroke();
      }

      // 3. 3D / Depth of Meteor:
      // Small & dimmer far away, larger & brighter with stronger trail near Earth
      const isDiv = isDivertingRef.current;
      const currentRadius = isDiv ? 7 : (4.5 + progress * 6.5);
      const glowBlur = isDiv ? 18 : (8 + progress * 16);
      const tailLength = isDiv ? 45 : (25 + progress * 45);
      const tailWidth = isDiv ? 5 : (3 + progress * 5);

      // Glowing Meteor Core
      ctx.shadowColor = isDiv ? 'rgba(125, 226, 255, 1)' : (progress > 0.6 ? 'rgba(255, 70, 20, 1)' : 'rgba(255, 120, 40, 1)');
      ctx.shadowBlur = glowBlur;
      ctx.fillStyle = isDiv ? '#ffffff' : (progress > 0.7 ? '#ffffff' : '#ffd060');
      ctx.beginPath();
      ctx.arc(meteorX, meteorY, currentRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Meteor Tail Flame
      const angle = isDiv 
        ? Math.atan2(meteorY - (divertFromPosRef.current.y || startY), meteorX - (divertFromPosRef.current.x || startX)) + Math.PI
        : Math.atan2(earthY - meteorY, earthX - meteorX) + Math.PI;
      const tailX = meteorX + Math.cos(angle) * tailLength;
      const tailY = meteorY + Math.sin(angle) * tailLength;
      const tailGrad = ctx.createLinearGradient(meteorX, meteorY, tailX, tailY);
      tailGrad.addColorStop(0, isDiv ? 'rgba(125, 226, 255, 0.9)' : (progress > 0.6 ? 'rgba(255, 90, 30, 0.95)' : 'rgba(255, 140, 40, 0.8)'));
      tailGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.strokeStyle = tailGrad;
      ctx.lineWidth = tailWidth;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(meteorX, meteorY);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [eventState, isDiverting, isChallengeActive]);

  const targetStarNode = (connectedCount < CONSTELLATION_NODES.length && !isDiverting && (isChallengeActive ? countdown > 0 : true))
    ? CONSTELLATION_NODES[connectedCount]
    : null;

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
              initial={{ opacity: 0, scale: 0.90, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.90, y: 25 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="meteor-glass-card"
            >
              {/* Sci-Fi Holographic Corner Accents */}
              <span className="meteor-corner corner-tl" />
              <span className="meteor-corner corner-tr" />
              <span className="meteor-corner corner-bl" />
              <span className="meteor-corner corner-br" />

              {/* Pulsing Critical Alert Tag */}
              <div className="meteor-alert-tag">
                <span className="meteor-alert-pulse-ring" />
                <span className="meteor-alert-pulse-dot" />
                <AlertTriangle size={15} />
                <span>CRITICAL ALERT // INCOMING VECTOR</span>
              </div>

              {/* Main Title */}
              <h2 className="meteor-card-title">
                A METEOR IS APPROACHING EARTH
              </h2>

              {/* Telemetry HUD Panel */}
              <div className="meteor-telemetry-panel">
                <div className="meteor-telemetry-row">
                  <span className="meteor-telemetry-chip">
                    <span className="chip-dot-blue" />
                    <span>TARGET: EARTH (SOL-3)</span>
                  </span>
                  <span className="meteor-telemetry-chip warning">
                    <span className="chip-dot-red" />
                    <span>THREAT: CLASS-IV METEOR</span>
                  </span>
                </div>

                <p className="meteor-card-desc">
                  Nova has detected an interstellar meteor breaching outer orbital defense on an immediate collision course with Earth.
                  <br />
                  <span className="meteor-card-subdesc">
                    The Starways require an anchor — she needs your cosmic sight to forge the Guardian Shield and deflect the impact.
                  </span>
                </p>
              </div>

              {/* Call to Action Question */}
              <div className="meteor-card-question">
                <Sparkles size={14} className="question-sparkle" />
                <span>WILL YOU HELP NOVA PROTECT EARTH?</span>
                <Sparkles size={14} className="question-sparkle" />
              </div>

              {/* Action Buttons */}
              <div className="meteor-button-group">
                <motion.button 
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="meteor-btn-primary"
                  onClick={handleStartMission}
                >
                  <ShieldCheck size={18} />
                  <span>HELP NOVA</span>
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="meteor-btn-secondary"
                  onClick={handleWatchCinematic}
                >
                  <span>WATCH WHAT HAPPENS</span>
                </motion.button>
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

      {/* 5. Full-Screen Interactive Mission & Constellation Game (Phase 1 & Phase 2) */}
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

              {/* Countdown is shown ONLY during Phase 2 Real Challenge */}
              {!isDiverting && isChallengeActive && (
                <div className="meteor-countdown">
                  IMPACT IN: 00:{countdown < 10 ? `0${countdown}` : countdown}
                </div>
              )}
            </div>

            {/* Constellation Visual Instructions Header */}
            {!isDiverting && (
              <div className="constellation-instruction-header">
                <div className="constellation-inst-title">CONNECT THE STARS</div>
                <div className="constellation-inst-subtitle">TO REDIRECT THE METEOR</div>

                {/* Demonstration vs Real Challenge Badges */}
                {isDemonstrating ? (
                  <div className="demo-instruction-badge">
                    <span className="demo-badge-text">DEMONSTRATION: STAR 1 → STAR 2</span>
                    <span className="demo-badge-cycle">CYCLE {demoCycle} / 3</span>
                    <button 
                      className="demo-skip-btn"
                      onClick={startRealChallenge}
                      title="Skip tutorial and start immediately"
                    >
                      [ START NOW ]
                    </button>
                  </div>
                ) : (
                  <motion.div
                    key="challenge-hint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="constellation-inst-hint"
                  >
                    Follow the glowing path.
                  </motion.div>
                )}
              </div>
            )}

            {/* Earth & Meteor Canvas Stage */}
            <canvas ref={stageCanvasRef} className="meteor-space-stage" />

            {/* Constellation Connecting SVG Lines */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 22 }}>
              <defs>
                <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3.5" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Demonstration animated growing connection line (3 cycles) */}
              {isDemonstrating && (
                <g className="demo-connection-group">
                  <line
                    x1={`${CONSTELLATION_NODES[0].x}vw`}
                    y1={`${CONSTELLATION_NODES[0].y}vh`}
                    x2={`${CONSTELLATION_NODES[1].x}vw`}
                    y2={`${CONSTELLATION_NODES[1].y}vh`}
                    stroke="rgba(125, 226, 255, 0.25)"
                    strokeWidth="3"
                    strokeDasharray="4 4"
                  />
                  {demoT > 0 && (
                    <line
                      x1={`${CONSTELLATION_NODES[0].x}vw`}
                      y1={`${CONSTELLATION_NODES[0].y}vh`}
                      x2={`${CONSTELLATION_NODES[0].x + (CONSTELLATION_NODES[1].x - CONSTELLATION_NODES[0].x) * demoT}vw`}
                      y2={`${CONSTELLATION_NODES[0].y + (CONSTELLATION_NODES[1].y - CONSTELLATION_NODES[0].y) * demoT}vh`}
                      stroke="#7de2ff"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      filter="url(#starGlow)"
                    />
                  )}
                </g>
              )}

              {/* Real connected glowing lines (during challenge) */}
              {!isDemonstrating && CONSTELLATION_NODES.map((node, i) => {
                if (i === 0 || i > connectedCount) return null;
                const prevNode = CONSTELLATION_NODES[i - 1];
                return (
                  <line
                    key={`line-${i}`}
                    x1={`${prevNode.x}vw`}
                    y1={`${prevNode.y}vh`}
                    x2={`${node.x}vw`}
                    y2={`${node.y}vh`}
                    stroke="#7de2ff"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    filter="url(#starGlow)"
                    style={{
                      filter: 'drop-shadow(0 0 10px #7de2ff) drop-shadow(0 0 20px rgba(125, 226, 255, 0.9))',
                      transition: 'all 0.25s ease-out'
                    }}
                  />
                );
              })}
              {!isDemonstrating && connectedCount >= 5 && (
                <line
                  key="line-close"
                  x1={`${CONSTELLATION_NODES[4].x}vw`}
                  y1={`${CONSTELLATION_NODES[4].y}vh`}
                  x2={`${CONSTELLATION_NODES[0].x}vw`}
                  y2={`${CONSTELLATION_NODES[0].y}vh`}
                  stroke="#7de2ff"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  filter="url(#starGlow)"
                  style={{
                    filter: 'drop-shadow(0 0 10px #7de2ff) drop-shadow(0 0 20px rgba(125, 226, 255, 0.9))',
                    transition: 'all 0.25s ease-out'
                  }}
                />
              )}
            </svg>

            {/* Demonstration Arrow (Glides smoothly from Star 1 to Star 2) */}
            {isDemonstrating && (
              <div
                className="star-guiding-arrow demo-arrow"
                style={{
                  left: `${CONSTELLATION_NODES[0].x + (CONSTELLATION_NODES[1].x - CONSTELLATION_NODES[0].x) * demoT}vw`,
                  top: `${CONSTELLATION_NODES[0].y + (CONSTELLATION_NODES[1].y - CONSTELLATION_NODES[0].y) * demoT}vh`,
                  transition: 'none'
                }}
              >
                <div className="guiding-arrow-inner">
                  <svg width="26" height="34" viewBox="0 0 24 32" fill="none" className="guiding-arrow-svg">
                    <path
                      d="M12 2 L12 24 M12 24 L5 16 M12 24 L19 16"
                      stroke="#7de2ff"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            )}

            {/* Real Challenge Guiding Arrow pointing to current target star */}
            {!isDemonstrating && targetStarNode && (
              <motion.div
                key={`guiding-arrow-${connectedCount}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="star-guiding-arrow"
                style={{
                  left: `${targetStarNode.x}vw`,
                  top: `${targetStarNode.y}vh`
                }}
              >
                <div className="guiding-arrow-inner">
                  <svg width="24" height="32" viewBox="0 0 24 32" fill="none" className="guiding-arrow-svg">
                    <path
                      d="M12 2 L12 24 M12 24 L5 16 M12 24 L19 16"
                      stroke="#7de2ff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </motion.div>
            )}

            {/* Constellation Star Nodes */}
            {CONSTELLATION_NODES.map((node, idx) => {
              const isConnected = !isDemonstrating && idx < connectedCount;
              const isTarget = !isDemonstrating && idx === connectedCount && !isDiverting && countdown > 0;
              const isFuture = !isDemonstrating && idx > connectedCount;
              const isDemoStar1 = isDemonstrating && idx === 0;
              const isDemoStar2 = isDemonstrating && idx === 1;

              return (
                <div
                  key={node.id}
                  className={`constellation-star-node ${isConnected ? 'connected' : ''} ${isTarget ? 'target' : ''} ${isFuture ? 'future' : ''} ${isDemoStar1 || (isDemoStar2 && demoT > 0.8) ? 'step-focus' : ''}`}
                  style={{ left: `${node.x}vw`, top: `${node.y}vh` }}
                  onClick={() => handleStarClick(idx)}
                >
                  <div className="constellation-star-core" />
                  {(isDemoStar1 || (isDemoStar2 && demoT > 0.8)) && <div className="constellation-focus-ring" />}
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
