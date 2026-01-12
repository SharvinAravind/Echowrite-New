
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  getWritingVariations, 
  translateText,
  rephraseText
} from './services/geminiService';
import { 
  WritingStyle, 
  WritingVariation, 
  SUPPORTED_LANGUAGES, 
  HistoryItem,
  User as UserType,
  AppTheme
} from './types';
import { StyleButtons } from './components/StyleButtons';
import { Auth } from './components/Auth';
import { SettingsModal } from './components/SettingsModal';
import { Waveform } from './components/Waveform';
import { LiveVoiceSession } from './components/LiveVoiceSession';
import { 
  Sparkles, Trash2, Copy, CheckCircle2, Mic, 
  RefreshCw, History as HistoryIcon, Languages, 
  X, Edit3, LogOut, Settings, BarChart2, Zap, Crown
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

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('v2t_history');
      if (saved) setHistory(JSON.parse(saved));
      const savedUser = localStorage.getItem('v2t_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        setUser(u);
        setTheme(u.tier === 'premium' ? 'gold-luxe' : 'minimal');
      }
    } catch (e) {}
  }, []);

  const handleLogin = (u: UserType) => {
    setUser(u);
    setTheme(u.tier === 'premium' ? 'gold-luxe' : 'minimal');
    localStorage.setItem('v2t_user', JSON.stringify(u));
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

  const handleProcess = useCallback(async (targetStyle: WritingStyle) => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);
    setStyle(targetStyle);
    try {
      const result = await getWritingVariations(text, targetStyle);
      setVariations(result.variations);
      setSelectedVariation(result.variations[0]);
      saveToHistory(result.variations);
    } catch (err) { 
      console.error(err); 
      alert("Neural engine mismatch. Please check your network and retry.");
    } finally { 
      setIsLoading(false); 
    }
  }, [text, saveToHistory, isLoading]);

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
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
        else currentInterim += event.results[i][0].transcript;
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
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsDictating(false);
    setInterimText('');
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
    'frost-glass': "bg-[#e2e8f0] text-slate-800"
  };

  if (!user) return <Auth onLogin={handleLogin} />;

  const isGold = theme === 'gold-luxe';

  return (
    <div className={`min-h-screen flex flex-col relative transition-colors duration-700 ${themeClasses[theme]} overflow-hidden font-sans`}>
      <header className={`px-10 py-6 flex justify-between items-center sticky top-0 z-40 border-b transition-all duration-700 ${
        isGold ? 'bg-black/90 border-[#d4af37]/10' : 'bg-white/90 border-slate-200'
      } backdrop-blur-xl`}>
        <div className="flex items-center gap-6">
          <button onClick={() => setHistoryOpen(!historyOpen)} className={`p-2.5 rounded-2xl transition-colors ${isGold ? 'text-[#d4af37] hover:bg-white/5' : 'text-slate-600 hover:bg-slate-100'}`}>
            <HistoryIcon className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl border transition-all ${
              isGold ? 'bg-[#d4af37]/20 border-[#d4af37]/40' : 'bg-[#d4af37] border-white/30'
            }`}>
              <Mic className={`${isGold ? 'text-[#d4af37]' : 'text-white'} w-7 h-7`} />
            </div>
            <div>
               <h1 className={`text-2xl font-black tracking-tighter uppercase ${isGold ? 'gold-gradient-text' : 'text-slate-900'}`}>EchoWrite</h1>
               <div className="flex items-center gap-2">
                 <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.3em]">{user.tier} Plan</p>
                 {user.tier === 'premium' && <Crown className="w-2.5 h-2.5 text-[#d4af37]" />}
               </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className={`flex items-center gap-3 px-6 py-2.5 rounded-full border shadow-sm transition-all ${
            isGold ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-600'
          }`}>
            <Languages className="w-5 h-5 text-[#d4af37]" />
            <select value={inputLang} onChange={(e) => setInputLang(e.target.value)} className="bg-transparent border-none text-[10px] font-black uppercase outline-none cursor-pointer">
              {SUPPORTED_LANGUAGES.map(l => <option key={l.code} value={l.code} className="text-black">{l.name}</option>)}
            </select>
          </div>
          <button onClick={() => setSettingsOpen(true)} className={`p-3 rounded-full border transition-all ${
            isGold ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}>
            <Settings className="w-6 h-6" />
          </button>
          <button disabled={!text || isLoading} onClick={() => handleProcess(style)} className="flex items-center gap-3 px-8 py-3 bg-[#d4af37] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-[#d4af37]/30 hover:scale-105 transition-all active:scale-95 disabled:opacity-50">
            <Sparkles className="w-4 h-4" /> GENERATE
          </button>
          <button onClick={handleLogout} className="p-3 text-slate-500 hover:text-red-500 transition-colors">
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </header>

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
              <div className="px-10 py-6 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3"><Edit3 className="w-4 h-4 text-[#d4af37]" /> Neural Canvas</h3>
                  {isDictating && <Waveform isActive={isDictating} />}
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => setLiveSessionOpen(true)} className="p-3 text-slate-500 hover:text-[#d4af37] transition-all">
                    <Mic className="w-5 h-5" />
                  </button>
                  <button onClick={isDictating ? stopDictation : startDictation} className={`flex items-center gap-3 px-6 py-2.5 rounded-xl shadow-lg transition-all active:scale-95 ${isDictating ? 'bg-red-500 text-white' : 'bg-[#d4af37] text-white'}`}>
                    <Mic className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{isDictating ? 'STOP' : 'DICTATE'}</span>
                  </button>
                  <button onClick={() => { setText(''); setVariations([]); }} className="p-3 text-slate-500 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
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
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {variations.map((v) => (
                      <button key={v.id} onClick={() => setSelectedVariation(v)} className={`shrink-0 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${selectedVariation?.id === v.id ? 'bg-[#d4af37] text-white border-[#d4af37] shadow-lg' : 'bg-white/5 border-white/10 text-slate-500 hover:text-[#d4af37]'}`}>{v.label}</button>
                    ))}
                  </div>
                  {selectedVariation && (
                    <div className={`rounded-[3rem] shadow-xl overflow-hidden p-8 border ${isGold ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100'}`}>
                        <div className="flex justify-between items-center mb-8">
                           <div className="flex gap-2">
                             <span className="text-[9px] font-black text-[#d4af37] bg-[#d4af37]/10 px-4 py-2 rounded-lg uppercase tracking-widest">{selectedVariation.tone} Tone</span>
                             {selectedVariation.analysis && <span className="text-[9px] font-black text-blue-400 bg-blue-400/10 px-4 py-2 rounded-lg uppercase tracking-widest">{selectedVariation.analysis.sentiment}</span>}
                           </div>
                           <button onClick={copyToClipboard} className={`p-3 rounded-xl transition-all ${isGold ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-slate-100'}`}>
                             {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-[#d4af37]" />}
                           </button>
                        </div>

                        <div className={`p-8 rounded-[2rem] text-lg leading-relaxed whitespace-pre-wrap font-medium italic mb-8 min-h-[200px] ${isGold ? 'bg-black/40 text-slate-200' : 'bg-slate-50 text-slate-700'}`}>
                          {selectedVariation.suggestedText}
                        </div>

                        {selectedVariation.analysis && (
                          <div className="mb-8 flex flex-wrap gap-2">
                            <span className="text-[9px] font-black text-slate-500 uppercase w-full mb-1 flex items-center gap-2">Neural Extraction</span>
                            {selectedVariation.analysis.keywords.map(k => (
                              <span key={k} className="px-3 py-1 bg-[#d4af37]/5 text-[#d4af37] border border-[#d4af37]/10 rounded-lg text-[9px] font-bold">#{k}</span>
                            ))}
                          </div>
                        )}

                        <button onClick={() => setText(selectedVariation.suggestedText)} className="w-full py-4 bg-gradient-to-r from-[#d4af37] to-[#b38728] text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">COMMIT TO CANVAS</button>
                    </div>
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
        onThemeChange={(t) => setTheme(t)}
      />

      {liveSessionOpen && <LiveVoiceSession onClose={() => setLiveSessionOpen(false)} />}

      <footer className={`px-10 py-4 text-center border-t transition-colors duration-700 ${isGold ? 'bg-black/95 border-white/5' : 'bg-white border-slate-100'}`}>
        <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.8em]">EchoWrite Professional • Neural Intelligence v2.5.0</p>
      </footer>
    </div>
  );
};

export default App;
