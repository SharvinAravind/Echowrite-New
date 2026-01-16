
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  getWritingVariations, 
  translateText,
  rephraseText,
  generateToneVariations
} from './services/geminiService';
import { 
  WritingStyle, 
  WritingVariation, 
  SUPPORTED_LANGUAGES, 
  HistoryItem,
  User as UserType,
  AppTheme,
  ToneCategory,
  LengthVariation
} from './types';
import { StyleButtons } from './components/StyleButtons';
import { Auth } from './components/Auth';
import { SettingsModal } from './components/SettingsModal';
import { Waveform } from './components/Waveform';
import { VoiceSparkleCanvas } from './components/VoiceSparkleCanvas';
import { LiveVoiceSession } from './components/LiveVoiceSession';
import { SnowEffect } from './components/SnowEffect';
import { 
  Sparkles, Trash2, Copy, CheckCircle2, Mic, 
  RefreshCw, History as HistoryIcon, Languages, 
  X, Edit3, LogOut, Settings, BarChart2, Zap, Crown,
  Pause, Play, Volume2, Snowflake
} from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [text, setText] = useState('');
  const [style, setStyle] = useState<WritingStyle>(WritingStyle.PROFESSIONAL_EMAIL);
  const [variations, setVariations] = useState<WritingVariation[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<WritingVariation | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [liveSessionOpen, setLiveSessionOpen] = useState(false);
  const [theme, setTheme] = useState<AppTheme>('gold-luxe');
  const [inputLang, setInputLang] = useState('en-US');
  const [isDictating, setIsDictating] = useState(false);
  const [interimText, setInterimText] = useState('');
  
  // New state for tone-based generation
  const [activeTone, setActiveTone] = useState<ToneCategory>(ToneCategory.PROFESSIONAL);
  const [selectedLength, setSelectedLength] = useState<LengthVariation | null>(null);
  const [dictationTimer, setDictationTimer] = useState(0);
  const [processingTime, setProcessingTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [snowEffectEnabled, setSnowEffectEnabled] = useState(false);
  const [voiceVolume, setVoiceVolume] = useState(0.5);
  const [showWaveform, setShowWaveform] = useState(true);

  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const processingStartRef = useRef<number>(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('v2t_history');
      if (saved) setHistory(JSON.parse(saved));
      const savedUser = localStorage.getItem('v2t_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        setUser(u);
        if (!u.usageCount) u.usageCount = 0;
        const savedTheme = u.settings?.personalization?.theme || (u.tier === 'premium' ? 'gold-luxe' : 'minimal');
        setTheme(savedTheme);
        setSnowEffectEnabled(u.settings?.personalization?.snowfallEffect || false);
        // Load theme CSS variables
        updateThemeCSS(savedTheme);
      } else {
        updateThemeCSS('minimal');
      }
    } catch (e) {
      updateThemeCSS('minimal');
    }
  }, []);

  // Dictation timer effect
  useEffect(() => {
    if (isDictating && !isPaused) {
      timerIntervalRef.current = setInterval(() => {
        setDictationTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isDictating, isPaused]);

  // Theme CSS variables update function
  const updateThemeCSS = (newTheme: AppTheme) => {
    const root = document.documentElement;
    const themeColors: Record<AppTheme, { bg: string; text: string; accent: string; border: string }> = {
      'gold-luxe': { bg: '#0a0a0a', text: '#ffffff', accent: '#d4af37', border: '#d4af37/10' },
      'minimal': { bg: '#fafafa', text: '#1e293b', accent: '#64748b', border: '#e2e8f0' },
      'creamy': { bg: '#f2f2f0', text: '#1e293b', accent: '#8b7355', border: '#d4c5b0' },
      'pure': { bg: '#ffffff', text: '#1e293b', accent: '#3b82f6', border: '#e5e7eb' },
      'midnight-pro': { bg: '#121212', text: '#e2e8f0', accent: '#6366f1', border: '#1e293b' },
      'frost-glass': { bg: '#e2e8f0', text: '#1e293b', accent: '#0ea5e9', border: '#cbd5e1' },
      'ocean-blue': { bg: '#0f172a', text: '#e0f2fe', accent: '#0ea5e9', border: '#1e3a8a/20' },
      'sunset-orange': { bg: '#1c1917', text: '#fed7aa', accent: '#f97316', border: '#ea580c/20' }
    };
    
    const colors = themeColors[newTheme];
    root.style.setProperty('--theme-bg', colors.bg);
    root.style.setProperty('--theme-text', colors.text);
    root.style.setProperty('--theme-accent', colors.accent);
    root.style.setProperty('--theme-border', colors.border);
  };

  const handleLogin = (u: UserType) => {
    const newUser = { ...u, usageCount: u.usageCount || 0 };
    setUser(newUser);
    const savedTheme = newUser.settings?.personalization?.theme || (newUser.tier === 'premium' ? 'gold-luxe' : 'minimal');
    setTheme(savedTheme);
    updateThemeCSS(savedTheme);
    setSnowEffectEnabled(newUser.settings?.personalization?.snowfallEffect || false);
    localStorage.setItem('v2t_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('v2t_user');
  };

  const saveToHistory = useCallback((vars: WritingVariation[]) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      originalText: text,
      style: style,
      variations: vars,
      visuals: []
    };
    setHistory(prev => {
      const updated = [newItem, ...prev].slice(0, 50);
      localStorage.setItem('v2t_history', JSON.stringify(updated));
      return updated;
    });
  }, [text, style]);

  const handleProcess = useCallback(async (targetStyle?: WritingStyle, tone?: ToneCategory) => {
    if (!text.trim() || isLoading) return;
    
    // Check usage limit for free tier
    if (user?.tier === 'free' && (user.usageCount || 0) >= 10) {
      alert("You've reached your free tier limit of 10 generations. Upgrade to Premium for unlimited access!");
      return;
    }

    setIsLoading(true);
    processingStartRef.current = Date.now();
    setStyle(targetStyle || style);
    
    try {
      let result;
      if (tone) {
        // Use tone-based generation
        result = await generateToneVariations(text, tone, inputLang);
      } else {
        // Use style-based generation (legacy)
        result = await getWritingVariations(text, targetStyle || style);
      }
      
      setVariations(result.variations);
      setSelectedVariation(result.variations[0]);
      saveToHistory(result.variations);
      
      // Update usage count
      if (user) {
        const updatedUser = { ...user, usageCount: (user.usageCount || 0) + 1 };
        setUser(updatedUser);
        localStorage.setItem('v2t_user', JSON.stringify(updatedUser));
      }
      
      const processingTimeMs = Date.now() - processingStartRef.current;
      setProcessingTime(processingTimeMs);
    } catch (err) { 
      console.error(err); 
      alert("Neural engine mismatch. Please check your network and retry.");
    } finally { 
      setIsLoading(false); 
    }
  }, [text, saveToHistory, isLoading, user, style, inputLang]);

  const startDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = inputLang;
    recognition.continuous = true;
    recognition.interimResults = true;
    
    // Track volume for sparkle animation
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let currentInterim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
        else currentInterim += event.results[i][0].transcript;
      }
      setInterimText(currentInterim);
      if (finalTranscript) {
        setText(prev => (prev ? prev + ' ' : '') + finalTranscript);
        setInterimText('');
      }
      
      // Simulate volume for sparkle effect
      setVoiceVolume(0.3 + Math.random() * 0.4);
    };
    
    recognition.onstart = () => {
      setIsDictating(true);
      setIsPaused(false);
      setDictationTimer(0);
      setShowWaveform(true);
    };
    
    recognition.onend = () => {
      setIsDictating(false);
      setIsPaused(false);
      setShowWaveform(false);
    };
    
    recognition.onerror = () => {
      setIsDictating(false);
      setIsPaused(false);
      setShowWaveform(false);
    };
    
    recognition.start();
    recognitionRef.current = recognition;
  };

  const pauseDictation = () => {
    if (recognitionRef.current && isDictating) {
      recognitionRef.current.stop();
      setIsPaused(true);
    }
  };

  const resumeDictation = () => {
    if (isPaused) {
      setIsPaused(false);
      startDictation();
    }
  };

  const stopDictation = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsDictating(false);
    setIsPaused(false);
    setInterimText('');
    setDictationTimer(0);
    setShowWaveform(false);
    setVoiceVolume(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = () => {
    if (selectedVariation) {
      navigator.clipboard.writeText(selectedVariation.suggestedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const themeClasses: Record<AppTheme, string> = {
    creamy: "bg-[#f2f2f0] text-slate-800",
    pure: "bg-[#ffffff] text-slate-800",
    minimal: "bg-[#fafafa] text-slate-800",
    'gold-luxe': "bg-[#0a0a0a] text-white",
    'midnight-pro': "bg-[#121212] text-slate-100",
    'frost-glass': "bg-[#e2e8f0] text-slate-800",
    'ocean-blue': "bg-[#0f172a] text-slate-100",
    'sunset-orange': "bg-[#1c1917] text-orange-100"
  };

  if (!user) return <Auth onLogin={handleLogin} />;

  const isGold = theme === 'gold-luxe';

  return (
    <div className={`min-h-screen flex flex-col relative transition-colors duration-700 ${themeClasses[theme]} overflow-hidden font-sans`}>
      {/* Snow Effect */}
      <SnowEffect enabled={snowEffectEnabled} />
      
      {/* Voice Sparkle Canvas */}
      {isDictating && <VoiceSparkleCanvas isActive={isDictating} volume={voiceVolume} />}
      
      <header className={`px-6 md:px-10 py-4 md:py-6 flex flex-col gap-4 sticky top-0 z-40 border-b transition-all duration-700 ${
        isGold ? 'bg-black/90 border-[#d4af37]/10' : 'bg-white/90 border-slate-200'
      } backdrop-blur-xl`}>
        {/* Top Row: Brand & Main Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 md:gap-6">
            <button onClick={() => setHistoryOpen(!historyOpen)} className={`p-2.5 rounded-2xl transition-all shadow-sm hover:shadow-md active:shadow-inner ${isGold ? 'text-[#d4af37] hover:bg-white/5 bg-white/5' : 'text-slate-600 hover:bg-slate-100 bg-white'}`}>
              <HistoryIcon className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <div className="flex items-center gap-3 md:gap-4">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shadow-xl border transition-all ${
                isGold ? 'bg-[#d4af37]/20 border-[#d4af37]/40' : 'bg-[#d4af37] border-white/30'
              }`}>
                <Mic className={`${isGold ? 'text-[#d4af37]' : 'text-white'} w-5 h-5 md:w-7 md:h-7`} />
              </div>
              <div>
                 <h1 className={`text-xl md:text-2xl font-black tracking-tighter uppercase ${isGold ? 'gold-gradient-text' : 'text-slate-900'}`}>EchoWrite</h1>
                 <p className="text-[7px] md:text-[8px] text-slate-500 font-black uppercase tracking-[0.3em]">Voice to Professional Text</p>
                 <div className="flex items-center gap-2 mt-0.5">
                   <p className="text-[7px] text-slate-500 font-black uppercase tracking-[0.2em]">{user.tier} Plan</p>
                   {user.tier === 'premium' && <Crown className="w-2 h-2 md:w-2.5 md:h-2.5 text-[#d4af37]" />}
                   {user.tier === 'free' && <span className="text-[7px] text-orange-500 font-bold">({10 - (user.usageCount || 0)} left)</span>}
                 </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <button onClick={() => setSettingsOpen(true)} className={`p-2.5 md:p-3 rounded-full border transition-all shadow-sm hover:shadow-md active:shadow-inner ${
              isGold ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
              <Settings className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button onClick={() => setSnowEffectEnabled(!snowEffectEnabled)} className={`p-2.5 md:p-3 rounded-full border transition-all shadow-sm hover:shadow-md active:shadow-inner ${
              isGold ? `bg-white/5 border-white/10 text-white hover:bg-white/10 ${snowEffectEnabled ? 'text-[#d4af37]' : ''}` : `bg-white border-slate-200 text-slate-600 hover:bg-slate-50 ${snowEffectEnabled ? 'text-blue-500' : ''}`
            }`}>
              <Snowflake className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button disabled={!text || isLoading} onClick={() => handleProcess(style, activeTone)} className="flex items-center gap-2 md:gap-3 px-6 md:px-8 py-2.5 md:py-3 bg-[#d4af37] text-white rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-widest shadow-2xl shadow-[#d4af37]/30 hover:scale-105 transition-all active:scale-95 disabled:opacity-50">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4" /> GENERATE
            </button>
            <button onClick={handleLogout} className="p-2.5 md:p-3 text-slate-500 hover:text-red-500 transition-colors">
              <LogOut className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>

        {/* Bottom Row: Navigation Elements */}
        <div className="flex items-center gap-3 md:gap-4 flex-wrap">
          <div className={`flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-2.5 rounded-full border shadow-sm transition-all ${
            isGold ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-600'
          }`}>
            <Languages className="w-4 h-4 md:w-5 md:h-5 text-[#d4af37]" />
            <select value={inputLang} onChange={(e) => setInputLang(e.target.value)} className="bg-transparent border-none text-[9px] md:text-[10px] font-black uppercase outline-none cursor-pointer">
              {SUPPORTED_LANGUAGES.map(l => <option key={l.code} value={l.code} className="text-black">{l.name}</option>)}
            </select>
          </div>
          
          {/* Voice Reduction Toggle */}
          <button className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-full border shadow-sm transition-all ${
            isGold ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}>
            <Volume2 className="w-4 h-4 text-[#d4af37]" />
            <span className="text-[9px] md:text-[10px] font-black uppercase">Noise Cancel</span>
          </button>

          {/* Generation Timer */}
          {isDictating && (
            <div className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-full border shadow-sm ${
              isGold ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
            }`}>
              <Mic className="w-4 h-4" />
              <span className="text-[9px] md:text-[10px] font-black">{formatTime(dictationTimer)}</span>
            </div>
          )}

          {/* Processing Time */}
          {processingTime > 0 && !isLoading && (
            <div className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-full border shadow-sm ${
              isGold ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-green-50 border-green-200 text-green-600'
            }`}>
              <Zap className="w-4 h-4" />
              <span className="text-[9px] md:text-[10px] font-black">{(processingTime / 1000).toFixed(1)}s</span>
            </div>
          )}
        </div>
      </header>

      {/* Tone Tabs */}
      <div className={`px-6 md:px-10 py-4 border-b sticky top-[140px] md:top-[160px] z-30 transition-all ${
        isGold ? 'bg-black/80 border-[#d4af37]/10' : 'bg-white/80 border-slate-200'
      } backdrop-blur-lg`}>
        <div className="flex items-center gap-2 md:gap-3 overflow-x-auto scrollbar-hide pb-2">
          {Object.values(ToneCategory).map((tone) => (
            <button
              key={tone}
              onClick={() => {
                setActiveTone(tone);
                setSelectedLength(null);
                if (text.trim()) handleProcess(style, tone);
              }}
              className={`shrink-0 px-4 md:px-6 py-2 md:py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-wider border transition-all shadow-sm hover:shadow-md active:shadow-inner ${
                activeTone === tone
                  ? 'bg-[#d4af37] text-white border-[#d4af37] shadow-lg scale-105'
                  : isGold
                  ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              } ${user?.tier === 'free' && (tone === ToneCategory.MARKETING || tone === ToneCategory.ELABORATE) ? 'opacity-50' : ''}`}
              disabled={user?.tier === 'free' && (tone === ToneCategory.MARKETING || tone === ToneCategory.ELABORATE)}
            >
              {tone}
              {user?.tier === 'free' && (tone === ToneCategory.MARKETING || tone === ToneCategory.ELABORATE) && (
                <Crown className="w-3 h-3 inline-block ml-1.5" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 relative z-10 overflow-hidden">
        {/* Archive Sidebar */}
        <aside className={`fixed left-0 top-0 h-full w-96 z-50 transition-transform duration-700 transform ${historyOpen ? 'translate-x-0' : '-translate-x-full'} ${
          isGold ? 'bg-black/98 border-r border-[#d4af37]/10' : 'bg-white/98 border-r border-slate-200'
        } shadow-2xl`}>
          <div className="p-10 h-full flex flex-col">
            <div className="flex justify-between items-center mb-12">
              <h3 className="text-sm font-black text-[#d4af37] uppercase tracking-[0.4em] flex items-center gap-3"><HistoryIcon className="w-5 h-5" /> Archive</h3>
              <button onClick={() => setHistoryOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6 text-slate-500" /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
              {history.length === 0 ? <p className="text-[10px] text-slate-500 uppercase font-black text-center mt-20 tracking-widest opacity-30">No sessions recorded</p> : 
                history.map(item => (
                  <div key={item.id} onClick={() => { setText(item.originalText); setVariations(item.variations); setSelectedVariation(item.variations[0]); setHistoryOpen(false); }} className={`p-5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] ${
                    isGold ? 'bg-white/5 border-white/5 hover:border-[#d4af37]/30' : 'bg-slate-50 border-slate-100 hover:border-[#d4af37]/30'
                  }`}>
                    <span className="text-[8px] font-black text-[#d4af37] uppercase block mb-1 tracking-widest">{item.style}</span>
                    <p className="text-xs line-clamp-2 font-medium opacity-70 leading-relaxed">{item.originalText}</p>
                    <p className="text-[7px] font-bold text-slate-500 mt-3 uppercase tracking-widest">{new Date(item.timestamp).toLocaleDateString()}</p>
                  </div>
                ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 scrollbar-hide">
          <div className={`p-4 rounded-3xl shadow-sm transition-all ${isGold ? 'bg-white/5 border border-white/5' : 'bg-white border border-slate-100'}`}>
             <StyleButtons currentStyle={style} onSelect={handleProcess} isLoading={isLoading} />
          </div>

          <div className="flex flex-col xl:flex-row gap-8">
            <div className={`flex-1 rounded-[3rem] shadow-xl flex flex-col relative min-h-[500px] overflow-hidden transition-all duration-700 ${
              isGold ? 'bg-white/5 border border-white/5' : 'bg-white border border-slate-100'
            }`}>
              <div className="px-6 md:px-10 py-4 md:py-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                  <h3 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 md:gap-3"><Edit3 className="w-3 h-3 md:w-4 md:h-4 text-[#d4af37]" /> Neural Canvas</h3>
                  {isDictating && showWaveform && <div className="flex-1 max-w-[200px] md:max-w-none"><Waveform isActive={isDictating} /></div>}
                </div>
                <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-end">
                  <button onClick={() => setLiveSessionOpen(true)} className={`p-2.5 md:p-3 rounded-xl transition-all shadow-sm hover:shadow-md active:shadow-inner ${isGold ? 'text-slate-400 hover:text-[#d4af37] bg-white/5' : 'text-slate-500 hover:text-[#d4af37] bg-slate-50'}`}>
                    <Mic className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  {isDictating && !isPaused && (
                    <button onClick={pauseDictation} className={`flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-2.5 rounded-xl shadow-lg transition-all active:scale-95 bg-yellow-500 text-white`}>
                      <Pause className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">PAUSE</span>
                    </button>
                  )}
                  {isPaused && (
                    <button onClick={resumeDictation} className={`flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-2.5 rounded-xl shadow-lg transition-all active:scale-95 bg-green-500 text-white`}>
                      <Play className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">RESUME</span>
                    </button>
                  )}
                  <button onClick={isDictating ? stopDictation : startDictation} className={`flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-2.5 rounded-xl shadow-lg transition-all active:scale-95 ${isDictating ? 'bg-red-500 text-white' : 'bg-[#d4af37] text-white'}`}>
                    <Mic className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">{isDictating ? 'STOP' : 'DICTATE'}</span>
                  </button>
                  <button onClick={() => { setText(''); setVariations([]); setSelectedVariation(null); }} className={`p-2.5 md:p-3 rounded-xl transition-all shadow-sm hover:shadow-md active:shadow-inner text-slate-500 hover:text-red-500 ${isGold ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 flex flex-col p-10 overflow-y-auto">
                <textarea 
                  value={text} 
                  onChange={(e) => setText(e.target.value)} 
                  placeholder="The neural link is active. Speak your mind or type your thoughts here..." 
                  className="w-full flex-1 resize-none bg-transparent focus:outline-none text-3xl font-light leading-relaxed placeholder:text-slate-700" 
                />
                {interimText && <p className="text-3xl text-[#d4af37] opacity-60 leading-relaxed font-light mt-6 italic animate-pulse">{interimText}</p>}
              </div>
            </div>

            <aside className="xl:w-[450px] flex flex-col gap-6">
              {isLoading ? (
                <div className={`flex-1 flex flex-col items-center justify-center p-20 rounded-[3rem] animate-pulse border ${isGold ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                  <RefreshCw className="w-12 h-12 text-[#d4af37] animate-spin mb-6" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Processing Neural Link...</p>
                </div>
              ) : variations.length > 0 ? (
                <div className="flex flex-col gap-4 animate-in slide-in-from-right-10 duration-700">
                  {/* Length Variation Tabs */}
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {[LengthVariation.SIMPLE, LengthVariation.MEDIUM, LengthVariation.LONG].map((length) => {
                      const lengthVars = variations.filter(v => v.lengthVariation === length);
                      if (lengthVars.length === 0) return null;
                      return (
                        <button
                          key={length}
                          onClick={() => {
                            setSelectedLength(length);
                            setSelectedVariation(lengthVars[0]);
                          }}
                          className={`shrink-0 px-4 md:px-6 py-2 md:py-3 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest border transition-all shadow-sm hover:shadow-md active:shadow-inner ${
                            selectedLength === length
                              ? 'bg-[#d4af37] text-white border-[#d4af37] shadow-lg scale-105'
                              : isGold
                              ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                              : 'bg-white border-slate-200 text-slate-500 hover:text-[#d4af37]'
                          }`}
                        >
                          {length}
                        </button>
                      );
                    })}
                  </div>

                  {/* Display variations grouped by length */}
                  {selectedLength ? (
                    variations
                      .filter(v => v.lengthVariation === selectedLength)
                      .map((variation) => (
                        <div key={variation.id} className={`rounded-[3rem] shadow-xl overflow-hidden p-6 md:p-8 border ${isGold ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100'}`}>
                          <div className="flex justify-between items-center mb-6 md:mb-8">
                            <div className="flex gap-2 flex-wrap">
                              <span className="text-[8px] md:text-[9px] font-black text-[#d4af37] bg-[#d4af37]/10 px-3 md:px-4 py-1.5 md:py-2 rounded-lg uppercase tracking-widest">{variation.toneCategory || variation.tone}</span>
                              <span className="text-[8px] md:text-[9px] font-black text-blue-400 bg-blue-400/10 px-3 md:px-4 py-1.5 md:py-2 rounded-lg uppercase tracking-widest">{variation.lengthVariation}</span>
                              {variation.analysis && <span className="text-[8px] md:text-[9px] font-black text-purple-400 bg-purple-400/10 px-3 md:px-4 py-1.5 md:py-2 rounded-lg uppercase tracking-widest">{variation.analysis.sentiment}</span>}
                            </div>
                            <button onClick={() => {
                              setSelectedVariation(variation);
                              copyToClipboard();
                            }} className={`p-2.5 md:p-3 rounded-xl transition-all shadow-sm hover:shadow-md active:shadow-inner ${isGold ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-slate-100'}`}>
                              {copied && selectedVariation?.id === variation.id ? <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-500" /> : <Copy className="w-4 h-4 md:w-5 md:h-5 text-[#d4af37]" />}
                            </button>
                          </div>

                          <div className={`p-6 md:p-8 rounded-[2rem] text-base md:text-lg leading-relaxed whitespace-pre-wrap font-medium mb-6 md:mb-8 min-h-[150px] md:min-h-[200px] ${isGold ? 'bg-black/40 text-slate-200' : 'bg-slate-50 text-slate-700'}`}>
                            {variation.suggestedText}
                          </div>

                          {variation.analysis && variation.analysis.keywords.length > 0 && (
                            <div className="mb-6 md:mb-8 flex flex-wrap gap-2">
                              <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase w-full mb-1 flex items-center gap-2">Neural Extraction</span>
                              {variation.analysis.keywords.map(k => (
                                <span key={k} className="px-2 md:px-3 py-1 bg-[#d4af37]/5 text-[#d4af37] border border-[#d4af37]/10 rounded-lg text-[8px] md:text-[9px] font-bold">#{k}</span>
                              ))}
                            </div>
                          )}

                          <button onClick={() => setText(variation.suggestedText)} className="w-full py-3 md:py-4 bg-gradient-to-r from-[#d4af37] to-[#b38728] text-white rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                            COMMIT TO CANVAS
                          </button>
                        </div>
                      );
                  }) : (
                    // Fallback: show first variation if no length selected
                    variations.slice(0, 1).map((variation) => (
                      <div key={variation.id} className={`rounded-[3rem] shadow-xl overflow-hidden p-6 md:p-8 border ${isGold ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100'}`}>
                        <div className="flex justify-between items-center mb-6 md:mb-8">
                          <div className="flex gap-2">
                            <span className="text-[8px] md:text-[9px] font-black text-[#d4af37] bg-[#d4af37]/10 px-3 md:px-4 py-1.5 md:py-2 rounded-lg uppercase tracking-widest">{variation.toneCategory || variation.tone}</span>
                            {variation.analysis && <span className="text-[8px] md:text-[9px] font-black text-blue-400 bg-blue-400/10 px-3 md:px-4 py-1.5 md:py-2 rounded-lg uppercase tracking-widest">{variation.analysis.sentiment}</span>}
                          </div>
                          <button onClick={copyToClipboard} className={`p-2.5 md:p-3 rounded-xl transition-all shadow-sm hover:shadow-md active:shadow-inner ${isGold ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-slate-100'}`}>
                            {copied && selectedVariation?.id === variation.id ? <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-500" /> : <Copy className="w-4 h-4 md:w-5 md:h-5 text-[#d4af37]" />}
                          </button>
                        </div>
                        <div className={`p-6 md:p-8 rounded-[2rem] text-base md:text-lg leading-relaxed whitespace-pre-wrap font-medium mb-6 md:mb-8 min-h-[150px] md:min-h-[200px] ${isGold ? 'bg-black/40 text-slate-200' : 'bg-slate-50 text-slate-700'}`}>
                          {variation.suggestedText}
                        </div>
                        <button onClick={() => setText(variation.suggestedText)} className="w-full py-3 md:py-4 bg-gradient-to-r from-[#d4af37] to-[#b38728] text-white rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                          COMMIT TO CANVAS
                        </button>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className={`flex-1 flex flex-col items-center justify-center p-20 border-2 border-dashed rounded-[3rem] opacity-30 ${isGold ? 'border-white/10' : 'border-slate-200'}`}>
                  <Zap className="w-12 h-12 mb-4 text-[#d4af37]" />
                  <p className="text-[10px] font-black uppercase tracking-[0.5em]">Neural Link Standby</p>
                </div>
              )}
            </aside>
          </div>
        </main>
      </div>

      <SettingsModal 
        user={user} 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
        currentTheme={theme}
        onThemeChange={(t) => {
          setTheme(t);
          updateThemeCSS(t);
          // Save theme to user settings
          if (user) {
            const updatedUser = { ...user, settings: { ...user.settings, personalization: { ...user.settings?.personalization, theme: t } } };
            setUser(updatedUser);
            localStorage.setItem('v2t_user', JSON.stringify(updatedUser));
          }
        }}
      />

      {liveSessionOpen && <LiveVoiceSession onClose={() => setLiveSessionOpen(false)} />}

      <footer className={`px-10 py-4 text-center border-t transition-colors duration-700 ${isGold ? 'bg-black/95 border-white/5' : 'bg-white border-slate-100'}`}>
        <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.8em]">EchoWrite Professional • Neural Intelligence v2.5.0</p>
      </footer>
    </div>
  );
};

export default App;
