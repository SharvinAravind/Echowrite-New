
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

export enum Tone {
  APPRECIATIVE = 'Appreciative',
  WARM = 'Warm',
  PROFESSIONAL = 'Professional',
  RESPECTFUL = 'Respectful',
  MARKETING = 'Marketing',
  ELABORATE = 'Elaborate'
}

export enum Length {
  SIMPLE = 'Simple',
  MEDIUM = 'Medium',
  LONG = 'Long'
}

export type AppTheme = 'neu-default' | 'neu-dark' | 'warm-cream' | 'cool-blue' | 'mint-fresh' | 'rose-gold' | 'arctic-white' | 'midnight-pro';

export interface ToneConfig {
  id: Tone;
  name: string;
  description: string;
  premium: boolean;
}

export interface LengthConfig {
  id: Length;
  name: string;
  wordRange: string;
  premium: boolean;
}

export interface UsageStats {
  [date: string]: number;
}

export interface UserPreferences {
  theme: AppTheme;
  noiseCancellation: boolean;
  accentColor: string;
  snowfallEffect: boolean;
  autoLanguageDetect: boolean;
}

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
  tone: Tone;
  length: Length;
  wordCount: number;
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
  style?: WritingStyle;
  tone?: Tone;
  length?: Length;
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

export const TONE_CONFIGS: ToneConfig[] = [
  { id: Tone.APPRECIATIVE, name: 'Appreciative', description: 'Grateful and thankful', premium: false },
  { id: Tone.WARM, name: 'Warm', description: 'Friendly and empathetic', premium: false },
  { id: Tone.PROFESSIONAL, name: 'Professional', description: 'Formal and polished', premium: false },
  { id: Tone.RESPECTFUL, name: 'Respectful', description: 'Courteous and diplomatic', premium: false },
  { id: Tone.MARKETING, name: 'Marketing', description: 'Persuasive and engaging', premium: true },
  { id: Tone.ELABORATE, name: 'Elaborate', description: 'Detailed and comprehensive', premium: true }
];

export const LENGTH_CONFIGS: LengthConfig[] = [
  { id: Length.SIMPLE, name: 'Simple', wordRange: '20-40 words', premium: false },
  { id: Length.MEDIUM, name: 'Medium', wordRange: '60-100 words', premium: false },
  { id: Length.LONG, name: 'Long', wordRange: '150-250 words', premium: true }
];

export const THEME_CONFIGS = [
  { id: 'neu-default', name: 'Default Neumorphic', bg: '#eef1f6', surface: '#ffffff', shadow: '#ced4e1' },
  { id: 'neu-dark', name: 'Dark Neumorphic', bg: '#2d3748', surface: '#1a202c', shadow: '#1a1a1a' },
  { id: 'warm-cream', name: 'Warm Cream', bg: '#f5f5dc', surface: '#fffef0', shadow: '#e0dfc8' },
  { id: 'cool-blue', name: 'Cool Blue', bg: '#e3f2fd', surface: '#f5fbff', shadow: '#c5e1f5' },
  { id: 'mint-fresh', name: 'Mint Fresh', bg: '#e0f2f1', surface: '#f0fffe', shadow: '#c2dedd' },
  { id: 'rose-gold', name: 'Rose Gold', bg: '#ffe4e1', surface: '#fff9f8', shadow: '#e8d0cd' },
  { id: 'arctic-white', name: 'Arctic White', bg: '#ffffff', surface: '#ffffff', shadow: '#e0e0e0' },
  { id: 'midnight-pro', name: 'Midnight Pro', bg: '#1a202c', surface: '#2d3748', shadow: '#0d1117' }
];
