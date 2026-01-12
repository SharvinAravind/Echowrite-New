import React from 'react';
import { Mic } from 'lucide-react';
import { Waveform } from './Waveform';

interface LivePreviewProps {
  interimText: string;
  isDictating: boolean;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ interimText, isDictating }) => {
  if (!isDictating && !interimText) return null;

  return (
    <div
      className="mt-4 rounded-[30px] overflow-hidden transition-all duration-300"
      style={{
        background: 'var(--neu-surface)',
        boxShadow: 'inset 4px 4px 8px var(--neu-shadow-dark), inset -4px -4px 8px var(--neu-shadow-light)',
        border: '2px dashed var(--neu-accent)',
        maxHeight: '200px'
      }}
    >
      <div className="px-6 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--neu-shadow-dark)' }}>
        <div className="flex items-center gap-3">
          <Mic className="w-4 h-4" style={{ color: 'var(--neu-accent)' }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--neu-text-secondary)' }}>
            Live Preview
          </span>
        </div>
        <Waveform isActive={isDictating} />
      </div>
      <div className="px-6 py-4 max-h-32 overflow-y-auto scrollbar-hide">
        {interimText ? (
          <p className="text-lg italic leading-relaxed" style={{ color: 'var(--neu-text-secondary)', opacity: 0.6 }}>
            {interimText}
          </p>
        ) : (
          <p className="text-sm" style={{ color: 'var(--neu-text-secondary)', opacity: 0.4 }}>
            Listening for your voice...
          </p>
        )}
      </div>
    </div>
  );
};
