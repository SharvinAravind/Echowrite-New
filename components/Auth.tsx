
import React, { useState } from 'react';
import { Chrome, Mail, Lock, User, ArrowRight, Facebook, CheckCircle2, ShieldCheck, Zap, Crown } from 'lucide-react';

interface AuthProps {
  onLogin: (user: any) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({
      id: '1',
      email,
      name: fullName || email.split('@')[0],
      tier: 'free', // Default to free tier
      usageCount: 0
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center golden-bg font-sans p-4 md:p-8">
      {/* Background Animated Sparks */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i} 
            className="sparkle-stream" 
            style={{ 
              left: `${Math.random() * 100}%`, 
              '--d': `${5 + Math.random() * 5}s`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: 0.15
            } as any} 
          />
        ))}
      </div>

      <div className="w-full max-w-6xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[650px] z-10 animate-in zoom-in-95 duration-700">
        
        {/* LEFT PANEL: PLAN BENEFITS */}
        <div className="md:w-[45%] bg-gradient-to-br from-[#1a1a1a] via-[#2d1b1b] to-[#1a1a1a] p-10 flex flex-col relative overflow-hidden text-white">
          <div className="mb-12 flex flex-col items-center text-center relative z-10">
            {/* Big EchoWrite Brand Name */}
            <div className="mb-6">
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter gold-gradient-text drop-shadow-[0_10px_30px_rgba(212,175,55,0.5)] mb-2">
                EchoWrite
              </h1>
              <p className="text-sm font-bold tracking-[0.3em] uppercase text-[#d4af37] mt-3">
                Voice to Professional Text
              </p>
            </div>
            
            {/* Gold Microphone Logo */}
            <div className="w-20 h-20 mb-6 drop-shadow-[0_10px_15px_rgba(212,175,55,0.4)] animate-pulse">
              <span className="text-[80px] leading-none">🎙️</span>
            </div>
          </div>

          <div className="relative z-10 space-y-8 flex-1">
            <div>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#d4af37]">
                <Zap className="w-5 h-5" />
                Free vs Premium Features
              </h2>
              
              {/* Free Tier */}
              <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <h3 className="text-sm font-bold mb-3 text-white/80">Free Tier</h3>
                <ul className="space-y-2 text-xs font-medium text-white/70">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    <span>10 generations per month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    <span>Basic tone options</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    <span>Standard themes</span>
                  </li>
                </ul>
              </div>

              {/* Premium Tier */}
              <div className="p-4 bg-gradient-to-br from-[#d4af37]/20 to-[#b38728]/10 rounded-xl border border-[#d4af37]/30">
                <h3 className="text-sm font-bold mb-3 text-[#d4af37] flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  Premium Tier
                </h3>
                <ul className="space-y-2 text-xs font-medium text-white/90">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                    <span><strong>Unlimited</strong> generations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                    <span><strong>All 6 tone categories</strong> with length variations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                    <span><strong>17+ languages</strong> with auto-detection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                    <span><strong>Premium themes</strong> & custom accent colors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                    <span><strong>Advanced features:</strong> Noise cancellation, visual generation</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Rocket Animation */}
          <div className="absolute -bottom-16 -right-16 w-80 h-80 flex items-center justify-center pointer-events-none">
            <div className="relative animate-bounce" style={{ animationDuration: '3s', animationIterationCount: 'infinite' }}>
              <span className="text-[180px] drop-shadow-[0_20px_50px_rgba(212,175,55,0.4)] block animate-pulse">🚀</span>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#d4af37]/30 blur-3xl rounded-full animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-24 h-24 bg-[#d4af37]/20 blur-2xl rounded-full" />
            </div>
          </div>
          
          <div className="mt-auto relative z-10">
             <div className="flex items-center gap-3">
               <ShieldCheck className="w-5 h-5 text-amber-300" />
               <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Verified Workspace Security</span>
             </div>
          </div>
        </div>

        {/* RIGHT PANEL: SIGN UP FORM */}
        <div className="flex-1 p-10 md:p-16 flex flex-col justify-center bg-white">
          <div className="mb-8">
            <h1 className="text-4xl font-black text-slate-800 mb-2">
              {mode === 'signup' ? 'Join Us' : 'Welcome Back'}
            </h1>
            <p className="text-slate-400 font-medium text-sm">Start your premium voice journey today.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-[#b05c6d]/20 transition-all font-medium"
                  required
                />
              </div>
            )}

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-[#b05c6d]/20 transition-all font-medium"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-[#b05c6d]/20 transition-all font-medium"
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-[#b05c6d] to-[#6d5cb0] text-white py-4 rounded-xl font-bold text-sm shadow-xl shadow-[#b05c6d]/20 hover:scale-[1.01] active:scale-95 transition-all mt-4"
            >
              {mode === 'signup' ? 'Get Started' : 'Log In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs font-medium text-slate-500">
              {mode === 'signup' ? 'Already have an account?' : "New here?"} 
              <button 
                onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
                className="text-[#6d5cb0] font-bold ml-1 hover:underline"
              >
                {mode === 'signup' ? 'Login' : 'Sign Up'}
              </button>
            </p>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-300 bg-white px-4 tracking-[0.2em]">OR</div>
          </div>

          <div className="flex justify-center gap-4">
            <button onClick={handleSubmit} className="flex-1 flex items-center justify-center p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all shadow-sm">
              <Chrome className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-[10px] font-bold uppercase text-slate-600">Google</span>
            </button>
            <button onClick={handleSubmit} className="flex-1 flex items-center justify-center p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all shadow-sm">
              <Facebook className="w-5 h-5 text-blue-600 mr-2 fill-blue-600" />
              <span className="text-[10px] font-bold uppercase text-slate-600">Facebook</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
