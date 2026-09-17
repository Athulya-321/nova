import React, { useEffect, useRef } from 'react';

/**
 * Chapter1Atmosphere
 * 
 * Bold, vibrant, cinematic foreground atmospheric animation for Chapter 1: The World of Veyra.
 * All effects are prominently visible, vibrant, and unmistakably alive while preserving
 * the static underlying artwork and keeping left-page text (x < 0.50) clean and readable.
 */
export default function Chapter1Atmosphere() {
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
    // 1. PROMINENT GLOWING FLOWER PETALS (10 to 14 active, bold & easily spotted)
    // =========================================================================
    const petals = Array.from({ length: 12 }, (_, i) => ({
      x: 0.51 + Math.random() * 0.44,
      y: 0.10 + (i * 0.07),
      vx: (Math.random() - 0.42) * 0.0003,
      vy: 0.00025 + Math.random() * 0.00035, // gentle downward flutter
      angle: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.028,
      flutterPhase: Math.random() * Math.PI * 2,
      flutterFreq: 1.8 + Math.random() * 1.5,
      // Prominent petal size (14px to 22px)
      length: 14 + Math.random() * 8,
      width: 8 + Math.random() * 5,
      alpha: 0.75 + Math.random() * 0.25,
      color: Math.random() > 0.4 ? '255, 150, 220' : '225, 140, 255'
    }));

    // =========================================================================
    // 2. VIBRANT MULTI-DEPTH MAGICAL PARTICLES (Bold, luminous & glowing)
    // =========================================================================
    const particles = [];
    const colors = [
      { rgb: '255, 215, 80', hex: '#ffd750' },  // Bright golden
      { rgb: '80, 225, 255', hex: '#50e1ff' },  // Electric cyan
      { rgb: '215, 140, 255', hex: '#d78cff' }, // Vivid violet
      { rgb: '255, 255, 255', hex: '#ffffff' }  // Pure starlight
    ];

    // Foreground / Near (large, radiant glow)
    for (let i = 0; i < 14; i++) {
      const c = colors[i % colors.length];
      particles.push({
        x: 0.52 + Math.random() * 0.45,
        y: 0.12 + Math.random() * 0.82,
        vx: (Math.random() - 0.48) * 0.00025,
        vy: -(0.00015 + Math.random() * 0.00025),
        radius: 3.5 + Math.random() * 2.5, // 3.5px to 6.0px!
        baseAlpha: 0.7 + Math.random() * 0.3,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.02 + Math.random() * 0.03,
        color: c.rgb,
        glowHex: c.hex
      });
    }

    // Midground (medium, luminous)
    for (let i = 0; i < 26; i++) {
      const c = colors[i % colors.length];
      particles.push({
        x: 0.52 + Math.random() * 0.46,
        y: 0.08 + Math.random() * 0.88,
        vx: (Math.random() - 0.48) * 0.00016,
        vy: -(0.0001 + Math.random() * 0.00018),
        radius: 2.2 + Math.random() * 1.5,
        baseAlpha: 0.6 + Math.random() * 0.35,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.015 + Math.random() * 0.025,
        color: c.rgb,
        glowHex: c.hex
      });
    }

    // Distant (sparkling stars & dust)
    for (let i = 0; i < 30; i++) {
      const c = colors[i % colors.length];
      particles.push({
        x: 0.52 + Math.random() * 0.46,
        y: 0.06 + Math.random() * 0.90,
        vx: (Math.random() - 0.5) * 0.00008,
        vy: -(0.00005 + Math.random() * 0.0001),
        radius: 1.4 + Math.random() * 1.0,
        baseAlpha: 0.5 + Math.random() * 0.4,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.012 + Math.random() * 0.02,
        color: c.rgb,
        glowHex: c.hex
      });
    }

    // =========================================================================
    // 3. RADIANT STAR SPARKLES (Bold diamond starbursts)
    // =========================================================================
    const starSparkles = [
      { x: 0.615, y: 0.115, interval: 4.0, timer: 0.5, maxRadius: 18 },
      { x: 0.678, y: 0.082, interval: 5.2, timer: 2.0, maxRadius: 16 },
      { x: 0.865, y: 0.118, interval: 4.8, timer: 3.5, maxRadius: 20 },
      { x: 0.725, y: 0.225, interval: 4.5, timer: 1.2, maxRadius: 15 },
      { x: 0.648, y: 0.252, interval: 5.5, timer: 2.8, maxRadius: 16 },
      { x: 0.815, y: 0.315, interval: 5.0, timer: 4.2, maxRadius: 14 }
    ];

    // =========================================================================
    // 4. CRYSTAL BALL INTERNAL STARS & POWER
    // =========================================================================
    const crystalBall = {
      cx: 0.742,
      cy: 0.735,
      r: 0.033, // ~51px radius at 1536w
      stars: Array.from({ length: 12 }, () => ({
        angle: Math.random() * Math.PI * 2,
        dist: 0.15 + Math.random() * 0.70,
        speed: (Math.random() - 0.5) * 0.025,
        radius: 1.5 + Math.random() * 1.8,
        alpha: 0.6 + Math.random() * 0.4,
        color: Math.random() > 0.3 ? '#7de2ff' : '#ffffff'
      })),
      pulse: 0
    };

    // =========================================================================
    // 5. ACTIVE STARWAY ENERGY BEAMS
    // =========================================================================
    const starwayEnergy = Array.from({ length: 4 }, (_, i) => ({
      progress: i * 0.25,
      speed: 0.0012 + Math.random() * 0.0006,
      startX: 0.56,
      startY: 0.30,
      ctrlX: 0.72,
      ctrlY: 0.23,
      endX: 0.90,
      endY: 0.33,
      alpha: 0.85
    }));

    // =========================================================================
    // 6. MAGICAL LIGHT DUST STREAM (Prominent wavy stardust ribbon)
    // =========================================================================
    const stardustStream = Array.from({ length: 22 }, () => ({
      x: 0.54 + Math.random() * 0.42,
      baseY: 0.32 + Math.random() * 0.48,
      yOffset: 0,
      vx: 0.0003 + Math.random() * 0.0003,
      waveFreq: 2.0 + Math.random() * 1.5,
      waveAmp: 0.02 + Math.random() * 0.025,
      phase: Math.random() * Math.PI * 2,
      radius: 1.8 + Math.random() * 1.8,
      alpha: 0.65 + Math.random() * 0.35,
      color: '255, 235, 140'
    }));

    // =========================================================================
    // DRAWING PRIMITIVES
    // =========================================================================

    const drawSoftGlow = (x, y, radius, color, alpha) => {
      if (alpha <= 0.01) return;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, `rgba(${color}, ${alpha})`);
      grad.addColorStop(0.45, `rgba(${color}, ${alpha * 0.6})`);
      grad.addColorStop(0.8, `rgba(${color}, ${alpha * 0.18})`);
      grad.addColorStop(1, `rgba(${color}, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // Brilliant 8-point / 4-point radiant diamond starburst
    const drawBigSparkle = (x, y, size, alpha) => {
      if (alpha <= 0.01) return;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.shadowColor = '#ffe388';
      ctx.shadowBlur = 18;

      // Vertical & Horizontal rays
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

      // Diagonal cross rays
      const diag = size * 0.55;
      ctx.beginPath();
      ctx.moveTo(x - diag, y - diag);
      ctx.lineTo(x + diag * 0.15, y - diag * 0.15);
      ctx.lineTo(x + diag, y + diag);
      ctx.lineTo(x - diag * 0.15, y + diag * 0.15);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x - diag, y + diag);
      ctx.lineTo(x - diag * 0.15, y - diag * 0.15);
      ctx.lineTo(x + diag, y - diag);
      ctx.lineTo(x + diag * 0.15, y + diag * 0.15);
      ctx.closePath();
      ctx.fill();

      // Center glowing core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, size * 0.22, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // Realistic curved flower petal
    const drawRealisticPetal = (x, y, length, width, angle, flutter, alpha, color) => {
      if (alpha <= 0.01) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      // 3D tumbling perspective
      ctx.scale(1, Math.max(0.2, Math.abs(Math.sin(flutter))));

      ctx.shadowColor = `rgba(${color}, 0.85)`;
      ctx.shadowBlur = 14;

      const halfL = length / 2;
      const halfW = width / 2;

      // Smooth curved organic petal shape
      ctx.beginPath();
      ctx.moveTo(0, -halfL);
      // Right curve
      ctx.bezierCurveTo(halfW * 1.3, -halfL * 0.4, halfW * 1.4, halfL * 0.5, 0, halfL);
      // Left curve
      ctx.bezierCurveTo(-halfW * 1.4, halfL * 0.5, -halfW * 1.3, -halfL * 0.4, 0, -halfL);
      ctx.closePath();

      // Lush gradient fill
      const grad = ctx.createLinearGradient(0, -halfL, 0, halfL);
      grad.addColorStop(0, `rgba(255, 235, 255, ${alpha})`);
      grad.addColorStop(0.4, `rgba(${color}, ${alpha * 0.95})`);
      grad.addColorStop(1, `rgba(180, 70, 220, ${alpha * 0.85})`);
      ctx.fillStyle = grad;
      ctx.fill();

      // Central glowing petal vein
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.7})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -halfL * 0.7);
      ctx.lineTo(0, halfL * 0.6);
      ctx.stroke();

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
      const cycleTime = elapsed % 16;

      // -----------------------------------------------------------------------
      // 1. AURELIS LIVING STAR - BOLD, RADIANT & PULSING (x: 0.792, y: 0.175)
      // -----------------------------------------------------------------------
      const aurelisX = W * 0.792;
      const aurelisY = H * 0.175;
      const aurelisCycle = (Math.sin((cycleTime / 16) * Math.PI * 2) + 1) / 2; // 0 to 1
      const aurelisAlpha = 0.45 + aurelisCycle * 0.40; // 0.45 (dim) to 0.85 (bright)!
      const aurelisRadius = W * (0.12 + aurelisCycle * 0.05);

      // Deep solar corona & radiant sunburst
      drawSoftGlow(aurelisX, aurelisY, aurelisRadius * 1.8, '255, 210, 80', aurelisAlpha * 0.7);
      drawSoftGlow(aurelisX, aurelisY, aurelisRadius, '255, 235, 140', aurelisAlpha * 0.9);
      drawSoftGlow(aurelisX, aurelisY, aurelisRadius * 0.4, '255, 255, 230', aurelisAlpha);

      // Rotating prominent starlight rays
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.translate(aurelisX, aurelisY);
      ctx.rotate(elapsed * 0.04);
      for (let r = 0; r < 6; r++) {
        ctx.rotate(Math.PI / 3);
        const rayGrad = ctx.createLinearGradient(0, 0, aurelisRadius * 1.5, 0);
        rayGrad.addColorStop(0, `rgba(255, 245, 200, ${aurelisAlpha * 0.45})`);
        rayGrad.addColorStop(0.6, `rgba(255, 215, 100, ${aurelisAlpha * 0.2})`);
        rayGrad.addColorStop(1, 'rgba(255, 215, 100, 0)');
        ctx.fillStyle = rayGrad;
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(aurelisRadius * 1.5, 0);
        ctx.lineTo(0, 6);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // -----------------------------------------------------------------------
      // 2. PROMINENT GLOWING FLOWER PETALS (12 large fluttering petals)
      // -----------------------------------------------------------------------
      petals.forEach(petal => {
        petal.x += petal.vx;
        petal.y += petal.vy;
        petal.angle += petal.rotSpeed;
        petal.flutterPhase += 0.035 * petal.flutterFreq;
        petal.x += Math.sin(petal.flutterPhase) * 0.0003;

        // Reset if reached bottom or drifted off right side
        if (petal.y > 0.94 || petal.x > 0.98) {
          petal.x = 0.51 + Math.random() * 0.40;
          petal.y = 0.08 + Math.random() * 0.15;
        }

        const px = petal.x * W;
        const py = petal.y * H;

        drawRealisticPetal(
          px,
          py,
          petal.length,
          petal.width,
          petal.angle,
          petal.flutterPhase,
          petal.alpha,
          petal.color
        );
      });

      // -----------------------------------------------------------------------
      // 3. CRYSTAL BALL GLOW & INTERNAL STARS (x: 0.742, y: 0.735)
      // -----------------------------------------------------------------------
      const ballX = W * crystalBall.cx;
      const ballY = H * crystalBall.cy;
      const ballR = W * crystalBall.r;

      // Vivid sapphire/violet ambient radiance
      crystalBall.pulse += 0.025;
      const ballPulseAlpha = 0.45 + Math.sin(crystalBall.pulse) * 0.30;
      drawSoftGlow(ballX, ballY, ballR * 1.8, '80, 200, 255', ballPulseAlpha * 0.85);
      drawSoftGlow(ballX, ballY, ballR * 1.2, '180, 110, 255', ballPulseAlpha * 0.75);

      // Rotating micro-stars inside crystal ball
      ctx.save();
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballR, 0, Math.PI * 2);
      ctx.clip();

      crystalBall.stars.forEach(star => {
        star.angle += star.speed;
        const sx = ballX + Math.cos(star.angle) * (ballR * star.dist);
        const sy = ballY + Math.sin(star.angle) * (ballR * star.dist * 0.75);
        ctx.fillStyle = star.color;
        ctx.shadowColor = '#7de2ff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(sx, sy, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // Occasional bright burst from crystal ball
      if (Math.sin(crystalBall.pulse * 0.5) > 0.85) {
        drawBigSparkle(ballX, ballY, 14, (Math.sin(crystalBall.pulse * 0.5) - 0.85) * 6);
      }

      // -----------------------------------------------------------------------
      // 4. NOVA'S FOREHEAD STAR & CRYSTAL TAIL
      // -----------------------------------------------------------------------
      // Forehead Star at x: 0.595, y: 0.535
      const novaForeheadX = W * 0.595;
      const novaForeheadY = H * 0.535;
      const foreheadPulse = (Math.sin(elapsed * 2.2) + 1) / 2;
      const foreheadSize = 12 + foreheadPulse * 8; // Bold 12px to 20px!
      drawBigSparkle(novaForeheadX, novaForeheadY, foreheadSize, 0.75 + foreheadPulse * 0.25);
      drawSoftGlow(novaForeheadX, novaForeheadY, 24, '125, 235, 255', 0.85);

      // Crystal Tail at x: 0.515, y: 0.67
      const tailX = W * 0.515;
      const tailY = H * 0.67;
      const tailBreath = (Math.sin(elapsed * 1.8) + 1) / 2;
      drawSoftGlow(tailX, tailY, W * 0.07, '80, 210, 255', 0.45 + tailBreath * 0.35);
      drawSoftGlow(tailX, tailY, W * 0.04, '190, 140, 255', 0.50 + tailBreath * 0.30);

      // Light traveling through tail feathers
      const tailWave = (elapsed * 1.2) % 1;
      const travelY = tailY + (tailWave - 0.5) * (H * 0.09);
      drawSoftGlow(tailX + Math.sin(tailWave * Math.PI) * 16, travelY, 14, '255, 255, 255', Math.sin(tailWave * Math.PI) * 0.8);
      drawBigSparkle(tailX + Math.sin(tailWave * Math.PI) * 16, travelY, 8, Math.sin(tailWave * Math.PI) * 0.9);

      // -----------------------------------------------------------------------
      // 5. NOVA'S MOTHER (Stationary foreground starlight reflections)
      // -----------------------------------------------------------------------
      const motherX = W * 0.825;
      const motherY = H * 0.55;
      const motherPulse = (Math.sin(elapsed * 1.2) + 1) / 2;
      drawSoftGlow(motherX, motherY, W * 0.08, '255, 235, 180', motherPulse * 0.25);
      // Crown star glint
      drawBigSparkle(W * 0.815, H * 0.42, 10, 0.6 + motherPulse * 0.4);

      // -----------------------------------------------------------------------
      // 6. RADIANT STAR SPARKLES (Bold diamond glints)
      // -----------------------------------------------------------------------
      starSparkles.forEach(s => {
        s.timer += 0.016;
        if (s.timer > s.interval) s.timer = 0;
        const p = s.timer / 2.2;
        if (p < 1) {
          const sparkAlpha = Math.sin(p * Math.PI);
          const size = s.maxRadius * (0.6 + p * 0.4);
          drawBigSparkle(W * s.x, H * s.y, size, sparkAlpha * 0.95);
          drawSoftGlow(W * s.x, H * s.y, size * 2.5, '255, 235, 175', sparkAlpha * 0.7);
        }
      });

      // -----------------------------------------------------------------------
      // 7. ACTIVE STARWAY ENERGY BEAMS
      // -----------------------------------------------------------------------
      starwayEnergy.forEach(e => {
        e.progress += e.speed;
        if (e.progress > 1) e.progress = 0;

        const t = e.progress;
        const ex = (1 - t) * (1 - t) * e.startX + 2 * (1 - t) * t * e.ctrlX + t * t * e.endX;
        const ey = (1 - t) * (1 - t) * e.startY + 2 * (1 - t) * t * e.ctrlY + t * t * e.endY;

        const a = Math.sin(t * Math.PI) * e.alpha;
        drawSoftGlow(ex * W, ey * H, 14, '120, 230, 255', a * 0.9);
        drawBigSparkle(ex * W, ey * H, 8, a * 0.95);
      });

      // -----------------------------------------------------------------------
      // 8. MAGICAL LIGHT DUST STREAM (Wavy stardust ribbon)
      // -----------------------------------------------------------------------
      stardustStream.forEach(d => {
        d.x += d.vx;
        d.phase += 0.025;
        d.yOffset = Math.sin(d.phase * d.waveFreq) * d.waveAmp;

        if (d.x > 0.98) {
          d.x = 0.52;
          d.baseY = 0.28 + Math.random() * 0.52;
        }

        const sx = d.x * W;
        const sy = (d.baseY + d.yOffset) * H;
        const a = d.alpha * (0.65 + Math.sin(d.phase) * 0.35);

        drawSoftGlow(sx, sy, d.radius * 2.5, '255, 235, 140', a * 0.6);
        ctx.fillStyle = `rgba(255, 245, 200, ${a})`;
        ctx.beginPath();
        ctx.arc(sx, sy, d.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // -----------------------------------------------------------------------
      // 9. MULTI-DEPTH MAGICAL PARTICLES (Bold, luminous & glowing)
      // -----------------------------------------------------------------------
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.twinklePhase += p.twinkleSpeed;

        if (p.y < 0.05) p.y = 0.92;
        if (p.x < 0.52) p.x = 0.96;
        if (p.x > 0.98) p.x = 0.53;

        const px = p.x * W;
        const py = p.y * H;
        const a = p.baseAlpha * (0.7 + Math.sin(p.twinklePhase) * 0.3);

        drawSoftGlow(px, py, p.radius * 2.8, p.color, a * 0.65);

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
