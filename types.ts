
export enum WritingStyle {
  PROFESSIONAL_EMAIL = 'Professional Email',
  CASUAL_TEXT = 'Casual Text',
  ACADEMIC = 'Academic Paper',
  IMPROVE_PHRASING = 'Improve Phrasing',
  GRAMMAR_CHECK = 'Grammar Check',
  CREATIVE = 'Creative Writing',
  PROFESSIONAL_SUMMARY = 'Professional Summary',
  SOCIAL_MEDIA_POST = 'Social Media Post',
  TECHNICAL_DOC = 'Technical Doc',
  REWRITE_BULLETS = 'Rewrite as Bullets',
  MEETING_NOTES = 'Meeting Notes',
  ACTION_ITEMS = 'Action Items',
  BLOG_DRAFT = 'Blog Draft'
}

export type AppTheme = 'creamy' | 'pure' | 'minimal' | 'gold-luxe' | 'midnight-pro' | 'frost-glass';

export interface User {
  id: string;
  email: string;
  name: string;
  tier: 'free' | 'premium';
  settings?: UserSettings;
}

export interface UserSettings {
  voice: {
    noiseCancellation: boolean;
    autoPunctuation: boolean;
    diarization: boolean;
    autoDetectLang: boolean;
  };
  output: {
    smartFormatting: boolean;
    autoGrammar: boolean;
    customVocabulary: string[];
    showEmoji: boolean;
  };
  privacy: {
    encryption: boolean;
    autoDeleteDays: number;
    noTraining: boolean;
  };
  automation: {
    autoSummarize: boolean;
    autoExportEmail: boolean;
  };
}

export interface WritingVariation {
  id: string;
  label: string;
  suggestedText: string;
  tone: string;
  changes: { field: string; reason: string }[];
  analysis?: {
    sentiment: string;
    keywords: string[];
  };
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  originalText: string;
  style: WritingStyle;
  variations: WritingVariation[];
  visuals: string[];
  tags?: string[];
  folder?: string;
}

export const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English' },
  { code: 'ta-IN', name: 'Tamil' },
  { code: 'ur-PK', name: 'Urdu' },
  { code: 'ml-IN', name: 'Malayalam' },
  { code: 'te-IN', name: 'Telugu' },
  { code: 'kn-IN', name: 'Kannada' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'pt-BR', name: 'Portuguese' },
  { code: 'ru-RU', name: 'Russian' },
  { code: 'zh-CN', name: 'Chinese' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'ko-KR', name: 'Korean' },
  { code: 'ar-SA', name: 'Arabic' },
  { code: 'hi-IN', name: 'Hindi' }
];
