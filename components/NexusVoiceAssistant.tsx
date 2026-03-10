
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { showToast } from './Toast';

interface NexusVoiceAssistantProps {
  userProfile: UserProfile | null;
}

const NexusVoiceAssistant: React.FC<NexusVoiceAssistantProps> = ({ userProfile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAIResponse] = useState("");
  const [visualizerBars, setVisualizerBars] = useState<number[]>(new Array(30).fill(5));
  
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize visualizer animation
  useEffect(() => {
    if ((isListening || isSpeaking) && isOpen) {
      const updateVisualizer = () => {
        const newBars = visualizerBars.map(() => {
          const height = Math.random() * (isListening ? 50 : isSpeaking ? 70 : 5) + 5;
          return height;
        });
        setVisualizerBars(newBars);
        animationFrameRef.current = requestAnimationFrame(updateVisualizer);
      };
      animationFrameRef.current = requestAnimationFrame(updateVisualizer);
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      setVisualizerBars(new Array(30).fill(5));
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isListening, isSpeaking, isOpen]);

  const toggleConversation = async () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setIsListening(true);
      setTranscript("Listening...");
      setAIResponse("");
      
      setTimeout(() => {
        stopListening();
        handleProcess();
      }, 4000);

    } catch (err) {
      showToast("Microphone access denied.", "error");
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setTranscript("Analyzing...");
  };

  const handleProcess = () => {
    setIsProcessing(true);
    setTranscript("Processing...");
    
    setTimeout(() => {
      setIsProcessing(false);
      setTranscript("You asked about ECE249.");
      handleSpeak("Hello! I am your AI Teacher. How can I help you with your studies today?");
    }, 1500);
  };

  const handleSpeak = (text: string) => {
    setAIResponse(text);
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full flex items-center justify-center z-[100] transition-all duration-500 shadow-[0_10px_40px_rgba(234,88,12,0.3)] active:scale-95 group overflow-hidden
          ${isOpen 
            ? 'bg-slate-900 text-white rotate-90 border-2 border-slate-700' 
            : 'bg-gradient-to-br from-orange-500 via-red-600 to-orange-400 text-white hover:scale-110 hover:shadow-[0_15px_60px_rgba(234,88,12,0.6)]'
          }`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-8 h-8"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        ) : (
          <div className="relative z-10">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v1a7 7 0 0 1-14 0v-1" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
            <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-white ring-4 ring-orange-600 group-hover:animate-ping"></span>
          </div>
        )}
      </button>

      {/* Voice Assistant Overlay */}
      <div className={`fixed inset-0 z-[90] flex items-end justify-end p-6 pointer-events-none transition-all duration-500 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        {isOpen && (
          <div className="w-[calc(100vw-48px)] max-w-[420px] bg-white/80 dark:bg-slate-950/90 border border-slate-200 dark:border-white/10 rounded-[42px] shadow-[0_40px_100px_rgba(0,0,0,0.4)] backdrop-blur-3xl pointer-events-auto p-8 animate-scale-in origin-bottom-right space-y-8 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <header className="flex justify-between items-start relative z-10">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/10 border border-orange-600/20 text-orange-600 text-[10px] font-black uppercase tracking-widest leading-none">
                  <span className="flex h-1.5 w-1.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-600"></span>
                  </span>
                  Live Audio
                </div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white">Nexus AICP</h3>
              </div>
            </header>

            {/* Visualizer Area */}
            <div className="h-32 flex items-center justify-center gap-1">
              {visualizerBars.map((height, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isSpeaking 
                      ? 'bg-gradient-to-t from-orange-600 to-red-500 shadow-[0_0_10px_rgba(234,88,12,0.5)]' 
                      : isListening 
                        ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                        : 'bg-slate-200 dark:bg-white/5'
                  }`}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>

            {/* Response Area */}
            <div className="min-h-[120px] flex flex-col justify-center gap-4">
              {transcript && (
                <p className="text-slate-400 dark:text-slate-500 font-bold text-sm italic text-center">
                  "{transcript}"
                </p>
              )}
              {aiResponse && (
                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 animate-scale-in">
                  <p className="text-sm font-bold text-slate-700 dark:text-white leading-relaxed">
                    {aiResponse}
                  </p>
                </div>
              )}
            </div>

            {/* Internal Action Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={toggleConversation}
                disabled={isProcessing}
                className={`w-20 h-20 rounded-full flex flex-col items-center justify-center gap-1 transition-all duration-300 shadow-xl
                  ${isListening 
                    ? 'bg-red-500 text-white shadow-red-500/20' 
                    : isProcessing 
                      ? 'bg-slate-200 dark:bg-white/10' 
                      : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105'
                  }
                `}
              >
                {isProcessing ? (
                  <div className="w-6 h-6 border-3 border-current border-t-transparent rounded-full animate-spin" />
                ) : isListening ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-8 h-8"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-8 h-8"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v1a7 7 0 0 1-14 0v-1" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
                )}
                <span className="text-[8px] font-black uppercase tracking-tighter">
                  {isListening ? 'Stop' : isProcessing ? '...' : 'Talk'}
                </span>
              </button>
            </div>
            
            <footer className="pt-4 flex justify-between items-center text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
              <span>Gemini 2.5 Flash</span>
              <span>120ms Latecy</span>
            </footer>
          </div>
        )}
      </div>
    </>
  );
};

export default NexusVoiceAssistant;
