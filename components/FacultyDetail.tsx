import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, BookOpen, AlertCircle, Sparkles, MessageCircle, Send } from 'lucide-react';
import CommunityService from '../services/communityService';
import NexusServer from '../services/nexusServer';
import { FacultyProfile } from '../types/communityTypes';
import { LibraryFile } from '../types';
import { FileIcon } from './FileIcon';
import { showToast } from './Toast';

interface FacultyDetailProps {
  userProfile: any;
}

const FacultyDetail: React.FC<FacultyDetailProps> = ({ userProfile }) => {
  const { facultyName } = useParams();
  const [faculty, setFaculty] = useState<FacultyProfile | null>(null);
  const [facultyFiles, setFacultyFiles] = useState<LibraryFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const navigate = useNavigate();

  const loadFacultyData = async () => {
    if (!facultyName) return;
    try {
      setIsLoading(true);
      const decodedName = decodeURIComponent(facultyName);
      
      // 1. Fetch faculty details & reviews
      const profile = await CommunityService.fetchFacultyProfile(decodedName);
      setFaculty(profile);

      // 2. Fetch documents uploaded under this faculty name
      const allFiles = await NexusServer.fetchFiles('All');
      const filtered = allFiles.filter(f => f.faculty_name?.toLowerCase().trim() === decodedName.toLowerCase().trim());
      setFacultyFiles(filtered);
    } catch (err) { 
      console.error("Failed to load faculty", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFacultyData();
  }, [facultyName]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) {
      showToast("Please login to submit a review.", "info");
      return;
    }
    if (!newReviewText.trim()) return;
    if (!faculty) return;

    try {
      setIsSubmittingReview(true);
      await CommunityService.submitFacultyReview(
        faculty.id,
        userProfile.username || 'Anonymous Verto',
        newRating,
        newReviewText.trim()
      );
      setNewReviewText('');
      showToast("Review submitted successfully!", "success");
      // Reload profile
      loadFacultyData();
    } catch (err) {
      showToast("Failed to submit review", "error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleFileClick = (file: LibraryFile) => {
    // Navigate to files viewer
    const semesterSlug = file.semester.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const subjectSlug = file.subject.toLowerCase().replace(/[^a-z0-9]/g, '-');
    navigate(`/library/${file.program || 'BTech-CSE'}/${semesterSlug}/${subjectSlug}?tab=files&file=${file.id}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 animate-pulse">
        <div className="h-6 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
        <div className="h-48 w-full bg-zinc-200 dark:bg-zinc-800 rounded-3xl"></div>
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Faculty Member Not Found</h3>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-bold border-none">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4 md:px-0 space-y-6">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-bold text-zinc-400 dark:text-zinc-500 hover:text-brand-primary bg-transparent border-none cursor-pointer transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Profile Card Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary/10 to-brand-secondary/5 border border-zinc-100 dark:border-white/5 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6 shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full border-4 border-white dark:border-[#0a0a0c] bg-zinc-200 overflow-hidden shrink-0 shadow-lg">
          <img src={faculty.avatar_url} alt={faculty.name} className="w-full h-full object-cover" />
        </div>

        {/* Info */}
        <div className="flex-1 space-y-2.5">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white leading-tight">
              {faculty.name}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              {faculty.designation} • {faculty.department}
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-white/5 border border-zinc-150/50 dark:border-white/5 rounded-xl text-amber-500">
              <Star size={14} fill="currentColor" /> {faculty.rating} / 5.0
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-white/5 border border-zinc-150/50 dark:border-white/5 rounded-xl">
              <BookOpen size={14} className="text-brand-primary" /> {facultyFiles.length} Uploaded Files
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Side: Resources & Courses */}
        <div className="md:col-span-2 space-y-6">
          {/* Taught Courses */}
          <div className="bg-white dark:bg-[#08080a] border border-zinc-100 dark:border-white/5 rounded-3xl p-5 md:p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              📚 Taught Courses
            </h3>
            <div className="flex flex-wrap gap-2">
              {faculty.courses.map((course) => (
                <span 
                  key={course}
                  className="px-3 py-1.5 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300"
                >
                  {course}
                </span>
              ))}
            </div>
          </div>

          {/* Uploaded Materials */}
          <div className="bg-white dark:bg-[#08080a] border border-zinc-100 dark:border-white/5 rounded-3xl p-5 md:p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              📄 Shared Study Materials
            </h3>
            {facultyFiles.length > 0 ? (
              <div className="divide-y divide-zinc-100 dark:divide-white/5">
                {facultyFiles.map((file) => (
                  <div 
                    key={file.id}
                    onClick={() => handleFileClick(file)}
                    className="py-3 flex items-center justify-between gap-4 hover:bg-zinc-50/50 dark:hover:bg-white/[0.01] px-2 rounded-xl transition-all cursor-pointer group"
                  >
                    <div className="min-w-0 flex items-center gap-3">
                      <FileIcon fileName={file.name} size="w-6 h-6" />
                      <div className="min-w-0 space-y-0.5">
                        <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-brand-primary transition-colors">
                          {file.name}
                        </div>
                        <div className="text-[10px] text-zinc-400 dark:text-zinc-500">
                          {file.subject} • {file.type} • {file.semester}
                        </div>
                      </div>
                    </div>
                    <ArrowLeft size={12} className="rotate-180 text-zinc-300 dark:text-zinc-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-zinc-400 py-4 text-center">No materials currently cataloged under this instructor.</div>
            )}
          </div>

          {/* Student Reviews List */}
          <div className="bg-white dark:bg-[#08080a] border border-zinc-100 dark:border-white/5 rounded-3xl p-5 md:p-6 space-y-5 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              💬 Student Feedback ({faculty.reviews.length})
            </h3>
            <div className="space-y-4 divide-y divide-zinc-100 dark:divide-white/5">
              {faculty.reviews.map((rev, idx) => (
                <div key={idx} className={`${idx > 0 ? 'pt-4' : ''} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                      <img src={rev.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'} className="w-6 h-6 rounded-full" />
                      {rev.username}
                    </div>
                    <div className="flex items-center text-amber-500 text-xs font-bold">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} size={12} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                    {rev.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Faculty Announcements & Write Review */}
        <div className="space-y-6">
          {/* Announcements */}
          <div className="bg-white dark:bg-[#08080a] border border-zinc-100 dark:border-white/5 rounded-3xl p-5 md:p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              📢 Announcements
            </h3>
            {faculty.announcements.length > 0 ? (
              <div className="space-y-3.5">
                {faculty.announcements.map((ann) => (
                  <div key={ann.id} className="p-3 bg-brand-primary/5 border border-brand-primary/10 rounded-2xl space-y-1.5">
                    <div className="text-xs font-bold text-brand-primary">{ann.title}</div>
                    <div className="text-[10px] text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">{ann.content}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-zinc-400 text-center py-4">No active announcements.</div>
            )}
          </div>

          {/* Write a Review Form */}
          <div className="bg-white dark:bg-[#08080a] border border-zinc-100 dark:border-white/5 rounded-3xl p-5 md:p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              ✍️ Review Professor
            </h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Rating</label>
                <div className="flex gap-1.5 text-zinc-300">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setNewRating(val)}
                      className={`p-1 bg-transparent border-none cursor-pointer hover:scale-115 transition-transform ${newRating >= val ? 'text-amber-500' : 'text-zinc-300 dark:text-zinc-700'}`}
                    >
                      <Star size={20} fill={newRating >= val ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Review Comments</label>
                <textarea
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  placeholder="Share your feedback..."
                  rows={4}
                  className="w-full bg-zinc-50 dark:bg-white/[0.02] border border-zinc-150 dark:border-white/5 rounded-2xl p-3 text-xs font-medium text-zinc-950 dark:text-white placeholder:text-zinc-400 outline-none focus:border-brand-primary/50 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview || !newReviewText.trim()}
                className="w-full py-3 bg-brand-primary disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:scale-102 active:scale-98 transition-all border-none cursor-pointer"
              >
                Submit Review <Send size={12} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDetail;
