import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Upload, HelpCircle, Trophy, MessageSquare, Download, ArrowRight, Star } from 'lucide-react';
import CommunityService from '../services/communityService';
import NexusServer from '../services/nexusServer';
import { CommunityPost, MaterialRequest } from '../types/communityTypes';
import { LibraryFile } from '../types';
import { slugify, librarySlug } from '../utils/slugify';

interface DailyFeedProps {
  userProfile: any;
}

const DailyFeed: React.FC<DailyFeedProps> = ({ userProfile }) => {
  const [trendingPosts, setTrendingPosts] = useState<CommunityPost[]>([]);
  const [recentUploads, setRecentUploads] = useState<LibraryFile[]>([]);
  const [openRequests, setOpenRequests] = useState<MaterialRequest[]>([]);
  const [topContributors, setTopContributors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadFeedData = async () => {
      try {
        setIsLoading(true);
        // Load CSE101 and INT306 data as representative seeds
        const [posts1, posts2, reqs1, reqs2, allFiles] = await Promise.all([
          CommunityService.fetchSubjectDiscussions('CSE101'),
          CommunityService.fetchSubjectDiscussions('INT306'),
          CommunityService.fetchSubjectRequests('CSE101'),
          CommunityService.fetchSubjectRequests('INT306'),
          NexusServer.fetchFiles('All')
        ]);

        // Merge posts
        const mergedPosts = [...posts1, ...posts2].sort((a, b) => {
          const aVotes = (a.reactions.helpful.length + a.reactions.quality.length + a.reactions.important.length);
          const bVotes = (b.reactions.helpful.length + b.reactions.quality.length + b.reactions.important.length);
          return bVotes - aVotes; // Sort by popularity
        }).slice(0, 4);

        setTrendingPosts(mergedPosts);

        // Filter files uploaded in last few days or just take the latest approved files
        const latestApproved = allFiles.slice(0, 4);
        setRecentUploads(latestApproved);

        // Merge and filter open requests
        const mergedReqs = [...reqs1, ...reqs2].filter(r => r.status === 'open').slice(0, 3);
        setOpenRequests(mergedReqs);

        // Load mock top contributors
        const mockContributors = [
          { username: 'Anunay', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80', xp: 840, level: 4, rank: 1 },
          { username: 'Rahul Sharma', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=80&h=80&q=80', xp: 520, level: 3, rank: 2 },
          { username: 'Priya Patel', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80', xp: 380, level: 2, rank: 3 }
        ];
        
        // If current user is logged in, we place them on the list dynamically if they have XP
        if (userProfile) {
          const userXP = userProfile.total_xp || 0;
          const userLevel = userProfile.level || 1;
          const userExists = mockContributors.some(c => c.username === userProfile.username);
          if (!userExists && userXP > 0) {
            mockContributors.push({
              username: userProfile.username || 'You',
              avatar: userProfile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80',
              xp: userXP,
              level: userLevel,
              rank: mockContributors.length + 1
            });
            mockContributors.sort((a, b) => b.xp - a.xp);
            mockContributors.forEach((c, idx) => c.rank = idx + 1);
          }
        }
        setTopContributors(mockContributors.slice(0, 4));

      } catch (err) {
        console.error("Failed to load feed", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeedData();
  }, [userProfile]);

  const handlePostClick = (post: CommunityPost) => {
    // Navigate to r/Subject community page with Overview tab and open the post
    const semesterSlug = 'semester-2'; // Default fallback or look up from files
    const path = `/library/BTech-CSE/${semesterSlug}/${librarySlug(post.subject_id, 'subject')}?tab=overview&post=${post.id}`;
    navigate(path);
  };

  const handleUploadClick = (file: LibraryFile) => {
    // Navigate to subject files and select the file
    const semesterSlug = librarySlug(file.semester || 'semester-2', 'semester');
    const path = `/library/${librarySlug(file.program || 'BTech CSE', 'program')}/${semesterSlug}/${librarySlug(file.subject, 'subject')}?tab=files&file=${file.id}`;
    navigate(path);
  };

  const handleRequestClick = (req: MaterialRequest) => {
    const semesterSlug = 'semester-2';
    const path = `/library/BTech-CSE/${semesterSlug}/${librarySlug(req.subject_id, 'subject')}?tab=requests&request=${req.id}`;
    navigate(path);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#09090b] border border-zinc-150 dark:border-white/5 rounded-3xl p-6 space-y-6 shadow-sm animate-pulse">
        <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex gap-4 items-center">
              <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
                <div className="h-3 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#08080a] border border-zinc-100 dark:border-white/5 rounded-3xl p-5 md:p-6 space-y-8 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="text-base md:text-lg font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            🔥 Scholix <span className="text-brand-primary">Daily Feed</span>
          </h3>
          <p className="text-[10px] md:text-xs text-zinc-400 font-medium">Trending activity in your courses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Trending & Requests */}
        <div className="space-y-6">
          {/* Trending Discussions */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>Trending Discussions</span>
            </div>
            <div className="space-y-3">
              {trendingPosts.length > 0 ? (
                trendingPosts.map((post) => {
                  const reactionsCount = (post.reactions.helpful?.length || 0) + (post.reactions.quality?.length || 0) + (post.reactions.important?.length || 0);
                  return (
                    <div 
                      key={post.id} 
                      onClick={() => handlePostClick(post)}
                      className="p-3.5 bg-zinc-50/50 dark:bg-white/[0.01] hover:bg-zinc-100/50 dark:hover:bg-white/[0.03] border border-zinc-100 dark:border-white/5 hover:border-brand-primary/20 rounded-2xl cursor-pointer transition-all duration-200 group flex items-start gap-3.5"
                    >
                      <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-xs font-bold shrink-0">
                        {post.subject_id.substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-brand-primary transition-colors truncate">
                          {post.title}
                        </div>
                        <div className="text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
                          <span>{post.subject_id}</span>
                          <span>•</span>
                          <span>by {post.user_username}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><MessageSquare size={10} /> {post.comments.length}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">👍 {reactionsCount}</span>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-zinc-300 dark:text-zinc-600 group-hover:translate-x-1 transition-transform self-center shrink-0" />
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-zinc-400 py-2">No active discussions today. Start one!</div>
              )}
            </div>
          </div>

          {/* Open Material Requests */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4 text-brand-secondary" />
              <span>Active Bounties (Requests)</span>
            </div>
            <div className="space-y-3">
              {openRequests.length > 0 ? (
                openRequests.map((req) => (
                  <div 
                    key={req.id} 
                    onClick={() => handleRequestClick(req)}
                    className="p-3.5 bg-zinc-50/50 dark:bg-white/[0.01] hover:bg-zinc-100/50 dark:hover:bg-white/[0.03] border border-zinc-100 dark:border-white/5 hover:border-brand-secondary/20 rounded-2xl cursor-pointer transition-all duration-200 group flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                        {req.title}
                      </div>
                      <div className="text-[10px] text-zinc-400 dark:text-zinc-500">
                        Requested in <span className="font-semibold text-zinc-500">{req.subject_id}</span> • by {req.user_username}
                      </div>
                    </div>
                    <div className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl text-[10px] font-black shrink-0 flex items-center gap-1">
                      +{req.bounty_xp} XP
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-zinc-400 py-2">All requests resolved! Nice job.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Uploads & Leaderboard */}
        <div className="space-y-6">
          {/* Recent Uploads */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
              <Upload className="w-4 h-4 text-emerald-500" />
              <span>Recently Uploaded</span>
            </div>
            <div className="space-y-3">
              {recentUploads.length > 0 ? (
                recentUploads.map((file) => (
                  <div 
                    key={file.id} 
                    onClick={() => handleUploadClick(file)}
                    className="p-3.5 bg-zinc-50/50 dark:bg-white/[0.01] hover:bg-zinc-100/50 dark:hover:bg-white/[0.03] border border-zinc-100 dark:border-white/5 hover:border-emerald-500/20 rounded-2xl cursor-pointer transition-all duration-200 group flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-brand-primary transition-colors truncate">
                        {file.name}
                      </div>
                      <div className="text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-zinc-500">{file.subject}</span>
                        <span>•</span>
                        <span>{file.type}</span>
                        {file.faculty_name && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-500 font-semibold flex items-center gap-0.5">
                              <Star size={10} fill="currentColor" /> {file.faculty_name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-100 dark:bg-white/5 text-zinc-400 dark:text-zinc-500 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
                      <Download size={14} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-zinc-400 py-2">No new files uploaded recently.</div>
              )}
            </div>
          </div>

          {/* Top Contributors */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Top Contributors this week</span>
            </div>
            <div className="bg-zinc-50/30 dark:bg-white/[0.005] border border-zinc-100 dark:border-white/5 rounded-2xl p-3.5 space-y-3">
              {topContributors.map((c) => (
                <div key={c.username} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img src={c.avatar} alt={c.username} className="w-8 h-8 rounded-full border border-zinc-200 dark:border-white/10" />
                      <div className="absolute -top-1 -left-1 w-4 h-4 bg-brand-primary text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white dark:border-[#08080a]">
                        {c.rank}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate flex items-center gap-1.5">
                        {c.username}
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 bg-zinc-100 dark:bg-white/5 rounded text-zinc-400">Lv.{c.level}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 shrink-0">
                    +{c.xp} XP
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyFeed;
