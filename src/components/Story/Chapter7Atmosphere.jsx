import React, { useEffect, useRef } from 'react';

/**
 * Chapter7Atmosphere
 * 
 * Noticeable, cinematic fantasy foreground atmospheric animation for Chapter 7:
 * Nova Today — The Starbound Guardian.
 * 
 * Designed to capture the wonder, majesty, and hope of Nova watching over the cosmos:
 * 1. Living Nova:
 *    - Noticeable natural breathing expansion
 *    - Expressive forward-facing eye blinking with radiant starlight pupil glints
 *    - Gentle ear movements & micro-tilt
 *    - Luminous forehead star pulsing with a crisp diamond glint
 *    - Flowing crystalline tail with visible traveling starlight waves and floating sparks
 * 2. Cosmic Starways & Sky:
 *    - Starway energy signals gliding along the light bridges connecting floating worlds
 *    - Twinkling constellations and periodic graceful shooting stars streaking across deep space
 * 3. Living World & Environment:
 *    - Liquid starlight waterfalls visibly streaming downward from floating islands
 *    - Slowly rotating celestial ring in the sky with glints
 *    - Warm lantern flame flickering on the right stone battlement with rising sparks
 *    - Mystical star-crystal on the pedestal book glowing with arcane knowledge
 *    - Faint magical starlight reflections sweeping across the marble terrace star chart
 * 4. Multi-Depth Floating Stardust:
 *    - Noticeable near particles (cyan, violet, gold, diamond white) drifting across the foreground
 *    - Midground & distant shimmering cosmic dust motes
 * 5. Complete Text Protection:
 *    - Left page (x < 0.50) is 100% clean, static, and readable
 *    - No extreme screen flashes or harsh shockwaves
 */
export default function Chapter7Atmosphere() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

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
    // 1. MULTI-DEPTH CELESTIAL STARDUST PARTICLES
    // =========================================================================
    const particles = [];
    const colors = [
      { rgb: '100, 225, 255', hex: '#64e1ff' }, // Electric cyan
      { rgb: '210, 150, 255', hex: '#d296ff' }, // Royal violet
      { rgb: '255, 235, 120', hex: '#ffeb78' }, // Warm golden starlight
      { rgb: '255, 255, 255', hex: '#ffffff' }  // Diamond white
    ];

    // Near floating particles (clearly visible, drifting gently across foreground)
    for (let i = 0; i < 16; i++) {
      const c = colors[i % colors.length];
      particles.push({
        depth: 1.0,
        x: 0.53 + Math.random() * 0.44,
        y: 0.12 + Math.random() * 0.80,
        vx: (Math.random() - 0.45) * 0.00025,
        vy: -(0.00015 + Math.random() * 0.00028),
        radius: 2.8 + Math.random() * 2.0, // 2.8px - 4.8px
        baseAlpha: 0.65 + Math.random() * 0.30,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.02 + Math.random() * 0.03,
        color: c.rgb,
        glowHex: c.hex
      });
    }

    // Midground stardust
    for (let i = 0; i < 26; i++) {
      const c = colors[i % colors.length];
      particles.push({
        depth: 0.6,
        x: 0.52 + Math.random() * 0.46,
        y: 0.08 + Math.random() * 0.86,
        vx: (Math.random() - 0.48) * 0.00016,
        vy: -(0.0001 + Math.random() * 0.00018),
        radius: 1.6 + Math.random() * 1.2,
        baseAlpha: 0.55 + Math.random() * 0.35,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.015 + Math.random() * 0.025,
        color: c.rgb,
        glowHex: c.hex
      });
    }

    // =========================================================================
    // 2. WATERFALL FLOW PARTICLES (Liquid Starlight Flowing Downward)
    // =========================================================================
    const waterfalls = Array.from({ length: 18 }, () => ({
      x: 0.605 + (Math.random() - 0.5) * 0.018,
      y: 0.31 + Math.random() * 0.12,
      vy: 0.0004 + Math.random() * 0.0005,
      radius: 1.4 + Math.random() * 1.6,
      alpha: 0.45 + Math.random() * 0.35
    }));

    // =========================================================================
    // 3. SHOOTING STARS (Graceful Cosmic Streaks)
    // =========================================================================
    const shootingStars = [
      { active: false, x: 0, y: 0, vx: 0, vy: 0, alpha: 0, timer: 2.5 },
      { active: false, x: 0, y: 0, vx: 0, vy: 0, alpha: 0, timer: 6.5 }
    ];

    // =========================================================================
    // 4. STARWAY LIGHT BEAMS (Packets of starlight traveling across bridges)
    // =========================================================================
    const starwaySignals = Array.from({ length: 3 }, (_, i) => ({
      progress: i * 0.33,
      speed: 0.0035 + Math.random() * 0.002,
      color: i === 1 ? '210, 160, 255' : '120, 230, 255'
    }));

    // =========================================================================
    // 5. LANTERN SPARK MOTES
    // =========================================================================
    const lanternSparks = Array.from({ length: 6 }, () => ({
      x: 0.945 + (Math.random() - 0.5) * 0.015,
      y: 0.72 + Math.random() * 0.04,
      vx: (Math.random() - 0.6) * 0.0002,
      vy: -(0.0003 + Math.random() * 0.0004),
      radius: 1.0 + Math.random() * 1.2,
      alpha: 0.8,
      life: Math.random()
    }));

    // Blinking timers
    let novaBlinkTimer = 3.6;
    let novaBlinking = 0;

    // Helper: Soft radial glow
    const drawSoftGlow = (x, y, radius, color, alpha) => {
      if (alpha <= 0.005 || radius <= 0) return;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, `rgba(${color}, ${alpha})`);
      grad.addColorStop(0.45, `rgba(${color}, ${alpha * 0.5})`);
      grad.addColorStop(1, `rgba(${color}, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // Helper: Crisp 4-point diamond sparkle
    const drawDiamondStar = (x, y, size, alpha, color = '255, 255, 255') => {
      if (alpha <= 0.01 || size <= 0) return;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      if (color.startsWith('#')) {
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
      } else {
        ctx.fillStyle = `rgba(${color}, ${alpha})`;
      }
      ctx.shadowColor = '#64dcff';
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size * 0.22, y);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x - size * 0.22, y);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x - size, y);
      ctx.lineTo(x, y + size * 0.22);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x, y - size * 0.22);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, size * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // =========================================================================
    // MAIN RENDER LOOP
    // =========================================================================
    let startTime = performance.now();

    const loop = (now) => {
      const W = canvas.width / (window.devicePixelRatio || 1);
      const H = canvas.height / (window.devicePixelRatio || 1);

      ctx.clearRect(0, 0, W, H);

      const elapsed = (now - startTime) / 1000;

      // -----------------------------------------------------------------------
      // 1. LIVING NOVA (Natural breathing, expressive blinking, star pulse, ears)
      // -----------------------------------------------------------------------
      const novaBreath = Math.sin(elapsed * 1.5) * 1.6; // noticeable 1.6px breathing rise/fall
      const headTilt = Math.sin(elapsed * 1.1) * 1.2;

      // Forehead Star Crown at x: 0.652, y: 0.508
      const crownX = W * 0.652;
      const crownY = H * 0.508 + novaBreath + headTilt;
      const starPulse = (Math.sin(elapsed * 2.5) + 1) / 2;
      const starSize = 10 + starPulse * 5; // 10px - 15px noticeable diamond star

      drawDiamondStar(crownX, crownY, starSize, 0.85 + starPulse * 0.15, '140, 235, 255');
      drawSoftGlow(crownX, crownY, 22, '100, 220, 255', 0.55 + starPulse * 0.25);

      // Nova Expressive Forward-Facing Eye Blinking
      // Left eye: x: 0.638, y: 0.552 | Right eye: x: 0.678, y: 0.548
      novaBlinkTimer -= 0.016;
      if (novaBlinkTimer <= 0) {
        novaBlinking = 0.13; // 130ms blink
        novaBlinkTimer = 3.5 + Math.random() * 2.2;
      }
      if (novaBlinking > 0) {
        novaBlinking -= 0.016;
        const bProgress = Math.sin((novaBlinking / 0.13) * Math.PI);

        ctx.save();
        ctx.fillStyle = '#f2f5fa';
        ctx.shadowColor = '#d0d8e8';
        ctx.shadowBlur = 4;

        // Left eye
        const eLX = W * 0.638;
        const eLY = H * 0.552 + novaBreath + headTilt;
        ctx.beginPath();
        ctx.ellipse(eLX, eLY, 8.5, 6.5 * bProgress, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#2c3345';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(eLX, eLY + (1 - bProgress) * 2, 7.5, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Right eye
        const eRX = W * 0.678;
        const eRY = H * 0.548 + novaBreath + headTilt;
        ctx.beginPath();
        ctx.ellipse(eRX, eRY, 8.5, 6.5 * bProgress, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#2c3345';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(eRX, eRY + (1 - bProgress) * 2, 7.5, 0.2, Math.PI - 0.2);
        ctx.stroke();

        ctx.restore();
      } else {
        // Deep starlight glints in pupils
        drawDiamondStar(W * 0.638 - 2, H * 0.552 - 2 + novaBreath + headTilt, 3.5, 0.90, '#ffffff');
        drawDiamondStar(W * 0.678 - 2, H * 0.548 - 2 + novaBreath + headTilt, 3.5, 0.90, '#ffffff');
      }

      // Ear micro-movements
      const earWiggle = Math.sin(elapsed * 3.8) * 2.2;
      drawSoftGlow(W * 0.60 + earWiggle, H * 0.47, 10, '255, 245, 220', 0.25);
      drawSoftGlow(W * 0.70 - earWiggle, H * 0.46, 10, '255, 245, 220', 0.25);

      // -----------------------------------------------------------------------
      // 2. FLOWING CRYSTALLINE TAIL (Noticeable bioluminescence, light waves & sparks)
      // -----------------------------------------------------------------------
      const tailSway = Math.sin(elapsed * 1.4) * 5; // gentle natural tail sway
      const tailX = W * 0.555 + tailSway;
      const tailY = H * 0.70;
      const tailPulse = (Math.sin(elapsed * 2.0) + 1) / 2;
      const tailR = W * 0.085;

      // Rich bioluminescent blue-purple aura
      drawSoftGlow(tailX, tailY, tailR * 1.3, '70, 180, 255', 0.45 + tailPulse * 0.25);
      drawSoftGlow(tailX, tailY, tailR * 0.9, '185, 125, 255', 0.45 + tailPulse * 0.20);

      // Visible starlight wave traveling along the tail feathers
      const tWave = (elapsed * 1.2) % 1;
      const wY = tailY + (tWave - 0.5) * (H * 0.10);
      const wX = tailX + Math.sin(tWave * Math.PI) * 20;
      drawSoftGlow(wX, wY, 15, '240, 250, 255', Math.sin(tWave * Math.PI) * 0.75);
      drawDiamondStar(wX, wY, 8, Math.sin(tWave * Math.PI) * 0.85, '#ffffff');

      // 4 floating starlight sparks released from tail into surrounding air
      for (let s = 0; s < 4; s++) {
        const spPhase = (elapsed * 1.8 + s * 0.8) % 1;
        const spX = tailX + (Math.sin(elapsed + s * 1.6) * 26);
        const spY = tailY - (spPhase * 45);
        drawDiamondStar(spX, spY, 3.8, (1 - spPhase) * 0.85, '140, 235, 255');
      }

      // -----------------------------------------------------------------------
      // 3. COSMIC STARWAYS & CELESTIAL SKY
      // -----------------------------------------------------------------------
      // Shooting stars
      shootingStars.forEach((ss, idx) => {
        ss.timer -= 0.016;
        if (ss.timer <= 0 && !ss.active) {
          ss.active = true;
          ss.x = W * (0.66 + idx * 0.14 + Math.random() * 0.08);
          ss.y = H * (0.04 + idx * 0.06);
          ss.vx = 4.8;
          ss.vy = 2.4;
          ss.alpha = 0.95;
          ss.timer = 5.0 + Math.random() * 4.0;
        }
        if (ss.active) {
          ss.x += ss.vx;
          ss.y += ss.vy;
          ss.alpha -= 0.022;
          if (ss.alpha <= 0) ss.active = false;

          ctx.save();
          ctx.strokeStyle = `rgba(255, 255, 255, ${ss.alpha * 0.85})`;
          ctx.lineWidth = 1.6;
          ctx.shadowColor = '#64dcff';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.moveTo(ss.x, ss.y);
          ctx.lineTo(ss.x - ss.vx * 8, ss.y - ss.vy * 8);
          ctx.stroke();
          ctx.restore();
        }
      });

      // Starway Energy Signals gliding along sky bridges
      starwaySignals.forEach(sig => {
        sig.progress += sig.speed;
        if (sig.progress > 1) sig.progress = 0;

        const p = sig.progress;
        const sigX = W * (0.58 + p * 0.32);
        const sigY = H * (0.26 + Math.sin(p * Math.PI) * -0.07);
        const a = Math.sin(p * Math.PI) * 0.85;

        drawSoftGlow(sigX, sigY, 14, sig.color, a * 0.65);
        drawDiamondStar(sigX, sigY, 6, a * 0.85, '#ffffff');
      });

      // Twinkling celestial constellation stars in sky
      const constellations = [
        { x: 0.62, y: 0.12, size: 5, phase: 0 },
        { x: 0.73, y: 0.08, size: 6, phase: 1.5 },
        { x: 0.84, y: 0.15, size: 5, phase: 3.0 },
        { x: 0.91, y: 0.10, size: 5.5, phase: 4.5 }
      ];
      constellations.forEach(st => {
        const cAlpha = 0.5 + Math.sin(elapsed * 1.8 + st.phase) * 0.4;
        drawDiamondStar(W * st.x, H * st.y, st.size, cAlpha * 0.85, '220, 240, 255');
      });

      // -----------------------------------------------------------------------
      // 4. FLOATING CITY: WATERFALLS & SKY RING
      // -----------------------------------------------------------------------
      // Waterfalls flowing downward
      waterfalls.forEach(wf => {
        wf.y += wf.vy;
        if (wf.y > 0.43) wf.y = 0.31;
        drawSoftGlow(wf.x * W, wf.y * H, wf.radius * 2.2, '180, 235, 255', wf.alpha * 0.65);
      });

      // Rotating celestial ring at x: 0.77, y: 0.22
      const ringAngle = elapsed * 0.16;
      ctx.save();
      ctx.strokeStyle = 'rgba(140, 220, 255, 0.40)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(W * 0.77, H * 0.22, 36, 12, ringAngle, 0, Math.PI * 2);
      ctx.stroke();
      drawDiamondStar(W * 0.77 + Math.cos(ringAngle) * 36, H * 0.22 + Math.sin(ringAngle) * 12, 5, 0.8, '#ffffff');
      ctx.restore();

      // -----------------------------------------------------------------------
      // 5. FOREGROUND PROPS & AMBIENT FLOOR REFLECTIONS
      // -----------------------------------------------------------------------
      // Book star crystal on pedestal at x: 0.82, y: 0.575
      const crystalPulse = (Math.sin(elapsed * 2.2) + 1) / 2;
      drawDiamondStar(W * 0.82, H * 0.575, 8 + crystalPulse * 3, 0.65 + crystalPulse * 0.25, '150, 230, 255');
      drawSoftGlow(W * 0.82, H * 0.575, 18, '130, 220, 255', 0.50 + crystalPulse * 0.25);

      // Lantern on right stone battlement at x: 0.945, y: 0.73
      const lanternFlame = 0.88 + Math.sin(elapsed * 6.5) * 0.12;
      drawSoftGlow(W * 0.945, H * 0.73, 24 * lanternFlame, '255, 190, 75', 0.60 * lanternFlame);
      drawSoftGlow(W * 0.945, H * 0.73, 12 * lanternFlame, '255, 235, 170', 0.75 * lanternFlame);

      // Lantern rising sparks
      lanternSparks.forEach(sp => {
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.life += 0.018;
        if (sp.life > 1) {
          sp.life = 0;
          sp.x = 0.945 + (Math.random() - 0.5) * 0.015;
          sp.y = 0.72 + Math.random() * 0.02;
        }
        const a = Math.sin(sp.life * Math.PI) * sp.alpha;
        drawDiamondStar(sp.x * W, sp.y * H, sp.radius * 2, a * 0.85, '255, 215, 110');
      });

      // Terrace floor star chart starlight pulse at x: 0.72, y: 0.88
      const floorChartPulse = (Math.sin(elapsed * 2.0) + 1) / 2;
      drawDiamondStar(W * 0.72, H * 0.88, 6.5, 0.55 + floorChartPulse * 0.30, '#ffe378');

      // Moving magical reflections sweeping across the terrace floor
      const sweepX = W * (0.64 + Math.sin(elapsed * 0.75) * 0.15);
      drawSoftGlow(sweepX, H * 0.87, W * 0.12, '90, 210, 255', 0.20);

      // -----------------------------------------------------------------------
      // 6. MULTI-DEPTH FLOATING STARDUST PARTICLES
      // -----------------------------------------------------------------------
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.twinklePhase += p.twinkleSpeed;

        if (p.y < 0.06) p.y = 0.92;
        if (p.x < 0.52) p.x = 0.96;
        if (p.x > 0.98) p.x = 0.53;

        const px = p.x * W;
        const py = p.y * H;
        const a = p.baseAlpha * (0.7 + Math.sin(p.twinklePhase) * 0.3);

        drawSoftGlow(px, py, p.radius * 2.5, p.color, a * 0.55);

        ctx.save();
        ctx.shadowColor = p.glowHex;
        ctx.shadowBlur = 8;
        ctx.fillStyle = `rgba(${p.color}, ${Math.min(1, a)})`;
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

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
