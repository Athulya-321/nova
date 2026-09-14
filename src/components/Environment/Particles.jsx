import React, { useEffect, useRef } from 'react';
import { useNova, NovaStates } from '../../context/NovaContext';

export default function Particles() {
  const canvasRef = useRef(null);
  const { novaState } = useNova();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.color = `rgba(125, 226, 255, ${Math.random() * 0.5})`; // Nova blue
      }
      update(isAccelerated) {
        let currentSpeedX = isAccelerated ? this.speedX * 5 : this.speedX;
        let currentSpeedY = isAccelerated ? this.speedY * 5 : this.speedY;
        
        this.x += currentSpeedX;
        this.y -= currentSpeedY + 0.1; // Float up naturally

        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < 100; i++) {
      particles.push(new Particle());
    }

    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isAccelerated = novaState === NovaStates.COSMIC_SIGHT;
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update(isAccelerated);
        particles[i].draw();
      }
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [novaState]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5
      }}
    />
  );
}
