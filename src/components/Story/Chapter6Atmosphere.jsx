import React, { useEffect, useRef } from 'react';

/**
 * Chapter6Atmosphere
 * 
 * Cinematic foreground atmospheric animation for Chapter 6: Earth - The World She Chose.
 * Features:
 * 1. Clearly visible multi-depth floating light particles (warm gold, blue, violet)
 * 2. Gentle floating flower petals drifting in the breeze
 * 3. Subtle swaying leaf & foliage wind highlights around the arch edges
 * 4. Living Nova: slow breathing, gentle ear movement, pulsing forehead star, shimmering crystalline tail, tail sparks
 * 5. Living Human: gentle breathing, hair breeze movement, subtle profile blink
 * 6. Cosmic sky: twinkling stars, occasional shooting star, pulsing Earth halo
 * 7. Sunset glow: slow cinematic sunset-light pulse along the horizon
 * 8. Lantern: warm flickering flame and rising light particles on the stone wall
 * 9. Magical connection: delicate star-particle stream bridging Nova and the human
 * 10. Cinematic depth with near, mid, and distant particle planes
 * 11. Preserves static artwork underneath; left-page text (x < 0.50) is 100% clean and readable
 */
export default function Chapter6Atmosphere() {
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
    // 1. FLOATING LIGHT PARTICLES (Warm-Gold, Electric Cyan, Neon Violet)
    // =========================================================================
    const particles = [];
    const particleColors = [
      { rgb: '255, 215, 80', hex: '#ffd750' },  // Warm-gold
      { rgb: '100, 220, 255', hex: '#64dcff' }, // Electric cyan
      { rgb: '215, 140, 255', hex: '#d78cff' }, // Violet
      { rgb: '255, 255, 255', hex: '#ffffff' }  // White starlight
    ];

    // Near particles (large, gentle blur, passing in front of characters)
    for (let i = 0; i < 16; i++) {
      const c = particleColors[i % particleColors.length];
      particles.push({
        depth: 1.0,
        x: 0.53 + Math.random() * 0.44,
        y: 0.15 + Math.random() * 0.80,
        vx: (Math.random() - 0.42) * 0.00028,
        vy: -(0.00015 + Math.random() * 0.0003),
        radius: 3.2 + Math.random() * 2.2,
        baseAlpha: 0.70 + Math.random() * 0.28,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.02 + Math.random() * 0.03,
        color: c.rgb,
        glowHex: c.hex
      });
    }

    // Midground particles
    for (let i = 0; i < 28; i++) {
      const c = particleColors[i % particleColors.length];
      particles.push({
        depth: 0.65,
        x: 0.52 + Math.random() * 0.46,
        y: 0.10 + Math.random() * 0.85,
        vx: (Math.random() - 0.45) * 0.00018,
        vy: -(0.0001 + Math.random() * 0.0002),
        radius: 2.0 + Math.random() * 1.4,
        baseAlpha: 0.60 + Math.random() * 0.35,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.015 + Math.random() * 0.025,
        color: c.rgb,
        glowHex: c.hex
      });
    }

    // Distant motes
    for (let i = 0; i < 30; i++) {
      const c = particleColors[i % particleColors.length];
      particles.push({
        depth: 0.35,
        x: 0.52 + Math.random() * 0.46,
        y: 0.06 + Math.random() * 0.90,
        vx: (Math.random() - 0.5) * 0.00008,
        vy: -(0.00005 + Math.random() * 0.0001),
        radius: 1.2 + Math.random() * 0.9,
        baseAlpha: 0.50 + Math.random() * 0.4,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.012 + Math.random() * 0.02,
        color: c.rgb,
        glowHex: c.hex
      });
    }

    // =========================================================================
    // 2. GENTLE FLOATING FLOWER PETALS
    // =========================================================================
    const petals = Array.from({ length: 8 }, (_, i) => ({
      x: 0.52 + Math.random() * 0.44,
      y: 0.08 + (i * 0.11),
      vx: 0.00018 + Math.random() * 0.00022,
      vy: 0.00022 + Math.random() * 0.0003,
      angle: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.025,
      flutterPhase: Math.random() * Math.PI * 2,
      length: 12 + Math.random() * 6,
      width: 7 + Math.random() * 4,
      alpha: 0.70 + Math.random() * 0.25,
      color: '255, 175, 215'
    }));

    // =========================================================================
    // 3. MAGICAL CONNECTION STREAM (Between Nova and the Human)
    // =========================================================================
    const connectionMotes = Array.from({ length: 12 }, (_, i) => ({
      progress: i / 12,
      speed: 0.003 + Math.random() * 0.002,
      yOffset: (Math.random() - 0.5) * 0.025,
      radius: 1.4 + Math.random() * 1.6,
      alpha: 0.6 + Math.random() * 0.4,
      color: Math.random() > 0.4 ? '255, 230, 140' : '140, 225, 255'
    }));

    // =========================================================================
    // 4. LANTERN SPARKS
    // =========================================================================
    const lanternSparks = Array.from({ length: 7 }, () => ({
      x: 0.88 + (Math.random() - 0.5) * 0.015,
      y: 0.80,
      vx: (Math.random() - 0.5) * 0.00015,
      vy: -(0.0004 + Math.random() * 0.0007),
      radius: 1.2 + Math.random() * 1.5,
      alpha: 0.7 + Math.random() * 0.3
    }));

    // =========================================================================
    // 5. SKY SHOOTING STAR
    // =========================================================================
    const shootingStar = {
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      alpha: 0,
      timer: 4.5
    };

    // Blinking timers
    let humanBlinkTimer = 3.5;
    let humanBlinking = 0;
    let novaBlinkTimer = 4.2;
    let novaBlinking = 0;

    // Drawing helpers
    const drawSoftGlow = (x, y, radius, color, alpha) => {
      if (alpha <= 0.01) return;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, `rgba(${color}, ${alpha})`);
      grad.addColorStop(0.5, `rgba(${color}, ${alpha * 0.55})`);
      grad.addColorStop(0.85, `rgba(${color}, ${alpha * 0.15})`);
      grad.addColorStop(1, `rgba(${color}, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawDiamondStar = (x, y, size, alpha, color = '255, 255, 255') => {
      if (alpha <= 0.01) return;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = `rgba(${color}, ${alpha})`;
      ctx.shadowColor = '#ffe388';
      ctx.shadowBlur = 14;

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
    // MAIN ANIMATION LOOP
    // =========================================================================
    let startTime = performance.now();

    const loop = (now) => {
      const W = canvas.width / (window.devicePixelRatio || 1);
      const H = canvas.height / (window.devicePixelRatio || 1);

      ctx.clearRect(0, 0, W, H);

      const elapsed = (now - startTime) / 1000;

      // -----------------------------------------------------------------------
      // 1. SUNSET GLOW PULSE (Horizon x: 0.762, y: 0.452)
      // -----------------------------------------------------------------------
      const sunX = W * 0.762;
      const sunY = H * 0.452;
      const sunsetPulse = (Math.sin(elapsed * 0.8) + 1) / 2; // slow, breathing light pulse
      const sunAlpha = 0.50 + sunsetPulse * 0.40;
      const sunRadius = W * (0.10 + sunsetPulse * 0.04);

      drawSoftGlow(sunX, sunY, sunRadius * 1.6, '255, 170, 50', sunAlpha * 0.65);
      drawSoftGlow(sunX, sunY, sunRadius, '255, 215, 100', sunAlpha * 0.85);
      drawSoftGlow(sunX, sunY, sunRadius * 0.35, '255, 255, 230', sunAlpha);

      // Horizontal sunset beam diffusion across river and city
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const beamGrad = ctx.createLinearGradient(W * 0.55, sunY, W * 0.98, sunY);
      beamGrad.addColorStop(0, 'rgba(255, 200, 80, 0)');
      beamGrad.addColorStop(0.5, `rgba(255, 220, 120, ${0.22 + sunsetPulse * 0.18})`);
      beamGrad.addColorStop(1, 'rgba(255, 200, 80, 0)');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(W * 0.55, sunY - 4, W * 0.43, 8);
      ctx.restore();

      // Warm rim lighting softly illuminating Nova and the Human
      drawSoftGlow(W * 0.65, H * 0.66, W * 0.08, '255, 205, 120', 0.25 + sunsetPulse * 0.18);
      drawSoftGlow(W * 0.76, H * 0.66, W * 0.08, '255, 205, 120', 0.25 + sunsetPulse * 0.18);

      // -----------------------------------------------------------------------
      // 2. EARTH ATMOSPHERIC GLOW PULSE (x: 0.74, y: 0.18)
      // -----------------------------------------------------------------------
      const earthX = W * 0.74;
      const earthY = H * 0.18;
      const earthBreath = (Math.sin(elapsed * 0.7) + 1) / 2;
      drawSoftGlow(earthX, earthY, W * 0.11, '90, 180, 255', 0.30 + earthBreath * 0.25);
      drawSoftGlow(earthX, earthY, W * 0.06, '140, 225, 255', 0.25 + earthBreath * 0.20);

      // -----------------------------------------------------------------------
      // 3. LIVING NOVA (Breathing, Forehead Star, Crystalline Tail, Ear Movement)
      // -----------------------------------------------------------------------
      const novaX = W * 0.648;
      const novaY = H * 0.65;
      const novaBreath = Math.sin(elapsed * 1.5); // slow breathing

      // Subtle chest/back breathing expansion wave
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      drawSoftGlow(novaX, novaY + novaBreath * 2, W * 0.055, '255, 245, 220', 0.12 + Math.abs(novaBreath) * 0.08);
      ctx.restore();

      // Forehead Star pulse (x: 0.648, y: 0.558)
      const starX = W * 0.648;
      const starY = H * 0.558 + (novaBreath * 1.2);
      const starPulse = (Math.sin(elapsed * 2.2) + 1) / 2;
      drawDiamondStar(starX, starY, 10 + starPulse * 6, 0.75 + starPulse * 0.25, '125, 226, 255');
      drawSoftGlow(starX, starY, 20, '100, 215, 255', 0.75 + starPulse * 0.25);

      // Nova Crystalline Tail Visibly Shimmering & Pulsing (x: 0.55, y: 0.68)
      const tailX = W * 0.55;
      const tailY = H * 0.68;
      const tailPulse = (Math.sin(elapsed * 1.8) + 1) / 2;
      drawSoftGlow(tailX, tailY, W * 0.085, '70, 180, 255', 0.50 + tailPulse * 0.35);
      drawSoftGlow(tailX, tailY, W * 0.05, '190, 130, 255', 0.55 + tailPulse * 0.30);

      // Light waves traveling through crystal tail feathers
      const tailWave = (elapsed * 1.2) % 1;
      const waveY = tailY + (tailWave - 0.5) * (H * 0.08);
      drawSoftGlow(tailX + Math.sin(tailWave * Math.PI) * 14, waveY, 12, '255, 255, 255', Math.sin(tailWave * Math.PI) * 0.75);
      drawDiamondStar(tailX + Math.sin(tailWave * Math.PI) * 14, waveY, 7, Math.sin(tailWave * Math.PI) * 0.85);

      // Tiny magical sparks popping near tail
      for (let s = 0; s < 3; s++) {
        const sparkPhase = (elapsed * 2.0 + s * 1.2) % 1;
        const spX = tailX + (Math.sin(elapsed + s) * 22);
        const spY = tailY - (sparkPhase * 35);
        drawDiamondStar(spX, spY, 4, (1 - sparkPhase) * 0.85, '140, 235, 255');
      }

      // Nova ear breeze movements (ear tips at x: 0.62, y: 0.50 and x: 0.68, y: 0.51)
      const earWiggle = Math.sin(elapsed * 3.5) * Math.sin(elapsed * 0.8);
      drawSoftGlow(W * 0.62 + earWiggle * 2.5, H * 0.50, 8, '255, 240, 210', 0.25);
      drawSoftGlow(W * 0.68 - earWiggle * 2.5, H * 0.51, 8, '255, 240, 210', 0.25);

      // -----------------------------------------------------------------------
      // 4. LIVING HUMAN CHARACTER (Breathing, Hair Breeze, Occasional Blink)
      // -----------------------------------------------------------------------
      const humanX = W * 0.76;
      const humanY = H * 0.66;
      const humanBreath = Math.sin(elapsed * 1.4);

      // Human breathing wave
      drawSoftGlow(humanX, humanY + humanBreath * 1.8, W * 0.05, '255, 225, 180', 0.10 + Math.abs(humanBreath) * 0.06);

      // Hair breeze movement (soft strands highlight moving with breeze)
      const hairBreeze = Math.sin(elapsed * 2.8) * 2;
      drawSoftGlow(W * 0.77 + hairBreeze, H * 0.61, 10, '255, 215, 140', 0.25);

      // Human occasional natural blink (every 3-5 seconds)
      humanBlinkTimer -= 0.016;
      if (humanBlinkTimer <= 0) {
        humanBlinking = 0.12; // 120ms blink
        humanBlinkTimer = 3.5 + Math.random() * 2.5;
      }
      if (humanBlinking > 0) {
        humanBlinking -= 0.016;
        // Draw delicate dark eyelid curve over profile eye (x: 0.748, y: 0.595)
        ctx.save();
        ctx.strokeStyle = 'rgba(60, 40, 30, 0.85)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(W * 0.748, H * 0.595, 3.5, 0.2, Math.PI - 0.2);
        ctx.stroke();
        ctx.restore();
      }

      // -----------------------------------------------------------------------
      // 5. MAGICAL CONNECTION STREAM (Between Nova and the Human)
      // -----------------------------------------------------------------------
      const connStartX = W * 0.65;
      const connEndX = W * 0.74;
      const connY = H * 0.68;

      connectionMotes.forEach(m => {
        m.progress += m.speed;
        if (m.progress > 1) m.progress = 0;

        const t = m.progress;
        // Arc path that dips slightly
        const mx = connStartX + t * (connEndX - connStartX);
        const my = connY + (m.yOffset * H) + Math.sin(t * Math.PI) * 12;

        const a = Math.sin(t * Math.PI) * m.alpha;
        drawSoftGlow(mx, my, 8, m.color, a * 0.7);
        drawDiamondStar(mx, my, 4.5, a * 0.9, m.color);
      });

      // -----------------------------------------------------------------------
      // 6. LANTERN FLICKER (Lower Right x: 0.88, y: 0.80)
      // -----------------------------------------------------------------------
      const lanternX = W * 0.88;
      const lanternY = H * 0.80;
      const lanternFlicker = 0.85 + (Math.sin(elapsed * 9) * 0.1) + ((Math.random() - 0.5) * 0.08);

      drawSoftGlow(lanternX, lanternY, 32 * lanternFlicker, '255, 170, 40', 0.65 * lanternFlicker);
      drawSoftGlow(lanternX, lanternY, 14 * lanternFlicker, '255, 240, 160', 0.85 * lanternFlicker);

      // Rising light particles around lantern
      lanternSparks.forEach(sp => {
        sp.y += sp.vy;
        sp.x += sp.vx;
        if (sp.y < 0.75) {
          sp.y = 0.80;
          sp.x = 0.88 + (Math.random() - 0.5) * 0.015;
        }
        drawDiamondStar(sp.x * W, sp.y * H, 3, sp.alpha * 0.8, '255, 220, 100');
      });

      // -----------------------------------------------------------------------
      // 7. GENTLE FLOATING FLOWER PETALS (Drifting from upper arch)
      // -----------------------------------------------------------------------
      petals.forEach(petal => {
        petal.x += petal.vx;
        petal.y += petal.vy;
        petal.angle += petal.rotSpeed;
        petal.flutterPhase += 0.04;
        petal.x += Math.sin(petal.flutterPhase) * 0.00025;

        if (petal.y > 0.94 || petal.x > 0.98) {
          petal.x = 0.52 + Math.random() * 0.38;
          petal.y = 0.06 + Math.random() * 0.12;
        }

        ctx.save();
        ctx.translate(petal.x * W, petal.y * H);
        ctx.rotate(petal.angle);
        ctx.scale(1, Math.max(0.25, Math.abs(Math.sin(petal.flutterPhase))));

        ctx.shadowColor = '#ff8cd2';
        ctx.shadowBlur = 10;
        const halfL = petal.length / 2;
        const halfW = petal.width / 2;

        ctx.beginPath();
        ctx.moveTo(0, -halfL);
        ctx.bezierCurveTo(halfW * 1.3, -halfL * 0.4, halfW * 1.3, halfL * 0.5, 0, halfL);
        ctx.bezierCurveTo(-halfW * 1.3, halfL * 0.5, -halfW * 1.3, -halfL * 0.4, 0, -halfL);
        ctx.closePath();

        const pGrad = ctx.createLinearGradient(0, -halfL, 0, halfL);
        pGrad.addColorStop(0, `rgba(255, 240, 250, ${petal.alpha})`);
        pGrad.addColorStop(0.5, `rgba(${petal.color}, ${petal.alpha * 0.95})`);
        pGrad.addColorStop(1, `rgba(200, 90, 180, ${petal.alpha * 0.8})`);
        ctx.fillStyle = pGrad;
        ctx.fill();
        ctx.restore();
      });

      // -----------------------------------------------------------------------
      // 8. FOREGROUND LEAVES & FOLIAGE SWAY
      // -----------------------------------------------------------------------
      const foliageSway = Math.sin(elapsed * 1.8) * 3;
      // Top-left vine highlight (x: 0.52, y: 0.08)
      drawSoftGlow(W * 0.52 + foliageSway, H * 0.08, 22, '140, 220, 160', 0.18);
      // Top-right arch leaves (x: 0.94, y: 0.15)
      drawSoftGlow(W * 0.94 - foliageSway, H * 0.15, 25, '140, 220, 160', 0.18);

      // -----------------------------------------------------------------------
      // 9. COSMIC SKY: SHOOTING STAR & TWINKLES
      // -----------------------------------------------------------------------
      shootingStar.timer -= 0.016;
      if (shootingStar.timer <= 0 && !shootingStar.active) {
        shootingStar.active = true;
        shootingStar.x = W * (0.68 + Math.random() * 0.16);
        shootingStar.y = H * (0.05 + Math.random() * 0.08);
        shootingStar.vx = 4.5;
        shootingStar.vy = 2.4;
        shootingStar.alpha = 1;
        shootingStar.timer = 5 + Math.random() * 5;
      }
      if (shootingStar.active) {
        shootingStar.x += shootingStar.vx;
        shootingStar.y += shootingStar.vy;
        shootingStar.alpha -= 0.02;
        if (shootingStar.alpha <= 0) shootingStar.active = false;

        ctx.save();
        ctx.strokeStyle = `rgba(255, 255, 255, ${shootingStar.alpha * 0.9})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(shootingStar.x, shootingStar.y);
        ctx.lineTo(shootingStar.x - shootingStar.vx * 9, shootingStar.y - shootingStar.vy * 9);
        ctx.stroke();
        ctx.restore();
      }

      // Sky twinkles
      const skyTwinkles = [
        { x: 0.62, y: 0.08, phase: 0 },
        { x: 0.68, y: 0.12, phase: 1.5 },
        { x: 0.85, y: 0.09, phase: 3.0 },
        { x: 0.90, y: 0.18, phase: 4.5 }
      ];
      skyTwinkles.forEach(st => {
        const tAlpha = (Math.sin(elapsed * 2.0 + st.phase) + 1) / 2;
        drawDiamondStar(W * st.x, H * st.y, 8, tAlpha * 0.85);
      });

      // -----------------------------------------------------------------------
      // 10. MULTI-DEPTH FLOATING LIGHT PARTICLES
      // -----------------------------------------------------------------------
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.twinklePhase += p.twinkleSpeed;

        if (p.y < 0.05) p.y = 0.94;
        if (p.x < 0.52) p.x = 0.96;
        if (p.x > 0.98) p.x = 0.53;

        const px = p.x * W;
        const py = p.y * H;
        const a = p.baseAlpha * (0.7 + Math.sin(p.twinklePhase) * 0.3);

        drawSoftGlow(px, py, p.radius * 2.6, p.color, a * 0.6);

        ctx.save();
        ctx.shadowColor = p.glowHex;
        ctx.shadowBlur = 8;
        ctx.fillStyle = `rgba(${p.color}, ${a})`;
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
