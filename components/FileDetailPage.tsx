import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Download, MessageSquare, ThumbsUp, Star, Flame, 
  Share2, Bookmark, Send, Check, Shield, FileText, CheckCircle2, ArrowRight
} from 'lucide-react';
import { LibraryFile } from '../types';
import { PostComment, ReactionContainer } from '../types/communityTypes';
import CommunityService from '../services/communityService';
import NexusServer from '../services/nexusServer';
import { showToast } from './Toast';
import VerifiedBadge from './VerifiedBadge';

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
  const [downloads, setDownloads] = useState(0);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  // New Comment form
  const [commentText, setCommentText] = useState('');
  const [replyTarget, setReplyTarget] = useState<{ commentId: string; username: string } | null>(null);
  const [replyText, setReplyText] = useState('');

  // Save Bookmark state
  const [isSaved, setIsSaved] = useState(() => {
    try {
      const saved = localStorage.getItem(`saved_file_${file.id}`);
      return saved === 'true';
    } catch (e) {
      return false;
    }
  });

  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Rate stars
  const [userRating, setUserRating] = useState<number>(0);

  const loadFileData = async () => {
    try {
      const data = await CommunityService.fetchFileCommunityData(file.id);
      setComments(data.comments || []);
      setReactions(data.reactions || { helpful: [], quality: [], important: [] });
      setAverageRating(data.averageRating || 0);
      setDownloads(data.downloads || 0);

      if (userProfile && file.rating_votes) {
        const ratingVotes = (file.rating_votes as any) || {};
        setUserRating(ratingVotes[userProfile.id] || 0);
      }
    } catch (e) {
      console.error("Failed to load file data:", e);
    }
  };

  useEffect(() => {
    loadFileData();
  }, [file.id, userProfile]);

  const handleSaveToggle = () => {
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    localStorage.setItem(`saved_file_${file.id}`, String(nextSaved));
    showToast(nextSaved ? "Added to saved items" : "Removed from saved items", "success");
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/library/${encodeURIComponent(file.program)}/${encodeURIComponent(file.semester)}/${encodeURIComponent(file.subject)}?file=${file.id}`;
    navigator.clipboard.writeText(shareUrl);
    showToast("Link copied to clipboard!", "success");
  };

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
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
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

  // Helper to extract clean extension format (e.g. PDF, PPT, DOC)
  const getCleanExtension = () => {
    const actualName = (file.storage_path || file.name).split('/').pop() || '';
    const parts = actualName.split('.');
    if (parts.length > 1) {
      const ext = parts.pop()?.trim().toLowerCase() || '';
      if (ext && ext.length <= 4 && /^[a-z0-9]+$/.test(ext)) {
        return ext.toUpperCase();
      }
    }
    // Fallback based on category/type
    const typeLower = (file.type || '').toLowerCase();
    if (typeLower.includes('lecture') || typeLower.includes('video')) return 'PPT';
    if (typeLower.includes('notes')) return 'PDF';
    return 'PDF';
  };

  const fileExt = getCleanExtension();
  const totalLikes = (reactions.helpful?.length || 0) + (reactions.quality?.length || 0) + (reactions.important?.length || 0);

  const relativeTime = (() => {
    const dateVal = file.uploadDate || (file as any).created_at;
    if (!dateVal) return 'some time ago';
    const timestamp = typeof dateVal === 'string' ? Date.parse(dateVal) : dateVal;
    
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 60) return `${mins} mins ago`;
    if (hours < 24) return `${hours} hrs ago`;
    return `${days} days ago`;
  })();

  // View count derived from downloads
  const viewCount = (downloads || 0) * 12 + 24;

  // Icon colors based on clean extension
  const iconStyle = (() => {
    if (fileExt === 'PDF') return { bg: 'bg-gradient-to-br from-rose-500 to-rose-600 shadow-rose-500/20' };
    if (['DOC', 'DOCX'].includes(fileExt)) return { bg: 'bg-gradient-to-br from-blue-500 to-blue-650 shadow-blue-500/20' };
    if (['PPT', 'PPTX'].includes(fileExt)) return { bg: 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-500/20' };
    if (['XLS', 'XLSX', 'CSV'].includes(fileExt)) return { bg: 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/20' };
    if (['ZIP', 'RAR'].includes(fileExt)) return { bg: 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/20' };
    return { bg: 'bg-gradient-to-br from-zinc-400 to-zinc-650 shadow-zinc-500/20' };
  })();

  return (
    <div className="w-full space-y-6 animate-fade-in text-zinc-900 dark:text-zinc-200">
      
      {/* Top Header Navigation Panel */}
      <div className="flex items-center justify-between gap-4 pb-2">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-[#161618] hover:bg-zinc-200/60 dark:hover:bg-[#1f1f23] text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-all border-none cursor-pointer active:scale-95"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>

        <div className="text-center min-w-0">
          <h4 className="text-xs md:text-sm font-extrabold text-zinc-900 dark:text-white truncate max-w-[200px] sm:max-w-[360px]">
            {file.subject}
          </h4>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold tracking-wider uppercase mt-0.5">
            {file.type} Material
          </p>
        </div>

        <button 
          onClick={handleDownload}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 border-none cursor-pointer shadow-lg shadow-orange-500/20"
          style={{ backgroundColor: themeColor || '#ff7a00' }}
        >
          <Download size={15} />
          <span>Download</span>
        </button>
      </div>

      {/* Detail Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Metadata & Reactions */}
        <div className="col-span-1 lg:col-span-7 space-y-5">
          
          {/* File Card Summary */}
          <div className="p-6 bg-zinc-100 dark:bg-[#161618] border-none rounded-[28px] shadow-none flex flex-col gap-5 relative overflow-hidden">
            <div className="flex gap-5 items-start relative z-10">
              {/* Premium Vector file format block */}
              <div 
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center text-white shrink-0 shadow-lg relative overflow-hidden ${iconStyle.bg}`}
              >
                <div className="absolute top-0 left-0 right-0 h-[30%] bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.2)]" />
                <span className="text-[10px] sm:text-xs font-black tracking-widest mt-1 drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">{fileExt}</span>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-white leading-tight tracking-tight mt-0.5 break-words">
                  {file.name}
                </h3>
                
                <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-600 dark:text-zinc-400 font-bold">
                  <span>By {file.uploader_username || 'Anonymous Verto'}</span>
                  {file.uploader_is_admin && (
                    <VerifiedBadge isAdmin={true} size="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-lg text-[9px] font-extrabold">Complete</span>
                  <span>•</span>
                  <span>Uploaded {relativeTime}</span>
                  <span>•</span>
                  <span>{viewCount >= 1000 ? `${(viewCount / 1000).toFixed(1)}k` : viewCount} views</span>
                </div>
              </div>
            </div>

            {/* Social Toolbar */}
            <div className="grid grid-cols-4 gap-2.5 pt-2 relative z-10 text-center">
              <button 
                onClick={() => handleReactionClick('helpful')}
                className="py-3 rounded-2xl bg-zinc-200/60 dark:bg-[#202024] hover:bg-zinc-200 dark:hover:bg-[#26262a] border-none transition-all flex items-center justify-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer active:scale-95"
              >
                <ThumbsUp size={15} className={reactions.helpful?.includes(userProfile?.id) ? "text-blue-500 fill-current animate-bounce-subtle" : ""} />
                <span>{totalLikes}</span>
              </button>

              <button 
                onClick={() => {
                  const el = document.getElementById('comments-header-anchor');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="py-3 rounded-2xl bg-zinc-200/60 dark:bg-[#202024] hover:bg-zinc-200 dark:hover:bg-[#26262a] border-none transition-all flex items-center justify-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer active:scale-95"
              >
                <MessageSquare size={15} />
                <span>{comments.length}</span>
              </button>

              <button 
                onClick={handleShare}
                className="py-3 rounded-2xl bg-zinc-200/60 dark:bg-[#202024] hover:bg-zinc-200 dark:hover:bg-[#26262a] border-none transition-all flex items-center justify-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer active:scale-95"
              >
                <Share2 size={15} />
                <span>Share</span>
              </button>

              <button 
                onClick={handleSaveToggle}
                className="py-3 rounded-2xl bg-zinc-200/60 dark:bg-[#202024] hover:bg-zinc-200 dark:hover:bg-[#26262a] border-none transition-all flex items-center justify-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer active:scale-95"
              >
                <Bookmark size={15} className={isSaved ? "text-orange-500 fill-current" : ""} />
                <span>{isSaved ? "Saved" : "Save"}</span>
              </button>
            </div>
          </div>

          {/* Description Block */}
          {(file.description || file.faculty_name) && (
            <div className="p-6 bg-zinc-100 dark:bg-[#161618] border-none rounded-[28px] shadow-none space-y-2">
              <h4 className="text-[11px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Description</h4>
              <div className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                {file.faculty_name && (
                  <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mb-2">
                    <Shield size={14} className="text-orange-500" /> Taught by: <strong className="text-zinc-900 dark:text-white font-extrabold">{file.faculty_name}</strong>
                  </div>
                )}
                {file.description && (
                  <div className={isDescExpanded ? "whitespace-pre-wrap" : "line-clamp-3"}>
                    {file.description}
                  </div>
                )}
                {file.description && file.description.length > 150 && (
                  <button 
                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                    className="text-orange-500 font-bold hover:underline bg-transparent border-none p-0 mt-1 cursor-pointer"
                  >
                    {isDescExpanded ? "Show less" : "...more"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tags Block */}
          {file.tags && file.tags.length > 0 && (
            <div className="p-6 bg-zinc-100 dark:bg-[#161618] border-none rounded-[28px] shadow-none space-y-3">
              <h4 className="text-[11px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Tags</h4>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x no-scrollbar">
                {file.tags.map((tag, idx) => (
                  <span 
                    key={idx}
                    className="px-3.5 py-1.5 bg-zinc-200/60 dark:bg-[#202024] border-none rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 snap-center shrink-0"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reactions & Star Rating Block */}
          <div className="p-6 bg-zinc-100 dark:bg-[#161618] border-none rounded-[28px] shadow-none space-y-4">
            <h4 className="text-[11px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Reactions</h4>
            
            <div className="grid grid-cols-3 gap-3">
              {[
                { type: 'helpful', label: '👍 Helpful', activeColor: 'text-blue-500 bg-blue-500/10 font-bold' },
                { type: 'quality', label: '⭐ Quality', activeColor: 'text-amber-500 bg-amber-500/10 font-bold' },
                { type: 'important', label: '🔥 Important', activeColor: 'text-orange-500 bg-orange-500/10 font-bold' }
              ].map((reaction) => {
                const count = reactions[reaction.type as keyof ReactionContainer]?.length || 0;
                const active = userProfile && reactions[reaction.type as keyof ReactionContainer]?.includes(userProfile.id);
                return (
                  <button
                    key={reaction.type}
                    onClick={() => handleReactionClick(reaction.type as any)}
                    className={`px-3 py-3 rounded-2xl border-none transition-all text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                      active 
                        ? reaction.activeColor 
                        : 'bg-zinc-200/60 dark:bg-[#202024] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-[#26262a]'
                    }`}
                  >
                    <span>{reaction.label}</span>
                    <span className="text-xs font-extrabold">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Rating Stars Row */}
            <div className="flex items-center justify-between gap-4 px-4 py-3.5 bg-zinc-200/50 dark:bg-[#202024] rounded-2xl border-none">
              <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Rate this study file:</div>
              <div className="flex gap-1.5 text-zinc-400">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleRate(val)}
                    className={`p-1 bg-transparent border-none cursor-pointer hover:scale-125 transition-transform ${userRating >= val ? 'text-amber-500' : 'text-zinc-400 dark:text-zinc-600'}`}
                  >
                    <Star size={18} fill={userRating >= val ? 'currentColor' : 'none'} className={userRating >= val ? "stroke-none" : ""} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Discussion & Comments */}
        <div className="col-span-1 lg:col-span-5 flex flex-col" id="comments-header-anchor">
          <div className="h-[550px] bg-zinc-100 dark:bg-[#161618] border-none rounded-[28px] flex flex-col overflow-hidden relative shadow-none">
            
            {/* Thread Header */}
            <div className="px-6 py-4 border-none shrink-0 bg-zinc-100 dark:bg-[#161618] flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                <span>Comments</span>
                <span className="text-[11px] text-zinc-400 font-semibold font-mono">({comments.length})</span>
              </h4>
            </div>

            {/* Scrollable list of comments */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="space-y-2">
                    <div className="flex gap-3 items-start">
                      <img 
                        src={comment.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(comment.username)}`} 
                        alt={comment.username} 
                        className="w-8 h-8 rounded-full shrink-0 border-none" 
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                            {comment.username}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider shrink-0">
                            {(() => {
                              const diff = Date.now() - Date.parse(comment.created_at);
                              const mins = Math.floor(diff / 60000);
                              const hours = Math.floor(mins / 60);
                              if (mins < 60) return `${mins}m ago`;
                              if (hours < 24) return `${hours}h ago`;
                              return new Date(comment.created_at).toLocaleDateString();
                            })()}
                          </span>
                        </div>
                        
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium break-words">
                          {comment.content}
                        </p>

                        <div className="flex items-center gap-3.5 text-[10px] font-bold text-zinc-400 mt-1">
                          <button 
                            onClick={() => setReplyTarget({ commentId: comment.id, username: comment.username })}
                            className="bg-transparent border-none hover:text-orange-500 cursor-pointer text-[10px] font-bold"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Nesting Replies */}
                    {comment.replies && comment.replies.map((reply) => (
                      <div key={reply.id} className="ml-9 flex gap-2.5 items-start bg-zinc-200/50 dark:bg-[#202024] p-3 rounded-2xl border-none">
                        <img 
                          src={reply.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(reply.username)}`} 
                          alt={reply.username} 
                          className="w-6 h-6 rounded-full shrink-0 border-none" 
                        />
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-zinc-900 dark:text-white truncate">
                              {reply.username}
                            </span>
                            <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider shrink-0">
                              {(() => {
                                  const diff = Date.now() - Date.parse(reply.created_at);
                                  const mins = Math.floor(diff / 60000);
                                  const hours = Math.floor(mins / 60);
                                  if (mins < 60) return `${mins}m ago`;
                                  if (hours < 24) return `${hours}h ago`;
                                  return new Date(reply.created_at).toLocaleDateString();
                                })()}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium break-words leading-relaxed">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-zinc-400 py-16 text-center flex flex-col items-center justify-center gap-3">
                    <MessageSquare size={28} className="opacity-30" />
                    <span>No discussion comments yet. Ask a question!</span>
                  </div>
                )}
                <div ref={commentsEndRef} />
              </div>

              {/* Reply target banner */}
              {replyTarget && (
                <div className="p-3 bg-zinc-200/70 dark:bg-[#202024] text-xs text-zinc-600 dark:text-zinc-300 font-bold flex justify-between items-center shrink-0">
                  <span>Replying to @{replyTarget.username}</span>
                  <button onClick={() => setReplyTarget(null)} className="text-rose-500 bg-transparent border-none cursor-pointer font-bold">Cancel</button>
                </div>
              )}

              {/* Bottom input form */}
              <div className="p-4 border-none bg-zinc-100 dark:bg-[#161618] shrink-0 z-20">
                {replyTarget ? (
                  <form onSubmit={handleReplySubmit} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to @${replyTarget.username}...`}
                      className="flex-1 bg-zinc-200/60 dark:bg-[#202024] border-none rounded-2xl px-4 py-3 text-xs font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-orange-500/40 transition-all"
                    />
                    <button 
                      type="submit" 
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 active:scale-90 transition-transform cursor-pointer border-none shadow-md shadow-orange-500/20"
                      style={{ backgroundColor: themeColor || '#ff7a00' }}
                    >
                      <ArrowRight size={16} strokeWidth={2.5} />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleCommentSubmit} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 bg-zinc-200/60 dark:bg-[#202024] border-none rounded-2xl px-4 py-3 text-xs font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-orange-500/40 transition-all"
                    />
                    <button 
                      type="submit" 
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 active:scale-90 transition-transform cursor-pointer border-none shadow-md shadow-orange-500/20"
                      style={{ backgroundColor: themeColor || '#ff7a00' }}
                    >
                      <ArrowRight size={16} strokeWidth={2.5} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    );
};

export default FileDetailPage;
