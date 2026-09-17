import React, { useEffect, useRef } from 'react';

/**
 * Chapter2Atmosphere
 * 
 * Cinematic fantasy foreground atmospheric animation for Chapter 2: The Guardian and Kaelen.
 * 
 * Features:
 * 1. Living Nova: breathing, profile eye blinking, ear movements, pulsing forehead star, swaying tail with sparks
 * 2. Living Kaelen: subtle breathing & cloak sway, downward-looking eye blinks, gentle head micro-movement, pulsing chest crystal
 * 3. Magical Interaction: active blue energy trails flowing from Kaelen's crystal to Nova's star and spiraling outward
 * 4. Environment: floating city waterfalls flowing, rotating magical city rings, swaying flowers and leaves
 * 5. Foreground: crystal orb at bottom-right glows strongly with orbiting stars and pulses across the floor
 * 6. Lighting: sweeping blue magical floor & character reflections, occasional magical flashes
 * 7. Complete text preservation: left page (x < 0.50) is 100% clean and readable
 */
export default function Chapter2Atmosphere() {
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
    // 1. PARTICLES & TAIL SPARKS
    // =========================================================================
    const particles = [];
    const colors = [
      { rgb: '100, 225, 255', hex: '#64e1ff' }, // Cyan mana
      { rgb: '190, 140, 255', hex: '#be8cff' }, // Sapphire violet
      { rgb: '255, 255, 255', hex: '#ffffff' }, // Diamond starlight
      { rgb: '255, 230, 130', hex: '#ffe682' }  // Warm gold
    ];

    // Foreground floating magical particles
    for (let i = 0; i < 24; i++) {
      const c = colors[i % colors.length];
      particles.push({
        x: 0.52 + Math.random() * 0.45,
        y: 0.12 + Math.random() * 0.82,
        vx: (Math.random() - 0.45) * 0.00022,
        vy: -(0.00012 + Math.random() * 0.00025),
        radius: 2.2 + Math.random() * 2.2,
        baseAlpha: 0.65 + Math.random() * 0.35,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.02 + Math.random() * 0.03,
        color: c.rgb,
        glowHex: c.hex
      });
    }

    // Waterfalls mist particles
    const waterfallParticles = Array.from({ length: 18 }, () => ({
      x: 0.73 + (Math.random() - 0.5) * 0.018,
      y: 0.20 + Math.random() * 0.12,
      vy: 0.0004 + Math.random() * 0.0005,
      radius: 1.5 + Math.random() * 2.0,
      alpha: 0.4 + Math.random() * 0.4
    }));

    // =========================================================================
    // 2. MAGICAL INTERACTION STREAM (Kaelen's Crystal -> Nova's Star -> Spiral)
    // =========================================================================
    const interactionMotes = Array.from({ length: 16 }, (_, i) => ({
      progress: i / 16,
      speed: 0.004 + Math.random() * 0.003,
      spiralAngle: Math.random() * Math.PI * 2,
      spiralRadius: 0,
      radius: 1.8 + Math.random() * 1.8,
      alpha: 0.85
    }));

    // =========================================================================
    // 3. CRYSTAL ORB ORBITING STARS (x: 0.74, y: 0.825)
    // =========================================================================
    const orbStars = Array.from({ length: 10 }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: 0.25 + Math.random() * 0.65,
      speed: (Math.random() - 0.5) * 0.03,
      radius: 1.6 + Math.random() * 1.8,
      alpha: 0.75 + Math.random() * 0.25
    }));

    // Blinking timers
    let novaBlinkTimer = 3.6;
    let novaBlinking = 0;
    let kaelenBlinkTimer = 4.4;
    let kaelenBlinking = 0;

    // Drawing helpers
    const drawSoftGlow = (x, y, radius, color, alpha) => {
      if (alpha <= 0.01) return;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, `rgba(${color}, ${alpha})`);
      grad.addColorStop(0.45, `rgba(${color}, ${alpha * 0.55})`);
      grad.addColorStop(0.85, `rgba(${color}, ${alpha * 0.15})`);
      grad.addColorStop(1, `rgba(${color}, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawBigSparkle = (x, y, size, alpha, color = '255, 255, 255') => {
      if (alpha <= 0.01) return;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = `rgba(${color}, ${alpha})`;
      ctx.shadowColor = '#64dcff';
      ctx.shadowBlur = 14;

      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size * 0.20, y);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x - size * 0.20, y);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x - size, y);
      ctx.lineTo(x, y + size * 0.20);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x, y - size * 0.20);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, size * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawDiamondStar = (x, y, size, alpha, color = '255, 255, 255') => {
      if (alpha <= 0.01) return;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      if (color.startsWith('#')) {
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
      } else {
        ctx.fillStyle = `rgba(${color}, ${alpha})`;
      }
      ctx.shadowColor = '#64dcff';
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
    // MAIN RENDER LOOP
    // =========================================================================
    let startTime = performance.now();

    const loop = (now) => {
      const W = canvas.width / (window.devicePixelRatio || 1);
      const H = canvas.height / (window.devicePixelRatio || 1);

      ctx.clearRect(0, 0, W, H);

      const elapsed = (now - startTime) / 1000;

      // -----------------------------------------------------------------------
      // 1. KAELEN (Subtle breathing, cloak sway, eye blinks, head micro-tilt, chest crystal)
      // -----------------------------------------------------------------------
      const kaelenBreath = Math.sin(elapsed * 1.4);
      // Gentle head tilt toward Nova
      const kaelenHeadTilt = Math.sin(elapsed * 1.1) * 1.5;

      // Kaelen's Glowing Blue Chest Crystal at x: 0.80, y: 0.515
      const crystalX = W * 0.80;
      const crystalY = H * 0.515 + (kaelenBreath * 1.5);
      const crystalPulse = (Math.sin(elapsed * 2.6) + 1) / 2;
      const crystalSize = 14 + crystalPulse * 8;

      drawBigSparkle(crystalX, crystalY, crystalSize, 0.85 + crystalPulse * 0.15, '100, 225, 255');
      drawSoftGlow(crystalX, crystalY, 35, '80, 210, 255', 0.80 + crystalPulse * 0.20);

      // Kaelen Cloak subtle breathing & ambient lighting
      drawSoftGlow(W * 0.82, H * 0.60 + (kaelenBreath * 2), W * 0.09, '80, 140, 255', 0.20 + (crystalPulse * 0.15));

      // Kaelen Eye Blinking (Looking down tenderly at Nova)
      // Eyes at x: 0.755, y: 0.395 and x: 0.742, y: 0.40
      kaelenBlinkTimer -= 0.016;
      if (kaelenBlinkTimer <= 0) {
        kaelenBlinking = 0.13; // 130ms blink
        kaelenBlinkTimer = 3.8 + Math.random() * 2.5;
      }
      if (kaelenBlinking > 0) {
        kaelenBlinking -= 0.016;
        const kBlinkP = Math.sin((kaelenBlinking / 0.13) * Math.PI);
        ctx.save();
        ctx.strokeStyle = '#2c3345';
        ctx.lineWidth = 1.8;
        // Left eye
        ctx.beginPath();
        ctx.arc(W * 0.755 + kaelenHeadTilt, H * 0.395 + (kaelenBreath * 1.2), 4, 0.2, Math.PI - 0.2);
        ctx.stroke();
        // Right eye
        ctx.beginPath();
        ctx.arc(W * 0.742 + kaelenHeadTilt, H * 0.40 + (kaelenBreath * 1.2), 3.5, 0.2, Math.PI - 0.2);
        ctx.stroke();
        ctx.restore();
      }

      // -----------------------------------------------------------------------
      // 2. NOVA (Breathing, profile eye blink, ear wiggle, pulsing star, tail sway & sparks)
      // -----------------------------------------------------------------------
      const novaBreath = Math.sin(elapsed * 1.6);

      // Nova Forehead Star at x: 0.645, y: 0.515
      const starX = W * 0.645;
      const starY = H * 0.515 + (novaBreath * 1.2);
      const starPulse = (Math.sin(elapsed * 2.8) + 1) / 2;
      const starSize = 12 + starPulse * 8;

      drawBigSparkle(starX, starY, starSize, 0.85 + starPulse * 0.15, '125, 235, 255');
      drawSoftGlow(starX, starY, 28, '100, 220, 255', 0.85 + starPulse * 0.15);

      // Nova Eye Blinking (Gazing up at Kaelen at x: 0.642, y: 0.555)
      novaBlinkTimer -= 0.016;
      if (novaBlinkTimer <= 0) {
        novaBlinking = 0.14; // 140ms blink
        novaBlinkTimer = 3.2 + Math.random() * 2.2;
      }
      if (novaBlinking > 0) {
        novaBlinking -= 0.016;
        const nBlinkP = Math.sin((novaBlinking / 0.14) * Math.PI);
        ctx.save();
        ctx.fillStyle = '#f5f6fa';
        ctx.beginPath();
        ctx.ellipse(W * 0.642, H * 0.555 + (novaBreath * 1.2), 6.5, 5.5 * nBlinkP, -0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#2d3345';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(W * 0.642, H * 0.555 + (novaBreath * 1.2), 6, 0.3, Math.PI - 0.3);
        ctx.stroke();
        ctx.restore();
      } else {
        // Starlight glint in pupil
        drawDiamondStar(W * 0.642 - 1, H * 0.555 - 2 + (novaBreath * 1.2), 3.5, 0.9, '#ffffff');
      }

      // Nova Ear Movement (ear tips at x: 0.575, y: 0.55 and x: 0.655, y: 0.485)
      const earWiggle = Math.sin(elapsed * 3.5) * 2.5;
      drawSoftGlow(W * 0.575 + earWiggle, H * 0.55, 8, '255, 245, 220', 0.3);
      drawSoftGlow(W * 0.655 - earWiggle, H * 0.485, 8, '255, 245, 220', 0.3);

      // Nova Crystalline Tail Visibly Swaying & Glowing (x: 0.53, y: 0.72)
      const tailSway = Math.sin(elapsed * 1.5) * 6;
      const tailX = W * 0.53 + tailSway;
      const tailY = H * 0.72;
      const tailPulse = (Math.sin(elapsed * 2.2) + 1) / 2;

      drawSoftGlow(tailX, tailY, W * 0.08, '70, 180, 255', 0.60 + tailPulse * 0.35);
      drawSoftGlow(tailX, tailY, W * 0.05, '180, 120, 255', 0.65 + tailPulse * 0.30);

      // Traveling light waves through tail feathers
      const tailWave = (elapsed * 1.3) % 1;
      const waveY = tailY + (tailWave - 0.5) * (H * 0.09);
      drawSoftGlow(tailX + Math.sin(tailWave * Math.PI) * 16, waveY, 14, '255, 255, 255', Math.sin(tailWave * Math.PI) * 0.85);
      drawBigSparkle(tailX + Math.sin(tailWave * Math.PI) * 16, waveY, 8, Math.sin(tailWave * Math.PI) * 0.95);

      // Moving sparks from tail
      for (let s = 0; s < 4; s++) {
        const spPhase = (elapsed * 2.0 + s * 1.0) % 1;
        const spX = tailX + (Math.sin(elapsed + s) * 24);
        const spY = tailY - (spPhase * 40);
        drawDiamondStar(spX, spY, 4, (1 - spPhase) * 0.9, '130, 230, 255');
      }

      // Small particles visibly traveling around Nova's body
      for (let p = 0; p < 4; p++) {
        const bodyAngle = elapsed * 1.8 + (p * Math.PI / 2);
        const bx = W * 0.61 + Math.cos(bodyAngle) * (W * 0.035);
        const by = H * 0.66 + Math.sin(bodyAngle) * (H * 0.05);
        drawDiamondStar(bx, by, 3.5, 0.85, '140, 235, 255');
      }

      // -----------------------------------------------------------------------
      // 3. MAGICAL INTERACTION TRAILS (Kaelen Crystal -> Nova Star -> Spiral)
      // -----------------------------------------------------------------------
      const kaelenCrystalX = crystalX;
      const kaelenCrystalY = crystalY;
      const novaStarX = starX;
      const novaStarY = starY;

      // Draw active flowing energy stream
      interactionMotes.forEach(m => {
        m.progress += m.speed;
        if (m.progress > 1) {
          m.progress = 0;
          m.spiralRadius = 0;
        }

        const t = m.progress;
        let mx, my;

        if (t < 0.65) {
          // Travel from Kaelen's crystal to Nova's star along a graceful arc
          const streamT = t / 0.65;
          const ctrlX = (kaelenCrystalX + novaStarX) / 2;
          const ctrlY = kaelenCrystalY - 20;

          mx = (1 - streamT) * (1 - streamT) * kaelenCrystalX + 2 * (1 - streamT) * streamT * ctrlX + streamT * streamT * novaStarX;
          my = (1 - streamT) * (1 - streamT) * kaelenCrystalY + 2 * (1 - streamT) * streamT * ctrlY + streamT * streamT * novaStarY;
        } else {
          // Spiral outward from Nova's star!
          const spiralT = (t - 0.65) / 0.35;
          m.spiralAngle += 0.08;
          m.spiralRadius = spiralT * 35;
          mx = novaStarX + Math.cos(m.spiralAngle) * m.spiralRadius;
          my = novaStarY + Math.sin(m.spiralAngle) * (m.spiralRadius * 0.7);
        }

        const a = Math.sin(t * Math.PI) * m.alpha;
        drawSoftGlow(mx, my, 10, '120, 230, 255', a * 0.85);
        drawBigSparkle(mx, my, 5, a * 0.95, '#ffffff');
      });

      // -----------------------------------------------------------------------
      // 4. FOREGROUND CRYSTAL ORB (x: 0.74, y: 0.825)
      // -----------------------------------------------------------------------
      const orbX = W * 0.74;
      const orbY = H * 0.825;
      const orbPulse = (Math.sin(elapsed * 2.2) + 1) / 2;
      const orbR = W * 0.033; // ~51px radius

      // Strong, visible glow
      drawSoftGlow(orbX, orbY, orbR * 2.2, '70, 190, 255', 0.60 + orbPulse * 0.35);
      drawSoftGlow(orbX, orbY, orbR * 1.3, '190, 130, 255', 0.65 + orbPulse * 0.30);

      // Floor reflection pulse
      drawSoftGlow(orbX, orbY + orbR * 0.9, orbR * 2.0, '90, 210, 255', 0.40 + orbPulse * 0.30);

      // Orbiting stars inside crystal
      ctx.save();
      ctx.beginPath();
      ctx.arc(orbX, orbY, orbR, 0, Math.PI * 2);
      ctx.clip();

      orbStars.forEach(s => {
        s.angle += s.speed;
        const sx = orbX + Math.cos(s.angle) * (orbR * s.dist);
        const sy = orbY + Math.sin(s.angle) * (orbR * s.dist * 0.75);
        drawDiamondStar(sx, sy, s.radius * 2, s.alpha, '#ffffff');
      });
      ctx.restore();

      // Occasional bright pulse across floor from orb (every 4s)
      const floorPulsePhase = (elapsed % 4.0);
      if (floorPulsePhase < 0.5) {
        const fpT = floorPulsePhase / 0.5;
        const fpAlpha = Math.sin(fpT * Math.PI) * 0.6;
        drawSoftGlow(orbX, orbY + 15, fpT * 120, '120, 220, 255', fpAlpha);
      }

      // -----------------------------------------------------------------------
      // 5. ENVIRONMENT: WATERFALLS & ROTATING MAGICAL CITY RINGS
      // -----------------------------------------------------------------------
      // Waterfalls flowing downward
      waterfallParticles.forEach(wp => {
        wp.y += wp.vy;
        if (wp.y > 0.32) wp.y = 0.20;
        drawSoftGlow(wp.x * W, wp.y * H, wp.radius * 2, '180, 235, 255', wp.alpha * 0.65);
      });

      // Rotating magical city rings at x: 0.77, y: 0.15
      const ringX = W * 0.77;
      const ringY = H * 0.15;
      const ringAngle = elapsed * 0.15;

      ctx.save();
      ctx.strokeStyle = 'rgba(140, 225, 255, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(ringX, ringY, 32, 12, ringAngle, 0, Math.PI * 2);
      ctx.stroke();

      // Ring glint
      drawDiamondStar(ringX + Math.cos(ringAngle) * 32, ringY + Math.sin(ringAngle) * 12, 5, 0.8, '#ffffff');
      ctx.restore();

      // Hanging foliage sway highlights (x: 0.52, y: 0.15 and x: 0.94, y: 0.20)
      const leafSway = Math.sin(elapsed * 2.0) * 3;
      drawSoftGlow(W * 0.52 + leafSway, H * 0.15, 22, '160, 230, 180', 0.22);
      drawSoftGlow(W * 0.94 - leafSway, H * 0.20, 25, '160, 230, 180', 0.22);

      // -----------------------------------------------------------------------
      // 6. LIGHTING: MOVING BLUE MAGICAL REFLECTIONS ACROSS FLOOR & CHARACTERS
      // -----------------------------------------------------------------------
      const sweepX = W * (0.60 + Math.sin(elapsed * 0.8) * 0.18);
      drawSoftGlow(sweepX, H * 0.88, W * 0.12, '100, 220, 255', 0.25);

      // Occasional tiny magical flashes around them
      if (Math.sin(elapsed * 4.5) > 0.92) {
        const flashX = W * (0.62 + Math.random() * 0.18);
        const flashY = H * (0.45 + Math.random() * 0.25);
        drawBigSparkle(flashX, flashY, 8, 0.9, '#ffffff');
      }

      // -----------------------------------------------------------------------
      // 7. MULTI-DEPTH PARTICLES
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

        drawSoftGlow(px, py, p.radius * 2.5, p.color, a * 0.6);

        ctx.save();
        ctx.shadowColor = p.glowHex;
        ctx.shadowBlur = 10;
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
