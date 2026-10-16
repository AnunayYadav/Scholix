
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SUPPORT_CHAT_TREE, ChatNode, ChatOption } from '../data/supportChatData.ts';
import { iosBackdropVariants, iosModalVariants } from '../utils/iosAnimations';

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
            variants={iosBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="absolute inset-0 bg-black/40"
          />
          
          <motion.div
            variants={iosModalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-md bg-white dark:bg-[#141417] rounded-3xl overflow-hidden shadow-2xl border border-zinc-200/80 dark:border-white/[0.08] flex flex-col h-[560px] max-h-[82vh] text-zinc-900 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 sm:p-6 bg-white dark:bg-[#18181c] border-b border-zinc-200/80 dark:border-white/[0.06] flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">Scholix Support</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Automated Assistant</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-all text-zinc-400 hover:text-zinc-800 dark:hover:text-white border-none bg-transparent cursor-pointer outline-none active:scale-90"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 no-scrollbar bg-zinc-50/50 dark:bg-[#141417]">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium shadow-xs leading-relaxed ${
                    msg.isBot 
                      ? 'bg-white dark:bg-[#1e1e24] text-zinc-800 dark:text-zinc-200 rounded-tl-none border border-zinc-200/60 dark:border-white/[0.06]' 
                      : 'bg-brand-primary text-white rounded-tr-none shadow-brand-primary/20 shadow-md'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-[#1e1e24] border border-zinc-200/60 dark:border-white/[0.06] rounded-tl-none flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-600 rounded-full animate-bounce [animation-duration:0.8s]" />
                    <div className="w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-600 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-600 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Options Area */}
            <div className="p-4 sm:p-5 bg-white dark:bg-[#18181c] border-t border-zinc-200/80 dark:border-white/[0.06] space-y-3">
              <div className="flex flex-wrap gap-2 justify-center">
                {currentNode.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleOptionClick(option)}
                    disabled={isTyping}
                    className="px-3.5 py-2 rounded-xl border border-brand-primary/25 bg-zinc-50 dark:bg-[#1e1e24] text-brand-primary text-xs font-semibold hover:bg-brand-primary hover:text-white transition-all active:scale-95 disabled:opacity-50 shadow-xs cursor-pointer outline-none"
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
