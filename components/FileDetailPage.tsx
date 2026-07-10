import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, Download, Eye, Star, MessageSquare, Shield, AlertTriangle, 
  Sparkles, BookOpen, Brain, HelpCircle, Check, Send, ThumbsUp, Flame, Play
} from 'lucide-react';
import { LibraryFile } from '../types';
import { PostComment, ReactionContainer } from '../types/communityTypes';
import CommunityService from '../services/communityService';
import NexusServer from '../services/nexusServer';
import { askGeminiText } from '../services/geminiService';
import { showToast } from './Toast';

interface FileDetailPageProps {
  file: LibraryFile;
  userProfile: any;
  onClose: () => void;
  onRefresh?: () => void;
  themeColor?: string;
}

const FileDetailPage: React.FC<FileDetailPageProps> = ({ file, userProfile, onClose, onRefresh, themeColor }) => {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [reactions, setReactions] = useState<ReactionContainer>({ helpful: [], quality: [], important: [] });
  const [averageRating, setAverageRating] = useState(0);
  const [ratingVotesCount, setRatingVotesCount] = useState(0);
  const [downloads, setDownloads] = useState(0);

  // New Comment form
  const [commentText, setCommentText] = useState('');
  const [replyTarget, setReplyTarget] = useState<{ commentId: string; username: string } | null>(null);
  const [replyText, setReplyText] = useState('');

  // Rate stars
  const [userRating, setUserRating] = useState<number>(0);

  const loadFileData = async () => {
    try {
      const data = await CommunityService.fetchFileCommunityData(file.id);
      setComments(data.comments);
      setReactions(data.reactions);
      setAverageRating(data.averageRating);
      setRatingVotesCount(data.ratingVotesCount);
      setDownloads(data.downloads);

      if (userProfile && file.rating_votes) {
        const ratingVotes = (file.rating_votes as any) || {};
        setUserRating(ratingVotes[userProfile.id] || 0);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadFileData();
  }, [file.id, userProfile]);

  // Download Handler
  const handleDownload = async () => {
    CommunityService.recordFileDownload(file.id);
    setDownloads(prev => prev + 1);
    
    try {
      const sessionRes = await NexusServer.getSession();
      const token = sessionRes?.data?.session?.access_token;
      const url = NexusServer.getFileUrl(file.storage_path, token);
      if (url) {
        window.open(url, '_blank');
        showToast("Opening file...", "success");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to retrieve file download link", "error");
    }
  };

  // Comments / Replies
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) {
      showToast("Please login to post a comment.", "info");
      return;
    }
    if (!commentText.trim()) return;

    try {
      await CommunityService.addCommentToItem(file.id, 'file', {
        user_id: userProfile.id,
        username: userProfile.username || 'Anonymous Verto',
        avatar_url: userProfile.avatar_url,
        content: commentText.trim()
      });
      setCommentText('');
      loadFileData();
      onRefresh?.();
      showToast("Comment added!", "success");
    } catch (e) {
      showToast("Failed to add comment", "error");
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !replyTarget) return;
    if (!replyText.trim()) return;

    try {
      await CommunityService.addReplyToComment(file.id, 'file', replyTarget.commentId, {
        user_id: userProfile.id,
        username: userProfile.username || 'Anonymous Verto',
        avatar_url: userProfile.avatar_url,
        content: replyText.trim()
      });
      setReplyText('');
      setReplyTarget(null);
      loadFileData();
      onRefresh?.();
      showToast("Reply added!", "success");
    } catch (e) {
      showToast("Failed to post reply", "error");
    }
  };

  // Reactions
  const handleReactionClick = async (type: 'helpful' | 'quality' | 'important') => {
    if (!userProfile) {
      showToast("Please login to react.", "info");
      return;
    }
    try {
      const updated = await CommunityService.toggleReaction(file.id, 'file', type, userProfile.id);
      setReactions(updated);
    } catch (e) {}
  };

  // Ratings
  const handleRate = async (score: number) => {
    if (!userProfile) {
      showToast("Please login to rate.", "info");
      return;
    }
    try {
      await CommunityService.submitFileRating(file.id, userProfile.id, score);
      setUserRating(score);
      loadFileData();
      onRefresh?.();
      showToast("Rating saved!", "success");
    } catch (e) {}
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-xl"
        style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
      />

      {/* Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-xl max-h-[88vh] bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-[40px] p-6 sm:p-7 shadow-2xl flex flex-col overflow-hidden z-10 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div 
              className="w-8.5 h-8.5 rounded-xl flex items-center justify-center text-white text-[10px] font-black shrink-0"
              style={{ backgroundColor: themeColor || '#ff7a00' }}
            >
              {(() => {
                if (!file.name.includes('.')) return 'FILE';
                const ext = file.name.split('.').pop()?.trim().toUpperCase() || 'FILE';
                return ext.length > 5 ? 'FILE' : ext;
              })()}
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-zinc-955 dark:text-white truncate max-w-[280px]">
                {file.name}
              </h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5">
                {file.subject} • {file.type}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-zinc-400 hover:text-zinc-650 dark:hover:text-white bg-transparent border-none text-lg cursor-pointer font-semibold transition-colors"
          >
            ×
          </button>
        </div>

        {/* Scrollable File Details */}
        <div className="flex-1 overflow-y-auto pr-1.5 space-y-4 max-h-[50vh] scrollbar-thin">
          {/* File Meta Pills */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="px-2.5 py-1 bg-zinc-50 dark:bg-white/5 border border-zinc-150/40 dark:border-white/5 rounded-xl text-[10px] font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <Download size={11} className="text-zinc-400" /> {downloads} DLs
            </span>
            <span className="px-2.5 py-1 bg-zinc-50 dark:bg-white/5 border border-zinc-150/40 dark:border-white/5 rounded-xl text-[10px] font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <ThumbsUp size={11} className="text-zinc-400" /> {(reactions.helpful?.length || 0) + (reactions.quality?.length || 0) + (reactions.important?.length || 0)} Likes
            </span>
            <span className="px-2.5 py-1 bg-zinc-50 dark:bg-white/5 border border-zinc-150/40 dark:border-white/5 rounded-xl text-[10px] font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <Star size={11} className="text-amber-500" fill="currentColor" /> {averageRating} / 5.0 Rating
            </span>
            {file.difficulty && (
              <span 
                className="px-2.5 py-1 bg-zinc-50 dark:bg-white/5 border border-zinc-150/40 dark:border-white/5 rounded-xl text-[10px] font-bold uppercase"
                style={{ color: themeColor || '#ff7a00' }}
              >
                {file.difficulty}
              </span>
            )}
            {file.exam_type && (
              <span className="px-2.5 py-1 bg-zinc-50 dark:bg-white/5 border border-zinc-150/40 dark:border-white/5 rounded-xl text-[10px] font-bold text-zinc-450 dark:text-zinc-400 uppercase">
                {file.exam_type}
              </span>
            )}
            {file.verified_status && file.verified_status !== 'none' && (
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/15 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-0.5">
                <Check size={10} strokeWidth={3} /> Verified
              </span>
            )}
          </div>

          {/* Description & Faculty */}
          <div className="p-4 bg-zinc-50/30 dark:bg-white/[0.005] border border-zinc-150 dark:border-white/5 rounded-2xl space-y-1.5 text-xs">
            {file.faculty_name && (
              <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                <Shield size={12} style={{ color: themeColor || '#ff7a00' }} /> Taught by: <strong className="text-zinc-700 dark:text-zinc-300 font-bold">{file.faculty_name}</strong>
              </div>
            )}
            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
              {file.description || "No description provided for this resource."}
            </p>
          </div>
          {/* Download Action */}
          <div className="flex justify-center w-full">
            <button 
              onClick={handleDownload}
              className="w-full max-w-[240px] py-2.5 hover:scale-[1.01] active:scale-[0.99] transition-all text-white rounded-xl text-xs font-bold border-none flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              style={{ backgroundColor: themeColor || '#ff7a00', boxShadow: `0 8px 16px -3px ${themeColor}20` }}
            >
              <Download size={13} /> Download File
            </button>
          </div>

          {/* Rate and React */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Rating */}
            <div className="flex items-center justify-between gap-4 px-4 py-2 border border-zinc-150 dark:border-white/5 rounded-2xl bg-zinc-50/20 dark:bg-white/[0.005]">
              <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Rate resource:</div>
              <div className="flex gap-0.5 text-zinc-350">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleRate(val)}
                    className={`p-0.5 bg-transparent border-none cursor-pointer hover:scale-115 transition-transform ${userRating >= val ? 'text-amber-500' : 'text-zinc-355 dark:text-zinc-700'}`}
                  >
                    <Star size={16} fill={userRating >= val ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>

            {/* Reactions */}
            <div className="flex justify-around items-center px-4 py-2 border border-zinc-150 dark:border-white/5 rounded-2xl bg-zinc-50/20 dark:bg-white/[0.005]">
              {[
                { type: 'helpful', label: '👍', activeColor: 'text-blue-500 bg-blue-500/10' },
                { type: 'quality', label: '⭐', activeColor: 'text-amber-500 bg-amber-500/10' },
                { type: 'important', label: '🔥', activeColor: 'text-orange-500 bg-orange-500/10' }
              ].map((reaction) => {
                const count = reactions[reaction.type as keyof ReactionContainer]?.length || 0;
                const active = userProfile && reactions[reaction.type as keyof ReactionContainer]?.includes(userProfile.id);
                return (
                  <button
                    key={reaction.type}
                    onClick={() => handleReactionClick(reaction.type as any)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 bg-transparent cursor-pointer transition-all border-none ${
                      active ? reaction.activeColor : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    <span>{reaction.label}</span>
                    <span className="text-[10px] font-bold">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider Line */}
          <div className="border-t border-zinc-100 dark:border-white/5 pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                💬 Discussion <span className="text-[10px] text-zinc-400 font-semibold">({comments.length})</span>
              </h4>
            </div>

            {/* Form */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Ask a question or add a note..."
                className="flex-1 bg-zinc-50 dark:bg-white/[0.02] border border-zinc-150 dark:border-white/5 rounded-xl px-4 py-2.5 text-xs font-medium text-zinc-955 dark:text-white placeholder:text-zinc-400 outline-none focus:border-zinc-400 transition-colors"
              />
              <button 
                type="submit" 
                className="px-4 py-2.5 hover:scale-105 active:scale-95 text-white rounded-xl text-xs font-bold border-none cursor-pointer"
                style={{ backgroundColor: themeColor || '#ff7a00' }}
              >
                Send
              </button>
            </form>

            {/* Replies indicator */}
            {replyTarget && (
              <div className="p-2.5 bg-zinc-50 dark:bg-white/5 rounded-xl text-[10px] text-zinc-500 font-semibold flex justify-between items-center">
                <span>Replying to @{replyTarget.username}</span>
                <button onClick={() => setReplyTarget(null)} className="text-rose-500 bg-transparent border-none cursor-pointer">Cancel</button>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4 pt-1">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="space-y-2">
                    <div className="flex gap-3 items-start">
                      <img 
                        src={comment.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'} 
                        alt={comment.username} 
                        className="w-7 h-7 rounded-full border border-zinc-200 dark:border-white/10" 
                      />
                      <div className="flex-1 space-y-1">
                        <div className="text-[10px] font-black text-zinc-800 dark:text-zinc-200">
                          {comment.username}
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                          {comment.content}
                        </p>
                        <div className="flex items-center gap-3 text-[9px] font-bold text-zinc-400">
                          <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                          <button 
                            onClick={() => setReplyTarget({ commentId: comment.id, username: comment.username })}
                            className="bg-transparent border-none hover:underline cursor-pointer"
                            style={{ color: themeColor || '#ff7a00' }}
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Replies */}
                    {comment.replies && comment.replies.map((reply) => (
                      <div key={reply.id} className="ml-10 flex gap-2.5 items-start bg-zinc-50/30 dark:bg-white/[0.003] p-2 rounded-xl">
                        <img 
                          src={reply.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'} 
                          alt={reply.username} 
                          className="w-5 h-5 rounded-full border border-zinc-200 dark:border-white/10" 
                        />
                        <div className="flex-1 space-y-0.5">
                          <div className="text-[9px] font-black text-zinc-700 dark:text-zinc-300">
                            {reply.username}
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div className="text-xs text-zinc-400 py-6 text-center">No discussion questions yet. Ask a question!</div>
              )}
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default FileDetailPage;
