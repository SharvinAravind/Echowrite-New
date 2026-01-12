# EchoWrite UI/UX Implementation Specification

## 1. CORE LAYOUT & BRANDING

### Header Layout
- **Left Side**: EchoWrite logo (golden microphone) + brand name
- **Center**: Language selector
- **Right Side**: Voice reduction toggle, Generate button, History, Settings, Logout
- **Spacing**: Consistent 16px gap between all navigation elements
- **Position**: Adjusted downward by 8px for proper accommodation

### Main Content Area
- **Left Panel (60%)**: Workspace textarea with live preview box
- **Right Panel (40%)**: Variations panel with tone/length selectors

## 2. NEUMORPHIC DESIGN SYSTEM

### Color Palette
```css
--neu-bg: #eef1f6
--neu-highlight: #ffffff
--neu-shadow: #ced4e1
--neu-text-primary: #2d3748
--neu-text-secondary: #718096
--neu-accent: #d4af37
```

### Shadow Styles
- **Lifted State**: `box-shadow: 8px 8px 16px #ced4e1, -8px -8px 16px #ffffff`
- **Pressed State**: `box-shadow: inset 4px 4px 8px #ced4e1, inset -4px -4px 8px #ffffff`
- **Hover State**: `box-shadow: 6px 6px 12px #ced4e1, -6px -6px 12px #ffffff`

### Button States
- Default: Lifted shadow
- Hover: Reduced shadow distance
- Active: Inset shadow
- Transition: 200ms cubic-bezier(0.4, 0, 0.2, 1)

## 3. INTELLIGENT CONTENT GENERATION

### Tone Categories (6)
1. **Appreciative**: Grateful, thankful, positive acknowledgment
2. **Warm**: Friendly, personable, empathetic
3. **Professional**: Formal, business-appropriate, polished
4. **Respectful**: Courteous, considerate, diplomatic
5. **Marketing**: Persuasive, engaging, action-oriented
6. **Elaborate**: Detailed, comprehensive, thorough

### Length Variations (3 per tone)
1. **SIMPLE**: 1-2 sentences, 20-40 words, direct and concise
2. **MEDIUM**: 3-5 sentences, 60-100 words, balanced approach
3. **LONG**: Multi-paragraph, 150-250 words, detailed and comprehensive

### Generation Matrix
Total outputs per generation: 18 variations (6 tones × 3 lengths)

### API Prompt Structure
```
System: You are generating variations in [TONE] tone.
Context: Maintain [TONE] characteristics while avoiding repetition.
Length: [SIMPLE/MEDIUM/LONG] - strictly adhere to word count.
Language: Auto-detect and respond in [USER_LANGUAGE].
Constraint: Each variation must be unique in structure and vocabulary.
```

## 4. REAL-TIME FEATURES

### Generation Timer
- **Display**: "Processing: 0:00" format
- **Position**: Below Generate button
- **Updates**: Every 100ms
- **Visibility**: Only during generation

### Live Preview Box
- **Trigger**: Activated when microphone button pressed
- **Position**: Below workspace textarea with 16px margin
- **Height**: 120px with scroll
- **Content**:
  - Interim text: Gray (#9ca3af), italic
  - Confirmed text: Auto-appends to main workspace
- **Border**: 2px dashed #d4af37 with neumorphic inset

### Voice Waveform
- **Canvas Size**: 400×60px
- **Color**: #d4af37
- **Animation**: Responds to microphone input volume
- **Position**: Inside live preview box header

## 5. OUTPUT FORMATTING

### Display Structure
```
Tone: [TONE_NAME]
Length: [SIMPLE/MEDIUM/LONG]
Words: [COUNT]
═══════════════════════
[Generated Content]
═══════════════════════
✓ Ready to copy
```

### Copy Button
- Position: Top-right of each variation card
- Icon: Copy with checkmark animation on success
- Toast notification: "Copied to clipboard"

## 6. SETTINGS & PERSONALIZATION

### Theme Engine
Available themes (5-8):
1. **Default Neumorphic**: #eef1f6 base
2. **Dark Neumorphic**: #2d3748 base
3. **Warm Cream**: #f5f5dc base
4. **Cool Blue**: #e3f2fd base
5. **Mint Fresh**: #e0f2f1 base
6. **Rose Gold**: #ffe4e1 base
7. **Arctic White**: #ffffff base
8. **Midnight Pro**: #1a202c base

### CSS Variables Architecture
```css
:root {
  --theme-bg: var(--neu-bg);
  --theme-surface: var(--neu-highlight);
  --theme-shadow-dark: var(--neu-shadow);
  --theme-shadow-light: var(--neu-highlight);
  --theme-text-primary: var(--neu-text-primary);
  --theme-text-secondary: var(--neu-text-secondary);
  --theme-accent: var(--neu-accent);
}
```

### LocalStorage Keys
- `echowrite_theme`: Current theme ID
- `echowrite_noise_cancellation`: Boolean
- `echowrite_accent_color`: Hex value
- `echowrite_snowfall`: Boolean
- `echowrite_preferences`: JSON object

### Auto-Apply Logic
```javascript
useEffect(() => {
  const savedTheme = localStorage.getItem('echowrite_theme');
  const savedPrefs = JSON.parse(localStorage.getItem('echowrite_preferences'));
  if (savedTheme) applyTheme(savedTheme);
  if (savedPrefs) applyPreferences(savedPrefs);
}, []);
```

## 7. TIER DIFFERENTIATION

### Free Tier Restrictions
- **Daily Generations**: 10 per day
- **Tones Available**: 3 (Professional, Warm, Respectful)
- **Length Variations**: 2 (Simple, Medium only)
- **Themes**: 2 (Default, Light)
- **History**: Last 5 sessions
- **Features**: Basic dictation, no noise cancellation
- **Watermark**: "Made with EchoWrite Free"

### Premium Tier Benefits
- **Daily Generations**: Unlimited
- **Tones Available**: All 6 tones
- **Length Variations**: All 3 lengths
- **Themes**: All 8 themes
- **History**: Unlimited with search
- **Features**: Advanced dictation, noise cancellation, live AI session
- **Export**: PDF, DOCX, TXT formats
- **No Watermark**: Clean professional output
- **Priority Processing**: 2x faster generation

### Implementation
```typescript
const canAccessFeature = (feature: string) => {
  if (user.tier === 'premium') return true;

  const freeFeatures = ['professional', 'warm', 'respectful', 'simple', 'medium'];
  return freeFeatures.includes(feature.toLowerCase());
};

const getRemainingGenerations = () => {
  if (user.tier === 'premium') return Infinity;

  const today = new Date().toDateString();
  const usage = JSON.parse(localStorage.getItem('echowrite_usage') || '{}');
  const todayUsage = usage[today] || 0;

  return Math.max(0, 10 - todayUsage);
};
```

## 8. TECHNICAL SPECIFICATIONS

### Component Hierarchy
```
App
├── Header
│   ├── Logo
│   ├── LanguageSelector
│   ├── VoiceReductionToggle
│   ├── GenerateButton
│   │   └── GenerationTimer
│   ├── HistoryButton
│   ├── SettingsButton
│   └── LogoutButton
├── MainContent
│   ├── WorkspacePanel
│   │   ├── WorkspaceTextarea
│   │   ├── LivePreviewBox
│   │   │   ├── WaveformCanvas
│   │   │   └── InterimText
│   │   └── MicrophoneControls
│   └── VariationsPanel
│       ├── ToneSelector
│       ├── LengthSelector
│       └── VariationCards[]
│           ├── VariationHeader
│           ├── VariationContent
│           └── CopyButton
├── HistorySidebar
├── SettingsModal
│   ├── ThemeSelector
│   ├── PreferencesPanel
│   └── TierUpgradePrompt
└── LiveVoiceSession
```

### State Management
```typescript
interface AppState {
  user: User;
  text: string;
  selectedTone: Tone;
  selectedLength: Length;
  variations: Variation[];
  isGenerating: boolean;
  generationTime: number;
  isDictating: boolean;
  interimText: string;
  theme: Theme;
  preferences: UserPreferences;
  usage: UsageStats;
}
```

### Performance Optimization
- Debounce live transcription: 100ms
- Throttle waveform updates: 16ms (60fps)
- Memoize variation cards: React.memo
- Virtual scroll for history: react-window
- Lazy load settings modal: React.lazy
- Code split by route: dynamic imports

### Cross-Browser Compatibility
- Chrome 90+: Full support
- Firefox 88+: Full support
- Safari 14+: Webkit prefix for speech recognition
- Edge 90+: Full support
- Mobile: Responsive breakpoints at 640px, 768px, 1024px

### Responsive Design Breakpoints
```css
/* Mobile */
@media (max-width: 640px) {
  - Stack workspace and variations vertically
  - Hide live preview on small screens
  - Collapse header to hamburger menu
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  - 50/50 split workspace and variations
  - Show condensed tone selector
}

/* Desktop */
@media (min-width: 1025px) {
  - 60/40 split workspace and variations
  - Full feature visibility
}
```

## 9. INTEGRATION GUIDELINES

### Gemini API Integration
```typescript
const generateVariations = async (text: string, tone: Tone, length: Length) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Generate ${length} variation in ${tone} tone: ${text}`,
    config: {
      systemInstruction: getSystemPrompt(tone, length),
      temperature: 0.7,
      maxOutputTokens: getLengthTokens(length),
    }
  });
  return parseVariation(response.text);
};
```

### Speech Recognition Integration
```typescript
const startDictation = () => {
  const recognition = new (window as any).webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = selectedLanguage;

  recognition.onresult = (event) => {
    let interim = '';
    let final = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        final += transcript;
      } else {
        interim += transcript;
      }
    }

    setInterimText(interim);
    if (final) appendToWorkspace(final);
  };
};
```

## 10. IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Days 1-2)
- Set up neumorphic design system in CSS
- Update type definitions
- Create base component structure

### Phase 2: Core Features (Days 3-4)
- Implement tone/length selector UI
- Build variation generation logic
- Add real-time dictation with live preview

### Phase 3: Polish (Day 5)
- Add generation timer
- Implement theme engine
- Create settings modal

### Phase 4: Tier System (Day 6)
- Add usage tracking
- Implement tier restrictions
- Create upgrade prompts

### Phase 5: Testing & Optimization (Day 7)
- Cross-browser testing
- Performance optimization
- Mobile responsiveness
- Final QA

## 11. SUCCESS METRICS

- Generation time: < 3 seconds per variation
- Theme switching: < 100ms instant update
- Dictation latency: < 200ms from speech to display
- Mobile load time: < 2 seconds
- Accessibility score: 95+ on Lighthouse
- User satisfaction: Intuitive UI requiring zero onboarding
