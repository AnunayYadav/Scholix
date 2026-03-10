
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { showToast } from './Toast';

interface NexusVoiceAssistantProps {
  userProfile: UserProfile | null;
}

const NexusVoiceAssistant: React.FC<NexusVoiceAssistantProps> = ({ userProfile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [visualizerBars, setVisualizerBars] = useState<number[]>(new Array(30).fill(5));
  
  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioQueue = useRef<Int16Array[]>([]);
  const isPlayingRef = useRef(false);

  // Constants for Gemini Multimodal Live
  const MODEL = "models/gemini-2.0-flash-exp"; // Using 2.0 Flash for Native Audio capabilities
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const WS_URL = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.MultimodalLive?key=${API_KEY}`;

  useEffect(() => {
    if (isOpen && !isConnected) {
      connectToGemini();
    }
    return () => {
      cleanup();
    };
  }, [isOpen]);

  // Visualizer Animation
  useEffect(() => {
    if ((isListening || isSpeaking) && isOpen) {
      const updateVisualizer = () => {
        setVisualizerBars(bars => bars.map(() => 
          Math.random() * (isListening ? 60 : isSpeaking ? 80 : 10) + 10
        ));
        animationFrameRef.current = requestAnimationFrame(updateVisualizer);
      };
      animationFrameRef.current = requestAnimationFrame(updateVisualizer);
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      setVisualizerBars(new Array(30).fill(5));
    }
  }, [isListening, isSpeaking, isOpen]);

  const connectToGemini = () => {
    if (!API_KEY) {
      showToast("VITE_GEMINI_API_KEY not found.", "error");
      return;
    }

    const socket = new WebSocket(WS_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      // Send Setup Message
      const setupMessage = {
        setup: {
          model: MODEL,
          generation_config: {
            response_modalities: ["audio"],
            speech_config: {
              voice_config: { prebuilt_voice_config: { voice_name: "Puck" } }
            }
          }
        }
      };
      socket.send(JSON.stringify(setupMessage));
    };

    socket.onmessage = async (event) => {
      const response = JSON.parse(event.data);
      
      if (response.serverContent?.modelTurn?.parts) {
        const audioPart = response.serverContent.modelTurn.parts.find((p: any) => p.inlineData?.mimeType?.includes('audio'));
        if (audioPart) {
          const audioData = base64ToArrayBuffer(audioPart.inlineData.data);
          processIncomingAudio(audioData);
        }
      }

      if (response.serverContent?.turnComplete) {
        setIsSpeaking(false);
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
      setIsListening(false);
    };

    socket.onerror = (err) => {
      console.error("WebSocket Error:", err);
      showToast("Connection to Gemini failed.", "error");
    };
  };

  const startInteraction = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = floatTo16BitPCM(inputData);
        const base64Data = arrayBufferToBase64(pcmData.buffer);
        
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({
            realtimeInput: {
              mediaChunks: [{ mimeType: "audio/pcm;rate=16000", data: base64Data }]
            }
          }));
        }
      };

      source.connect(processor);
      processor.connect(audioContextRef.current.destination);
      setIsListening(true);
      setTranscript("Listening...");

    } catch (err) {
      showToast("Mic access required for Voice AI.", "error");
    }
  };

  const stopInteraction = () => {
    setIsListening(false);
    setTranscript("Session paused.");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
    }
  };

  const processIncomingAudio = (buffer: ArrayBuffer) => {
    const pcmData = new Int16Array(buffer);
    audioQueue.current.push(pcmData);
    if (!isPlayingRef.current) {
      playNextInQueue();
    }
  };

  const playNextInQueue = async () => {
    if (audioQueue.current.length === 0) {
      isPlayingRef.current = false;
      setIsSpeaking(false);
      return;
    }

    isPlayingRef.current = true;
    setIsSpeaking(true);
    const pcmData = audioQueue.current.shift()!;
    
    if (!audioContextRef.current) return;
    
    // Play 24kHz audio from Gemini
    const audioBuffer = audioContextRef.current.createBuffer(1, pcmData.length, 24000);
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < pcmData.length; i++) {
      channelData[i] = pcmData[i] / 32768;
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => {
      playNextInQueue();
    };
    source.start();
  };

  const cleanup = () => {
    stopInteraction();
    if (socketRef.current) socketRef.current.close();
    if (audioContextRef.current) audioContextRef.current.close();
  };

  // Helpers
  const base64ToArrayBuffer = (base64: string) => {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return window.btoa(binary);
  };

  const floatTo16BitPCM = (input: Float32Array) => {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output;
  };

  return (
    <>
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
            <span className={`absolute -top-1 -right-1 block h-3 w-3 rounded-full ring-4 ${isConnected ? 'bg-green-400 ring-orange-600' : 'bg-white ring-orange-600'} group-hover:animate-ping`}></span>
          </div>
        )}
      </button>

      <div className={`fixed inset-0 z-[90] flex items-end justify-end p-6 pointer-events-none transition-all duration-500 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        {isOpen && (
          <div className="w-[calc(100vw-48px)] max-w-[420px] bg-white/80 dark:bg-slate-950/90 border border-slate-200 dark:border-white/10 rounded-[42px] shadow-[0_40px_100px_rgba(0,0,0,0.4)] backdrop-blur-3xl pointer-events-auto p-8 animate-scale-in origin-bottom-right space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <header className="flex justify-between items-start relative z-10">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/10 border border-orange-600/20 text-orange-600 text-[10px] font-black uppercase tracking-widest leading-none">
                  <span className="flex h-1.5 w-1.5 relative">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isConnected ? 'bg-green-600' : 'bg-orange-600'}`}></span>
                  </span>
                  {isConnected ? 'Connection Live' : 'Initializing...'}
                </div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white">Nexus AICP</h3>
              </div>
            </header>

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

            <div className="min-h-[120px] flex flex-col justify-center gap-4">
              <p className="text-slate-400 dark:text-slate-500 font-bold text-sm italic text-center">
                {isListening ? '"Listening to your voice..."' : isSpeaking ? '"AI is responding..."' : '"Ready to help you study"'}
              </p>
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={isListening ? stopInteraction : startInteraction}
                disabled={!isConnected}
                className={`w-20 h-20 rounded-full flex flex-col items-center justify-center gap-1 transition-all duration-300 shadow-xl
                  ${isListening 
                    ? 'bg-red-500 text-white shadow-red-500/20' 
                    : !isConnected
                      ? 'bg-slate-200 dark:bg-white/10 cursor-not-allowed' 
                      : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105'
                  }
                `}
              >
                {isListening ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-8 h-8"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-8 h-8"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v1a7 7 0 0 1-14 0v-1" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
                )}
                <span className="text-[8px] font-black uppercase tracking-tighter">
                  {isListening ? 'Stop' : 'Talk'}
                </span>
              </button>
            </div>
            
            <footer className="pt-4 flex justify-between items-center text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
              <span>Gemini 2.5 Flash</span>
              <span>Unlimited Voice</span>
            </footer>
          </div>
        )}
      </div>
    </>
  );
};

export default NexusVoiceAssistant;
