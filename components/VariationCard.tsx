import React, { useState } from 'react';
import { WritingVariation } from '../types';
import { Copy, CheckCircle2 } from 'lucide-react';

interface VariationCardProps {
  variation: WritingVariation;
  onApply: (text: string) => void;
}

export const VariationCard: React.FC<VariationCardProps> = ({ variation, onApply }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(variation.suggestedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="neu-card rounded-[30px] p-6 transition-all hover:scale-[1.01]"
      style={{
        background: 'var(--neu-surface)',
        boxShadow: '10px 10px 20px var(--neu-shadow-dark), -10px -10px 20px var(--neu-shadow-light)'
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2 flex-wrap">
          <span
            className="text-[9px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest"
            style={{
              background: 'var(--neu-bg)',
              color: 'var(--neu-accent)',
              boxShadow: 'inset 2px 2px 5px var(--neu-shadow-dark), inset -2px -2px 5px var(--neu-shadow-light)'
            }}
          >
            {variation.tone}
          </span>
          <span
            className="text-[9px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest"
            style={{
              background: 'var(--neu-bg)',
              color: 'var(--neu-text-primary)',
              boxShadow: 'inset 2px 2px 5px var(--neu-shadow-dark), inset -2px -2px 5px var(--neu-shadow-light)'
            }}
          >
            {variation.length}
          </span>
          <span
            className="text-[9px] font-bold px-3 py-1.5 rounded-lg"
            style={{
              color: 'var(--neu-text-secondary)'
            }}
          >
            {variation.wordCount} words
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="neu-button neu-hover p-2 rounded-full"
          style={{
            background: 'var(--neu-surface)',
            boxShadow: '4px 4px 8px var(--neu-shadow-dark), -4px -4px 8px var(--neu-shadow-light)'
          }}
        >
          {copied ? (
            <CheckCircle2 className="w-4 h-4" style={{ color: '#10b981' }} />
          ) : (
            <Copy className="w-4 h-4" style={{ color: 'var(--neu-accent)' }} />
          )}
        </button>
      </div>

      <div
        className="rounded-[20px] p-6 mb-4 min-h-[120px]"
        style={{
          background: 'var(--neu-bg)',
          boxShadow: 'inset 4px 4px 8px var(--neu-shadow-dark), inset -4px -4px 8px var(--neu-shadow-light)'
        }}
      >
        <p className="text-base leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--neu-text-primary)' }}>
          {variation.suggestedText}
        </p>
      </div>

      {variation.analysis && variation.analysis.keywords && variation.analysis.keywords.length > 0 && (
        <div className="mb-4">
          <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--neu-text-secondary)' }}>
            Keywords
          </p>
          <div className="flex flex-wrap gap-2">
            {variation.analysis.keywords.slice(0, 5).map((keyword, idx) => (
              <span
                key={idx}
                className="text-[9px] font-medium px-3 py-1 rounded-full"
                style={{
                  background: 'var(--neu-surface)',
                  color: 'var(--neu-accent)',
                  boxShadow: '2px 2px 4px var(--neu-shadow-dark), -2px -2px 4px var(--neu-shadow-light)',
                  border: '1px solid var(--neu-shadow-dark)'
                }}
              >
                #{keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => onApply(variation.suggestedText)}
        className="w-full py-3 rounded-[20px] font-bold text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: 'linear-gradient(135deg, var(--neu-accent), var(--neu-accent-hover))',
          boxShadow: '6px 6px 12px var(--neu-shadow-dark), -6px -6px 12px var(--neu-shadow-light)',
          color: 'white'
        }}
      >
        Apply to Workspace
      </button>
    </div>
  );
};
