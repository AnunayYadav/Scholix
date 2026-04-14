
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import NexusServer from '../services/nexusServer.ts';
import { showToast } from './Toast.tsx';
import { UserProfile } from '../types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, userProfile }) => {
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const submitFeedback = async () => {
    if (!feedbackText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await NexusServer.submitFeedback(feedbackText, userProfile?.id, userProfile?.email);
      setSubmitSuccess(true);
      setFeedbackText("");
      setTimeout(() => {
        onClose();
        // Reset success state after modal closes
        setTimeout(() => setSubmitSuccess(false), 500);
      }, 2000);
    } catch (e: any) {
      showToast(`Oops! Something went wrong: ${e.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
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
            onClick={() => !isSubmitting && onClose()}
            className="absolute inset-0 bg-black/40 backdrop-blur-xl"
            style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-[#0a0a0a] rounded-[40px] border border-zinc-200 dark:border-white/10 shadow-2xl p-10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={onClose} 
              className="absolute top-8 right-8 p-2 text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors border-none bg-transparent active:scale-90 cursor-pointer outline-none"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>

            {submitSuccess ? (
              <div className="text-center py-12 space-y-6">
                <div className="w-20 h-20 bg-green-500/10 rounded-[32px] flex items-center justify-center mx-auto text-green-500 border border-green-500/20">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-10 h-10"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight leading-none mb-2">Success!</h3>
                  <p className="text-zinc-500 font-bold text-[11px] sm:text-xs uppercase tracking-widest">Your feedback has been received.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 bg-brand-primary/10 rounded-[32px] flex items-center justify-center mb-8 border border-brand-primary/20">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-10 h-10 text-brand-primary"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                </div>

                <h3 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight leading-none">Feedback</h3>
                <p className="text-zinc-500 text-xs mb-8">Found a bug or have a suggestion? Let us know.</p>

                <div className="relative group">
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full h-40 p-6 rounded-[32px] bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 focus:ring-4 focus:ring-brand-primary/10 text-zinc-800 dark:text-zinc-200 resize-none transition-all outline-none font-medium text-sm leading-relaxed shadow-inner"
                    placeholder="Tell us what's on your mind... we're all ears."
                  />
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1 py-4 text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-white font-bold text-sm border-none bg-transparent transition-colors cursor-pointer outline-none"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={submitFeedback}
                    disabled={isSubmitting || !feedbackText.trim()}
                    className="flex-[2] py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-[24px] font-bold text-sm shadow-xl shadow-brand-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3 border-none disabled:opacity-50 cursor-pointer outline-none"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><line x1="22" y1="2" x2="11" y2="13" /><polyline points="22 2 15 22 11 13 2 9 22 2" /></svg>
                    )}
                    <span>{isSubmitting ? 'Sending...' : 'Submit Feedback'}</span>
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.getElementById('modal-root') || document.body
  );
};

export default FeedbackModal;
