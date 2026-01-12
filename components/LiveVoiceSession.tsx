
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createLiveSession } from '../services/geminiService';
import { decode, decodeAudioData, createBlob } from '../utils/audioUtils';
import { Mic, MicOff, Volume2, X } from 'lucide-react';

interface LiveVoiceSessionProps {
  onClose: () => void;
}

export const LiveVoiceSession: React.FC<LiveVoiceSessionProps> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcription, setTranscription] = useState('');
  
  const audioContextRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.then((session: any) => session.close());
    }
    for (const source of sourcesRef.current) {
      source.stop();
    }
    sourcesRef.current.clear();
    setIsActive(false);
  }, []);

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = { input: inputCtx, output: outputCtx };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = createLiveSession({
        onopen: () => {
          setIsActive(true);
          setIsConnecting(false);
          const source = inputCtx.createMediaStreamSource(stream);
          const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e: any) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmBlob = createBlob(inputData);
            sessionPromise.then((session: any) => {
              session.sendRealtimeInput({ media: pcmBlob });
            });
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputCtx.destination);
        },
        onmessage: async (message: any) => {
          if (message.serverContent?.outputTranscription) {
            setTranscription(prev => (prev + ' ' + message.serverContent.outputTranscription.text).slice(-150));
          }

          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64Audio && audioContextRef.current) {
            const outCtx = audioContextRef.current.output;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
            const audioBuffer = await decodeAudioData(decode(base64Audio), outCtx, 24000, 1);
            const source = outCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outCtx.destination);
            source.addEventListener('ended', () => {
              sourcesRef.current.delete(source);
            });
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            sourcesRef.current.add(source);
          }

          if (message.serverContent?.interrupted) {
            for (const s of sourcesRef.current) s.stop();
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
        },
        onerror: (e: any) => console.error("Live Error", e),
        onclose: () => setIsActive(false),
      });

      sessionRef.current = sessionPromise;
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    startSession();
    return () => {
      stopSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed bottom-6 right-6 w-80 glass border border-indigo-200 rounded-3xl shadow-2xl p-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} />
          <span className="text-sm font-semibold text-gray-700">Voice Assistant</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-4 py-6">
        <div className={`p-6 rounded-full ${isActive ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'} transition-all duration-500 shadow-lg`}>
          {isActive ? <Mic className="w-10 h-10 animate-bounce" /> : <MicOff className="w-10 h-10" />}
        </div>
        
        <div className="text-center">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">
            {isConnecting ? 'Initializing...' : isActive ? 'Listening & Speaking' : 'Disconnected'}
          </p>
          <div className="h-12 overflow-hidden px-2">
            <p className="text-sm text-gray-600 italic line-clamp-2">
              {transcription || "Talk to the assistant to brainstorm wording..."}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-3 border-t border-gray-100 pt-4">
        <button 
          onClick={isActive ? stopSession : startSession}
          className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isActive ? 'Stop Session' : 'Reconnect'}
        </button>
      </div>
    </div>
  );
};
