
import React, { useEffect, useRef } from 'react';

export const Waveform: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let offset = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';

      const width = canvas.width;
      const height = canvas.height;
      const mid = height / 2;

      for (let x = 0; x < width; x += 4) {
        const amplitude = Math.sin(x * 0.05 + offset) * 15 * (Math.sin(offset * 0.5) + 0.5);
        ctx.moveTo(x, mid - amplitude);
        ctx.lineTo(x, mid + amplitude);
      }

      ctx.stroke();
      offset += 0.15;
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isActive]);

  return (
    <canvas 
      ref={canvasRef} 
      width={400} 
      height={60} 
      className={`w-full h-12 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}
    />
  );
};
