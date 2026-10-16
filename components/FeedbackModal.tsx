
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import NexusServer from '../services/nexusServer.ts';
import { showToast } from './Toast.tsx';
import { UserProfile } from '../types';
import { iosBackdropVariants, iosModalVariants } from '../utils/iosAnimations';

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
            variants={iosBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => !isSubmitting && onClose()}
            className="absolute inset-0 bg-black/40"
          />

          {/* Modal Content */}
          <motion.div
            variants={iosModalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-md bg-white dark:bg-[#141417] rounded-3xl border border-zinc-200/80 dark:border-white/[0.08] shadow-2xl p-6 sm:p-7 overflow-hidden text-zinc-900 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={onClose} 
              className="absolute top-5 right-5 p-1.5 text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-colors border-none bg-transparent active:scale-90 cursor-pointer outline-none"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>

            {submitSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto text-green-500 border border-green-500/20">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-7 h-7"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight leading-none mb-1.5">Success!</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 font-medium text-xs">Your feedback has been received.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary border border-brand-primary/20 shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight leading-none">Feedback</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">Found a bug or have a suggestion? Let us know.</p>
                  </div>
                </div>

                <div className="relative group mb-5">
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full h-32 p-3.5 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/70 dark:border-white/[0.07] focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/50 text-zinc-800 dark:text-zinc-200 resize-none transition-all outline-none text-xs sm:text-sm leading-relaxed placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                    placeholder="Tell us what's on your mind... we're all ears."
                  />
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-white font-semibold text-xs sm:text-sm border border-zinc-200/60 dark:border-white/5 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer outline-none"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={submitFeedback}
                    disabled={isSubmitting || !feedbackText.trim()}
                    className="flex-[2] py-2.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-xl font-semibold text-xs sm:text-sm shadow-md shadow-brand-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer outline-none"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><line x1="22" y1="2" x2="11" y2="13" /><polyline points="22 2 15 22 11 13 2 9 22 2" /></svg>
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
