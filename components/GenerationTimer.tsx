import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface GenerationTimerProps {
  isGenerating: boolean;
  onTimeUpdate?: (time: number) => void;
}

export const GenerationTimer: React.FC<GenerationTimerProps> = ({ isGenerating, onTimeUpdate }) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setElapsedTime(0);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsed);
      if (onTimeUpdate) onTimeUpdate(elapsed);
    }, 100);

    return () => clearInterval(interval);
  }, [isGenerating, onTimeUpdate]);

  if (!isGenerating && elapsedTime === 0) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="flex items-center gap-2 px-4 py-2 rounded-full animate-pulse"
      style={{
        background: 'var(--neu-surface)',
        boxShadow: 'inset 2px 2px 5px var(--neu-shadow-dark), inset -2px -2px 5px var(--neu-shadow-light)'
      }}
    >
      <Clock className="w-4 h-4" style={{ color: 'var(--neu-accent)' }} />
      <span className="text-xs font-bold" style={{ color: 'var(--neu-text-secondary)' }}>
        Processing: {formatTime(elapsedTime)}
      </span>
    </div>
  );
};
