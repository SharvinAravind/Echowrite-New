import React from 'react';
import { Tone, TONE_CONFIGS } from '../types';
import { Lock } from 'lucide-react';

interface ToneSelectorProps {
  selectedTone: Tone;
  onSelect: (tone: Tone) => void;
  userTier: 'free' | 'premium';
}

export const ToneSelector: React.FC<ToneSelectorProps> = ({ selectedTone, onSelect, userTier }) => {
  const canAccess = (isPremium: boolean) => {
    return userTier === 'premium' || !isPremium;
  };

  return (
    <div className="w-full">
      <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--neu-text-secondary)' }}>
        Tone
      </label>
      <div className="grid grid-cols-2 gap-3">
        {TONE_CONFIGS.map((config) => {
          const accessible = canAccess(config.premium);
          const isSelected = selectedTone === config.id;

          return (
            <button
              key={config.id}
              onClick={() => accessible && onSelect(config.id)}
              disabled={!accessible}
              className={`neu-button neu-hover px-6 py-4 rounded-[20px] text-left transition-all relative ${
                isSelected ? 'neu-pressed' : 'neu-lifted'
              } ${!accessible ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{
                background: isSelected ? 'var(--neu-surface)' : 'var(--neu-surface)',
                color: isSelected ? 'var(--neu-accent)' : 'var(--neu-text-primary)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">{config.name}</p>
                  <p className="text-[10px] mt-1" style={{ color: 'var(--neu-text-secondary)' }}>
                    {config.description}
                  </p>
                </div>
                {config.premium && !accessible && (
                  <Lock className="w-4 h-4" style={{ color: 'var(--neu-text-secondary)' }} />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
