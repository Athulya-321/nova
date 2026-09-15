import React, { useEffect, useRef } from 'react';
import starData from './slideStars.json';

/**
 * FullScreenStoryCanvas
 * 
 * High-performance, full-screen procedural canvas animation layer.
 * Uses exact cover-ratio coordinate mapping so star twinkles, waterfalls,
 * and atmospheric glows align with the underlying 1536x1024 artwork on all screen sizes.
 */
export default function FullScreenStoryCanvas({ slideId }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Aspect ratio calculation matching CSS background-size: cover (1536 x 1024 base image)
    const IMG_W = 1536;
    const IMG_H = 1024;
    const IMG_ASPECT = IMG_W / IMG_H;

    let drawW = width;
    let drawH = height;
    let offsetX = 0;
    let offsetY = 0;

    const updateCoverDimensions = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      const screenAspect = width / height;

      if (screenAspect > IMG_ASPECT) {
        drawW = width;
        drawH = width / IMG_ASPECT;
        offsetX = 0;
        offsetY = (height - drawH) / 2;
      } else {
        drawH = height;
        drawW = height * IMG_ASPECT;
        offsetX = (width - drawW) / 2;
        offsetY = 0;
      }
    };

    updateCoverDimensions();
    window.addEventListener('resize', updateCoverDimensions);

    // Helper to map normalized image coordinates (0..1) to canvas screen pixels
    const toScreen = (normX, normY) => ({
      x: offsetX + normX * drawW,
      y: offsetY + normY * drawH
    });

    // ==========================================
    // 1. SKY / STARS (Exact centroids from artwork)
    // ==========================================
    const rawStarCoords = starData[slideId] || [];
    
    // Independent timing for every star
    const starInstances = rawStarCoords.map((coord, idx) => {
      // Randomized intervals between 3.5s and 9.5s
      const interval = 3.5 + (idx * 0.43) % 6.0;
      // Staggered initial timers so stars never blink all together
      const timer = (idx * 0.77) % interval;
      // Subtle 2–3px glow expansion
      const maxGlowSize = 1.6 + (idx % 4) * 0.45;

      return {
        normX: coord.x / 100,
        normY: coord.y / 100,
        interval,
        timer,
        isTwinkling: false,
        twinkleProgress: 0,
        twinkleDuration: 1.5, // exact 1.5 seconds brighten & return
        maxGlowSize
      };
    });

    // ==========================================
    // 2. WATERFALLS (Continuous subtle downward flow)
    // ==========================================
    class WaterfallParticle {
      constructor(side) {
        this.side = side;
        this.reset();
      }
      reset() {
        const normBaseX = this.side === 'left' ? 0.236 : 0.714;
        this.normX = normBaseX + (Math.random() - 0.5) * 0.016;
        this.normY = 0.38 + Math.random() * 0.04;
        this.normTargetY = 0.65 + Math.random() * 0.04;
        this.normVy = 0.0008 + Math.random() * 0.0012;
        this.normVx = (Math.random() - 0.5) * 0.00015;
        this.size = 1.0 + Math.random() * 1.8;
        this.alpha = 0.08 + Math.random() * 0.22;
      }
      update() {
        this.normY += this.normVy;
        this.normX += this.normVx;
        if (this.normY > this.normTargetY) this.reset();
      }
      draw() {
        const pos = toScreen(this.normX, this.normY);
        ctx.fillStyle = `rgba(200, 240, 255, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ==========================================
    // OTHER SLIDES PARTICLES (Slides 2 to 7)
    // ==========================================
    class MagicMote {
      constructor() {
        this.reset();
        this.normY = 0.3 + Math.random() * 0.6;
      }
      reset() {
        this.normX = 0.2 + Math.random() * 0.6;
        this.normY = 0.85;
        this.normVx = (Math.random() - 0.5) * 0.0004;
        this.normVy = -(0.0003 + Math.random() * 0.0005);
        this.size = 1.2 + Math.random() * 2.0;
        this.alpha = 0.15 + Math.random() * 0.35;
        this.color = Math.random() > 0.4 ? '140, 210, 255' : '200, 160, 255';
        this.pulse = Math.random() * Math.PI;
      }
      update() {
        this.normX += this.normVx + Math.sin(this.pulse) * 0.0002;
        this.normY += this.normVy;
        this.pulse += 0.018;
        if (this.normY < 0.25) this.reset();
      }
      draw() {
        const pos = toScreen(this.normX, this.normY);
        const a = this.alpha * (0.6 + Math.sin(this.pulse) * 0.4);
        ctx.fillStyle = `rgba(${this.color}, ${a})`;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    class RisingSpark {
      constructor() {
        this.reset();
        this.normY = 0.55 + Math.random() * 0.35;
      }
      reset() {
        this.normX = 0.34 + Math.random() * 0.5;
        this.normY = 0.72 + Math.random() * 0.18;
        this.normVx = (Math.random() - 0.5) * 0.0008;
        this.normVy = -(0.0009 + Math.random() * 0.0018);
        this.size = 1.0 + Math.random() * 2.2;
        this.life = 1.0;
        this.decay = 0.006 + Math.random() * 0.012;
        this.color = Math.random() > 0.3 ? '255, 140, 40' : '255, 210, 70';
      }
      update() {
        this.normX += this.normVx;
        this.normY += this.normVy;
        this.life -= this.decay;
        if (this.life <= 0 || this.normY < 0.12) this.reset();
      }
      draw() {
        const pos = toScreen(this.normX, this.normY);
        ctx.fillStyle = `rgba(${this.color}, ${this.life * 0.7})`;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, this.size * (0.4 + this.life * 0.6), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    class StarlightPetal {
      constructor() {
        this.reset();
        this.normY = Math.random();
      }
      reset() {
        this.normX = Math.random();
        this.normY = -0.05;
        this.normVy = 0.0005 + Math.random() * 0.0009;
        this.normVx = (Math.random() - 0.5) * 0.0004;
        this.angle = Math.random() * Math.PI * 2;
        this.vAngle = (Math.random() - 0.5) * 0.015;
        this.size = 1.8 + Math.random() * 2.4;
        this.alpha = 0.18 + Math.random() * 0.35;
        this.color = Math.random() > 0.35 ? '255, 255, 255' : '190, 230, 255';
      }
      update() {
        this.normY += this.normVy;
        this.normX += this.normVx + Math.sin(this.angle) * 0.0003;
        this.angle += this.vAngle;
        if (this.normY > 1.05) this.reset();
      }
      draw() {
        const pos = toScreen(this.normX, this.normY);
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    class CampfireEmber {
      constructor() {
        this.reset();
        this.normY = 0.68 + Math.random() * 0.12;
      }
      reset() {
        this.normX = 0.666 + (Math.random() - 0.5) * 0.035;
        this.normY = 0.725 + (Math.random() - 0.5) * 0.025;
        this.normVx = -0.0003 + (Math.random() - 0.5) * 0.0004;
        this.normVy = -(0.0006 + Math.random() * 0.001);
        this.size = 1.0 + Math.random() * 2.0;
        this.life = 1.0;
        this.decay = 0.005 + Math.random() * 0.009;
      }
      update() {
        this.normX += this.normVx;
        this.normY += this.normVy;
        this.life -= this.decay;
        if (this.life <= 0) this.reset();
      }
      draw() {
        const pos = toScreen(this.normX, this.normY);
        ctx.fillStyle = `rgba(255, 175, 50, ${this.life * 0.65})`;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    class ValleyCityLight {
      constructor() {
        this.normX = 0.32 + Math.random() * 0.36;
        this.normY = 0.56 + Math.random() * 0.14;
        this.size = 0.8 + Math.random() * 1.4;
        this.speed = 0.015 + Math.random() * 0.03;
        this.phase = Math.random() * Math.PI * 2;
        this.color = Math.random() > 0.4 ? '255, 240, 180' : '255, 255, 255';
      }
      update() {
        this.phase += this.speed;
      }
      draw() {
        const pos = toScreen(this.normX, this.normY);
        const alpha = 0.1 + (Math.sin(this.phase) * 0.5 + 0.5) * 0.55;
        ctx.fillStyle = `rgba(${this.color}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Pool instances
    const waterfallParticles = [];
    const magicMotes = [];
    const risingSparks = [];
    const starlightPetals = [];
    const campfireEmbers = [];
    const cityLights = [];

    if (slideId === 1) {
      for (let i = 0; i < 24; i++) waterfallParticles.push(new WaterfallParticle('left'));
      for (let i = 0; i < 24; i++) waterfallParticles.push(new WaterfallParticle('right'));
    } else if (slideId === 2) {
      for (let i = 0; i < 26; i++) magicMotes.push(new MagicMote());
    } else if (slideId === 3) {
      for (let i = 0; i < 30; i++) risingSparks.push(new RisingSpark());
    } else if (slideId === 4) {
      for (let i = 0; i < 28; i++) starlightPetals.push(new StarlightPetal());
    } else if (slideId === 5) {
      for (let i = 0; i < 20; i++) campfireEmbers.push(new CampfireEmber());
      for (let i = 0; i < 14; i++) waterfallParticles.push(new WaterfallParticle('left'));
    } else if (slideId === 6) {
      for (let i = 0; i < 40; i++) cityLights.push(new ValleyCityLight());
    }

    // ==========================================
    // RENDER LOOP (60 FPS)
    // ==========================================
    let lastTime = performance.now();

    const render = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'screen';

      // ------------------------------------------
      // 1. SKY / STARS TWINKLE (Exact Star Positions)
      // ------------------------------------------
      starInstances.forEach(star => {
        star.timer += dt;

        if (!star.isTwinkling && star.timer >= star.interval) {
          star.isTwinkling = true;
          star.twinkleProgress = 0;
          star.timer = 0;
        }

        if (star.isTwinkling) {
          star.twinkleProgress += dt;
          const halfDur = star.twinkleDuration / 2; // 0.75s brighten, 0.75s return
          let alphaBoost = 0;
          let sizeBoost = 0;

          if (star.twinkleProgress <= halfDur) {
            // Brighten up smoothly
            const progress = star.twinkleProgress / halfDur;
            alphaBoost = progress * 0.55;
            sizeBoost = progress * star.maxGlowSize;
          } else if (star.twinkleProgress <= star.twinkleDuration) {
            // Return to original brightness
            const progress = (star.twinkleDuration - star.twinkleProgress) / halfDur;
            alphaBoost = progress * 0.55;
            sizeBoost = progress * star.maxGlowSize;
          } else {
            star.isTwinkling = false;
          }

          if (alphaBoost > 0.02) {
            const pos = toScreen(star.normX, star.normY);
            const radius = 1.0 + sizeBoost;

            ctx.fillStyle = `rgba(255, 255, 255, ${alphaBoost})`;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
            ctx.fill();

            // Subtle 2-3px soft cross glint on peak
            if (alphaBoost > 0.32) {
              ctx.strokeStyle = `rgba(200, 240, 255, ${alphaBoost * 0.65})`;
              ctx.lineWidth = 0.8;
              ctx.beginPath();
              ctx.moveTo(pos.x - radius * 2.2, pos.y);
              ctx.lineTo(pos.x + radius * 2.2, pos.y);
              ctx.moveTo(pos.x, pos.y - radius * 2.2);
              ctx.lineTo(pos.x, pos.y + radius * 2.2);
              ctx.stroke();
            }
          }
        }
      });

      // ------------------------------------------
      // 2. CONTINUOUS WATERFALLS & PARTICLES
      // ------------------------------------------
      if (slideId === 1) {
        waterfallParticles.forEach(w => { w.update(); w.draw(); });
      } else if (slideId === 2) {
        magicMotes.forEach(m => { m.update(); m.draw(); });
      } else if (slideId === 3) {
        risingSparks.forEach(s => { s.update(); s.draw(); });
      } else if (slideId === 4) {
        starlightPetals.forEach(p => { p.update(); p.draw(); });
      } else if (slideId === 5) {
        campfireEmbers.forEach(e => { e.update(); e.draw(); });
        waterfallParticles.forEach(w => { w.update(); w.draw(); });
      } else if (slideId === 6) {
        cityLights.forEach(c => { c.update(); c.draw(); });
      }

      ctx.globalCompositeOperation = 'source-over';
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', updateCoverDimensions);
      cancelAnimationFrame(animationFrameId);
    };
  }, [slideId]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 2
      }}
    />
  );
}
