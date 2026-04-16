
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SUPPORT_CHAT_TREE, ChatNode, ChatOption } from '../data/supportChatData.ts';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFeedback: () => void;
}

const ChatSupportModal: React.FC<ChatSupportModalProps> = ({ isOpen, onClose, onOpenFeedback }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentNode, setCurrentNode] = useState<ChatNode>(SUPPORT_CHAT_TREE.start);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage(SUPPORT_CHAT_TREE.start.message);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const addBotMessage = (text: string) => {
    setIsTyping(true);
    setTimeout(() => {
      const newMessage: Message = {
        id: Date.now().toString(),
        text,
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleOptionClick = (option: ChatOption) => {
    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      text: option.text,
      isBot: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    // Handle Actions
    if (option.action === 'email') {
      window.open('https://mail.google.com/mail/?view=cm&fs=1&to=anunayarvind@gmail.com', '_blank');
      return;
    }
    if (option.action === 'feedback') {
      onClose();
      onOpenFeedback();
      return;
    }
    if (option.action === 'link' && option.link) {
      window.open(option.link, '_blank');
      return;
    }

    // Handle Logic
    if (option.response) {
      addBotMessage(option.response);
      // After a response, we might want to offer more options or a "back" option.
      // For simplicity, we just stay at current node options or could add a special "is there anything else" node.
    } else if (option.nextId && SUPPORT_CHAT_TREE[option.nextId]) {
      const nextNode = SUPPORT_CHAT_TREE[option.nextId];
      setCurrentNode(nextNode);
      addBotMessage(nextNode.message);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setCurrentNode(SUPPORT_CHAT_TREE.start);
    addBotMessage(SUPPORT_CHAT_TREE.start.message);
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden pointer-events-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-xl"
            style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-zinc-50 dark:bg-[#0a0a0a] rounded-[40px] overflow-hidden shadow-2xl border border-zinc-200 dark:border-white/10 flex flex-col h-[600px] max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-8 bg-white dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[20px] bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Scholix Support</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Automated Assistant</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-2xl transition-all text-zinc-400 border-none bg-transparent cursor-pointer outline-none active:scale-90"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-5 no-scrollbar bg-white dark:bg-[#0a0a0a]">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[85%] px-5 py-3.5 rounded-[24px] text-sm font-medium shadow-sm leading-relaxed ${
                    msg.isBot 
                      ? 'bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-tl-none border border-zinc-100 dark:border-white/5' 
                      : 'bg-brand-primary text-white rounded-tr-none shadow-brand-primary/20 shadow-lg'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="px-5 py-3.5 rounded-[24px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-tl-none flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-600 rounded-full animate-bounce [animation-duration:0.8s]" />
                    <div className="w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-600 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-600 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Options Area */}
            <div className="p-8 bg-zinc-50/50 dark:bg-zinc-900/30 backdrop-blur-md border-t border-zinc-200 dark:border-white/5 space-y-4">
              <div className="flex flex-wrap gap-2.5 justify-center">
                {currentNode.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleOptionClick(option)}
                    disabled={isTyping}
                    className="px-5 py-3 rounded-2xl border border-brand-primary/20 bg-white dark:bg-zinc-900 text-brand-primary text-xs font-bold hover:bg-brand-primary hover:text-white transition-all active:scale-95 disabled:opacity-50 border-none shadow-sm cursor-pointer outline-none"
                  >
                    {option.text}
                  </button>
                ))}
              </div>
              
              {messages.length > 2 && (
                <button 
                  onClick={resetChat}
                  className="w-full py-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-brand-primary transition-colors border-none bg-transparent cursor-pointer outline-none"
                >
                  Restart Assistance
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.getElementById('modal-root') || document.body
  );
};

export default ChatSupportModal;
