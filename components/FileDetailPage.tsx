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
    <div className="w-full space-y-5 animate-fade-in text-zinc-900 dark:text-zinc-200">
      
      {/* Top Header Panel (Matches folder drilldown back style but with details) */}
      <div className="flex items-center justify-between border-b border-zinc-150 dark:border-white/5 pb-4 mb-4 gap-4">
        <button 
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/5 border border-transparent dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 text-xs font-bold text-zinc-650 dark:text-zinc-300 transition-all border-none cursor-pointer"
        >
          <ChevronLeft size={16} />
          Back
        </button>

        <div className="text-center min-w-0">
          <h4 className="text-xs md:text-sm font-black text-zinc-850 dark:text-white truncate max-w-[150px] sm:max-w-[300px]">
            {file.subject}
          </h4>
          <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold tracking-wider uppercase mt-0.5">
            {file.type} Material
          </p>
        </div>

        <button 
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 border-none cursor-pointer shadow-lg shadow-brand-primary/10"
          style={{ backgroundColor: themeColor || '#ff7a00' }}
        >
          <Download size={14} />
          Download
        </button>
      </div>

      {/* Detail Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: Metadata & Reactions */}
        <div className="col-span-1 lg:col-span-7 space-y-4">
          
          {/* File Card Summary */}
          <div className="p-5 bg-white dark:bg-[#0a0a0c] border border-zinc-150 dark:border-white/[0.04] rounded-3xl shadow-sm flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-white/10 dark:bg-white/[0.01] blur-[40px] rounded-full pointer-events-none" />
            
            <div className="flex gap-4 items-start relative z-10">
              {/* Premium Vector file format block (fixed height/width) */}
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
                
                <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-650 dark:text-zinc-400 font-bold">
                  <span>By {file.uploader_username || 'Anonymous Verto'}</span>
                  {file.uploader_is_admin && (
                    <VerifiedBadge isAdmin={true} size="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">
                  <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 rounded-md text-[9px] font-black">Complete</span>
                  <span>•</span>
                  <span>Uploaded {relativeTime}</span>
                  <span>•</span>
                  <span>{viewCount >= 1000 ? `${(viewCount / 1000).toFixed(1)}k` : viewCount} views</span>
                </div>
              </div>
            </div>

            {/* Social Toolbar */}
            <div className="grid grid-cols-4 gap-2 pt-3 border-t border-zinc-100 dark:border-white/[0.04] relative z-10 text-center">
              <button 
                onClick={() => handleReactionClick('helpful')}
                className="py-2.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/[0.04] hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-all flex items-center justify-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 cursor-pointer"
              >
                <ThumbsUp size={14} className={reactions.helpful?.includes(userProfile?.id) ? "text-blue-500 fill-current animate-bounce-subtle" : ""} />
                <span>{totalLikes}</span>
              </button>

              <button 
                onClick={() => {
                  const el = document.getElementById('comments-header-anchor');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="py-2.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/[0.04] hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-all flex items-center justify-center gap-2 text-xs font-bold text-zinc-650 dark:text-zinc-400 cursor-pointer"
              >
                <MessageSquare size={14} />
                <span>{comments.length}</span>
              </button>

              <button 
                onClick={handleShare}
                className="py-2.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/[0.04] hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-all flex items-center justify-center gap-2 text-xs font-bold text-zinc-655 dark:text-zinc-400 cursor-pointer"
              >
                <Share2 size={14} />
                <span>Share</span>
              </button>

              <button 
                onClick={handleSaveToggle}
                className="py-2.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/[0.04] hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-all flex items-center justify-center gap-2 text-xs font-bold text-zinc-655 dark:text-zinc-400 cursor-pointer"
              >
                <Bookmark size={14} className={isSaved ? "text-brand-primary fill-current" : ""} />
                <span>{isSaved ? "Saved" : "Save"}</span>
              </button>
            </div>
          </div>

          {/* Description Block (Only rendered if description or faculty is present) */}
          {(file.description || file.faculty_name) && (
            <div className="p-5 bg-white dark:bg-[#0a0a0c] border border-zinc-150 dark:border-white/[0.04] rounded-3xl shadow-sm space-y-2">
              <h4 className="text-[11px] font-black text-zinc-450 dark:text-zinc-500 uppercase tracking-widest">Description</h4>
              <div className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-medium">
                {file.faculty_name && (
                  <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 mb-2">
                    <Shield size={12} style={{ color: themeColor || '#ff7a00' }} /> Taught by: <strong className="text-zinc-700 dark:text-zinc-300 font-extrabold">{file.faculty_name}</strong>
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
                    className="text-brand-primary font-bold hover:underline bg-transparent border-none p-0 mt-1 cursor-pointer"
                  >
                    {isDescExpanded ? "Show less" : "...more"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tags Block (Only rendered if tags exist) */}
          {file.tags && file.tags.length > 0 && (
            <div className="p-5 bg-white dark:bg-[#0a0a0c] border border-zinc-150 dark:border-white/[0.04] rounded-3xl shadow-sm space-y-3">
              <h4 className="text-[11px] font-black text-zinc-450 dark:text-zinc-500 uppercase tracking-widest">Tags</h4>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x no-scrollbar">
                {file.tags.map((tag, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/5 rounded-full text-xs font-semibold text-zinc-650 dark:text-zinc-300 snap-center shrink-0"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reactions Block */}
          <div className="p-5 bg-white dark:bg-[#0a0a0c] border border-zinc-150 dark:border-white/[0.04] rounded-3xl shadow-sm space-y-3">
            <h4 className="text-[11px] font-black text-zinc-450 dark:text-zinc-500 uppercase tracking-widest">Reactions</h4>
            
            <div className="grid grid-cols-3 gap-3">
              {[
                { type: 'helpful', label: '👍 Helpful', activeColor: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
                { type: 'quality', label: '⭐ Quality', activeColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
                { type: 'important', label: '🔥 Important', activeColor: 'text-orange-500 bg-orange-500/10 border-orange-500/20' }
              ].map((reaction) => {
                const count = reactions[reaction.type as keyof ReactionContainer]?.length || 0;
                const active = userProfile && reactions[reaction.type as keyof ReactionContainer]?.includes(userProfile.id);
                return (
                  <button
                    key={reaction.type}
                    onClick={() => handleReactionClick(reaction.type as any)}
                    className={`px-3 py-2.5 rounded-2xl border transition-all text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      active 
                        ? reaction.activeColor 
                        : 'bg-zinc-50 dark:bg-white/[0.02] border-zinc-100 dark:border-white/5 text-zinc-600 dark:text-zinc-400 hover:border-zinc-350 dark:hover:border-white/10'
                    }`}
                  >
                    <span>{reaction.label}</span>
                    <span className="text-[10px] font-extrabold">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Rating Stars Row */}
            <div className="flex items-center justify-between gap-4 px-4 py-3 border border-zinc-100 dark:border-white/[0.04] rounded-2xl bg-zinc-50/20 dark:bg-white/[0.01] mt-1">
              <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Rate this study file:</div>
              <div className="flex gap-1 text-zinc-350">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleRate(val)}
                    className={`p-0.5 bg-transparent border-none cursor-pointer hover:scale-115 transition-transform ${userRating >= val ? 'text-amber-500' : 'text-zinc-300 dark:text-zinc-700'}`}
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
          <div className="h-[550px] bg-white dark:bg-[#0a0a0c]/40 border border-zinc-150 dark:border-white/[0.04] rounded-3xl flex flex-col overflow-hidden relative shadow-sm">
            
            {/* Thread Header */}
            <div className="px-5 py-4 border-b border-zinc-100 dark:border-white/[0.04] shrink-0 bg-white/20 dark:bg-black/10 backdrop-blur-sm z-10 flex items-center justify-between">
              <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                Comments <span className="text-[10px] text-zinc-400 font-semibold font-mono">({comments.length})</span>
              </h4>
            </div>

            {/* Scrollable list of comments */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="space-y-2">
                    <div className="flex gap-3 items-start">
                      <img 
                        src={comment.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(comment.username)}`} 
                        alt={comment.username} 
                        className="w-7.5 h-7.5 rounded-full border border-zinc-150 dark:border-white/10 shrink-0" 
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-zinc-850 dark:text-zinc-200 truncate">
                            {comment.username}
                          </span>
                          <span className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wider shrink-0">
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
                        
                        <p className="text-[11px] text-zinc-650 dark:text-zinc-400 leading-relaxed font-medium break-words">
                          {comment.content}
                        </p>

                        <div className="flex items-center gap-3.5 text-[9px] font-bold text-zinc-450 mt-1">
                          <button 
                            onClick={() => setReplyTarget({ commentId: comment.id, username: comment.username })}
                            className="bg-transparent border-none hover:text-brand-primary cursor-pointer text-[9px] font-bold"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Nesting Replies */}
                    {comment.replies && comment.replies.map((reply) => (
                      <div key={reply.id} className="ml-10 flex gap-2.5 items-start bg-zinc-50/50 dark:bg-white/[0.005] p-2.5 rounded-2xl border border-zinc-100/50 dark:border-white/5">
                        <img 
                          src={reply.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(reply.username)}`} 
                          alt={reply.username} 
                          className="w-5.5 h-5.5 rounded-full border border-zinc-150 dark:border-white/10 shrink-0" 
                        />
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-zinc-700 dark:text-zinc-300 truncate">
                              {reply.username}
                            </span>
                            <span className="text-[8px] text-zinc-450 uppercase font-bold tracking-wider shrink-0">
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
                            <p className="text-[10px] text-zinc-550 dark:text-zinc-400 font-medium break-words leading-relaxed">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-zinc-400 py-12 text-center flex flex-col items-center justify-center gap-2">
                    <MessageSquare size={24} className="opacity-30" />
                    <span>No discussion comments yet. Ask a question!</span>
                  </div>
                )}
                <div ref={commentsEndRef} />
              </div>

              {/* Reply target banner */}
              {replyTarget && (
                <div className="p-2.5 bg-zinc-50 dark:bg-[#121214] border-t border-zinc-100 dark:border-white/[0.04] text-[10px] text-zinc-500 font-bold flex justify-between items-center z-25 shrink-0">
                  <span>Replying to @{replyTarget.username}</span>
                  <button onClick={() => setReplyTarget(null)} className="text-rose-500 bg-transparent border-none cursor-pointer font-bold">Cancel</button>
                </div>
              )}

              {/* Bottom input form */}
              <div className="p-4 border-t border-zinc-100 dark:border-white/[0.04] bg-white/80 dark:bg-[#0a0a0c]/80 backdrop-blur-md shrink-0 z-20">
                {replyTarget ? (
                  <form onSubmit={handleReplySubmit} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to @${replyTarget.username}...`}
                      className="flex-1 bg-zinc-50 dark:bg-white/[0.02] border border-zinc-150 dark:border-white/5 rounded-full px-4 py-2.5 text-xs font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-zinc-350 dark:focus:border-white/10 transition-colors"
                    />
                    <button 
                      type="submit" 
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 active:scale-90 transition-transform cursor-pointer border-none shadow-md shadow-brand-primary/10"
                      style={{ backgroundColor: themeColor || '#ff7a00' }}
                    >
                      <ArrowRight size={15} strokeWidth={2.5} />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleCommentSubmit} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 bg-zinc-50 dark:bg-white/[0.02] border border-zinc-150 dark:border-white/5 rounded-full px-4 py-2.5 text-xs font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-zinc-350 dark:focus:border-white/10 transition-colors"
                    />
                    <button 
                      type="submit" 
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 active:scale-90 transition-transform cursor-pointer border-none shadow-md shadow-brand-primary/10"
                      style={{ backgroundColor: themeColor || '#ff7a00' }}
                    >
                      <ArrowRight size={15} strokeWidth={2.5} />
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
