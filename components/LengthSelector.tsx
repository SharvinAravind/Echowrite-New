import React from 'react';
import { Length, LENGTH_CONFIGS } from '../types';
import { Lock } from 'lucide-react';

interface LengthSelectorProps {
  selectedLength: Length;
  onSelect: (length: Length) => void;
  userTier: 'free' | 'premium';
}

export const LengthSelector: React.FC<LengthSelectorProps> = ({ selectedLength, onSelect, userTier }) => {
  const canAccess = (isPremium: boolean) => {
    return userTier === 'premium' || !isPremium;
  };

  return (
    <div className="w-full">
      <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--neu-text-secondary)' }}>
        Length
      </label>
      <div className="grid grid-cols-3 gap-3">
        {LENGTH_CONFIGS.map((config) => {
          const accessible = canAccess(config.premium);
          const isSelected = selectedLength === config.id;

          return (
            <button
              key={config.id}
              onClick={() => accessible && onSelect(config.id)}
              disabled={!accessible}
              className={`neu-button neu-hover px-4 py-4 rounded-[20px] text-center transition-all relative ${
                isSelected ? 'neu-pressed' : 'neu-lifted'
              } ${!accessible ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{
                background: isSelected ? 'var(--neu-surface)' : 'var(--neu-surface)',
                color: isSelected ? 'var(--neu-accent)' : 'var(--neu-text-primary)'
              }}
            >
              <p className="text-sm font-bold mb-1">{config.name}</p>
              <p className="text-[9px]" style={{ color: 'var(--neu-text-secondary)' }}>
                {config.wordRange}
              </p>
              {config.premium && !accessible && (
                <Lock className="w-3 h-3 absolute top-2 right-2" style={{ color: 'var(--neu-text-secondary)' }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
