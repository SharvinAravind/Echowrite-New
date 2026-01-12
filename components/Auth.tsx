
import React, { useState } from 'react';
import { Chrome, Mail, Lock, User, ArrowRight, Facebook, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

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
      tier: 'premium' // Releasing premium access as requested
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
        <div className="md:w-[45%] bg-[#b05c6d] p-10 flex flex-col relative overflow-hidden text-white">
          <div className="mb-12 flex flex-col items-center text-center">
            {/* Gold Microphone Logo */}
            <div className="w-24 h-24 mb-4 drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)] animate-pulse">
              <span className="text-[100px] leading-none">🎙️</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight gold-gradient-text drop-shadow-sm">EchoWrite</h1>
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-60 mt-2">Your Voice, Refined.</p>
          </div>

          <div className="relative z-10 space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6 text-amber-300" />
                Why Upgrade to Premium?
              </h2>
              <ul className="space-y-4 text-sm font-medium">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0" />
                  <span><strong>Unlimited</strong> Voice-to-Text conversion without daily caps.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0" />
                  <span><strong>Smart Logic:</strong> Create professional meeting notes automatically.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0" />
                  <span><strong>Global Support:</strong> Transcribe in 17+ languages flawlessly.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0" />
                  <span><strong>Privacy First:</strong> Enterprise-grade encryption for all your notes.</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
               <p className="text-xs italic opacity-90 leading-relaxed">
                 "Free version covers the basics, but Premium unlocks the full neural potential of your workspace."
               </p>
            </div>
          </div>

          {/* Rocket Animation */}
          <div className="absolute -bottom-10 -right-10 w-64 h-64 flex items-center justify-center animate-bounce duration-[4000ms]">
            <div className="relative">
              <span className="text-[140px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]">🚀</span>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-20 bg-white/20 blur-3xl rounded-full" />
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
