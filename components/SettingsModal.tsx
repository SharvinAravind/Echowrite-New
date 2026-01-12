
import React, { useState } from 'react';
import { 
  X, User, Mic, FileText, Zap, Share2, 
  Palette, Shield, 
  Settings as SettingsIcon, Crown, Check,
  Sliders, Camera, Star
} from 'lucide-react';
import { User as UserType } from '../types';

interface SettingsModalProps {
  user: UserType;
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  onThemeChange: (theme: any) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ user, isOpen, onClose, currentTheme, onThemeChange }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [userName, setUserName] = useState(user.name);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | 'premium'>(user.tier);

  const tabs = [
    { id: 'profile', icon: <User className="w-4 h-4" />, label: 'My Profile' },
    { id: 'voice', icon: <Mic className="w-4 h-4" />, label: 'Voice Settings' },
    { id: 'personalization', icon: <Palette className="w-4 h-4" />, label: 'Design' },
    { id: 'ai', icon: <Zap className="w-4 h-4" />, label: 'AI Power' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white rounded-[3rem] w-full max-w-4xl h-[80vh] overflow-hidden shadow-2xl flex border border-slate-100 animate-in zoom-in-95">
        
        {/* Simplified Sidebar */}
        <div className="w-72 bg-[#fafafa] border-r border-slate-100 flex flex-col p-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-[#b05c6d] rounded-xl flex items-center justify-center text-white shadow-lg">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <h2 className="text-sm font-black uppercase tracking-tighter text-slate-800">Account</h2>
          </div>
          
          <div className="flex-1 space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white text-[#b05c6d] shadow-md border border-slate-100 scale-105' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setActiveTab('plans')}
            className={`mt-auto p-6 rounded-3xl border transition-all text-left ${
              activeTab === 'plans' ? 'bg-[#b05c6d] text-white border-[#b05c6d]' : 'bg-gradient-to-br from-[#b05c6d]/5 to-transparent border-[#b05c6d]/10'
            }`}
          >
             <p className={`text-[8px] font-black uppercase mb-1 tracking-widest ${activeTab === 'plans' ? 'text-white/70' : 'text-[#b05c6d]'}`}>Your Plan</p>
             <div className="flex justify-between items-center">
               <p className="text-xs font-bold capitalize">{selectedPlan} Access</p>
               <Crown className={`w-3 h-3 ${activeTab === 'plans' ? 'text-white' : 'text-[#b05c6d]'}`} />
             </div>
          </button>
        </div>

        {/* Simplified Content */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="px-12 py-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-300">
               {activeTab.replace('-', ' ')}
            </h3>
            <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-full transition-colors"><X className="w-6 h-6 text-slate-300" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-12 scrollbar-hide">
            {activeTab === 'profile' && (
              <div className="space-y-10 animate-in fade-in">
                <div className="flex items-center gap-8">
                  <div className="relative group cursor-pointer">
                    <div className="w-28 h-28 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
                      <User className="w-14 h-14 text-slate-300" />
                    </div>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Change Your Name</label>
                    <input 
                      type="text" 
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#b05c6d]/20 transition-all"
                    />
                    <p className="text-[10px] text-slate-400 mt-3 font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Account Security</p>
                  <button className="text-[10px] font-black text-[#b05c6d] uppercase tracking-widest hover:underline">Change Password</button>
                </div>
              </div>
            )}

            {activeTab === 'plans' && (
              <div className="space-y-8 animate-in fade-in">
                <div className="text-center mb-8">
                  <h4 className="text-2xl font-black text-slate-800">Select Your Power</h4>
                  <p className="text-sm text-slate-500 mt-2">All premium features are unlocked for you.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  {/* Pro Option */}
                  <button 
                    onClick={() => setSelectedPlan('pro')}
                    className={`p-8 rounded-[2.5rem] border-2 transition-all text-left relative overflow-hidden ${
                      selectedPlan === 'pro' ? 'border-[#b05c6d] bg-[#b05c6d]/5 shadow-xl scale-105' : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-4">
                       <Star className={`w-8 h-8 ${selectedPlan === 'pro' ? 'text-[#b05c6d]' : 'text-slate-200'}`} />
                       <span className="text-[10px] font-black bg-slate-100 px-3 py-1 rounded-full uppercase text-slate-400 tracking-widest">$9/mo</span>
                    </div>
                    <h5 className="text-xl font-black text-slate-800 mb-2">Echo Pro</h5>
                    <ul className="text-[10px] font-bold text-slate-400 uppercase tracking-wider space-y-2">
                      <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-500" /> High Accuracy</li>
                      <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-500" /> Cloud Sync</li>
                      <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-500" /> Ad-Free</li>
                    </ul>
                  </button>

                  {/* Premium Option */}
                  <button 
                    onClick={() => setSelectedPlan('premium')}
                    className={`p-8 rounded-[2.5rem] border-2 transition-all text-left relative overflow-hidden ${
                      selectedPlan === 'premium' ? 'border-amber-400 bg-amber-400/5 shadow-xl scale-105' : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-4">
                       <Crown className={`w-8 h-8 ${selectedPlan === 'premium' ? 'text-amber-500' : 'text-slate-200'}`} />
                       <span className="text-[10px] font-black bg-amber-100 px-3 py-1 rounded-full uppercase text-amber-600 tracking-widest">$19/mo</span>
                    </div>
                    <h5 className="text-xl font-black text-slate-800 mb-2">Echo Premium</h5>
                    <ul className="text-[10px] font-bold text-slate-400 uppercase tracking-wider space-y-2">
                      <li className="flex items-center gap-2"><Check className="w-3 h-3 text-amber-500" /> Neural Insight</li>
                      <li className="flex items-center gap-2"><Check className="w-3 h-3 text-amber-500" /> 17+ Languages</li>
                      <li className="flex items-center gap-2"><Check className="w-3 h-3 text-amber-500" /> 3D Visuals</li>
                    </ul>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'personalization' && (
              <div className="space-y-10 animate-in fade-in">
                <div>
                  <p className="text-[11px] font-black text-slate-400 uppercase mb-6 tracking-widest">Workspace Appearance</p>
                  <div className="grid grid-cols-2 gap-4">
                    {['minimal', 'gold-luxe', 'midnight-pro', 'frost-glass'].map(t => (
                      <button 
                        key={t}
                        onClick={() => onThemeChange(t)}
                        className={`p-6 rounded-[2rem] border transition-all text-left ${
                          currentTheme === t ? 'border-[#b05c6d] bg-[#b05c6d]/5 shadow-md' : 'border-slate-100 bg-slate-50 hover:bg-white'
                        }`}
                      >
                        <p className="text-[11px] font-black uppercase text-slate-800">{t.replace('-', ' ')}</p>
                        <div className="mt-2 w-full h-1 bg-slate-200 rounded-full" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Zap className="w-10 h-10 text-amber-500" />
                    <div>
                      <p className="text-sm font-black text-amber-900 uppercase">Neural Brain Active</p>
                      <p className="text-[10px] text-amber-700/60 font-medium">Enjoy unlimited AI analysis and phrasing improvements.</p>
                    </div>
                  </div>
                  <Check className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            )}
          </div>

          <div className="p-10 border-t border-slate-50 flex justify-end gap-4 bg-slate-50/30">
            <button onClick={onClose} className="px-10 py-4 bg-[#b05c6d] text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#b05c6d]/30 hover:scale-105 active:scale-95 transition-all">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};
