
import React from 'react';
import { WritingStyle } from '../types';
import { Crown } from 'lucide-react';

interface StyleButtonsProps {
  currentStyle: WritingStyle;
  onSelect: (style: WritingStyle) => void;
  isLoading: boolean;
}

const styles = [
  { id: WritingStyle.PROFESSIONAL_EMAIL, label: '📧 Email', color: 'text-blue-600', premium: false },
  { id: WritingStyle.CASUAL_TEXT, label: '💬 Casual', color: 'text-emerald-600', premium: false },
  { id: WritingStyle.GRAMMAR_CHECK, label: '⚖️ Grammar', color: 'text-indigo-600', premium: false },
  { id: WritingStyle.IMPROVE_PHRASING, label: '✨ Phrasing', color: 'text-[#d4af37]', premium: false },
  { id: WritingStyle.MEETING_NOTES, label: '📓 Meeting Notes', color: 'text-amber-700', premium: true },
  { id: WritingStyle.ACTION_ITEMS, label: '✅ Action Items', color: 'text-red-600', premium: true },
  { id: WritingStyle.BLOG_DRAFT, label: '✍️ Blog Draft', color: 'text-violet-600', premium: true },
  { id: WritingStyle.ACADEMIC, label: '🎓 Academic', color: 'text-slate-600', premium: false },
  { id: WritingStyle.PROFESSIONAL_SUMMARY, label: '📝 Summary', color: 'text-amber-600', premium: false },
  { id: WritingStyle.SOCIAL_MEDIA_POST, label: '📱 Social', color: 'text-sky-600', premium: false },
  { id: WritingStyle.TECHNICAL_DOC, label: '🛠️ Tech Doc', color: 'text-zinc-600', premium: true },
  { id: WritingStyle.REWRITE_BULLETS, label: '📋 Bullets', color: 'text-teal-600', premium: false },
];

export const StyleButtons: React.FC<StyleButtonsProps> = ({ currentStyle, onSelect, isLoading }) => {
  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      {styles.map((style) => (
        <button
          key={style.id}
          disabled={isLoading}
          onClick={() => onSelect(style.id)}
          className={`group flex items-center px-4 py-2.5 rounded-full transition-all duration-300 text-[9px] font-black uppercase tracking-wider border shadow-sm relative ${
            currentStyle === style.id 
              ? 'bg-[#d4af37] text-white border-[#d4af37] scale-105 z-10' 
              : 'bg-white text-slate-500 border-slate-100 hover:border-[#d4af37]/30 hover:scale-[1.02]'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className={currentStyle === style.id ? 'text-white' : style.color + ' mr-1.5'}>
            {style.label.split(' ')[0]}
          </span>
          {style.label.split(' ').slice(1).join(' ')}
          {style.premium && (
            <Crown className={`w-2.5 h-2.5 ml-1.5 transition-colors ${currentStyle === style.id ? 'text-white' : 'text-[#d4af37]'}`} />
          )}
        </button>
      ))}
    </div>
  );
};
