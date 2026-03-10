
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
  const [visualizerBars, setVisualizerBars] = useState<number[]>(new Array(35).fill(4));
  const [connError, setConnError] = useState<string | null>(null);
  
  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioQueue = useRef<Int16Array[]>([]);
  const isPlayingRef = useRef(false);

  // Constants
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const MODEL = "models/gemini-2.0-flash-exp"; 
  
  // Multiple versions to try for stability
  const WS_VERSIONS = [
    `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.MultimodalLive?key=${API_KEY}`,
    `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.MultimodalLive?key=${API_KEY}`
  ];

  useEffect(() => {
    if (isOpen && !isConnected) {
      connectWithRetry(0);
    }
    return () => cleanup();
  }, [isOpen]);

  // Visualizer Logic
  useEffect(() => {
    if ((isListening || isSpeaking) && isOpen) {
      const updateVisualizer = () => {
        setVisualizerBars(bars => bars.map(() => 
          Math.random() * (isListening ? 65 : isSpeaking ? 85 : 8) + 8
        ));
        animationFrameRef.current = requestAnimationFrame(updateVisualizer);
      };
      animationFrameRef.current = requestAnimationFrame(updateVisualizer);
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      setVisualizerBars(new Array(35).fill(4));
    }
  }, [isListening, isSpeaking, isOpen]);

  const connectWithRetry = (versionIndex: number) => {
    if (!API_KEY) {
      setConnError("No API Key detected.");
      return;
    }

    if (versionIndex >= WS_VERSIONS.length) {
      setConnError("All connection attempts failed. This usually means a Region Restriction or an unauthenticated API Key.");
      return;
    }

    setConnError(null);
    const socket = new WebSocket(WS_VERSIONS[versionIndex]);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      setConnError(null);
      
      const config = {
        setup: {
          model: MODEL,
          generation_config: {
            response_modalities: ["audio"],
            speech_config: {
              voice_config: { prebuilt_voice_config: { voice_name: "Aoede" } }
            }
          }
        }
      };
      socket.send(JSON.stringify(config));
    };

    socket.onmessage = async (event) => {
      const response = JSON.parse(event.data);
      
      if (response.serverContent?.modelTurn?.parts) {
        const audioPart = response.serverContent.modelTurn.parts.find((p: any) => p.inlineData?.mimeType?.includes('audio'));
        if (audioPart) {
          const audioBuffer = base64ToBuffer(audioPart.inlineData.data);
          queueAudio(audioBuffer);
        }
      }

      if (response.serverContent?.turnComplete) {
         // Batch finalized
      }
    };

    socket.onerror = () => {
      console.warn(`Connection failed for version ${versionIndex}. Retrying next...`);
      socket.close();
      connectWithRetry(versionIndex + 1);
    };

    socket.onclose = () => {
      setIsConnected(false);
      setIsListening(false);
    };
  };

  const startMic = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      } else if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (socketRef.current?.readyState !== WebSocket.OPEN) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = floatToShort(inputData);
        const base64 = bufferToBase64(pcm16.buffer);
        
        socketRef.current.send(JSON.stringify({
          realtimeInput: {
            mediaChunks: [{ mimeType: "audio/pcm;rate=16000", data: base64 }]
          }
        }));
      };

      source.connect(processor);
      processor.connect(audioContextRef.current.destination);
      setIsListening(true);
      setTranscript("Listening dynamically...");

    } catch (err) {
      showToast("Access to microphone is required.", "error");
    }
  };

  const stopMic = () => {
    setIsListening(false);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (processorRef.current) processorRef.current.disconnect();
    setTranscript("Stopped.");
  };

  const queueAudio = (buffer: ArrayBuffer) => {
    const pcmData = new Int16Array(buffer);
    audioQueue.current.push(pcmData);
    if (!isPlayingRef.current) playNext();
  };

  const playNext = async () => {
    if (audioQueue.current.length === 0) {
      isPlayingRef.current = false;
      setIsSpeaking(false);
      return;
    }

    isPlayingRef.current = true;
    setIsSpeaking(true);
    const pcm = audioQueue.current.shift()!;
    
    if (!audioContextRef.current) return;
    
    const audioBuffer = audioContextRef.current.createBuffer(1, pcm.length, 24000); // Gemini returns 24k
    const channel = audioBuffer.getChannelData(0);
    for (let i = 0; i < pcm.length; i++) channel[i] = pcm[i] / 32768;

    const node = audioContextRef.current.createBufferSource();
    node.buffer = audioBuffer;
    node.connect(audioContextRef.current.destination);
    node.onended = () => playNext();
    node.start();
  };

  const cleanup = () => {
    stopMic();
    if (socketRef.current) socketRef.current.close();
    if (audioContextRef.current) audioContextRef.current.close();
  };

  // Binary Utilities
  const base64ToBuffer = (b64: string) => {
    const bin = window.atob(b64);
    const buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    return buf.buffer;
  };

  const bufferToBase64 = (buf: ArrayBuffer) => {
    let bin = '';
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
    return window.btoa(bin);
  };

  const floatToShort = (input: Float32Array) => {
    const out = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      out[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return out;
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full flex items-center justify-center z-[100] transition-all duration-500 shadow-[0_10px_40px_rgba(234,88,12,0.3)] active:scale-95 group overflow-hidden
          ${isOpen 
            ? 'bg-slate-900 border-2 border-orange-500/30 text-white rotate-90' 
            : 'bg-gradient-to-br from-orange-500 via-red-600 to-orange-400 text-white hover:scale-110'
          }`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-8 h-8"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        ) : (
          <div className="relative z-10">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v1a7 7 0 0 1-14 0v-1" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
            <span className={`absolute -top-1 -right-1 block h-3 w-3 rounded-full ring-4 ${isConnected ? 'bg-green-400 animate-pulse ring-orange-600' : 'bg-white ring-orange-600'}`}></span>
          </div>
        )}
      </button>

      <div className={`fixed inset-0 z-[90] flex items-end justify-end p-6 pointer-events-none transition-all duration-500 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className={`w-[calc(100vw-48px)] max-w-[420px] bg-white/90 dark:bg-slate-950/95 border border-slate-200 dark:border-white/10 rounded-[42px] shadow-[0_40px_100px_rgba(0,0,0,0.5)] backdrop-blur-3xl pointer-events-auto p-8 transform transition-all duration-500 ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-12 scale-95'}`}>
          {/* Header */}
          <div className="flex justify-between items-start mb-10 relative z-10">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/10 border border-orange-600/20 text-orange-600 text-[9px] font-black uppercase tracking-[0.2em]">
                <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-orange-500'}`} />
                {isConnected ? 'Nexus AICP Active' : 'Connecting...'}
              </div>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">AI Teacher</h3>
            </div>
            {connError && (
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 group relative">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                <div className="absolute bottom-full right-0 mb-2 w-48 p-3 rounded-2xl bg-slate-900 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {connError}
                </div>
              </div>
            )}
          </div>

          {/* Visualization */}
          <div className="h-40 flex items-end justify-center gap-1.5 px-4 mb-8">
            {visualizerBars.map((height, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-150 transform-gpu ${
                  isSpeaking 
                    ? 'bg-gradient-to-t from-orange-600 to-red-500 shadow-[0_-5px_15px_rgba(234,88,12,0.3)]' 
                    : isListening 
                      ? 'bg-blue-500 shadow-[0_-5px_15px_rgba(59,130,246,0.3)]'
                      : 'bg-slate-200 dark:bg-white/5'
                }`}
                style={{ height: `${height}%`, opacity: height / 100 }}
              />
            ))}
          </div>

          {/* Status Text Area */}
          <div className="min-h-[80px] flex flex-col items-center justify-center text-center">
            <p className="text-lg font-bold text-slate-800 dark:text-white leading-tight mb-2">
              {isListening ? "Listening to you..." : isSpeaking ? "AI is talking..." : isConnected ? "Tap to speak with Nexus" : "Failed to connect"}
            </p>
            <p className="text-[11px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest italic px-8">
              {connError ? "Check API permissions or VPN" : isListening ? "LPU Context Active" : "Native Audio Multimodal"}
            </p>
          </div>

          {/* Control Button */}
          <div className="flex flex-col items-center gap-4 pt-6">
            <button
              onClick={isListening ? stopMic : startMic}
              disabled={!isConnected}
              className={`relative w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-2xl overflow-hidden
                ${isListening 
                  ? 'bg-red-500 text-white shadow-red-500/30' 
                  : !isConnected
                    ? 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-700 cursor-not-allowed border-none' 
                    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 hover:shadow-orange-600/20'
                }
              `}
            >
              <div className={`absolute inset-0 bg-white/10 opacity-0 ${isListening ? 'animate-pulse opacity-100' : ''}`} />
              {isListening ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-10 h-10 relative z-10"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-10 h-10 relative z-10"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v1a7 7 0 0 1-14 0v-1" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
              )}
              <span className="text-[10px] font-black uppercase tracking-widest mt-1 relative z-10">
                {isListening ? 'Mute' : 'Talk'}
              </span>
            </button>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">125ms Latency • Audio Native</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NexusVoiceAssistant;
