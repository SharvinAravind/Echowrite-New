
import React, { useEffect, useRef } from 'react';

interface VoiceSparkleCanvasProps {
  isActive: boolean;
  volume?: number; // 0-1 normalized volume
}

export const VoiceSparkleCanvas: React.FC<VoiceSparkleCanvasProps> = ({ isActive, volume = 0.5 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!isActive || !canvasRef.current) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
      color: string;
    }> = [];

    const colors = ['#d4af37', '#fcf6ba', '#b38728', '#fbf5b7', '#ffd700'];
    
    const createParticle = () => {
      const side = Math.floor(Math.random() * 4);
      let x = 0, y = 0, vx = 0, vy = 0;
      
      switch (side) {
        case 0: // top
          x = Math.random() * canvas.width;
          y = 0;
          vx = (Math.random() - 0.5) * 2;
          vy = Math.random() * 2 + 1;
          break;
        case 1: // right
          x = canvas.width;
          y = Math.random() * canvas.height;
          vx = -(Math.random() * 2 + 1);
          vy = (Math.random() - 0.5) * 2;
          break;
        case 2: // bottom
          x = Math.random() * canvas.width;
          y = canvas.height;
          vx = (Math.random() - 0.5) * 2;
          vy = -(Math.random() * 2 + 1);
          break;
        case 3: // left
          x = 0;
          y = Math.random() * canvas.height;
          vx = Math.random() * 2 + 1;
          vy = (Math.random() - 0.5) * 2;
          break;
      }

      particles.push({
        x,
        y,
        vx,
        vy,
        life: 0,
        maxLife: 60 + Math.random() * 40,
        size: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create particles based on volume
      const particleRate = Math.max(0.1, volume * 2);
      if (Math.random() < particleRate) {
        createParticle();
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        
        const progress = p.life / p.maxLife;
        const alpha = 1 - progress;
        const currentSize = p.size * (1 - progress * 0.5);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
        }
      }

      // Draw central sparkle effect based on volume
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const sparkleSize = 20 + volume * 30;
      
      ctx.save();
      ctx.globalAlpha = 0.6;
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, sparkleSize);
      gradient.addColorStop(0, '#d4af37');
      gradient.addColorStop(0.5, '#fcf6ba');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, sparkleSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, volume]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  );
};
