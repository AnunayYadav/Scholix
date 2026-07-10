import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Users, BookOpen, MessageSquare, HelpCircle, Calendar, Plus,
  Search, Shield, Check, Flame, Trophy, Map, ArrowRight, ArrowLeft,
  Sparkles, Send, Edit, FileText, Download, Award, Code, Database,
  Terminal, Globe, Book, Video, FlaskConical, ClipboardList, Scroll, Folder, MessageCircle, Pin,
  Languages, Bell, BellOff, MoreHorizontal, Cpu, Monitor, Sigma
} from 'lucide-react';
import { Folder as FolderType, LibraryFile, UserProfile } from '../types';
import {
  CommunityPost, MaterialRequest, StudyPack, WikiSection, SubjectChatMsg, SubjectStats
} from '../types/communityTypes';
import CommunityService from '../services/communityService';
import NexusServer from '../services/nexusServer';
import { askGeminiText } from '../services/geminiService';
import FileDetailPage from './FileDetailPage';
import { FileIcon } from './FileIcon';
import { showToast } from './Toast';

interface SubjectCommunityProps {
  activeSubject: FolderType;
  activeSemester: FolderType | null;
  selectedProgram: string;
  userProfile: UserProfile | null;
  categories: FolderType[];
  allFiles: LibraryFile[];
  userProgressList?: { document_id: string; progress_percentage: number; last_read_page: number }[];
  onFileAccess: (file: LibraryFile) => void;
  onUploadClick: () => void;
  onBack: () => void;
  searchQuery?: string;
}

const getSubjectTheme = (nameOrCode: string) => {
  const c = nameOrCode.toUpperCase().trim();
  
  // 1. Math / Calculus subjects
  if (c.includes('MTH') || c.includes('MATH') || c.includes('CALCULUS') || c.includes('STATISTICS')) {
    return {
      text: 'text-emerald-500',
      bg: 'bg-emerald-500',
      lightBg: 'bg-emerald-500/10 dark:bg-emerald-500/10',
      border: 'border-emerald-500/20',
      gradient: 'from-emerald-500 to-teal-500',
      icon: <Sigma className="w-5 h-5 text-white" strokeWidth={3} />,
      rawColor: '#22c55e'
    };
  }

  // 2. Coding / Programming / Development / Web labs
  if (
    c.includes('PROGRAMMING') || 
    c.includes('PYTHON') || 
    c.includes('CSE101') || 
    c.includes('CSE326') || 
    c.includes('INT108') || 
    c.includes('JAVA') || 
    c.includes('CPP') || 
    c.includes('DEVELOPMENT') || 
    c.includes('WEB')
  ) {
    return {
      text: 'text-orange-500',
      bg: 'bg-orange-500',
      lightBg: 'bg-orange-500/10 dark:bg-orange-500/10',
      border: 'border-orange-500/20',
      gradient: 'from-orange-500 to-amber-500',
      icon: <Code className="w-5 h-5 text-white" strokeWidth={3} />,
      rawColor: '#ff7a00'
    };
  }

  // 3. Electrical / Electronics / Hardware subjects
  if (
    c.includes('ECE') || 
    c.includes('EEE') || 
    c.includes('ELECTRICAL') || 
    c.includes('ELECTRONICS') || 
    c.includes('HARDWARE') || 
    c.includes('DIGITAL ELECTRONICS')
  ) {
    return {
      text: 'text-blue-500',
      bg: 'bg-blue-500',
      lightBg: 'bg-blue-500/10 dark:bg-blue-500/10',
      border: 'border-blue-500/20',
      gradient: 'from-blue-500 to-indigo-500',
      icon: <Cpu className="w-5 h-5 text-white" strokeWidth={3} />,
      rawColor: '#0ea5e9'
    };
  }

  // 4. Other CSE Theory / Computing / Systems / Architecture
  if (
    c.includes('CSE') || 
    c.includes('COMPUTING') || 
    c.includes('ORIENTATION') || 
    c.includes('INT') || 
    c.includes('CAP') ||
    c.includes('OPERATING') ||
    c.includes('NETWORKS') ||
    c.includes('SECURITY')
  ) {
    return {
      text: 'text-teal-500',
      bg: 'bg-teal-500',
      lightBg: 'bg-teal-500/10 dark:bg-teal-500/10',
      border: 'border-teal-500/20',
      gradient: 'from-teal-500 to-emerald-500',
      icon: <Monitor className="w-5 h-5 text-white" strokeWidth={3} />,
      rawColor: '#14b8a6'
    };
  }

  // 5. Database / DBMS subjects
  if (c.includes('DATABASE') || c.includes('DBMS') || c.includes('SQL')) {
    return {
      text: 'text-purple-500',
      bg: 'bg-purple-500',
      lightBg: 'bg-purple-500/10 dark:bg-purple-500/10',
      border: 'border-purple-500/20',
      gradient: 'from-purple-500 to-pink-500',
      icon: <Database className="w-5 h-5 text-white" strokeWidth={3} />,
      rawColor: '#a855f7'
    };
  }

  // 6. Languages / Communication / Soft Skills
  if (
    c.includes('FRN') || 
    c.includes('GER') || 
    c.includes('JAP') || 
    c.includes('SPA') || 
    c.includes('FRENCH') || 
    c.includes('GERMAN') || 
    c.includes('JAPANESE') || 
    c.includes('SPANISH') || 
    c.includes('LANG') ||
    c.includes('COMMUNICATION') ||
    c.includes('COMM') ||
    c.includes('PEL')
  ) {
    return {
      text: 'text-pink-500',
      bg: 'bg-pink-500',
      lightBg: 'bg-pink-500/10 dark:bg-pink-500/10',
      border: 'border-pink-500/20',
      gradient: 'from-pink-500 to-rose-500',
      icon: <Languages className="w-5 h-5 text-white" strokeWidth={3} />,
      rawColor: '#ec4899'
    };
  }

  // 7. General Fallback
  return {
    text: 'text-indigo-500',
    bg: 'bg-indigo-500',
    lightBg: 'bg-indigo-500/10 dark:bg-indigo-500/10',
    border: 'border-indigo-500/20',
    gradient: 'from-indigo-500 to-purple-500',
    icon: <Globe className="w-5 h-5 text-white" strokeWidth={3} />,
    rawColor: '#6366f1'
  };
};

const getCategoryMetadata = (catName: string) => {
  const n = catName.toLowerCase().trim();
  if (n.includes('note')) {
    return {
      description: "All handwritten & digital notes",
      color: "#3b82f6",
      lightColorBg: "bg-blue-50/70 dark:bg-blue-500/10 text-blue-500",
      percent: 98,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5.5 h-5.5 text-blue-500 shrink-0">
          <path d="M4 2h11l5 5v15a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" fill="currentColor" />
          <path d="M15 2v5h5" fill="#93c5fd" opacity="0.8" />
          <line x1="7" y1="11" x2="17" y2="11" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <line x1="7" y1="15" x2="17" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <line x1="7" y1="19" x2="13" y2="19" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    };
  }
  if (n.includes('pyq') || n.includes('question') || n.includes('paper')) {
    return {
      description: "Previous year question papers",
      color: "#a855f7",
      lightColorBg: "bg-purple-50/70 dark:bg-purple-500/10 text-purple-500",
      percent: 76,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5.5 h-5.5 text-purple-500 shrink-0">
          <path d="M4 2h11l5 5v15a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" fill="currentColor" />
          <path d="M15 2v5h5" fill="#c084fc" opacity="0.8" />
          <path d="M8 12l2 2 4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="7" y1="17" x2="17" y2="17" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    };
  }
  if (n.includes('lecture') || n.includes('slide') || n.includes('video') || n.includes('recording')) {
    return {
      description: "Slides, videos & recordings",
      color: "#ef4444",
      lightColorBg: "bg-red-50/70 dark:bg-red-500/10 text-red-500",
      percent: 92,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5.5 h-5.5 text-red-500 shrink-0">
          <path d="M4 2h11l5 5v15a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" fill="currentColor" />
          <path d="M15 2v5h5" fill="#fca5a5" opacity="0.8" />
          <path d="M10 10l5 3-5 3V10z" fill="white" />
        </svg>
      )
    };
  }
  // Syllabus & Others (prioritized before labs so "syllab-us" doesn't match "lab"!)
  if (n.includes('syllabus') || n.includes('syllabi') || n.includes('roadmap') || n.includes('curriculum')) {
    return {
      description: "Syllabus, docs & misc",
      color: "#4b5563",
      lightColorBg: "bg-zinc-100/70 dark:bg-zinc-500/10 text-zinc-500",
      percent: 80,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5.5 h-5.5 text-zinc-500 shrink-0">
          <path d="M4 2h11l5 5v15a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" fill="currentColor" />
          <path d="M15 2v5h5" fill="#cbd5e1" opacity="0.8" />
          <line x1="7" y1="11" x2="17" y2="11" stroke="white" strokeWidth="2" />
          <line x1="7" y1="15" x2="13" y2="15" stroke="white" strokeWidth="2" />
          <circle cx="15.5" cy="15.5" r="1.5" fill="white" />
        </svg>
      )
    };
  }
  // Labs
  const isLabCategory = n === 'lab' || n === 'labs' || n.startsWith('lab ') || n.endsWith(' lab') || n.includes('laboratory') || n.includes('manual') || n.includes('practical');
  if (isLabCategory) {
    return {
      description: "Lab manuals & practical files",
      color: "#f97316",
      lightColorBg: "bg-orange-50/70 dark:bg-orange-500/10 text-orange-500",
      percent: 90,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5.5 h-5.5 text-orange-500 shrink-0">
          <rect x="9" y="2" width="6" height="1.5" rx="0.75" fill="currentColor" />
          <path d="M10 3.5h4v14a2 2 0 0 1-4 0v-14z" fill="currentColor" />
          <path d="M10 9.5h4v8a2 2 0 0 1-4 0v-8z" fill="#fed7aa" opacity="0.7" />
          <ellipse cx="12" cy="9.5" rx="2" ry="0.5" fill="#fed7aa" />
          <circle cx="11.5" cy="12" r="0.5" fill="white" />
          <circle cx="12.5" cy="14" r="0.75" fill="white" opacity="0.8" />
          <circle cx="11.8" cy="16" r="0.4" fill="white" />
        </svg>
      )
    };
  }
  // Books & Fallback Default block (Green Open Book Icon!)
  return {
    description: "Syllabus, docs & misc",
    color: "#22c55e",
    lightColorBg: "bg-emerald-50/70 dark:bg-emerald-500/10 text-emerald-500",
    percent: 85,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" className="w-5.5 h-5.5 text-emerald-500 shrink-0">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2V3z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7V3z" />
      </svg>
    )
  };
};

const SubjectCommunity: React.FC<SubjectCommunityProps> = ({
  activeSubject,
  activeSemester,
  selectedProgram,
  userProfile,
  categories,
  allFiles,
  userProgressList,
  onFileAccess,
  onUploadClick,
  onBack,
  searchQuery
}) => {
  const subjectCodeMatch = activeSubject.name.match(/^([A-Za-z]+\d{3})/);
  const subjectCode = subjectCodeMatch ? subjectCodeMatch[1].toUpperCase() : activeSubject.name.split(':')[0].trim();
  const subjectName = activeSubject.name.split(':')[1]?.trim() || activeSubject.name;

  const theme = useMemo(() => getSubjectTheme(activeSubject.name), [activeSubject.name]);

  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState<'files' | 'discussions' | 'requests' | 'packs' | 'leaderboard' | 'people'>('files');
  const [joined, setJoined] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scoped subject data
  const [stats, setStats] = useState<SubjectStats | null>(null);
  const [onlineCount, setOnlineCount] = useState(1);
  const [overviewItems, setOverviewItems] = useState<any[]>([]);
  const [discussions, setDiscussions] = useState<CommunityPost[]>([]);
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [studyPacks, setStudyPacks] = useState<StudyPack[]>([]);
  const [wikiSections, setWikiSections] = useState<WikiSection[]>([]);

  // Live leaderboard and members lists
  const [leaderboardList, setLeaderboardList] = useState<any[]>([]);
  const [moderatorsList, setModeratorsList] = useState<any[]>([]);
  const [liveMembersCount, setLiveMembersCount] = useState<number>(2430);

  // Admin edit overlay states
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFileToEdit, setSelectedFileToEdit] = useState<LibraryFile | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    type: '',
    display_order: 0
  });

  // Interaction overlays
  const [selectedFileDetail, setSelectedFileDetail] = useState<LibraryFile | null>(null);
  const [activeMenuFileId, setActiveMenuFileId] = useState<string | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateRequest, setShowCreateRequest] = useState(false);
  const [showCreatePack, setShowCreatePack] = useState(false);

  // Discussions comments & pin states
  const [expandedPostCommentsId, setExpandedPostCommentsId] = useState<string | null>(null);
  const [newCommentTexts, setNewCommentTexts] = useState<Record<string, string>>({});
  const [submittingCommentId, setSubmittingCommentId] = useState<string | null>(null);
  const [pinningPostId, setPinningPostId] = useState<string | null>(null);

  // Post editing & options states
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [editPostTitle, setEditPostTitle] = useState('');
  const [editPostContent, setEditPostContent] = useState('');
  const [activePostMenuId, setActivePostMenuId] = useState<string | null>(null);

  // Forms
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState<'discussion' | 'doubt' | 'poll' | 'question' | 'resource'>('discussion');
  const [postContent, setPostContent] = useState('');
  const [postTags, setPostTags] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

  const [reqTitle, setReqTitle] = useState('');
  const [reqContent, setReqContent] = useState('');
  const [reqBounty, setReqBounty] = useState(50);

  const [packTitle, setPackTitle] = useState('');
  const [packContent, setPackContent] = useState('');
  const [packFiles, setPackFiles] = useState<string[]>([]);

  // Subject Scoped AI Chat
  const [subjectAiInput, setSubjectAiInput] = useState('');
  const [subjectAiHistory, setSubjectAiHistory] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);
  const [subjectAiLoading, setSubjectAiLoading] = useState(false);



  // Selected Section inside Files tab (null means listing categories, Folder means viewing files inside that category)
  const [activeCategoryFolder, setActiveCategoryFolder] = useState<FolderType | null>(null);

  // Robust subject code extractor
  const getSubjectCode = (nameOrCode: string) => {
    const match = nameOrCode.match(/([A-Za-z]+[0-9]+)/);
    return match ? match[1].toUpperCase() : nameOrCode.split(':')[0].trim().toUpperCase().replace(/\s+/g, '');
  };

  // Robust file-type to category name matcher
  const isFileTypeMatchingCategory = (fileType: string, catName: string) => {
    const ft = fileType.toLowerCase().trim();
    const cn = catName.toLowerCase().trim();
    
    if (cn.includes('note')) {
      return ft.includes('note');
    }
    if (cn.includes('pyq') || cn.includes('question') || cn.includes('paper')) {
      return ft.includes('pyq') || ft.includes('question') || ft.includes('paper');
    }
    if (cn.includes('lecture') || cn.includes('slide') || cn.includes('video') || cn.includes('recording')) {
      return ft.includes('lecture') || ft.includes('slide') || ft.includes('video') || ft.includes('recording');
    }
    if (cn.includes('syllabus') || cn.includes('syllabi') || cn.includes('roadmap') || cn.includes('curriculum')) {
      return ft.includes('syllabus') || ft.includes('curriculum');
    }
    
    const isLabCategory = cn === 'lab' || cn === 'labs' || cn.startsWith('lab ') || cn.endsWith(' lab') || cn.includes('laboratory') || cn.includes('manual') || cn.includes('practical');
    if (isLabCategory) {
      return ft.includes('lab') || ft.includes('manual') || ft.includes('practical') || ft.includes('file');
    }
    
    if (cn.includes('book') || cn.includes('textbook')) {
      return ft.includes('book') || ft.includes('material');
    }
    return ft === cn || ft.includes(cn) || cn.includes(ft);
  };

  // Filter subject specific files
  const subjectFiles = useMemo(() => {
    const activeSubCode = getSubjectCode(activeSubject.name);
    console.log("[SubjectCommunity] activeSubject.name:", activeSubject.name, "activeSubCode:", activeSubCode);
    console.log("[SubjectCommunity] allFiles count:", allFiles.length);
    if (allFiles.length > 0) {
      console.log("[SubjectCommunity] Sample file subject:", allFiles[0].subject, "sample file program:", allFiles[0].program);
    }
    const filtered = allFiles.filter(f => {
      const fileSubCode = getSubjectCode(f.subject);
      const isSubMatch = fileSubCode === activeSubCode;
      if (!isSubMatch) return false;
      if (searchQuery && searchQuery.trim() !== '') {
        return f.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
      }
      return true;
    });
    console.log("[SubjectCommunity] Filtered subjectFiles count:", filtered.length);
    
    // Sort files by display_order ascending (1 to 6), with uploadDate descending as fallback
    return [...filtered].sort((a, b) => {
      const orderA = a.display_order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.display_order ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      return b.uploadDate - a.uploadDate;
    });
  }, [allFiles, activeSubject.name, searchQuery]);

  const continueStudyingFile = useMemo(() => {
    if (subjectFiles.length === 0) return null;
    const list = userProgressList || [];
    
    // Try to find a partially read file first
    const partials = list
      .filter(p => p.progress_percentage > 0 && p.progress_percentage < 100)
      .map(p => ({
        doc: subjectFiles.find(f => f.id === p.document_id),
        percent: p.progress_percentage
      }))
      .filter(item => !!item.doc);
      
    if (partials.length > 0) return partials[0] as { doc: LibraryFile; percent: number };
    
    // Try to find a fully read file
    const completed = list
      .filter(p => p.progress_percentage === 100)
      .map(p => ({
        doc: subjectFiles.find(f => f.id === p.document_id),
        percent: p.progress_percentage
      }))
      .filter(item => !!item.doc);
      
    if (completed.length > 0) return completed[0] as { doc: LibraryFile; percent: number };
    
    // Fallback to the first file in the subject (at 0% progress)
    return { doc: subjectFiles[0], percent: 0 };
  }, [userProgressList, subjectFiles]);

  const recentFiles = useMemo(() => {
    return [...subjectFiles]
      .sort((a, b) => b.uploadDate - a.uploadDate)
      .slice(0, 5);
  }, [subjectFiles]);

  const getRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins || 1} min${mins !== 1 ? 's' : ''} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr${hrs !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return `1 day ago`;
    if (days < 7) return `${days} days ago`;
    return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const loadCommunityData = async () => {
    try {
      const subjectId = subjectCode;
      const [st, feed, posts, reqs, packs, wikis, leader, mods, memb] = await Promise.all([
        CommunityService.fetchSubjectStats(subjectId),
        CommunityService.fetchOverviewFeed(subjectId),
        CommunityService.fetchSubjectDiscussions(subjectId),
        CommunityService.fetchSubjectRequests(subjectId),
        CommunityService.fetchSubjectStudyPacks(subjectId),
        CommunityService.fetchSubjectWiki(subjectId),
        NexusServer.fetchLeaderboard(),
        NexusServer.fetchModerators(),
        NexusServer.fetchMembersCount(selectedProgram)
      ]);
      setStats(st);
      setOverviewItems(feed);
      setDiscussions(posts);
      setRequests(reqs);
      setStudyPacks(packs);
      setWikiSections(wikis);
      setLeaderboardList(leader);
      setModeratorsList(mods);
      setLiveMembersCount(memb);

      if (userProfile) {
        const isMember = await CommunityService.isJoined(subjectId, userProfile.id);
        setJoined(isMember);
      }
    } catch (e) { }
  };

  const handleDeleteFile = async (file: LibraryFile) => {
    const confirmed = window.confirm("Are you sure you want to permanently delete this file?");
    if (!confirmed) return;
    try {
      await NexusServer.deleteFile(file.id, file.storage_path);
      showToast("File deleted successfully!", "success");
      window.location.reload();
    } catch (e: any) {
      showToast("Error deleting file: " + e.message, "error");
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedFileToEdit) return;
    try {
      const client = NexusServer.getClient();
      if (!client) return;
      const { error } = await client
        .from('library_items')
        .update({
          name: editForm.name,
          description: editForm.description,
          type: editForm.type,
          display_order: editForm.display_order,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedFileToEdit.id);

      if (error) throw error;
      showToast("File updated successfully!", "success");
      setShowEditModal(false);
      window.location.reload();
    } catch (e: any) {
      showToast("Error updating file: " + e.message, "error");
    }
  };

  useEffect(() => {
    loadCommunityData();
  }, [activeSubject.id, userProfile]);

  useEffect(() => {
    const handleDocClick = () => setActiveMenuFileId(null);
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, []);

  // Real-time Presence sync for active studying users count
  useEffect(() => {
    const client = NexusServer.getClient();
    if (!client) return;

    const userKey = userProfile?.id || `anon-${Math.random().toString(36).substring(2, 11)}`;
    const channel = client.channel(`subject-presence:${subjectCode}`, {
      config: {
        presence: {
          key: userKey,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const count = Object.keys(presenceState).length;
        setOnlineCount(Math.max(1, count));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            online_at: new Date().toISOString(),
            username: userProfile?.username || 'Anonymous Verto',
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [subjectCode, userProfile]);



  // Toggle Join (Notifications)
  const handleJoinToggle = async () => {
    if (!userProfile) {
      showToast("Please login to manage notifications.", "info");
      return;
    }
    const subjectId = subjectCode;
    try {
      if (joined) {
        await CommunityService.leaveSubject(subjectId, userProfile.id);
        setJoined(false);
        showToast("Notifications turned off.", "info");
      } else {
        await CommunityService.joinSubject(subjectId, userProfile.id);
        setJoined(true);
        showToast("Notifications turned on!", "success");
      }
      loadCommunityData();
    } catch (e) { }
  };

  const handleOpenFile = (file: LibraryFile) => {
    onFileAccess(file);
  };

  // Upvote/Downvote reactions
  const handleReaction = async (itemId: string, type: 'post' | 'request', reaction: 'helpful' | 'quality' | 'important') => {
    if (!userProfile) {
      showToast("Please login to react.", "info");
      return;
    }
    try {
      await CommunityService.toggleReaction(itemId, type, reaction, userProfile.id);
      loadCommunityData();
    } catch (e) { }
  };

  // Submit Post
  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    if (!postTitle.trim() || !postContent.trim()) return;

    try {
      const cleanTags = postTags.split(',').map(t => t.trim()).filter(t => t.startsWith('#') ? t : `#${t}`);
      await CommunityService.createPost({
        subject_id: subjectCode,
        user_id: userProfile.id,
        user_username: userProfile.username || 'Anonymous',
        user_avatar: userProfile.avatar_url,
        type: 'post',
        category: postCategory,
        title: postTitle.trim(),
        content: postContent.trim(),
        tags: cleanTags,
        verified_status: 'none'
      });
      setPostTitle('');
      setPostContent('');
      setPostTags('');
      setShowCreatePost(false);
      loadCommunityData();
      showToast("Post created!", "success");
    } catch (e) {
      showToast("Failed to create post", "error");
    }
  };

  // Submit Request
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    if (!reqTitle.trim() || !reqContent.trim()) return;

    try {
      await CommunityService.createMaterialRequest({
        subject_id: subjectCode,
        user_id: userProfile.id,
        user_username: userProfile.username || 'Anonymous',
        user_avatar: userProfile.avatar_url,
        type: 'request',
        title: reqTitle.trim(),
        content: reqContent.trim(),
        bounty_xp: Number(reqBounty)
      });
      setReqTitle('');
      setReqContent('');
      setShowCreateRequest(false);
      loadCommunityData();
      showToast("Request bounty created!", "success");
    } catch (e) {
      showToast("Failed to create request", "error");
    }
  };

  // Submit Study Pack
  const handlePackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    if (!packTitle.trim() || !packContent.trim()) return;

    try {
      await CommunityService.createStudyPack({
        subject_id: subjectCode,
        user_id: userProfile.id,
        user_username: userProfile.username || 'Anonymous',
        user_avatar: userProfile.avatar_url,
        type: 'collection',
        title: packTitle.trim(),
        content: packContent.trim(),
        file_ids: []
      });
      setPackTitle('');
      setPackContent('');
      setShowCreatePack(false);
      loadCommunityData();
      showToast("Curated study pack created!", "success");
    } catch (e) {
      showToast("Failed to create study pack", "error");
    }
  };



  // Scoped AI Chat submit
  const handleSendSubjectAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectAiInput.trim() || subjectAiLoading) return;

    const userText = subjectAiInput.trim();
    setSubjectAiInput('');
    setSubjectAiHistory(prev => [...prev, { sender: 'user', text: userText }]);
    setSubjectAiLoading(true);

    try {
      const filesContext = subjectFiles.map(f => `- ${f.name} (Taught by: ${f.faculty_name || "N/A"}, Type: ${f.type})`).join('\n');
      const wikiContext = wikiSections.map(w => `### Wiki ${w.category}\n${w.content}`).join('\n');
      const prompt = `You are the AI tutor for the course "${activeSubject.name}".
      Below is the context of files, syllabus, and wiki details available in the community:
      
      Files Catalog:
      ${filesContext}
      
      Wiki Roadmaps:
      ${wikiContext}
      
      Answer the student's question accurately based on this course context. Question: "${userText}"`;

      const response = await askGeminiText(prompt);
      setSubjectAiHistory(prev => [...prev, { sender: 'ai', text: response }]);
    } catch (err) {
      setSubjectAiHistory(prev => [...prev, { sender: 'ai', text: "I ran into an issue loading that response. Please try again." }]);
    } finally {
      setSubjectAiLoading(false);
    }
  };

  // Filtered files in selected category folder
  const categoryFiles = useMemo(() => {
    if (!activeCategoryFolder) return [];
    return subjectFiles.filter(f => isFileTypeMatchingCategory(f.type, activeCategoryFolder.name));
  }, [activeCategoryFolder, subjectFiles]);

  return (
    <div className="space-y-6">
      {/* Header block (unified tinted section on mobile, box on desktop) */}
      <div 
        className="mx-[-32px] sm:mx-0 px-8 sm:px-0 pt-0 pb-3 sm:py-0 bg-gradient-to-b sm:bg-none relative overflow-hidden sm:overflow-visible"
        style={isMobile ? {
          background: `linear-gradient(to bottom, ${theme.rawColor}1c, transparent)`,
          marginTop: 'calc(env(safe-area-inset-top, 0px) * -1 - 36px)',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 36px + 16px)'
        } : undefined}
      >
        {/* Back button */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 bg-transparent border-none cursor-pointer transition-colors"
          >
            <ArrowLeft size={16} /> Back to Semesters
          </button>
        </div>

        {/* Subject Header Banner Box */}
        <div className="relative overflow-hidden bg-transparent sm:bg-gradient-to-br sm:from-zinc-50 sm:to-zinc-100/50 sm:dark:from-white/[0.01] sm:dark:to-transparent border-0 sm:border border-zinc-150 dark:border-white/5 rounded-none sm:rounded-3xl p-0 sm:p-6 flex flex-row items-center justify-between gap-3 sm:gap-6 shadow-none sm:shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 rounded-full pointer-events-none hidden sm:block" style={{ backgroundColor: theme.rawColor }} />

          {/* Course Logo & Info */}
          <div className="flex items-center gap-3 sm:gap-5 min-w-0">
            <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm shrink-0 text-white" style={{ backgroundColor: theme.rawColor }}>
              {React.cloneElement(theme.icon as React.ReactElement, { className: 'w-5 h-5 sm:w-6.5 sm:h-6.5 text-white' })}
            </div>
            <div className="min-w-0 space-y-0.5 sm:space-y-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="px-1.5 py-0.5 rounded-md sm:rounded-lg text-[8px] sm:text-[9px] font-black text-white" style={{ backgroundColor: theme.rawColor }}>
                  {subjectCode}
                </span>
                <span className="text-[8px] sm:text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">
                  {onlineCount} studying now
                </span>
              </div>
              <h2 className="text-sm xs:text-base md:text-lg lg:text-xl font-black text-zinc-900 dark:text-white leading-tight truncate">
                {subjectName}
              </h2>
            </div>
          </div>

          {/* Notifications & Options Controls */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleJoinToggle}
              title={joined ? "Notifications are ON" : "Notifications are OFF"}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer border-none bg-transparent sm:hover:bg-zinc-100 sm:dark:hover:bg-white/5 outline-none text-zinc-500 dark:text-zinc-400 active:scale-95 shrink-0"
            >
              {joined ? (
                <Bell className="w-5 h-5" strokeWidth={2.5} style={{ color: theme.rawColor }} />
              ) : (
                <BellOff className="w-5 h-5" strokeWidth={2.5} />
              )}
            </button>
            
            <button
              title="Options"
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer border-none bg-transparent sm:hover:bg-zinc-100 sm:dark:hover:bg-white/5 outline-none text-zinc-500 dark:text-zinc-400 active:scale-95 shrink-0"
            >
              <MoreHorizontal className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Deck Header */}
      <div className="flex border-b border-zinc-150 dark:border-white/5 overflow-x-auto no-scrollbar scroll-smooth mb-6">
        {[
          { id: 'files', label: 'Files', icon: <Folder className="w-3.5 h-3.5 text-zinc-500" /> },
          { id: 'discussions', label: 'Discussions', icon: <MessageSquare className="w-3.5 h-3.5 text-zinc-500" /> },
          { id: 'requests', label: 'Requests', icon: <HelpCircle className="w-3.5 h-3.5 text-zinc-500" /> },
          { id: 'packs', label: 'Study Packs', icon: <BookOpen className="w-3.5 h-3.5 text-zinc-500" /> },
          { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-3.5 h-3.5 text-zinc-500" /> },
          { id: 'people', label: 'People', icon: <Users className="w-3.5 h-3.5 text-zinc-500" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setActiveCategoryFolder(null); }}
            style={activeTab === tab.id ? { borderColor: theme.rawColor, color: theme.rawColor } : {}}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 bg-transparent cursor-pointer shrink-0 transition-all flex items-center gap-1.5 ${activeTab === tab.id
                ? 'font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-700'
              }`}
          >
            {tab.icon}
            {tab.id === 'files' && stats ? `Files (${stats.filesCount})` :
              tab.id === 'requests' && stats ? `Requests (${stats.requestsCount})` : tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}

      {/* 1. FILES TAB (Default) */}
      {activeTab === 'files' && (
        <div className="space-y-6">
          {/* Listing Category Folders (Overview of study sections) */}
          {!activeCategoryFolder ? (
            <div className="space-y-6 animate-fade-in">
              {/* Continue Studying Card */}
              {userProfile && continueStudyingFile && (
                <div className="p-4 bg-zinc-100/50 dark:bg-[#161619]/90 border border-zinc-200 dark:border-white/5 rounded-2xl flex flex-row items-center justify-between gap-4 shadow-sm">
                  <div className="space-y-1 min-w-0">
                    <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: theme.rawColor }}>
                      {continueStudyingFile.percent === 0 ? "Start Studying" : continueStudyingFile.percent === 100 ? "Completed Studying" : "Continue Studying"}
                    </div>
                    <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">{continueStudyingFile.doc.name}</div>
                    <div className="w-24 xs:w-48 bg-zinc-200 dark:bg-zinc-850 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div className="h-full rounded-full" style={{ width: `${continueStudyingFile.percent}%`, backgroundColor: theme.rawColor }} />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onFileAccess(continueStudyingFile.doc);
                    }}
                    style={{ backgroundColor: theme.rawColor }}
                    className="px-3 py-1.5 xs:px-4 xs:py-2 text-white rounded-xl text-xs font-bold border-none flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-all shrink-0"
                  >
                    {continueStudyingFile.percent === 0 ? "Start" : continueStudyingFile.percent === 100 ? "Review (100%)" : `Resume (${continueStudyingFile.percent}%)`} <ArrowRight size={12} />
                  </button>
                </div>
              )}

              <div className="space-y-4 animate-fade-in">
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5"><Folder className="w-3.5 h-3.5" /> Study Sections</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {categories
                    .filter(cat => {
                      if (!searchQuery || searchQuery.trim() === '') return true;
                      const filesInCat = subjectFiles.filter(f => isFileTypeMatchingCategory(f.type, cat.name));
                      const nameMatches = cat.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
                      return filesInCat.length > 0 || nameMatches;
                    })
                    .map((cat) => {
                      const filesInCat = subjectFiles.filter(f => isFileTypeMatchingCategory(f.type, cat.name));
                    const meta = getCategoryMetadata(cat.name);
                    
                    const progressList = userProgressList || [];
                    const totalPercent = filesInCat.reduce((sum, file) => {
                      const prog = progressList.find(p => p.document_id === file.id);
                      return sum + (prog ? prog.progress_percentage : 0);
                    }, 0);
                    const averagePercent = filesInCat.length > 0 ? Math.round(totalPercent / filesInCat.length) : 0;
                    
                    const strokeDasharray = 2 * Math.PI * 16;
                    const strokeDashoffset = strokeDasharray - (averagePercent / 100) * strokeDasharray;

                    return (
                      <div
                        key={cat.id}
                        onClick={() => setActiveCategoryFolder(cat)}
                        className="group p-3.5 bg-white dark:bg-[#111113] border border-zinc-200/60 dark:border-white/[0.06] rounded-2xl flex items-start gap-3.5 hover:shadow-md cursor-pointer transition-all duration-200"
                      >
                        {/* Left Column: Soft colored backdrop containing the solid filled icon */}
                        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${meta.lightColorBg}`}>
                          {meta.icon}
                        </div>

                        {/* Right Column: Text area & progress ring */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          {/* Row 1: Title & Progress Ring */}
                          <div className="flex items-center justify-between gap-2 w-full">
                            <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white capitalize group-hover:text-orange-500 transition-colors truncate">
                              {cat.name}
                            </h4>
                            
                            {/* SVG Progress Ring */}
                            <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                              <svg className="w-10 h-10 -rotate-90">
                                <circle cx="20" cy="20" r="16" className="stroke-zinc-100 dark:stroke-white/5" strokeWidth="2.5" fill="transparent" />
                                <circle cx="20" cy="20" r="16" style={{ stroke: meta.color }} strokeWidth="2.5" fill="transparent" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
                              </svg>
                              <span className="absolute text-[10px] font-black text-zinc-800 dark:text-zinc-200">{averagePercent}%</span>
                            </div>
                          </div>

                          {/* Row 2: Description */}
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium line-clamp-1 -mt-1">
                            {meta.description}
                          </p>

                          {/* Row 3: Resources Count */}
                          <p className="text-[10px] sm:text-[11px] font-bold text-zinc-500 dark:text-zinc-400 mt-2">
                            {filesInCat.length} Resources
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recently Added Section */}
              <div className="space-y-4 pt-4 border-t border-zinc-150 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-black text-zinc-900 dark:text-white">Recently Added</h3>
                  {subjectFiles.length > 5 && (
                    <button 
                      onClick={() => {
                        // Fallback: view all by activating the first category folder
                        if (categories.length > 0) setActiveCategoryFolder(categories[0]);
                      }}
                      className="text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors bg-transparent border-none cursor-pointer"
                    >
                      View all
                    </button>
                  )}
                </div>

                {recentFiles.length === 0 ? (
                  <div className="p-8 text-center bg-zinc-50 dark:bg-white/[0.005] border border-zinc-150 dark:border-white/5 rounded-2xl text-xs text-zinc-400">
                    No resources uploaded yet. Be the first to add study material!
                  </div>
                ) : (
                  <div className="overflow-x-auto no-scrollbar border border-zinc-150 dark:border-white/5 rounded-2xl bg-white dark:bg-[#111113]">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="border-b border-zinc-150 dark:border-white/5 text-[10px] sm:text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider bg-zinc-50/50 dark:bg-white/[0.005]">
                          <th className="py-3 px-4">Name</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Added By</th>
                          <th className="py-3 px-4">Added On</th>
                          <th className="py-3 px-4 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                        {recentFiles.map((file) => {
                          const relativeTime = getRelativeTime(file.uploadDate);
                          return (
                            <tr 
                              key={file.id} 
                              onClick={() => handleOpenFile(file)}
                              className="group hover:bg-zinc-50/50 dark:hover:bg-white/[0.01] transition-all cursor-pointer text-xs sm:text-sm"
                            >
                              {/* Name */}
                              <td className="py-3.5 px-4 font-bold text-zinc-800 dark:text-zinc-200 min-w-[220px]">
                                <div className="flex items-center gap-2.5">
                                  <FileIcon fileName={file.name} size="w-5 h-5" className="shrink-0" />
                                  <span className="truncate group-hover:text-orange-500 transition-colors max-w-[280px]">
                                    {file.name}
                                  </span>
                                </div>
                              </td>
                              {/* Type */}
                              <td className="py-3.5 px-4 font-semibold text-zinc-400 dark:text-zinc-500 uppercase">
                                {file.type}
                              </td>
                              {/* Added By */}
                              <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-350 font-medium">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-orange-500/10 dark:bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold text-[10px]">
                                    {(file.uploader_username || 'A')[0].toUpperCase()}
                                  </div>
                                  <span className="truncate max-w-[120px]">
                                    {file.uploader_username || "Anonymous Verto"}
                                  </span>
                                </div>
                              </td>
                              {/* Added On */}
                              <td className="py-3.5 px-4 text-zinc-400 dark:text-zinc-500 font-medium">
                                {relativeTime}
                              </td>
                              {/* Action button */}
                              <td className="py-3.5 px-4 text-center relative">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuFileId(activeMenuFileId === file.id ? null : file.id);
                                  }}
                                  className="p-1 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-350 transition-colors bg-transparent border-none cursor-pointer"
                                >
                                  <MoreHorizontal className="w-4.5 h-4.5" />
                                </button>

                                {activeMenuFileId === file.id && (
                                  <>
                                    {/* Dropdown Menu Container */}
                                    <div 
                                      className="absolute right-4 mt-1 w-36 rounded-2xl bg-white dark:bg-[#121214] border border-zinc-150 dark:border-white/5 py-1.5 shadow-xl z-50 text-left overflow-hidden animate-fade-in"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {/* View Details */}
                                      <button
                                        onClick={() => {
                                          setActiveMenuFileId(null);
                                          setSelectedFileDetail(file);
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-xs font-bold text-zinc-650 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors border-none bg-transparent cursor-pointer flex items-center gap-2"
                                      >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                        Details
                                      </button>

                                      {/* Edit (Admin only) */}
                                      {userProfile?.is_admin && (
                                        <button
                                          onClick={() => {
                                            setActiveMenuFileId(null);
                                            setSelectedFileToEdit(file);
                                            setEditForm({
                                              name: file.name,
                                              description: file.description || '',
                                              type: file.type || '',
                                              display_order: file.display_order || 0
                                            });
                                            setShowEditModal(true);
                                          }}
                                          className="w-full px-4 py-2.5 text-left text-xs font-bold text-zinc-650 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors border-none bg-transparent cursor-pointer flex items-center gap-2"
                                        >
                                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                                          Edit Metadata
                                        </button>
                                      )}

                                      {/* Delete (Admin only) */}
                                      {userProfile?.is_admin && (
                                        <button
                                          onClick={() => {
                                            setActiveMenuFileId(null);
                                            handleDeleteFile(file);
                                          }}
                                          className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border-none bg-transparent cursor-pointer flex items-center gap-2"
                                        >
                                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                          Delete File
                                        </button>
                                      )}
                                    </div>
                                  </>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Category drilldown (File List View grouped by Unit)
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveCategoryFolder(null)}
                    className="px-2.5 py-1.5 bg-zinc-50 dark:bg-white/5 border border-zinc-150 dark:border-white/5 rounded-xl text-xs font-bold text-zinc-400 hover:text-zinc-800 dark:hover:text-white cursor-pointer"
                  >
                    Back to Sections
                  </button>
                  <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 capitalize">
                    Viewing: {activeCategoryFolder.name}
                  </div>
                </div>
                {userProfile?.is_admin && (
                  <button
                    onClick={onUploadClick}
                    className="px-3.5 py-1.5 bg-orange-500 text-white rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-all border-none cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Upload File
                  </button>
                )}
              </div>

              {(() => {
                const categoryFiles = subjectFiles.filter(f => isFileTypeMatchingCategory(f.type, activeCategoryFolder.name));
                if (categoryFiles.length === 0) {
                  return (
                    <div className="text-center py-10 bg-zinc-50/50 dark:bg-white/[0.005] border border-dashed border-zinc-250 dark:border-white/5 rounded-3xl space-y-4">
                      <div className="space-y-1">
                        <BookOpen className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto" />
                        <p className="text-xs text-zinc-400">No resources uploaded in this section yet.</p>
                      </div>
                      {userProfile?.is_admin && (
                        <button
                          onClick={onUploadClick}
                          className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-all border-none cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Plus size={14} /> Upload File
                        </button>
                      )}
                    </div>
                  );
                }                return (
                  <div className="w-full overflow-hidden border border-zinc-150 dark:border-white/5 rounded-3xl bg-white dark:bg-[#111113] shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.01]">
                            <th className="py-3 pl-4 pr-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider min-w-[220px]">
                              Name
                            </th>
                            <th className="py-3 px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-center w-20">
                              Unit
                            </th>
                            <th className="py-3 px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider hidden md:table-cell w-28">
                              Added By
                            </th>
                            <th className="py-3 px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider hidden sm:table-cell w-28">
                              Updated On
                            </th>
                            <th className="py-3 px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-right hidden sm:table-cell w-24">
                              Downloads
                            </th>
                            <th className="py-3 px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-right w-24">
                              Rating
                            </th>
                            <th className="py-3 pr-4 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-right w-12"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                          {categoryFiles.map((file) => {
                            // Extract real name from storage path (e.g. community/6yc9oo_UNIT 1 (O).pdf -> UNIT 1 (O).pdf)
                            const getRealFileName = (f: LibraryFile) => {
                              if (f.storage_path) {
                                const base = f.storage_path.split('/').pop() || '';
                                const clean = base.replace(/^[a-z0-9]+_/, '');
                                if (clean) {
                                  try {
                                    return decodeURIComponent(clean);
                                  } catch (e) {
                                    return clean;
                                  }
                                }
                              }
                              return f.name;
                            };

                            const realNameWithExt = getRealFileName(file);
                            const ext = realNameWithExt.split('.').pop()?.toLowerCase() || '';
                            const cleanName = realNameWithExt.replace(/\.[^/.]+$/, ""); // Strip extension for clean text

                            const ratingVal = (() => {
                              if (file.rating_votes) {
                                const votes = Object.values(file.rating_votes as Record<string, number>);
                                if (votes.length > 0) return (votes.reduce((a, b) => a + b, 0) / votes.length).toFixed(1);
                              }
                              return null;
                            })();
                            
                            const downloadCountVal = file.downloads || 0;

                            const timeAgoVal = (() => {
                              const timestamp = file.uploadDate || (file.created_at ? Date.parse(file.created_at) : Date.now());
                              return getRelativeTime(timestamp);
                            })();

                            const avatarSeed = file.uploader_username || file.uploader_id || file.name;
                            const uploaderName = file.uploader_username || file.faculty_name || "Faculty";

                            return (
                              <tr 
                                key={file.id}
                                onClick={() => handleOpenFile(file)}
                                className="hover:bg-zinc-50 dark:hover:bg-white/[0.01] transition-colors cursor-pointer group"
                              >
                                {/* Name column */}
                                <td className="py-3.5 pl-4 pr-3 min-w-[220px]">
                                  <div className="flex items-center gap-3">
                                    {/* Mockup Vector File Icon */}
                                    <div className="relative w-8 h-9 shrink-0 flex items-center justify-center">
                                      {(() => {
                                        let fillCol = "text-zinc-500";
                                        let label = "FILE";
                                        let foldBg = "#cbd5e1";
                                        
                                        if (ext === 'pdf') { fillCol = "text-red-500"; label = "PDF"; foldBg = "#fca5a5"; }
                                        else if (ext === 'docx' || ext === 'doc') { fillCol = "text-blue-500"; label = "DOC"; foldBg = "#93c5fd"; }
                                        else if (ext === 'pptx' || ext === 'ppt') { fillCol = "text-orange-500"; label = "PPT"; foldBg = "#fed7aa"; }
                                        else if (ext === 'xlsx' || ext === 'xls') { fillCol = "text-emerald-500"; label = "XLS"; foldBg = "#a7f3d0"; }
                                        
                                        return (
                                          <svg viewBox="0 0 24 28" fill="none" className={`w-7.5 h-8.5 ${fillCol}`}>
                                            <path d="M2 0h14l6 6v21a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1z" fill="currentColor" />
                                            <path d="M16 0v6h6" fill={foldBg} opacity="0.9" />
                                            <text x="11" y="21" fill="white" fontSize="7" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">{label}</text>
                                          </svg>
                                        );
                                      })()}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-zinc-900 dark:text-white truncate group-hover:text-orange-500 transition-colors">
                                        {cleanName}
                                      </p>
                                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5 uppercase">
                                        {ext || 'pdf'} • {file.size || '2.4 MB'}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                {/* Unit column */}
                                <td className="py-3.5 px-3 text-center">
                                  {(() => {
                                    const match = file.name.match(/Unit\s*(\d+)/i) || (file.description && file.description.match(/Unit\s*(\d+)/i));
                                    if (match) {
                                      return (
                                        <span className="px-2.5 py-1 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-150 dark:border-white/5 rounded-lg text-[9px] font-bold text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                                          Unit {match[1]}
                                        </span>
                                      );
                                    }
                                    return <span className="text-zinc-300 dark:text-zinc-700 font-bold">-</span>;
                                  })()}
                                </td>

                                {/* Added By column */}
                                <td className="py-3.5 px-3 hidden md:table-cell">
                                  <div className="flex items-center gap-2">
                                    <div className="w-5.5 h-5.5 rounded-full overflow-hidden border border-zinc-200 dark:border-white/10 flex items-center justify-center bg-zinc-100 dark:bg-white/5 shrink-0">
                                      <img 
                                        src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`} 
                                        alt="avatar" 
                                        className="w-full h-full object-cover" 
                                      />
                                    </div>
                                    <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-350 truncate max-w-[100px]">
                                      {uploaderName}
                                    </span>
                                  </div>
                                </td>

                                {/* Updated On column */}
                                <td className="py-3.5 px-3 hidden sm:table-cell text-zinc-400 dark:text-zinc-500 text-[11px] font-semibold">
                                  {timeAgoVal}
                                </td>

                                {/* Downloads column */}
                                <td className="py-3.5 px-3 text-right hidden sm:table-cell text-zinc-500 dark:text-zinc-400 text-[11px] font-bold">
                                  {downloadCountVal}
                                </td>

                                {/* Rating column */}
                                <td className="py-3.5 px-3 text-right text-zinc-800 dark:text-zinc-200 text-[11px] font-black">
                                  {ratingVal ? (
                                    <span className="inline-flex items-center gap-1">
                                      {ratingVal} <Star size={11} className="text-amber-500" fill="currentColor" />
                                    </span>
                                  ) : (
                                    <span className="text-zinc-300 dark:text-zinc-700 font-bold">-</span>
                                  )}
                                </td>

                                {/* Options Actions */}
                                <td className="py-3.5 pr-4 text-right relative">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuFileId(activeMenuFileId === file.id ? null : file.id);
                                    }}
                                    className="p-1.5 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white bg-transparent border-none cursor-pointer transition-all hover:scale-105 active:scale-95"
                                    title="Actions"
                                  >
                                    <MoreHorizontal size={18} />
                                  </button>

                                  {activeMenuFileId === file.id && (
                                    <>
                                      {/* Dropdown Menu Container */}
                                      <div 
                                        className="absolute right-4 mt-1 w-36 rounded-2xl bg-white dark:bg-[#121214] border border-zinc-150 dark:border-white/5 py-1.5 shadow-xl z-50 text-left overflow-hidden animate-fade-in"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {/* View Details */}
                                        <button
                                          onClick={() => {
                                            setActiveMenuFileId(null);
                                            setSelectedFileDetail(file);
                                          }}
                                          className="w-full px-4 py-2.5 text-left text-xs font-bold text-zinc-650 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors border-none bg-transparent cursor-pointer flex items-center gap-2"
                                        >
                                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                          Details
                                        </button>

                                        {/* Edit (Admin only) */}
                                        {userProfile?.is_admin && (
                                          <button
                                            onClick={() => {
                                              setActiveMenuFileId(null);
                                              setSelectedFileToEdit(file);
                                              setEditForm({
                                                name: file.name,
                                                description: file.description || '',
                                                type: file.type || '',
                                                display_order: file.display_order || 0
                                              });
                                              setShowEditModal(true);
                                            }}
                                            className="w-full px-4 py-2.5 text-left text-xs font-bold text-zinc-650 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors border-none bg-transparent cursor-pointer flex items-center gap-2"
                                          >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                                            Edit Metadata
                                          </button>
                                        )}

                                        {/* Delete (Admin only) */}
                                        {userProfile?.is_admin && (
                                          <button
                                            onClick={() => {
                                              setActiveMenuFileId(null);
                                              handleDeleteFile(file);
                                            }}
                                            className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border-none bg-transparent cursor-pointer flex items-center gap-2"
                                          >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                            Delete File
                                          </button>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}



      {/* 3. DISCUSSIONS TAB */}
      {activeTab === 'discussions' && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex justify-between items-center gap-4">
            <h3 className="text-xs font-bold text-zinc-400 tracking-wider flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Discussions</h3>
            <button
              onClick={() => setShowCreatePost(true)}
              style={{ backgroundColor: theme.rawColor }}
              className="px-3.5 py-2 text-white rounded-xl text-xs font-bold border-none cursor-pointer hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1"
            >
              <Plus size={14} /> Create Post
            </button>
          </div>



          {/* List of discussions */}
          <div className="space-y-4">
            {discussions.map((p) => {
              const reactionsCount = (p.reactions.helpful?.length || 0) + (p.reactions.quality?.length || 0) + (p.reactions.important?.length || 0);
              return (
                <div
                  key={p.id}
                  className="p-5 bg-white dark:bg-[#111113] border border-zinc-150 dark:border-white/5 rounded-3xl space-y-3.5 shadow-sm"
                >
                  <div className="flex items-center justify-between relative">
                    <div className="text-[10px] font-black text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                      <img src={p.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'} className="w-6 h-6 rounded-full" />
                      {p.user_username} • <span className="text-zinc-400 font-normal">{new Date(p.created_at).toLocaleDateString()}</span>
                      {p.is_pinned && (
                        <span className="flex items-center gap-0.5 text-orange-500 font-bold bg-orange-500/15 border border-orange-500/20 px-2 py-0.5 rounded-lg text-[8px]">
                          📌 Pinned
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider" style={{ backgroundColor: `${theme.rawColor}15`, color: theme.rawColor }}>
                        {p.category}
                      </span>

                      {/* Three-dot dropdown menu */}
                      {(userProfile?.is_admin || userProfile?.id === p.user_id) && (
                        <div className="relative flex items-center">
                          <button
                            onClick={() => setActivePostMenuId(activePostMenuId === p.id ? null : p.id)}
                            className="p-1 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 bg-transparent border-none cursor-pointer transition-colors rounded-lg hover:bg-zinc-50 dark:hover:bg-white/5"
                          >
                            <MoreHorizontal size={14} />
                          </button>

                          {activePostMenuId === p.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActivePostMenuId(null)} />
                              <div className="absolute right-0 top-full mt-1 w-28 bg-white dark:bg-[#121214] border border-zinc-150 dark:border-white/5 rounded-xl shadow-lg py-1 z-20 text-[10px] font-bold">
                                {userProfile?.is_admin && (
                                  <button
                                    onClick={async () => {
                                      setActivePostMenuId(null);
                                      setPinningPostId(p.id);
                                      const nextPinStatus = !p.is_pinned;
                                      const ok = await CommunityService.updatePostPinStatus(p.id, nextPinStatus);
                                      if (ok) {
                                        setDiscussions(prev => {
                                          const updated = prev.map(post => post.id === p.id ? { ...post, is_pinned: nextPinStatus } : post);
                                          return [...updated].sort((a, b) => {
                                            const pinA = a.is_pinned ? 1 : 0;
                                            const pinB = b.is_pinned ? 1 : 0;
                                            if (pinA !== pinB) return pinB - pinA;
                                            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                                          });
                                        });
                                        showToast(nextPinStatus ? "Post pinned!" : "Post unpinned!", "success");
                                      } else {
                                        showToast("Failed to update pin status", "error");
                                      }
                                      setPinningPostId(null);
                                    }}
                                    disabled={pinningPostId === p.id}
                                    className="w-full text-left px-3 py-1.5 hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300 border-none bg-transparent cursor-pointer font-bold"
                                  >
                                    {p.is_pinned ? "Unpin Post" : "Pin Post"}
                                  </button>
                                )}

                                {userProfile?.id === p.user_id && (
                                  <button
                                    onClick={() => {
                                      setActivePostMenuId(null);
                                      setEditingPost(p);
                                      setEditPostTitle(p.title);
                                      setEditPostContent(p.content);
                                    }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300 border-none bg-transparent cursor-pointer font-bold"
                                  >
                                    Edit Post
                                  </button>
                                )}

                                <button
                                  onClick={async () => {
                                    if (confirm("Are you sure you want to delete this post?")) {
                                      setActivePostMenuId(null);
                                      const ok = await CommunityService.deletePost(p.id);
                                      if (ok) {
                                        setDiscussions(prev => prev.filter(post => post.id !== p.id));
                                        showToast("Post deleted successfully", "success");
                                      } else {
                                        showToast("Failed to delete post", "error");
                                      }
                                    }
                                  }}
                                  className="w-full text-left px-3 py-1.5 hover:bg-zinc-50 dark:hover:bg-white/5 text-red-500 border-none bg-transparent cursor-pointer font-bold"
                                >
                                  Delete Post
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <h4 className="text-xs font-black text-zinc-950 dark:text-white leading-tight">
                    {p.title}
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                    {p.content}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {p.tags.map(t => (
                      <span key={t} className="px-1.5 py-0.2 bg-zinc-50 dark:bg-white/5 border border-zinc-150/50 dark:border-white/5 rounded text-[8px] font-semibold text-zinc-400">{t}</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-4 border-t border-zinc-100 dark:border-white/5 pt-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReaction(p.id, 'post', 'helpful')}
                        className="px-2.5 py-1 bg-zinc-50 dark:bg-white/5 border border-zinc-150/50 dark:border-white/5 hover:border-blue-500/20 text-[10px] rounded-lg font-bold text-zinc-500 flex items-center gap-1 cursor-pointer"
                      >
                        👍 Helpful ({p.reactions.helpful?.length || 0})
                      </button>
                    </div>
                    <button
                      onClick={() => setExpandedPostCommentsId(expandedPostCommentsId === p.id ? null : p.id)}
                      className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-bold flex items-center gap-1.5 bg-transparent border-none cursor-pointer transition-all p-1.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-white/5"
                    >
                      <MessageSquare size={12} /> {p.comments?.length || 0} Comments
                    </button>
                  </div>

                  {/* Expanded Comments Box */}
                  {expandedPostCommentsId === p.id && (
                    <div className="space-y-3.5 mt-4 pt-4 border-t border-zinc-100 dark:border-white/5 pl-2 sm:pl-4">
                      {p.comments && p.comments.length > 0 ? (
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1 no-scrollbar">
                          {p.comments.map((comment) => (
                            <div key={comment.id} className="flex gap-2.5 items-start text-xs animate-fade-in">
                              <img src={comment.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'} className="w-5 h-5 rounded-full shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0 bg-zinc-50 dark:bg-white/[0.015] p-2.5 rounded-2xl border border-zinc-150 dark:border-white/5">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{comment.username}</span>
                                  <span className="text-[9px] text-zinc-400 font-medium">{new Date(comment.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-zinc-650 dark:text-zinc-350 leading-relaxed font-medium">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[10px] font-bold text-zinc-400 italic">No comments yet. Start the conversation!</div>
                      )}

                      {/* Add Comment Input Form */}
                      <form 
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (!userProfile) {
                            showToast("Please login to post a comment.", "info");
                            return;
                          }
                          const text = newCommentTexts[p.id] || '';
                          if (!text.trim()) return;

                          setSubmittingCommentId(p.id);
                          try {
                            const added = await CommunityService.addCommentToItem(p.id, 'post', {
                              user_id: userProfile.id,
                              username: userProfile.username,
                              avatar_url: userProfile.avatar_url || '',
                              content: text.trim()
                            });

                            // Update state locally
                            setDiscussions(prev => prev.map(post => {
                              if (post.id === p.id) {
                                return { ...post, comments: [...(post.comments || []), added] };
                              }
                              return post;
                            }));

                            setNewCommentTexts(prev => ({ ...prev, [p.id]: '' }));
                            showToast("Comment posted!", "success");
                          } catch (err) {
                            showToast("Failed to post comment", "error");
                          } finally {
                            setSubmittingCommentId(null);
                          }
                        }}
                        className="flex gap-2.5 items-center mt-3"
                      >
                        <img src={userProfile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'} className="w-5 h-5 rounded-full shrink-0" />
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={newCommentTexts[p.id] || ''}
                          onChange={(e) => setNewCommentTexts(prev => ({ ...prev, [p.id]: e.target.value }))}
                          className="flex-1 min-w-0 bg-zinc-50 dark:bg-[#121214] border border-zinc-150 dark:border-white/5 rounded-xl px-3 py-1.5 text-xs text-zinc-800 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-orange-500 transition-colors"
                          disabled={submittingCommentId === p.id}
                        />
                        <button
                          type="submit"
                          style={{ backgroundColor: theme.rawColor }}
                          className="px-3.5 py-1.5 text-white rounded-xl text-xs font-bold border-none cursor-pointer hover:opacity-90 transition-all shrink-0 flex items-center justify-center min-w-[50px]"
                          disabled={submittingCommentId === p.id}
                        >
                          {submittingCommentId === p.id ? "..." : "Reply"}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. REQUESTS TAB */}
      {activeTab === 'requests' && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex justify-between items-center gap-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5" /> Open Study Material Bounties</h3>
            <button
              onClick={() => setShowCreateRequest(true)}
              style={{ backgroundColor: theme.rawColor }}
              className="px-3.5 py-2 text-white rounded-xl text-xs font-bold border-none cursor-pointer hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1"
            >
              <Plus size={14} /> Request Material
            </button>
          </div>



          {/* Requests list */}
          <div className="space-y-4">
            {requests.map((r) => (
              <div key={r.id} className="p-5 bg-white dark:bg-[#111113] border border-zinc-150 dark:border-white/5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <img src={r.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'} className="w-6 h-6 rounded-full" />
                    <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">{r.user_username} asked {new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-xs font-black text-zinc-950 dark:text-white leading-tight">
                    {r.title}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    {r.content}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="px-3 py-1.5 border rounded-xl text-xs font-semibold" style={{ backgroundColor: `${theme.rawColor}15`, borderColor: `${theme.rawColor}30`, color: theme.rawColor }}>
                    +{r.bounty_xp} XP Bounty
                  </div>

                  {r.status === 'open' ? (
                    <button
                      onClick={() => {
                        if (!userProfile) {
                          showToast("Please login to solve requests", "info");
                          return;
                        }
                        // Fire file uploader
                        onUploadClick();
                        showToast("Upload the file to this subject folder first to solve!", "info");
                      }}
                      style={{ backgroundColor: theme.rawColor }}
                      className="px-4 py-2 text-white rounded-xl text-xs font-bold border-none cursor-pointer hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Solve Request
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-xl text-xs font-bold">Solved</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. STUDY PACKS TAB */}
      {activeTab === 'packs' && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex justify-between items-center gap-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Curated Student Study Packs</h3>
            <button
              onClick={() => setShowCreatePack(true)}
              style={{ backgroundColor: theme.rawColor }}
              className="px-3.5 py-2 text-white rounded-xl text-xs font-bold border-none cursor-pointer hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1"
            >
              <Plus size={14} /> Create Study Pack
            </button>
          </div>

          {/* List of Study Packs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {studyPacks.map((pack) => (
              <div
                key={pack.id}
                className="p-5 bg-white dark:bg-[#121214] border border-zinc-150 dark:border-white/5 rounded-3xl space-y-4 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="text-xs font-black text-zinc-950 dark:text-white leading-tight">
                    {pack.title}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                    {pack.content}
                  </p>
                  <div className="text-[10px] text-zinc-400 font-semibold flex items-center gap-3">
                    <span>Created by {pack.user_username}</span>
                    <span>•</span>
                    <span>{pack.follower_ids?.length || 0} Followers</span>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2 border-t border-zinc-100 dark:border-white/5">
                  <button
                    onClick={() => {
                      if (subjectFiles.length > 0) {
                        setSelectedFileDetail(subjectFiles[0]);
                      } else {
                        showToast("Study Pack details loading...", "info");
                      }
                    }}
                    style={{ backgroundColor: `${theme.rawColor}15`, color: theme.rawColor }}
                    className="flex-1 py-2 rounded-xl text-xs font-bold border-none cursor-pointer hover:opacity-90 transition-all"
                  >
                    Open Study Pack
                  </button>
                  <button
                    onClick={async () => {
                      if (!userProfile) return;
                      await CommunityService.toggleFollowStudyPack(pack.id, userProfile.id);
                      loadCommunityData();
                    }}
                    className="px-4.5 py-2 bg-zinc-100 dark:bg-white/5 rounded-xl text-xs font-bold text-zinc-500 border-none cursor-pointer"
                  >
                    Follow
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* 7. LEADERBOARD TAB */}
      {activeTab === 'leaderboard' && (
        <div className="max-w-xl mx-auto bg-gradient-to-br from-white to-zinc-50/50 dark:from-[#121214] dark:to-[#0c0c0e] border border-zinc-150 dark:border-white/5 rounded-3xl p-5 md:p-6 space-y-6 shadow-sm animate-fade-in">
          <div className="text-center space-y-1">
            <h3 className="text-sm font-semibold text-zinc-950 dark:text-white uppercase tracking-wider flex items-center justify-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" /> Subject Leaders (All-Time)
            </h3>
            <p className="text-[10px] text-zinc-400 font-medium">Top contributors by study XP earned in {subjectCode}</p>
          </div>

          <div className="space-y-3.5 pt-3">
            {leaderboardList.length > 0 ? (
              leaderboardList.map((s, idx) => (
                <div key={idx} className="flex justify-between items-center gap-4 bg-zinc-50/30 dark:bg-white/[0.02] border border-zinc-150/40 dark:border-white/5 p-3.5 rounded-2xl hover:bg-zinc-100/50 dark:hover:bg-white/[0.04] transition-all duration-200">
                  <div className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0" style={{ backgroundColor: `${theme.rawColor}15`, color: theme.rawColor }}>
                      {idx + 1}
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200">{s.username || 'Anonymous Verto'}</div>
                      <div className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium">{s.level_title || 'Scholar'} • Lv.{s.level || 1}</div>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm font-bold" style={{ color: theme.rawColor }}>
                    +{s.total_xp} XP
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-zinc-450 dark:text-zinc-500 text-xs">No contributors on the leaderboard yet.</div>
            )}
          </div>
        </div>
      )}



      {/* 9. PEOPLE TAB */}
      {activeTab === 'people' && (
        <div className="space-y-6 animate-fade-in">
          {/* Faculty section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Faculty</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(() => {
                const faculties = Array.from(new Set(subjectFiles.map(f => f.faculty_name).filter(Boolean))) as string[];
                if (faculties.length === 0) {
                  return (
                    <div className="col-span-full p-6 bg-zinc-50 dark:bg-white/[0.005] border border-zinc-150 dark:border-white/5 rounded-2xl text-[11px] sm:text-xs text-zinc-400 font-medium text-center">
                      No designated faculty uploaded resources for this subject yet.
                    </div>
                  );
                }
                return faculties.map((f, idx) => (
                  <div key={idx} className="p-4 bg-white dark:bg-[#0c0c0e] border border-zinc-150 dark:border-white/5 rounded-2xl flex items-center gap-3.5 shadow-sm">
                    <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(f || 'Faculty')}`} className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-800" />
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{f}</h4>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium font-bold">Subject Instructor</p>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Top Contributors & Moderators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5" /> Top Contributors</h3>
              <div className="divide-y divide-zinc-100 dark:divide-white/5 border border-zinc-150 dark:border-white/5 rounded-2xl overflow-hidden bg-white dark:bg-[#0c0c0e]">
                {leaderboardList.length > 0 ? (
                  leaderboardList.slice(0, 3).map((c, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between text-xs">
                      <div className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                        <span className="text-[10px] font-black px-1.5 py-0.5 bg-zinc-100 dark:bg-white/5 rounded text-zinc-500">{idx + 1}</span>
                        {c.username || 'Anonymous Verto'}
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg" style={{ color: theme.rawColor, backgroundColor: `${theme.rawColor}15` }}>{c.level_title || 'Scholar'}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-zinc-450 dark:text-zinc-500 text-xs">No contributors yet.</div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Moderators</h3>
              <div className="divide-y divide-zinc-100 dark:divide-white/5 border border-zinc-150 dark:border-white/5 rounded-2xl overflow-hidden bg-white dark:bg-[#0c0c0e]">
                {moderatorsList.length > 0 ? (
                  moderatorsList.map((m, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between text-xs">
                      <div className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5" style={{ color: theme.rawColor }} />
                        {m.username || 'Campus Admin'}
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg" style={{ color: theme.rawColor, backgroundColor: `${theme.rawColor}15` }}>Admin</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-zinc-450 dark:text-zinc-500 text-xs">No moderators assigned yet.</div>
                )}
              </div>
            </div>
          </div>

          {/* Members list */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Members ({liveMembersCount.toLocaleString()} Enrolled)</h3>
            <div className="p-4 bg-zinc-50 dark:bg-white/[0.005] border border-zinc-150 dark:border-white/5 rounded-2xl text-[11px] sm:text-xs text-zinc-450 leading-relaxed font-medium">
              All students enrolled in <strong>{selectedProgram}</strong> are automatically members of this subject community. Enrolled members receive course announcements and exam notifications.
            </div>
          </div>
        </div>
      )}

      {/* Detail Overlay */}
      {selectedFileDetail && createPortal(
        <FileDetailPage
          file={selectedFileDetail}
          userProfile={userProfile}
          onClose={() => setSelectedFileDetail(null)}
          onRefresh={loadCommunityData}
          themeColor={theme.rawColor}
        />,
        document.body
      )}
      {createPortal(
        <AnimatePresence>
          {showCreatePost && (
            <div 
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setShowCreatePost(false)}
            >
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/55 backdrop-blur-md"
                style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
              />

              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-xl bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-[40px] p-8 shadow-2xl space-y-5 overflow-hidden z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center border-b border-zinc-100 dark:border-white/5 pb-3.5">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Plus size={18} style={{ color: theme.rawColor }} /> Create New Post
                  </h3>
                  <button onClick={() => setShowCreatePost(false)} className="text-zinc-400 hover:text-zinc-655 dark:hover:text-white bg-transparent border-none text-lg cursor-pointer font-semibold transition-colors">×</button>
                </div>

                <form onSubmit={handlePostSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Title</label>
                      <input
                        type="text"
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        placeholder="Enter post title..."
                        className="w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-3 text-xs font-semibold outline-none text-zinc-955 dark:text-white transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Category</label>
                      <select
                        value={postCategory}
                        onChange={(e) => setPostCategory(e.target.value as any)}
                        className="w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-3 text-xs font-semibold outline-none text-zinc-955 dark:text-white transition-all"
                      >
                        <option value="discussion">General Discussion</option>
                        <option value="doubt">Doubt / Question</option>
                        <option value="poll">Poll</option>
                        <option value="question">Midterm/Exam Prep</option>
                        <option value="resource">Reference resource</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={postTags}
                      onChange={(e) => setPostTags(e.target.value)}
                      placeholder="e.g. pointers, malloc, unit5"
                      className="w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-3 text-xs font-semibold outline-none text-zinc-955 dark:text-white transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Content Body (supports Markdown)</label>
                    <textarea
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Explain details of the doubt or question..."
                      rows={5}
                      className="w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-3xl p-4 text-xs font-semibold outline-none text-zinc-955 dark:text-white transition-all resize-none"
                      required
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setShowCreatePost(false)}
                      className="px-5 py-3 text-zinc-450 hover:text-zinc-800 dark:hover:text-white font-bold text-xs border-none bg-transparent transition-colors cursor-pointer outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ backgroundColor: theme.rawColor }}
                      className="px-6 py-3 text-white rounded-2xl text-xs font-bold border-none cursor-pointer hover:opacity-90 active:scale-95 transition-all outline-none"
                    >
                      Submit Post
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Edit Post Modal */}
      {createPortal(
        <AnimatePresence>
          {editingPost && (
            <div 
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setEditingPost(null)}
            >
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/55 backdrop-blur-md"
                style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
              />

              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 rounded-[40px] p-8 shadow-2xl space-y-5 overflow-hidden z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center border-b border-zinc-100 dark:border-white/5 pb-3.5">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    Edit Post
                  </h3>
                  <button onClick={() => setEditingPost(null)} className="text-zinc-400 hover:text-zinc-655 dark:hover:text-white bg-transparent border-none text-lg cursor-pointer font-semibold transition-colors">×</button>
                </div>

                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!editingPost) return;
                    const ok = await CommunityService.editPost(editingPost.id, editPostTitle, editPostContent);
                    if (ok) {
                      setDiscussions(prev => prev.map(post => {
                        if (post.id === editingPost.id) {
                          return { ...post, title: editPostTitle, content: editPostContent, updated_at: new Date().toISOString() };
                        }
                        return post;
                      }));
                      showToast("Post edited successfully", "success");
                      setEditingPost(null);
                    } else {
                      showToast("Failed to edit post", "error");
                    }
                  }} 
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Title</label>
                    <input
                      type="text"
                      value={editPostTitle}
                      onChange={(e) => setEditPostTitle(e.target.value)}
                      placeholder="Enter post title..."
                      className="w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-3 text-xs font-semibold outline-none text-zinc-955 dark:text-white transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Content Body</label>
                    <textarea
                      value={editPostContent}
                      onChange={(e) => setEditPostContent(e.target.value)}
                      placeholder="Explain details of the doubt or question..."
                      rows={5}
                      className="w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-3xl p-4 text-xs font-semibold outline-none text-zinc-955 dark:text-white transition-all resize-none"
                      required
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setEditingPost(null)}
                      className="px-5 py-3 text-zinc-450 hover:text-zinc-800 dark:hover:text-white font-bold text-xs border-none bg-transparent transition-colors cursor-pointer outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ backgroundColor: theme.rawColor }}
                      className="px-6 py-3 text-white rounded-2xl text-xs font-bold border-none cursor-pointer hover:opacity-90 active:scale-95 transition-all outline-none"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* 2. Create Request Modal */}
      {createPortal(
        <AnimatePresence>
          {showCreateRequest && (
            <div 
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setShowCreateRequest(false)}
            >
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/55 backdrop-blur-md"
                style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
              />

              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-xl bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-[40px] p-8 shadow-2xl space-y-5 overflow-hidden z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center border-b border-zinc-100 dark:border-white/5 pb-3.5">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <HelpCircle size={18} style={{ color: theme.rawColor }} /> Request Study Material
                  </h3>
                  <button onClick={() => setShowCreateRequest(false)} className="text-zinc-400 hover:text-zinc-655 dark:hover:text-white bg-transparent border-none text-lg cursor-pointer font-semibold transition-colors">×</button>
                </div>

                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Document Title Needed</label>
                      <input
                        type="text"
                        value={reqTitle}
                        onChange={(e) => setReqTitle(e.target.value)}
                        placeholder="e.g. Unit 3 lab manual code solved"
                        className="w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-3 text-xs font-semibold outline-none text-zinc-955 dark:text-white transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">XP Reward Bounty</label>
                      <input
                        type="number"
                        value={reqBounty}
                        onChange={(e) => setReqBounty(Number(e.target.value))}
                        placeholder="e.g. 50"
                        className="w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-3 text-xs font-semibold outline-none text-zinc-955 dark:text-white transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Description</label>
                    <textarea
                      value={reqContent}
                      onChange={(e) => setReqContent(e.target.value)}
                      placeholder="Specify details or requirements..."
                      rows={4}
                      className="w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-3xl p-4 text-xs font-semibold outline-none text-zinc-955 dark:text-white transition-all resize-none"
                      required
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setShowCreateRequest(false)}
                      className="px-5 py-3 text-zinc-450 hover:text-zinc-800 dark:hover:text-white font-bold text-xs border-none bg-transparent transition-colors cursor-pointer outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ backgroundColor: theme.rawColor }}
                      className="px-6 py-3 text-white rounded-2xl text-xs font-bold border-none cursor-pointer hover:opacity-90 active:scale-95 transition-all outline-none"
                    >
                      Post Bounty Request
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* 3. Create Study Pack Modal */}
      {createPortal(
        <AnimatePresence>
          {showCreatePack && (
            <div 
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setShowCreatePack(false)}
            >
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/55 backdrop-blur-md"
                style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
              />

              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-xl bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-[40px] p-8 shadow-2xl space-y-5 overflow-hidden z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center border-b border-zinc-100 dark:border-white/5 pb-3.5">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <BookOpen size={18} style={{ color: theme.rawColor }} /> Create Curated Study Pack
                  </h3>
                  <button onClick={() => setShowCreatePack(false)} className="text-zinc-400 hover:text-zinc-655 dark:hover:text-white bg-transparent border-none text-lg cursor-pointer font-semibold transition-colors">×</button>
                </div>

                <form onSubmit={handlePackSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Study Pack Title</label>
                    <input
                      type="text"
                      value={packTitle}
                      onChange={(e) => setPackTitle(e.target.value)}
                      placeholder="e.g. CSE101 Midterm Complete Preparation Bundle"
                      className="w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-3 text-xs font-semibold outline-none text-zinc-955 dark:text-white transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Study Pack Description</label>
                    <textarea
                      value={packContent}
                      onChange={(e) => setPackContent(e.target.value)}
                      placeholder="Summarize what files are included and what chapters this pack covers..."
                      rows={4}
                      className="w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-3xl p-4 text-xs font-semibold outline-none text-zinc-955 dark:text-white transition-all resize-none"
                      required
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setShowCreatePack(false)}
                      className="px-5 py-3 text-zinc-455 hover:text-zinc-800 dark:hover:text-white font-bold text-xs border-none bg-transparent transition-colors cursor-pointer outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ backgroundColor: theme.rawColor }}
                      className="px-6 py-3 text-white rounded-2xl text-xs font-bold border-none cursor-pointer hover:opacity-90 active:scale-95 transition-all outline-none"
                    >
                      Create Study Pack
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Admin Edit Modal */}
      {showEditModal && selectedFileToEdit && createPortal(
        <div className="modal-overlay" style={{ zIndex: 1000, backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }} onClick={() => setShowEditModal(false)}>
          <div className="bg-white dark:bg-[#0c0c0e] border border-zinc-150 dark:border-white/5 w-full max-w-md rounded-3xl p-6 shadow-2xl relative space-y-4 m-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-black text-zinc-800 dark:text-zinc-100 uppercase tracking-wider">Edit File Metadata</h3>
            
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-zinc-500 dark:text-zinc-400">File Name</label>
                <input 
                  type="text" 
                  value={editForm.name} 
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-white/5 border border-zinc-150 dark:border-white/5 rounded-xl outline-none focus:ring-1 focus:ring-orange-500 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-500 dark:text-zinc-400">Description</label>
                <textarea 
                  value={editForm.description} 
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-white/5 border border-zinc-150 dark:border-white/5 rounded-xl outline-none focus:ring-1 focus:ring-orange-500 dark:text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-500 dark:text-zinc-400">Category Type</label>
                  <select 
                    value={editForm.type} 
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-white/5 border border-zinc-150 dark:border-white/5 rounded-xl outline-none focus:ring-1 focus:ring-orange-500 dark:text-white"
                  >
                    <option value="Notes">Notes</option>
                    <option value="PYQs">PYQs</option>
                    <option value="Lectures">Lectures</option>
                    <option value="Syllabus">Syllabus</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-500 dark:text-zinc-400">Display Order</label>
                  <input 
                    type="number" 
                    value={editForm.display_order} 
                    onChange={(e) => setEditForm({ ...editForm, display_order: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-white/5 border border-zinc-150 dark:border-white/5 rounded-xl outline-none focus:ring-1 focus:ring-orange-500 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3.5 pt-2">
              <button 
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-2.5 border border-zinc-150 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-400 rounded-xl text-xs font-bold cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-xs font-bold hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all border-none"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default SubjectCommunity;
