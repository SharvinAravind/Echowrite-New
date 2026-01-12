import React, { useState } from 'react';
import {
  X, User, Mic, Palette, Shield,
  Settings as SettingsIcon, Crown, Check,
  Camera, Star, Zap
} from 'lucide-react';
import { User as UserType, AppTheme, THEME_CONFIGS } from '../types';

interface SettingsModalProps {
  user: UserType;
  isOpen: boolean;
  onClose: () => void;
  currentTheme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  user,
  isOpen,
  onClose,
  currentTheme,
  onThemeChange
}) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [userName, setUserName] = useState(user.name);
  const [noiseCancellation, setNoiseCancellation] = useState(false);
  const [snowfallEffect, setSnowfallEffect] = useState(false);

  const tabs = [
    { id: 'profile', icon: <User className="w-4 h-4" />, label: 'Profile' },
    { id: 'personalization', icon: <Palette className="w-4 h-4" />, label: 'Appearance' },
    { id: 'voice', icon: <Mic className="w-4 h-4" />, label: 'Voice' },
    { id: 'privacy', icon: <Shield className="w-4 h-4" />, label: 'Privacy' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300" style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(10px)' }}>
      <div
        className="w-full max-w-5xl h-[85vh] overflow-hidden flex rounded-[40px] animate-in zoom-in-95 duration-500"
        style={{
          background: 'var(--neu-surface)',
          boxShadow: '20px 20px 60px var(--neu-shadow-dark), -20px -20px 60px var(--neu-shadow-light)'
        }}
      >
        <div
          className="w-64 flex flex-col p-8 border-r"
          style={{
            background: 'var(--neu-bg)',
            borderRightColor: 'var(--neu-shadow-dark)'
          }}
        >
          <div className="flex items-center gap-3 mb-10">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'var(--neu-accent)',
                boxShadow: '4px 4px 8px var(--neu-shadow-dark), -4px -4px 8px var(--neu-shadow-light)'
              }}
            >
              <SettingsIcon className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-sm font-black uppercase tracking-tight" style={{ color: 'var(--neu-text-primary)' }}>
              Settings
            </h2>
          </div>

          <div className="flex-1 space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-[15px] text-[10px] font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab.id ? 'neu-pressed' : 'neu-lifted neu-hover'
                }`}
                style={{
                  color: activeTab === tab.id ? 'var(--neu-accent)' : 'var(--neu-text-secondary)'
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setActiveTab('plans')}
            className={`mt-auto p-4 rounded-[20px] transition-all text-left ${
              activeTab === 'plans' ? 'neu-pressed' : 'neu-lifted neu-hover'
            }`}
          >
            <p className="text-[8px] font-black uppercase mb-1 tracking-widest" style={{ color: 'var(--neu-accent)' }}>
              Your Plan
            </p>
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold capitalize" style={{ color: 'var(--neu-text-primary)' }}>
                {user.tier} Access
              </p>
              <Crown className="w-3 h-3" style={{ color: 'var(--neu-accent)' }} />
            </div>
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--neu-surface)' }}>
          <div className="px-10 py-6 border-b flex justify-between items-center" style={{ borderBottomColor: 'var(--neu-shadow-dark)' }}>
            <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--neu-text-secondary)' }}>
              {activeTab.replace('-', ' ')}
            </h3>
            <button
              onClick={onClose}
              className="neu-button neu-hover p-2 rounded-full"
            >
              <X className="w-5 h-5" style={{ color: 'var(--neu-text-secondary)' }} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
            {activeTab === 'profile' && (
              <div className="space-y-8 animate-in fade-in">
                <div className="flex items-center gap-6">
                  <div className="relative group cursor-pointer">
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden neu-lifted"
                      style={{ background: 'var(--neu-surface)' }}
                    >
                      <User className="w-12 h-12" style={{ color: 'var(--neu-text-secondary)' }} />
                    </div>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-[9px] font-black uppercase tracking-widest block mb-2" style={{ color: 'var(--neu-text-secondary)' }}>
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full neu-input text-base font-semibold"
                    />
                    <p className="text-[10px] mt-2 font-medium" style={{ color: 'var(--neu-text-secondary)' }}>
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="neu-card-inset rounded-[20px]">
                  <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--neu-text-secondary)' }}>
                    Account Security
                  </p>
                  <button className="text-[10px] font-bold uppercase tracking-widest hover:underline" style={{ color: 'var(--neu-accent)' }}>
                    Change Password
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'personalization' && (
              <div className="space-y-8 animate-in fade-in">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: 'var(--neu-text-secondary)' }}>
                    Workspace Theme
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {THEME_CONFIGS.map((themeConfig) => (
                      <button
                        key={themeConfig.id}
                        onClick={() => onThemeChange(themeConfig.id as AppTheme)}
                        className={`p-5 rounded-[20px] text-left transition-all ${
                          currentTheme === themeConfig.id ? 'neu-pressed' : 'neu-lifted neu-hover'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold" style={{ color: 'var(--neu-text-primary)' }}>
                            {themeConfig.name}
                          </p>
                          {currentTheme === themeConfig.id && (
                            <Check className="w-4 h-4" style={{ color: 'var(--neu-accent)' }} />
                          )}
                        </div>
                        <div className="flex gap-2">
                          <div
                            className="w-8 h-8 rounded-lg"
                            style={{
                              background: themeConfig.bg,
                              boxShadow: `2px 2px 4px ${themeConfig.shadow}`
                            }}
                          />
                          <div
                            className="w-8 h-8 rounded-lg"
                            style={{
                              background: themeConfig.surface,
                              boxShadow: `2px 2px 4px ${themeConfig.shadow}`
                            }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="neu-card-inset rounded-[20px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold mb-1" style={{ color: 'var(--neu-text-primary)' }}>
                        Snowfall Effect
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--neu-text-secondary)' }}>
                        Add animated snowfall to background
                      </p>
                    </div>
                    <button
                      onClick={() => setSnowfallEffect(!snowfallEffect)}
                      className={`neu-button neu-hover px-4 py-2 rounded-full text-xs font-bold ${
                        snowfallEffect ? 'neu-pressed' : ''
                      }`}
                      style={{ color: snowfallEffect ? 'var(--neu-accent)' : 'var(--neu-text-primary)' }}
                    >
                      {snowfallEffect ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'voice' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="neu-card-inset rounded-[20px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold mb-1" style={{ color: 'var(--neu-text-primary)' }}>
                        Noise Cancellation
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--neu-text-secondary)' }}>
                        Reduce background noise during dictation
                      </p>
                    </div>
                    <button
                      onClick={() => setNoiseCancellation(!noiseCancellation)}
                      className={`neu-button neu-hover px-4 py-2 rounded-full text-xs font-bold ${
                        noiseCancellation ? 'neu-pressed' : ''
                      }`}
                      style={{ color: noiseCancellation ? 'var(--neu-accent)' : 'var(--neu-text-primary)' }}
                    >
                      {noiseCancellation ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>

                <div className="neu-card rounded-[20px]">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--neu-accent)' }}>
                    Premium Feature
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--neu-text-secondary)' }}>
                    Advanced noise cancellation and voice enhancement are available in Premium tier.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="neu-card rounded-[20px] flex items-center gap-4">
                  <Shield className="w-8 h-8" style={{ color: 'var(--neu-accent)' }} />
                  <div>
                    <p className="text-sm font-bold mb-1" style={{ color: 'var(--neu-text-primary)' }}>
                      Enterprise Encryption
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--neu-text-secondary)' }}>
                      All your data is encrypted end-to-end
                    </p>
                  </div>
                  <Check className="w-5 h-5 ml-auto" style={{ color: '#10b981' }} />
                </div>
              </div>
            )}

            {activeTab === 'plans' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="text-center mb-6">
                  <h4 className="text-xl font-black mb-2" style={{ color: 'var(--neu-text-primary)' }}>
                    Upgrade Your Experience
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--neu-text-secondary)' }}>
                    Unlock unlimited potential with Premium
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className={`neu-card rounded-[25px] p-6 ${user.tier === 'free' ? 'neu-pressed' : ''}`}>
                    <div className="flex items-center justify-between mb-4">
                      <Star className="w-6 h-6" style={{ color: 'var(--neu-text-secondary)' }} />
                      <span className="text-[9px] font-black px-3 py-1 rounded-full neu-card-inset">FREE</span>
                    </div>
                    <h5 className="text-lg font-black mb-2" style={{ color: 'var(--neu-text-primary)' }}>
                      Echo Free
                    </h5>
                    <ul className="text-[10px] font-medium space-y-2" style={{ color: 'var(--neu-text-secondary)' }}>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3" style={{ color: '#10b981' }} />
                        10 generations per day
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3" style={{ color: '#10b981' }} />
                        3 tones available
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3" style={{ color: '#10b981' }} />
                        2 length options
                      </li>
                    </ul>
                  </div>

                  <div className={`neu-card rounded-[25px] p-6 border-2 ${user.tier === 'premium' ? 'neu-pressed' : ''}`} style={{ borderColor: 'var(--neu-accent)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <Crown className="w-6 h-6" style={{ color: 'var(--neu-accent)' }} />
                      <span className="text-[9px] font-black px-3 py-1 rounded-full" style={{ background: 'var(--neu-accent)', color: 'white' }}>
                        PREMIUM
                      </span>
                    </div>
                    <h5 className="text-lg font-black mb-2" style={{ color: 'var(--neu-text-primary)' }}>
                      Echo Premium
                    </h5>
                    <ul className="text-[10px] font-medium space-y-2" style={{ color: 'var(--neu-text-secondary)' }}>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3" style={{ color: 'var(--neu-accent)' }} />
                        Unlimited generations
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3" style={{ color: 'var(--neu-accent)' }} />
                        All 6 tones
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3" style={{ color: 'var(--neu-accent)' }} />
                        All 3 lengths
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3" style={{ color: 'var(--neu-accent)' }} />
                        17+ languages
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3" style={{ color: 'var(--neu-accent)' }} />
                        Priority processing
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t flex justify-end" style={{ borderTopColor: 'var(--neu-shadow-dark)' }}>
            <button
              onClick={onClose}
              className="neu-button-accent px-8 py-3 rounded-[20px] font-bold text-sm uppercase tracking-widest"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
