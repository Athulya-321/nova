import React, { useEffect, useRef } from 'react';

/**
 * AtmosphericStoryLayer
 * 
 * High-performance, transparent procedural canvas layer that breathes realistic,
 * content-specific life into each storybook chapter illustration.
 * 
 * Sized 100% within StoryArtworkStage (matching the 1536x1024 illustration).
 * Preserves the left text page (x < 0.50) completely clean and legible.
 * Smoothly cross-fades atmospheres when navigating between chapters.
 */
export default function AtmosphericStoryLayer({ slideId }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    currentSlide: slideId,
    prevSlide: null,
    transitionProgress: 1, // 0 = fully prev, 1 = fully current
    lastTime: performance.now(),
    particles: {}
  });

  // Handle slide changes with smooth cross-fade transition
  useEffect(() => {
    if (stateRef.current.currentSlide !== slideId) {
      stateRef.current.prevSlide = stateRef.current.currentSlide;
      stateRef.current.currentSlide = slideId;
      stateRef.current.transitionProgress = 0; // begin transition
    }
  }, [slideId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    // Set canvas resolution to container rect
    const updateSize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    // =========================================================================
    // PARTICLE FACTORIES & SIMULATIONS PER CHAPTER
    // =========================================================================

    // --- CHAPTER 1: THE WORLD OF VEYRA ---
    // Calm, magical, cosmic dust, tiny blue/violet motes, subtle Aurelis glow, waterfall mist
    const initCh1 = () => {
      const dust = Array.from({ length: 32 }, () => ({
        x: 0.53 + Math.random() * 0.44,
        y: 0.10 + Math.random() * 0.85,
        vx: (Math.random() - 0.5) * 0.00008,
        vy: -(0.00004 + Math.random() * 0.0001),
        radius: 1.2 + Math.random() * 1.8,
        baseAlpha: 0.2 + Math.random() * 0.45,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.012 + Math.random() * 0.02,
        color: Math.random() > 0.4 ? '255, 235, 175' : '175, 230, 255'
      }));

      const violetMotes = Array.from({ length: 20 }, () => ({
        x: 0.56 + Math.random() * 0.40,
        y: 0.20 + Math.random() * 0.65,
        vx: (Math.random() - 0.5) * 0.00006,
        vy: -(0.00003 + Math.random() * 0.00008),
        radius: 1.0 + Math.random() * 1.6,
        baseAlpha: 0.15 + Math.random() * 0.35,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.01 + Math.random() * 0.018,
        color: Math.random() > 0.5 ? '190, 160, 255' : '140, 210, 255'
      }));

      const stars = [
        { x: 0.58, y: 0.12, interval: 4.2, timer: 0.5 },
        { x: 0.64, y: 0.08, interval: 5.5, timer: 2.1 },
        { x: 0.70, y: 0.14, interval: 6.2, timer: 3.8 },
        { x: 0.88, y: 0.09, interval: 4.8, timer: 1.2 }
      ];

      return { dust, violetMotes, stars, aurelisPulse: 0 };
    };

    // --- CHAPTER 2: THE GUARDIAN AND KAELEN ---
    // Mentorship, magical blue particles, symbol resonance, training mana motes
    const initCh2 = () => {
      const mana = Array.from({ length: 28 }, () => ({
        x: 0.56 + Math.random() * 0.38,
        y: 0.40 + Math.random() * 0.55,
        vx: (Math.random() - 0.5) * 0.0001,
        vy: -(0.00006 + Math.random() * 0.00014),
        radius: 1.2 + Math.random() * 2.0,
        baseAlpha: 0.2 + Math.random() * 0.5,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.015 + Math.random() * 0.025,
        color: Math.random() > 0.3 ? '130, 225, 255' : '180, 150, 255'
      }));

      const runes = Array.from({ length: 4 }, (_, i) => ({
        x: 0.68 + (i * 0.05),
        y: 0.40 + (i * 0.04),
        size: 8 + Math.random() * 6,
        alpha: 0.2 + Math.random() * 0.4,
        rot: Math.random() * Math.PI,
        rotSpeed: 0.004 + Math.random() * 0.006
      }));

      return { mana, runes, resonancePulse: 0 };
    };

    // --- CHAPTER 3: THE FALL OF VEYRA ---
    // War, lightning storm, Vorak red pulses, flying embers, ash, dark smoke
    const initCh3 = () => {
      const embers = Array.from({ length: 45 }, () => ({
        x: 0.52 + Math.random() * 0.46,
        y: 0.68 + Math.random() * 0.30,
        vx: -(0.0002 + Math.random() * 0.0005), // drift up and left with war draft
        vy: -(0.0006 + Math.random() * 0.0014),
        radius: 1.2 + Math.random() * 2.4,
        alpha: 0.4 + Math.random() * 0.6,
        temp: Math.random(), // 1 = white-hot, 0 = dark red
        wobble: Math.random() * Math.PI * 2
      }));

      const ash = Array.from({ length: 24 }, () => ({
        x: 0.54 + Math.random() * 0.44,
        y: 0.15 + Math.random() * 0.80,
        vx: -(0.0001 + Math.random() * 0.0002),
        vy: 0.00015 + Math.random() * 0.0003,
        size: 1.5 + Math.random() * 2.5,
        alpha: 0.15 + Math.random() * 0.3,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02
      }));

      const smoke = Array.from({ length: 8 }, () => ({
        x: 0.72 + (Math.random() - 0.5) * 0.18,
        y: 0.45 + (Math.random() - 0.5) * 0.25,
        radius: 25 + Math.random() * 40,
        alpha: 0.04 + Math.random() * 0.07,
        vx: (Math.random() - 0.5) * 0.0001,
        vy: -0.00012
      }));

      return {
        embers,
        ash,
        smoke,
        // Irregular lightning state machine
        lightningTimer: 3.5, // seconds until next lightning
        lightningActive: 0,  // duration remaining
        lightningIntensity: 0,
        lightningSegments: [],
        redPulseTimer: 2.0,
        redPulseIntensity: 0
      };
    };

    // --- CHAPTER 4: THE LAST LIGHT OF AURELIS ---
    // Emotional sacrifice, living Starforged Core pulse, starlight ribbons, golden memory motes
    const initCh4 = () => {
      const coreMotes = Array.from({ length: 30 }, () => ({
        x: 0.712 + (Math.random() - 0.5) * 0.04,
        y: 0.592 + (Math.random() - 0.5) * 0.04,
        angle: Math.random() * Math.PI * 2,
        speed: 0.0002 + Math.random() * 0.0006,
        radius: 1.2 + Math.random() * 2.2,
        alpha: 0.3 + Math.random() * 0.7,
        life: Math.random(),
        color: Math.random() > 0.4 ? '255, 230, 160' : '140, 230, 255'
      }));

      const memoryDust = Array.from({ length: 22 }, () => ({
        x: 0.58 + Math.random() * 0.38,
        y: 0.18 + Math.random() * 0.75,
        vx: (Math.random() - 0.5) * 0.00006,
        vy: 0.00008 + Math.random() * 0.00014, // gently drifting downward
        radius: 1.2 + Math.random() * 2.0,
        alpha: 0.2 + Math.random() * 0.5,
        color: '255, 225, 140'
      }));

      return {
        coreMotes,
        memoryDust,
        corePulsePhase: 0, // 0 to 2PI (5.5s cycle)
        rippleRadius: 0
      };
    };

    // --- CHAPTER 5: THE GUARDIAN WITHOUT A HOME ---
    // Campfire living flame & leaping embers, warm hearth glow, cold cosmic void, shooting stars
    const initCh5 = () => {
      const embers = Array.from({ length: 24 }, () => ({
        x: 0.642 + (Math.random() - 0.5) * 0.03,
        y: 0.82 + Math.random() * 0.02,
        vx: (Math.random() - 0.45) * 0.0003,
        vy: -(0.0006 + Math.random() * 0.0012),
        radius: 1.0 + Math.random() * 2.0,
        alpha: 0.5 + Math.random() * 0.5,
        temp: Math.random()
      }));

      const smoke = Array.from({ length: 6 }, () => ({
        x: 0.642 + (Math.random() - 0.5) * 0.02,
        y: 0.78,
        radius: 12 + Math.random() * 16,
        alpha: 0.04 + Math.random() * 0.05,
        vy: -0.00018
      }));

      const novaAuraMotes = Array.from({ length: 14 }, () => ({
        x: 0.73 + (Math.random() - 0.5) * 0.12,
        y: 0.54 + (Math.random() - 0.5) * 0.12,
        radius: 1.2 + Math.random() * 1.8,
        alpha: 0.2 + Math.random() * 0.4,
        pulse: Math.random() * Math.PI * 2
      }));

      return {
        embers,
        smoke,
        novaAuraMotes,
        fireFlicker: 1,
        shootingStar: { active: false, x: 0, y: 0, vx: 0, vy: 0, len: 0, alpha: 0, timer: 4 }
      };
    };

    // --- CHAPTER 6: EARTH: THE WORLD SHE CHOSE ---
    // Twilight sunset radiance, meadow fireflies, city lights, orbital dust
    const initCh6 = () => {
      const fireflies = Array.from({ length: 18 }, () => ({
        x: 0.58 + Math.random() * 0.38,
        y: 0.65 + Math.random() * 0.30,
        vx: (Math.random() - 0.5) * 0.00015,
        vy: -(0.00005 + Math.random() * 0.00015),
        radius: 1.4 + Math.random() * 2.2,
        alpha: 0.1,
        blinkTimer: Math.random() * 3,
        blinkDuration: 1.2 + Math.random() * 1.5,
        color: '255, 235, 120'
      }));

      const orbitalDust = Array.from({ length: 16 }, () => ({
        x: 0.68 + Math.random() * 0.16,
        y: 0.10 + Math.random() * 0.16,
        radius: 1.0 + Math.random() * 1.6,
        alpha: 0.15 + Math.random() * 0.35,
        color: '140, 215, 255'
      }));

      return { fireflies, orbitalDust, sunsetBreath: 0 };
    };

    // --- CHAPTER 7: NOVA TODAY: THE STARBOUND GUARDIAN ---
    // Cosmic dust, twinkling nebula stars, tail prismatic shimmer, shooting meteors, hopeful starlight
    const initCh7 = () => {
      const cosmicDust = Array.from({ length: 36 }, () => ({
        x: 0.54 + Math.random() * 0.44,
        y: 0.08 + Math.random() * 0.88,
        vx: (Math.random() - 0.5) * 0.00008,
        vy: -(0.00004 + Math.random() * 0.0001),
        radius: 1.2 + Math.random() * 2.2,
        alpha: 0.2 + Math.random() * 0.5,
        color: Math.random() > 0.4 ? '180, 235, 255' : '220, 180, 255'
      }));

      const tailMotes = Array.from({ length: 16 }, () => ({
        x: 0.52 + Math.random() * 0.09,
        y: 0.65 + Math.random() * 0.14,
        radius: 1.2 + Math.random() * 2.0,
        alpha: 0.25 + Math.random() * 0.6,
        pulse: Math.random() * Math.PI * 2,
        color: Math.random() > 0.5 ? '125, 226, 255' : '190, 140, 255'
      }));

      return {
        cosmicDust,
        tailMotes,
        starwaySignalProgress: 0,
        crownStarPulse: 0,
        shootingStar: { active: false, x: 0, y: 0, vx: 0, vy: 0, len: 0, alpha: 0, timer: 5 }
      };
    };

    // Store particle states
    const particles = {
      1: initCh1(),
      2: initCh2(),
      3: initCh3(),
      4: initCh4(),
      5: initCh5(),
      6: initCh6(),
      7: initCh7()
    };
    stateRef.current.particles = particles;

    // =========================================================================
    // DRAWING HELPERS
    // =========================================================================

    const drawSoftGlow = (x, y, radius, color, alpha) => {
      if (alpha <= 0.005) return;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, `rgba(${color}, ${alpha})`);
      grad.addColorStop(0.5, `rgba(${color}, ${alpha * 0.4})`);
      grad.addColorStop(1, `rgba(${color}, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawDiamondStar = (x, y, size, color, alpha) => {
      if (alpha <= 0.005) return;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = `rgba(${color}, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size * 0.25, y);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x - size * 0.25, y);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x - size, y);
      ctx.lineTo(x, y + size * 0.25);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x, y - size * 0.25);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    // =========================================================================
    // CHAPTER RENDERERS
    // =========================================================================

    const renderCh1 = (p, W, H, layerAlpha) => {
      // 1. Subtle Aurelis solar breathing glow
      p.aurelisPulse += 0.015;
      const aurelisAlpha = (0.16 + Math.sin(p.aurelisPulse) * 0.08) * layerAlpha;
      drawSoftGlow(W * 0.79, H * 0.17, W * 0.14, '255, 225, 140', aurelisAlpha);

      // 2. Cosmic dust particles
      p.dust.forEach(d => {
        d.x += d.vx;
        d.y += d.vy;
        d.pulse += d.pulseSpeed;
        if (d.y < 0.05) d.y = 0.90;
        if (d.x < 0.52) d.x = 0.96;
        if (d.x > 0.98) d.x = 0.53;

        const a = d.baseAlpha * (0.6 + Math.sin(d.pulse) * 0.4) * layerAlpha;
        drawSoftGlow(d.x * W, d.y * H, d.radius * 2.5, d.color, a * 0.5);
        ctx.fillStyle = `rgba(${d.color}, ${a})`;
        ctx.beginPath();
        ctx.arc(d.x * W, d.y * H, d.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Violet magical particles around city & Nova
      p.violetMotes.forEach(m => {
        m.x += m.vx;
        m.y += m.vy;
        m.pulse += m.pulseSpeed;
        if (m.y < 0.15) m.y = 0.85;

        const a = m.baseAlpha * (0.6 + Math.sin(m.pulse) * 0.4) * layerAlpha;
        ctx.fillStyle = `rgba(${m.color}, ${a})`;
        ctx.beginPath();
        ctx.arc(m.x * W, m.y * H, m.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Subtle star twinkles
      p.stars.forEach(s => {
        s.timer += 0.016;
        if (s.timer > s.interval) s.timer = 0;
        const progress = s.timer / 1.5;
        if (progress < 1) {
          const starAlpha = Math.sin(progress * Math.PI) * 0.75 * layerAlpha;
          drawDiamondStar(s.x * W, s.y * H, 7, '255, 255, 255', starAlpha);
        }
      });
    };

    const renderCh2 = (p, W, H, layerAlpha) => {
      p.resonancePulse += 0.018;
      const resAlpha = (0.2 + Math.sin(p.resonancePulse) * 0.15) * layerAlpha;

      // Symbol resonance: Kaelen's heart gem and Nova's forehead star
      drawSoftGlow(W * 0.80, H * 0.515, 18, '125, 226, 255', resAlpha);
      drawSoftGlow(W * 0.645, H * 0.515, 14, '125, 226, 255', resAlpha);

      // Astrolabe sphere subtle aura
      drawSoftGlow(W * 0.74, H * 0.825, W * 0.06, '140, 210, 255', (0.15 + Math.sin(p.resonancePulse * 0.8) * 0.08) * layerAlpha);

      // Mana motes rising
      p.mana.forEach(m => {
        m.x += m.vx;
        m.y += m.vy;
        m.pulse += m.pulseSpeed;
        if (m.y < 0.35) m.y = 0.92;

        const a = m.baseAlpha * (0.6 + Math.sin(m.pulse) * 0.4) * layerAlpha;
        drawSoftGlow(m.x * W, m.y * H, m.radius * 2.2, m.color, a * 0.4);
        ctx.fillStyle = `rgba(${m.color}, ${a})`;
        ctx.beginPath();
        ctx.arc(m.x * W, m.y * H, m.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Subtle wisdom runes
      p.runes.forEach(r => {
        r.rot += r.rotSpeed;
        ctx.save();
        ctx.translate(r.x * W, r.y * H);
        ctx.rotate(r.rot);
        ctx.strokeStyle = `rgba(160, 220, 255, ${r.alpha * layerAlpha * 0.6})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(-r.size / 2, -r.size / 2, r.size, r.size);
        ctx.restore();
      });
    };

    const renderCh3 = (p, W, H, layerAlpha) => {
      // 1. Lightning Timing & Scene Flash
      p.lightningTimer -= 0.016;
      if (p.lightningTimer <= 0) {
        p.lightningActive = 0.16; // 160ms flash
        p.lightningIntensity = 0.8 + Math.random() * 0.2;
        p.lightningTimer = 4.5 + Math.random() * 5.5; // randomized irregular pause

        // Generate jagged lightning segments
        p.lightningSegments = [];
        let curX = W * (0.65 + Math.random() * 0.15);
        let curY = H * 0.05;
        p.lightningSegments.push({ x: curX, y: curY });
        for (let i = 0; i < 6; i++) {
          curX += (Math.random() - 0.45) * 28;
          curY += H * 0.045 + Math.random() * 12;
          p.lightningSegments.push({ x: curX, y: curY });
        }
      }

      if (p.lightningActive > 0) {
        p.lightningActive -= 0.016;
        const flashAlpha = (p.lightningActive / 0.16) * p.lightningIntensity * layerAlpha;

        // Realistic Scene Illumination Flash (soft screen over clouds & spires)
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `rgba(255, 140, 100, ${flashAlpha * 0.28})`;
        ctx.fillRect(W * 0.50, 0, W * 0.50, H);

        // Draw lightning bolt
        if (p.lightningSegments.length > 1) {
          ctx.strokeStyle = `rgba(255, 240, 220, ${flashAlpha})`;
          ctx.lineWidth = 2;
          ctx.shadowColor = '#ff4400';
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.moveTo(p.lightningSegments[0].x, p.lightningSegments[0].y);
          for (let i = 1; i < p.lightningSegments.length; i++) {
            ctx.lineTo(p.lightningSegments[i].x, p.lightningSegments[i].y);
          }
          ctx.stroke();
        }
        ctx.restore();
      }

      // 2. Vorak Fleet Red Energy Pulses
      p.redPulseTimer -= 0.016;
      if (p.redPulseTimer <= 0) {
        p.redPulseIntensity = 1;
        p.redPulseTimer = 2.8 + Math.random() * 2.2;
      }
      if (p.redPulseIntensity > 0) {
        p.redPulseIntensity -= 0.02;
        const pulseAlpha = Math.max(0, p.redPulseIntensity) * 0.35 * layerAlpha;
        drawSoftGlow(W * 0.64, H * 0.09, W * 0.08, '255, 30, 0', pulseAlpha);
      }

      // 3. Embers with realistic upward draft
      p.embers.forEach(e => {
        e.x += e.vx;
        e.y += e.vy;
        e.wobble += 0.05;
        e.x += Math.sin(e.wobble) * 0.0003;

        if (e.y < 0.10 || e.x < 0.50) {
          e.x = 0.54 + Math.random() * 0.44;
          e.y = 0.88 + Math.random() * 0.10;
        }

        const a = e.alpha * layerAlpha;
        const color = e.temp > 0.6 ? '255, 190, 60' : '255, 80, 10';
        drawSoftGlow(e.x * W, e.y * H, e.radius * 2, color, a * 0.6);
        ctx.fillStyle = `rgba(${color}, ${a})`;
        ctx.beginPath();
        ctx.arc(e.x * W, e.y * H, e.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Drifting Ash flakes
      p.ash.forEach(a => {
        a.x += a.vx;
        a.y += a.vy;
        a.rot += a.rotSpeed;
        if (a.y > 0.95 || a.x < 0.51) {
          a.x = 0.55 + Math.random() * 0.43;
          a.y = 0.15 + Math.random() * 0.2;
        }

        ctx.save();
        ctx.translate(a.x * W, a.y * H);
        ctx.rotate(a.rot);
        ctx.fillStyle = `rgba(180, 160, 150, ${a.alpha * layerAlpha * 0.5})`;
        ctx.fillRect(-a.size / 2, -a.size / 4, a.size, a.size / 2);
        ctx.restore();
      });
    };

    const renderCh4 = (p, W, H, layerAlpha) => {
      // 1. Living Starforged Core Breathing Cycle (5.5s loop)
      p.corePulsePhase += 0.019; // ~5.5s period
      const pulseNorm = (Math.sin(p.corePulsePhase) + 1) / 2; // 0 to 1
      const coreAlpha = (0.35 + pulseNorm * 0.55) * layerAlpha;
      const coreRadius = W * (0.025 + pulseNorm * 0.02);

      // Core radial glow
      drawSoftGlow(W * 0.712, H * 0.592, coreRadius * 2.5, '255, 230, 160', coreAlpha);
      drawSoftGlow(W * 0.712, H * 0.592, coreRadius, '125, 226, 255', coreAlpha * 0.9);

      // Concentric energy waves gently expanding outward
      p.rippleRadius += 0.4;
      if (p.rippleRadius > 60) p.rippleRadius = 5;
      const waveAlpha = (1 - p.rippleRadius / 60) * 0.35 * layerAlpha;
      ctx.save();
      ctx.strokeStyle = `rgba(140, 225, 255, ${waveAlpha})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(W * 0.712, H * 0.592, p.rippleRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 2. Flowing Starlight Ribbon from Core into Nova
      const startX = W * 0.712;
      const startY = H * 0.592;
      const endX = W * 0.635;
      const endY = H * 0.68;
      const ctrlX = W * 0.66;
      const ctrlY = H * 0.60;

      ctx.save();
      ctx.strokeStyle = `rgba(140, 230, 255, ${(0.25 + pulseNorm * 0.3) * layerAlpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
      ctx.stroke();
      ctx.restore();

      // 3. Core fragments drifting outward
      p.coreMotes.forEach(m => {
        m.life += 0.012;
        if (m.life > 1) {
          m.life = 0;
          m.x = 0.712;
          m.y = 0.592;
          m.angle = Math.random() * Math.PI * 2;
        }
        m.x += Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed;

        const a = Math.sin(m.life * Math.PI) * m.alpha * layerAlpha;
        ctx.fillStyle = `rgba(${m.color}, ${a})`;
        ctx.beginPath();
        ctx.arc(m.x * W, m.y * H, m.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Memory stardust drifting down
      p.memoryDust.forEach(d => {
        d.x += d.vx;
        d.y += d.vy;
        if (d.y > 0.88) d.y = 0.18;

        const a = d.alpha * layerAlpha;
        drawSoftGlow(d.x * W, d.y * H, d.radius * 2, d.color, a * 0.4);
        ctx.fillStyle = `rgba(${d.color}, ${a})`;
        ctx.beginPath();
        ctx.arc(d.x * W, d.y * H, d.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Nova forehead starlight flare
      drawDiamondStar(W * 0.642, H * 0.505, 8, '255, 255, 255', (0.5 + pulseNorm * 0.4) * layerAlpha);
    };

    const renderCh5 = (p, W, H, layerAlpha) => {
      // 1. Physically believable campfire flame & warm hearth glow
      p.fireFlicker += (Math.random() - 0.5) * 0.08;
      p.fireFlicker = Math.max(0.75, Math.min(1.25, p.fireFlicker));

      const fireX = W * 0.642;
      const fireY = H * 0.82;
      const hearthAlpha = (0.35 * p.fireFlicker) * layerAlpha;
      drawSoftGlow(fireX, fireY, W * 0.12 * p.fireFlicker, '255, 150, 40', hearthAlpha);

      // Living organic flame core
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const flameGrad = ctx.createRadialGradient(fireX, fireY - 4, 1, fireX, fireY - 6, 14 * p.fireFlicker);
      flameGrad.addColorStop(0, `rgba(255, 255, 220, ${0.9 * layerAlpha})`);
      flameGrad.addColorStop(0.4, `rgba(255, 180, 40, ${0.7 * layerAlpha})`);
      flameGrad.addColorStop(1, `rgba(255, 60, 10, 0)`);
      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.ellipse(fireX, fireY - 6, 8 * p.fireFlicker, 14 * p.fireFlicker, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2. Leaping embers rising from fire
      p.embers.forEach(e => {
        e.x += e.vx;
        e.y += e.vy;
        e.vx += (Math.random() - 0.5) * 0.00008; // draft wiggle

        if (e.y < 0.68) {
          e.x = 0.642 + (Math.random() - 0.5) * 0.025;
          e.y = 0.82;
          e.vy = -(0.0006 + Math.random() * 0.0012);
        }

        const a = e.alpha * layerAlpha;
        const color = e.temp > 0.5 ? '255, 200, 60' : '255, 90, 20';
        ctx.fillStyle = `rgba(${color}, ${a})`;
        ctx.beginPath();
        ctx.arc(e.x * W, e.y * H, e.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Delicate campfire smoke
      p.smoke.forEach(s => {
        s.y += s.vy;
        s.radius += 0.15;
        if (s.y < 0.60) {
          s.y = 0.78;
          s.radius = 10;
        }
        drawSoftGlow(s.x * W, s.y * H, s.radius, '200, 190, 210', s.alpha * layerAlpha);
      });

      // 4. Nova's warm protective aura motes around child
      p.novaAuraMotes.forEach(m => {
        m.pulse += 0.02;
        const a = m.alpha * (0.6 + Math.sin(m.pulse) * 0.4) * layerAlpha;
        drawSoftGlow(m.x * W, m.y * H, m.radius * 2.5, '140, 220, 255', a * 0.5);
      });

      // 5. Cold night sky shooting star
      const ss = p.shootingStar;
      ss.timer -= 0.016;
      if (ss.timer <= 0 && !ss.active) {
        ss.active = true;
        ss.x = W * (0.66 + Math.random() * 0.15);
        ss.y = H * (0.05 + Math.random() * 0.10);
        ss.vx = 4 + Math.random() * 3;
        ss.vy = 2.5 + Math.random() * 2;
        ss.len = 60;
        ss.alpha = 1;
        ss.timer = 5 + Math.random() * 5;
      }
      if (ss.active) {
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.alpha -= 0.025;
        if (ss.alpha <= 0) ss.active = false;

        ctx.save();
        ctx.strokeStyle = `rgba(255, 255, 255, ${ss.alpha * layerAlpha * 0.8})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - ss.vx * 8, ss.y - ss.vy * 8);
        ctx.stroke();
        ctx.restore();
      }
    };

    const renderCh6 = (p, W, H, layerAlpha) => {
      p.sunsetBreath += 0.014;
      const sunAlpha = (0.28 + Math.sin(p.sunsetBreath) * 0.12) * layerAlpha;

      // Setting Sun bloom & horizontal rays
      drawSoftGlow(W * 0.762, H * 0.452, W * 0.08, '255, 180, 60', sunAlpha);

      // Twilight fireflies
      p.fireflies.forEach(f => {
        f.x += f.vx;
        f.y += f.vy;
        f.blinkTimer += 0.016;
        if (f.blinkTimer > f.blinkDuration) f.blinkTimer = 0;
        if (f.y < 0.62) f.y = 0.95;

        const a = Math.sin((f.blinkTimer / f.blinkDuration) * Math.PI) * 0.75 * layerAlpha;
        drawSoftGlow(f.x * W, f.y * H, f.radius * 2.2, f.color, a * 0.5);
        ctx.fillStyle = `rgba(${f.color}, ${a})`;
        ctx.beginPath();
        ctx.arc(f.x * W, f.y * H, f.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Earth orbital stardust
      p.orbitalDust.forEach(o => {
        drawSoftGlow(o.x * W, o.y * H, o.radius * 2, o.color, o.alpha * layerAlpha * 0.4);
      });
    };

    const renderCh7 = (p, W, H, layerAlpha) => {
      // 1. Slow-moving cosmic dust
      p.cosmicDust.forEach(d => {
        d.x += d.vx;
        d.y += d.vy;
        if (d.y < 0.05) d.y = 0.92;
        if (d.x < 0.52) d.x = 0.96;

        const a = d.alpha * layerAlpha;
        drawSoftGlow(d.x * W, d.y * H, d.radius * 2.4, d.color, a * 0.4);
        ctx.fillStyle = `rgba(${d.color}, ${a})`;
        ctx.beginPath();
        ctx.arc(d.x * W, d.y * H, d.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Crown Diamond Starlight Flare on Nova
      p.crownStarPulse += 0.022;
      const crownAlpha = (0.55 + Math.sin(p.crownStarPulse) * 0.35) * layerAlpha;
      drawDiamondStar(W * 0.652, H * 0.508, 10, '255, 255, 255', crownAlpha);
      drawSoftGlow(W * 0.652, H * 0.508, 16, '125, 226, 255', crownAlpha * 0.7);

      // 3. Prismatic starlight rising from crystal tails
      p.tailMotes.forEach(m => {
        m.pulse += 0.02;
        const a = m.alpha * (0.6 + Math.sin(m.pulse) * 0.4) * layerAlpha;
        drawSoftGlow(m.x * W, m.y * H, m.radius * 2.2, m.color, a * 0.5);
      });

      // 4. Starway travelling signal packets along arches
      p.starwaySignalProgress += 0.003;
      if (p.starwaySignalProgress > 1) p.starwaySignalProgress = 0;
      const sigX = W * (0.60 + p.starwaySignalProgress * 0.28);
      const sigY = H * (0.28 + Math.sin(p.starwaySignalProgress * Math.PI) * -0.06);
      drawSoftGlow(sigX, sigY, 10, '125, 226, 255', 0.8 * layerAlpha);
      drawDiamondStar(sigX, sigY, 5, '255, 255, 255', 0.9 * layerAlpha);

      // 5. Deep space shooting meteor
      const ss = p.shootingStar;
      ss.timer -= 0.016;
      if (ss.timer <= 0 && !ss.active) {
        ss.active = true;
        ss.x = W * (0.74 + Math.random() * 0.16);
        ss.y = H * (0.08 + Math.random() * 0.08);
        ss.vx = 4.5;
        ss.vy = 2.4;
        ss.alpha = 1;
        ss.timer = 6 + Math.random() * 5;
      }
      if (ss.active) {
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.alpha -= 0.02;
        if (ss.alpha <= 0) ss.active = false;

        ctx.save();
        ctx.strokeStyle = `rgba(255, 255, 255, ${ss.alpha * layerAlpha * 0.85})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - ss.vx * 8, ss.y - ss.vy * 8);
        ctx.stroke();
        ctx.restore();
      }
    };

    const chapterRenderers = {
      1: renderCh1,
      2: renderCh2,
      3: renderCh3,
      4: renderCh4,
      5: renderCh5,
      6: renderCh6,
      7: renderCh7
    };

    // =========================================================================
    // MAIN ANIMATION LOOP
    // =========================================================================

    const loop = () => {
      const W = canvas.width / (window.devicePixelRatio || 1);
      const H = canvas.height / (window.devicePixelRatio || 1);

      ctx.clearRect(0, 0, W, H);

      const state = stateRef.current;

      // Progress smooth transition
      if (state.transitionProgress < 1) {
        state.transitionProgress = Math.min(1, state.transitionProgress + 0.022); // ~800ms transition
      }

      const curAlpha = state.transitionProgress;
      const prevAlpha = 1 - state.transitionProgress;

      // Draw previous chapter fading out
      if (prevAlpha > 0.01 && state.prevSlide && chapterRenderers[state.prevSlide]) {
        chapterRenderers[state.prevSlide](particles[state.prevSlide], W, H, prevAlpha);
      }

      // Draw current chapter fading in
      if (curAlpha > 0.01 && state.currentSlide && chapterRenderers[state.currentSlide]) {
        chapterRenderers[state.currentSlide](particles[state.currentSlide], W, H, curAlpha);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
      }}
      aria-hidden="true"
    />
  );
}
