import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  generateAllVariations
} from './services/geminiService';
import {
  WritingVariation,
  User as UserType,
  AppTheme,
  Tone,
  Length,
  SUPPORTED_LANGUAGES,
  HistoryItem,
  TONE_CONFIGS,
  LENGTH_CONFIGS,
  UsageStats
} from './types';
import { ToneSelector } from './components/ToneSelector';
import { LengthSelector } from './components/LengthSelector';
import { LivePreview } from './components/LivePreview';
import { GenerationTimer } from './components/GenerationTimer';
import { VariationCard } from './components/VariationCard';
import { Auth } from './components/Auth';
import { SettingsModal } from './components/SettingsModal';
import { LiveVoiceSession } from './components/LiveVoiceSession';
import {
  Sparkles, Trash2, Mic, MicOff, History as HistoryIcon, Languages,
  X, LogOut, Settings, Globe
} from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [text, setText] = useState('');
  const [selectedTone, setSelectedTone] = useState<Tone>(Tone.PROFESSIONAL);
  const [selectedLength, setSelectedLength] = useState<Length>(Length.MEDIUM);
  const [variations, setVariations] = useState<WritingVariation[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [liveSessionOpen, setLiveSessionOpen] = useState(false);
  const [theme, setTheme] = useState<AppTheme>('neu-default');
  const [inputLang, setInputLang] = useState('en-US');
  const [isDictating, setIsDictating] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [usageStats, setUsageStats] = useState<UsageStats>({});
  const [generationTime, setGenerationTime] = useState(0);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('echowrite_history');
      if (saved) setHistory(JSON.parse(saved));

      const savedUser = localStorage.getItem('echowrite_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        setUser(u);
      }

      const savedTheme = localStorage.getItem('echowrite_theme');
      if (savedTheme) setTheme(savedTheme as AppTheme);

      const savedUsage = localStorage.getItem('echowrite_usage');
      if (savedUsage) setUsageStats(JSON.parse(savedUsage));
    } catch (e) {
      console.error('Error loading saved data:', e);
    }
  }, []);

  const handleLogin = (u: UserType) => {
    setUser(u);
    localStorage.setItem('echowrite_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('echowrite_user');
    setVariations([]);
    setText('');
  };

  const getRemainingGenerations = () => {
    if (!user) return 0;
    if (user.tier === 'premium') return Infinity;

    const today = new Date().toDateString();
    const todayUsage = usageStats[today] || 0;
    return Math.max(0, 10 - todayUsage);
  };

  const incrementUsage = () => {
    if (!user || user.tier === 'premium') return;

    const today = new Date().toDateString();
    const newStats = {
      ...usageStats,
      [today]: (usageStats[today] || 0) + 1
    };
    setUsageStats(newStats);
    localStorage.setItem('echowrite_usage', JSON.stringify(newStats));
  };

  const saveToHistory = useCallback((vars: WritingVariation[]) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      originalText: text,
      tone: selectedTone,
      length: selectedLength,
      variations: vars,
      visuals: []
    };
    setHistory(prev => {
      const updated = [newItem, ...prev].slice(0, 50);
      localStorage.setItem('echowrite_history', JSON.stringify(updated));
      return updated;
    });
  }, [text, selectedTone, selectedLength]);

  const handleGenerate = useCallback(async () => {
    if (!text.trim() || isLoading || !user) return;

    const remaining = getRemainingGenerations();
    if (remaining === 0) {
      alert('You have reached your daily generation limit. Upgrade to Premium for unlimited generations!');
      return;
    }

    setIsLoading(true);
    setGenerationTime(0);

    try {
      const allowedTones = user.tier === 'premium'
        ? TONE_CONFIGS.map(t => t.id)
        : TONE_CONFIGS.filter(t => !t.premium).map(t => t.id);

      const allowedLengths = user.tier === 'premium'
        ? LENGTH_CONFIGS.map(l => l.id)
        : LENGTH_CONFIGS.filter(l => !l.premium).map(l => l.id);

      const tonesToGenerate = allowedTones.includes(selectedTone)
        ? [selectedTone]
        : [Tone.PROFESSIONAL];

      const lengthsToGenerate = allowedLengths.includes(selectedLength)
        ? [selectedLength]
        : [Length.MEDIUM];

      const langName = SUPPORTED_LANGUAGES.find(l => l.code === inputLang)?.name || 'English';

      const result = await generateAllVariations(text, tonesToGenerate, lengthsToGenerate, langName);

      setVariations(result.variations);
      saveToHistory(result.variations);
      incrementUsage();
    } catch (err) {
      console.error(err);
      alert("Generation failed. Please check your network and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [text, selectedTone, selectedLength, inputLang, user, saveToHistory, isLoading]);

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

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }

      setInterimText(currentInterim);

      if (finalTranscript) {
        setText(prev => (prev ? prev + ' ' : '') + finalTranscript);
        setInterimText('');
      }
    };

    recognition.onstart = () => setIsDictating(true);
    recognition.onend = () => setIsDictating(false);
    recognition.onerror = () => setIsDictating(false);

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopDictation = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsDictating(false);
    setInterimText('');
  };

  if (!user) return <Auth onLogin={handleLogin} />;

  const remaining = getRemainingGenerations();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--neu-bg)', color: 'var(--neu-text-primary)' }}>
      <header
        className="px-6 py-4 flex justify-between items-center sticky top-0 z-40 backdrop-blur-xl"
        style={{
          background: 'var(--neu-surface)',
          boxShadow: '4px 4px 12px var(--neu-shadow-dark), -4px -4px 12px var(--neu-shadow-light)',
          borderBottom: '1px solid var(--neu-shadow-dark)'
        }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className="neu-button neu-hover p-3 rounded-full"
          >
            <HistoryIcon className="w-5 h-5" style={{ color: 'var(--neu-text-secondary)' }} />
          </button>

          <div className="flex items-center gap-3">
            <img
              src="/chatgpt_image_jan_6,_2026,_08_38_37_pm.png"
              alt="EchoWrite Logo"
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-xl font-black tracking-tight" style={{ color: 'var(--neu-accent)' }}>
                EchoWrite
              </h1>
              <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: 'var(--neu-text-secondary)' }}>
                {user.tier} Plan
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div
            className="neu-lifted flex items-center gap-2 px-4 py-2 rounded-full"
          >
            <Languages className="w-4 h-4" style={{ color: 'var(--neu-accent)' }} />
            <select
              value={inputLang}
              onChange={(e) => setInputLang(e.target.value)}
              className="bg-transparent border-none text-xs font-bold uppercase outline-none cursor-pointer"
              style={{ color: 'var(--neu-text-primary)' }}
            >
              {SUPPORTED_LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>

          {user.tier === 'free' && remaining < Infinity && (
            <div
              className="neu-pressed px-4 py-2 rounded-full text-xs font-bold"
              style={{ color: 'var(--neu-text-secondary)' }}
            >
              {remaining} / 10 left today
            </div>
          )}

          <button
            onClick={() => setSettingsOpen(true)}
            className="neu-button neu-hover p-3 rounded-full"
          >
            <Settings className="w-5 h-5" style={{ color: 'var(--neu-text-secondary)' }} />
          </button>

          <button
            disabled={!text || isLoading || remaining === 0}
            onClick={handleGenerate}
            className="neu-button-accent flex items-center gap-2 px-6 py-3 rounded-full font-bold uppercase text-xs tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" />
            Generate
          </button>

          <button
            onClick={handleLogout}
            className="neu-button neu-hover p-3 rounded-full"
          >
            <LogOut className="w-5 h-5" style={{ color: 'var(--neu-text-secondary)' }} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        <aside
          className={`fixed left-0 top-0 h-full w-96 z-50 transition-transform duration-500 ${
            historyOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{
            background: 'var(--neu-surface)',
            boxShadow: '8px 0 24px var(--neu-shadow-dark)',
            borderRight: '1px solid var(--neu-shadow-dark)'
          }}
        >
          <div className="p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-black uppercase tracking-widest" style={{ color: 'var(--neu-accent)' }}>
                History
              </h3>
              <button
                onClick={() => setHistoryOpen(false)}
                className="neu-button neu-hover p-2 rounded-full"
              >
                <X className="w-5 h-5" style={{ color: 'var(--neu-text-secondary)' }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
              {history.length === 0 ? (
                <p className="text-xs text-center mt-20" style={{ color: 'var(--neu-text-secondary)', opacity: 0.5 }}>
                  No history yet
                </p>
              ) : (
                history.map(item => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setText(item.originalText);
                      if (item.variations) setVariations(item.variations);
                      setHistoryOpen(false);
                    }}
                    className="neu-lifted p-4 rounded-[20px] cursor-pointer hover:scale-[1.02] transition-all"
                  >
                    <div className="flex gap-2 mb-2">
                      {item.tone && (
                        <span className="text-[8px] font-bold px-2 py-1 rounded" style={{
                          background: 'var(--neu-bg)',
                          color: 'var(--neu-accent)'
                        }}>
                          {item.tone}
                        </span>
                      )}
                      {item.length && (
                        <span className="text-[8px] font-bold px-2 py-1 rounded" style={{
                          background: 'var(--neu-bg)',
                          color: 'var(--neu-text-primary)'
                        }}>
                          {item.length}
                        </span>
                      )}
                    </div>
                    <p className="text-xs line-clamp-2 mb-2" style={{ color: 'var(--neu-text-primary)' }}>
                      {item.originalText}
                    </p>
                    <p className="text-[8px] font-medium" style={{ color: 'var(--neu-text-secondary)' }}>
                      {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 space-y-6">
                <div
                  className="neu-card rounded-[30px] p-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--neu-text-secondary)' }}>
                      <Globe className="w-4 h-4 inline mr-2" style={{ color: 'var(--neu-accent)' }} />
                      Workspace
                    </h3>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setLiveSessionOpen(true)}
                        className="neu-button neu-hover p-2 rounded-full"
                      >
                        <Mic className="w-4 h-4" style={{ color: 'var(--neu-accent)' }} />
                      </button>
                      <button
                        onClick={isDictating ? stopDictation : startDictation}
                        className={`neu-button neu-hover px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold ${
                          isDictating ? 'animate-pulse' : ''
                        }`}
                        style={{
                          background: isDictating ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'var(--neu-surface)',
                          color: isDictating ? 'white' : 'var(--neu-text-primary)'
                        }}
                      >
                        {isDictating ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        {isDictating ? 'Stop' : 'Dictate'}
                      </button>
                      <button
                        onClick={() => { setText(''); setVariations([]); }}
                        className="neu-button neu-hover p-2 rounded-full"
                      >
                        <Trash2 className="w-4 h-4" style={{ color: '#ef4444' }} />
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Start dictating or type your thoughts here..."
                    className="w-full h-64 resize-none neu-input text-lg leading-relaxed"
                    style={{
                      background: 'var(--neu-surface)',
                      color: 'var(--neu-text-primary)'
                    }}
                  />

                  <LivePreview interimText={interimText} isDictating={isDictating} />
                </div>

                {isLoading && (
                  <div className="flex justify-center">
                    <GenerationTimer isGenerating={isLoading} onTimeUpdate={setGenerationTime} />
                  </div>
                )}
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="neu-card rounded-[30px] p-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: 'var(--neu-text-secondary)' }}>
                    Variations
                  </h3>

                  <div className="space-y-6">
                    <ToneSelector
                      selectedTone={selectedTone}
                      onSelect={setSelectedTone}
                      userTier={user.tier}
                    />

                    <LengthSelector
                      selectedLength={selectedLength}
                      onSelect={setSelectedLength}
                      userTier={user.tier}
                    />
                  </div>

                  {!isLoading && variations.length === 0 && (
                    <div className="mt-8 text-center py-12 neu-card-inset rounded-[20px]">
                      <Sparkles className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--neu-accent)', opacity: 0.3 }} />
                      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--neu-text-secondary)', opacity: 0.5 }}>
                        Click Generate to create variations
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {variations.length > 0 && !isLoading && (
              <div className="mt-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--neu-accent)' }}>
                  Generated Variations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {variations.map((variation) => (
                    <VariationCard
                      key={variation.id}
                      variation={variation}
                      onApply={(txt) => setText(txt)}
                    />
                  ))}
                </div>
              </div>
            )}
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
          localStorage.setItem('echowrite_theme', t);
        }}
      />

      {liveSessionOpen && <LiveVoiceSession onClose={() => setLiveSessionOpen(false)} />}

      <footer
        className="px-6 py-3 text-center border-t"
        style={{
          background: 'var(--neu-surface)',
          borderTopColor: 'var(--neu-shadow-dark)'
        }}
      >
        <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: 'var(--neu-text-secondary)' }}>
          EchoWrite Professional • Neural Intelligence v2.5.0 {user.tier === 'free' && '• Made with EchoWrite Free'}
        </p>
      </footer>
    </div>
  );
};

export default App;
