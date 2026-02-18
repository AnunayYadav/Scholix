
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { LibraryFile, UserProfile, Folder } from '../types.ts';
import NexusServer from '../services/nexusServer.ts';
import PDFViewer from './PDFViewer.tsx';
import NexusDropdown from './NexusDropdown.tsx';

const FolderIcon = ({ type, size = "w-7 h-7" }: { type: 'semester' | 'subject' | 'category' | 'root', size?: string }) => {
  const colors = {
    root: 'text-slate-400',
    semester: 'text-orange-600',
    subject: 'text-orange-500',
    category: 'text-amber-600'
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`${size} ${colors[type]} mb-2 transition-colors`}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
};

const SkeletonCard = () => (
  <div className="group p-5 rounded-[30px] border border-slate-100 dark:border-white/5 bg-white dark:bg-black/40 relative overflow-hidden flex flex-col min-h-[140px] animate-pulse">
    <div className="w-10 h-10 bg-slate-200 dark:bg-white/5 rounded-xl mb-4 shimmer" />
    <div className="h-4 w-3/4 bg-slate-200 dark:bg-white/5 rounded-md mb-2 shimmer" />
    <div className="h-3 w-1/2 bg-slate-200 dark:bg-white/5 rounded-md shimmer" />
  </div>
);

interface ContentLibraryProps {
  userProfile: UserProfile | null;
  initialView?: 'browse' | 'my-uploads';
}

const ContentLibrary: React.FC<ContentLibraryProps> = ({ userProfile, initialView = 'browse' }) => {
  const [allFiles, setAllFiles] = useState<LibraryFile[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [viewMode, setViewMode] = useState<'browse' | 'my-uploads'>(initialView);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const [activeSemester, setActiveSemester] = useState<Folder | null>(null);
  const [activeSubject, setActiveSubject] = useState<Folder | null>(null);
  const [activeCategory, setActiveCategory] = useState<Folder | null>(null);

  const initialPrograms = ["BTech CSE", "BTech IT", "BCA", "MCA", "MBA", "BCom", "BA"];
  const [availablePrograms, setAvailablePrograms] = useState(initialPrograms);
  const [selectedProgram, setSelectedProgram] = useState(() => {
    if (userProfile?.program && initialPrograms.includes(userProfile.program)) return userProfile.program;
    return initialPrograms[0];
  });

  const availableProgramsWithAll = useMemo(() => {
    if (userProfile?.is_admin) return ["All", ...availablePrograms];
    return availablePrograms;
  }, [availablePrograms, userProfile?.is_admin]);

  const [isAdminView, setIsAdminView] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<LibraryFile | null>(null);
  const [folderToManage, setFolderToManage] = useState<Folder | null>(null);
  const [newFolderName, setNewFolderName] = useState('');

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [metaForm, setMetaForm] = useState({ name: '', description: '', semester: '', subject: '', type: '', program: selectedProgram });

  const modalSemesters = useMemo(() => {
    return folders.filter(f => f.type === 'semester' && f.program === metaForm.program).map(f => f.name);
  }, [folders, metaForm.program]);

  const modalSubjects = useMemo(() => {
    const sem = folders.find(f => f.name === metaForm.semester && f.type === 'semester' && f.program === metaForm.program);
    return sem ? folders.filter(f => f.type === 'subject' && f.parent_id === sem.id).map(f => f.name) : [];
  }, [folders, metaForm.semester, metaForm.program]);

  const modalCategories = useMemo(() => {
    const sub = folders.find(f => f.name === metaForm.subject && f.type === 'subject' && f.program === metaForm.program);
    return sub ? folders.filter(f => f.type === 'category' && f.parent_id === sub.id).map(f => f.name) : [];
  }, [folders, metaForm.subject, metaForm.program]);

  useEffect(() => {
    if (showUploadModal || showEditModal) {
      setMetaForm(prev => ({ ...prev, program: selectedProgram }));
    }
  }, [showUploadModal, showEditModal, selectedProgram]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggingOverId, setDraggingOverId] = useState<string | null>(null);

  const [viewerInfo, setViewerInfo] = useState<{ show: boolean, url: string, name: string }>({ show: false, url: '', name: '' });

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isAnyModalOpen = showFolderModal || showRenameModal || showDetailsModal || showEditModal || showUploadModal;
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showFolderModal, showRenameModal, showDetailsModal, showEditModal, showUploadModal]);

  useEffect(() => {
    if (initialView) setViewMode(initialView);
  }, [initialView]);

  const fetchFromSource = useCallback(async (showSkeleton = true) => {
    if (showSkeleton) setIsLoading(true);
    try {
      const [folderList, filesFromDb] = await Promise.all([
        NexusServer.fetchFolders(selectedProgram),
        isAdminView
          ? NexusServer.fetchPendingFiles(selectedProgram, searchQuery)
          : (viewMode === 'my-uploads' && userProfile)
            ? NexusServer.fetchUserFiles(userProfile.id)
            : NexusServer.fetchFiles(selectedProgram, searchQuery)
      ]);

      setFolders(folderList);
      setAllFiles(filesFromDb);
    } catch (e: any) {
      console.error("Library load error:", e);
    } finally {
      setIsLoading(false);
    }
  }, [isAdminView, viewMode, userProfile, searchQuery, selectedProgram]);

  useEffect(() => {
    fetchFromSource(true);
  }, [fetchFromSource]);

  const displayFiles = useMemo(() => {
    let data = [...allFiles];

    if (isAdminView || viewMode === 'my-uploads' || searchQuery.trim() !== '') {
      // Global flattened views
    } else if (viewMode === 'browse') {
      if (activeCategory) {
        data = data.filter(f =>
          f.semester === activeSemester?.name &&
          f.subject === activeSubject?.name &&
          f.type === activeCategory.name
        );
      } else if (activeSubject) {
        data = data.filter(f =>
          f.semester === activeSemester?.name &&
          f.subject === activeSubject.name &&
          (!f.type || f.type.trim() === '' || f.type === 'General' || f.type === activeSubject.name)
        );
      } else {
        data = [];
      }
    }

    data.sort((a, b) => {
      if (sortBy === 'newest') return b.uploadDate - a.uploadDate;
      if (sortBy === 'oldest') return a.uploadDate - b.uploadDate;
      if (sortBy === 'az') return a.name.localeCompare(b.name);
      return 0;
    });
    return data;
  }, [allFiles, searchQuery, isAdminView, viewMode, activeSemester, activeSubject, activeCategory, sortBy]);

  const currentFolders = useMemo(() => {
    if (isAdminView || viewMode === 'my-uploads' || searchQuery.trim() !== '') return [];

    return folders.filter(f => {
      if (!activeSemester) return f.type === 'semester';
      if (!activeSubject) return f.type === 'subject' && f.parent_id === activeSemester.id;
      if (!activeCategory) return f.type === 'category' && f.parent_id === activeSubject.id;
      return false;
    });
  }, [folders, activeSemester, activeSubject, activeCategory, isAdminView, viewMode, searchQuery]);

  const dropdownLists = useMemo(() => {
    const sems = Array.from(new Set(folders.filter(f => f.type === 'semester').map(f => f.name)));
    const subjs = Array.from(new Set(folders.filter(f => f.type === 'subject').map(f => f.name)));
    const cats = Array.from(new Set(folders.filter(f => f.type === 'category').map(f => f.name)));
    return { sems, subjs, cats };
  }, [folders]);

  const [isCreatingNew, setIsCreatingNew] = useState({ program: false, semester: false, subject: false, type: false });

  const navigateTo = (sem: Folder | null, subj: Folder | null, cat: Folder | null) => {
    setActiveSemester(sem);
    setActiveSubject(subj);
    setActiveCategory(cat);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !userProfile?.is_admin) return;
    setIsProcessing(true);
    try {
      let type: 'semester' | 'subject' | 'category' = 'semester';
      let parentId: string | null = null;
      if (activeSubject) { type = 'category'; parentId = activeSubject.id; }
      else if (activeSemester) { type = 'subject'; parentId = activeSemester.id; }
      await NexusServer.createFolder(newFolderName, type, parentId, selectedProgram);
      setNewFolderName('');
      setShowFolderModal(false);
      fetchFromSource(false);
    } catch (e: any) { alert(e.message); } finally { setIsProcessing(false); }
  };

  const handleUpload = async () => {
    if (!pendingFile || !userProfile) return;
    setIsProcessing(true);
    try {
      await NexusServer.uploadFile(
        pendingFile,
        metaForm.name.trim(),
        metaForm.description.trim(),
        metaForm.subject.trim(),
        metaForm.semester.trim(),
        metaForm.type.trim(),
        userProfile.id,
        userProfile.is_admin,
        metaForm.program.trim()
      );
      if (!availablePrograms.includes(metaForm.program)) {
        setAvailablePrograms(prev => [...prev, metaForm.program]);
      }
      setShowUploadModal(false);
      setPendingFile(null);
      fetchFromSource(false);
    } catch (e: any) { alert(e.message); } finally { setIsProcessing(false); }
  };

  const handleEditSubmission = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    try {
      await NexusServer.requestUpdate(selectedFile.id, metaForm, userProfile?.is_admin || false);
      setShowEditModal(false);
      setSelectedFile(null);
      fetchFromSource(false);
    } catch (e: any) { alert(e.message); } finally { setIsProcessing(false); }
  };

  const handleRenameFolder = async () => {
    if (!folderToManage || !newFolderName.trim() || !userProfile?.is_admin) return;
    setIsProcessing(true);
    try {
      await NexusServer.renameFolder(folderToManage.id, newFolderName);
      setNewFolderName('');
      setFolderToManage(null);
      setShowRenameModal(false);
      fetchFromSource(false);
    } catch (e: any) { alert(e.message); } finally { setIsProcessing(false); }
  };

  const handleDeleteFolder = async (folder: Folder, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userProfile?.is_admin) return;
    if (!confirm(`Permanently delete node "${folder.name}"?`)) return;
    setIsProcessing(true);
    try {
      await NexusServer.deleteFolder(folder.id);
      fetchFromSource(false);
    } catch (e: any) { alert(e.message); } finally { setIsProcessing(false); }
  };

  const toggleAdminView = () => {
    const nextAdminState = !isAdminView;
    setIsAdminView(nextAdminState);
    if (nextAdminState) {
      setSelectedProgram('All');
    } else {
      setSelectedProgram(userProfile?.program || initialPrograms[0]);
    }
    setViewMode('browse');
    setSearchQuery('');
    navigateTo(null, null, null);
  };

  const handleFileAccess = async (file: LibraryFile) => {
    try {
      const url = await NexusServer.getFileUrl(file.storage_path);
      if (file.storage_path.toLowerCase().endsWith('.pdf')) {
        setViewerInfo({ show: true, url, name: file.name });
      } else {
        window.open(url, '_blank');
      }
    } catch (e: any) {
      alert("Error accessing file: " + e.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-20 px-4 md:px-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tighter leading-none mb-1">
            Content <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Library</span> Hub
          </h2>
          {!isAdminView && !searchQuery && viewMode === 'browse' && (
            <nav className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-black tracking-widest text-slate-400">
              <button onClick={() => navigateTo(null, null, null)} className="hover:text-orange-500 transition-colors border-none bg-transparent">Root</button>
              {activeSemester && <><span className="opacity-30">/</span><button onClick={() => navigateTo(activeSemester, null, null)} className={`border-none bg-transparent ${!activeSubject ? 'text-orange-600' : 'hover:text-orange-500'}`}>{activeSemester.name}</button></>}
              {activeSubject && <><span className="opacity-30">/</span><button onClick={() => navigateTo(activeSemester, activeSubject, null)} className={`border-none bg-transparent ${!activeCategory ? 'text-orange-600' : 'hover:text-orange-500'}`}>{activeSubject.name}</button></>}
              {activeCategory && <><span className="opacity-30">/</span><span className="text-orange-600">{activeCategory.name}</span></>}
            </nav>
          )}
        </div>
        <div className="flex gap-2">
          {userProfile?.is_admin && (
            <>
              <button onClick={toggleAdminView} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border-none ${isAdminView ? 'bg-orange-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-black text-slate-400'}`} title={isAdminView ? "Exit Review Hub" : "Enter Review Hub"}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg></button>
              <button onClick={() => { setNewFolderName(''); setShowFolderModal(true); }} className="w-10 h-10 bg-slate-100 dark:bg-black rounded-xl flex items-center justify-center text-orange-600 hover:scale-110 active:scale-95 transition-all shadow-sm border-none" title="Create Folder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M12 5v14M5 12h14" /></svg></button>
            </>
          )}
          <button onClick={() => { setViewMode(viewMode === 'browse' ? 'my-uploads' : 'browse'); navigateTo(null, null, null); setIsAdminView(false); }} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border-none ${viewMode === 'my-uploads' ? 'bg-orange-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-black text-slate-400'}`} title={viewMode === 'my-uploads' ? "Exit Vault" : "My Vault"}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></button>
          <button onClick={() => { if (!userProfile) { alert("Sign in required."); return; } fileInputRef.current?.click(); }} className="px-5 py-2 bg-orange-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-600/20 border-none hover:scale-105 active:scale-95 transition-all flex items-center gap-2"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>Contribute</button>
        </div>
      </header>

      <div className="flex gap-2 w-full flex-col md:flex-row">
        <div className="flex-1 flex gap-2">
          <NexusDropdown
            options={availableProgramsWithAll}
            value={selectedProgram}
            onChange={(val) => {
              setSelectedProgram(val);
              navigateTo(null, null, null);
            }}
          />

          <div className="relative flex-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            <input type="text" placeholder="Filter files..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-orange-500 transition-all dark:text-white" />
          </div>
        </div>
        <button onClick={() => fetchFromSource(true)} className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-black rounded-xl text-slate-400 hover:text-orange-600 transition-colors shadow-sm border-none self-end md:self-auto" title="Refresh List"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}><path d="M23 4v6h-6" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg></button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">{Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {currentFolders.map(folder => (
            <div key={folder.id} onDragOver={(e) => { if (!userProfile?.is_admin) return; e.preventDefault(); setDraggingOverId(folder.id); }} onDragLeave={() => setDraggingOverId(null)} onDrop={(e) => { if (!userProfile?.is_admin) return; e.preventDefault(); setDraggingOverId(null); const droppedFiles = e.dataTransfer.files; if (droppedFiles && droppedFiles.length > 0) { setPendingFile(droppedFiles[0]); setMetaForm({ name: droppedFiles[0].name.replace(/\.[^/.]+$/, ""), description: '', semester: folder.type === 'semester' ? folder.name : activeSemester?.name || '', subject: folder.type === 'subject' ? folder.name : activeSubject?.name || '', type: folder.type === 'category' ? folder.name : '', program: folder.program }); setShowUploadModal(true); } }} onClick={() => { if (folder.type === 'semester') navigateTo(folder, null, null); else if (folder.type === 'subject') navigateTo(activeSemester, folder, null); else if (folder.type === 'category') navigateTo(activeSemester, activeSubject, folder); }} className={`group p-5 rounded-[30px] border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-center min-h-[140px] ${draggingOverId === folder.id ? 'border-orange-500 bg-orange-500/10 scale-105 shadow-xl z-10' : 'border-slate-100 dark:border-white/5 bg-white dark:bg-black/40 hover:border-orange-500/50 hover:shadow-lg'}`}>
              {userProfile?.is_admin && (
                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <button onClick={(e) => { e.stopPropagation(); setFolderToManage(folder); setNewFolderName(folder.name); setShowRenameModal(true); }} className="p-1.5 bg-black rounded-lg text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-900 transition-colors shadow-sm border-none"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button>
                  <button onClick={(e) => handleDeleteFolder(folder, e)} className="p-1.5 bg-black rounded-lg text-red-500 hover:bg-red dark:hover:bg-slate-900 transition-colors shadow-sm border-none"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg></button>
                </div>
              )}
              <FolderIcon type={folder.type} size="w-10 h-10" />
              <h3 className="text-sm md:text-base font-black text-slate-800 dark:text-white tracking-tight uppercase leading-tight mt-1">{folder.name}</h3>
              <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:scale-110 transition-transform"><FolderIcon type={folder.type} size="w-24 h-24" /></div>
            </div>
          ))}
          {displayFiles.map(file => (
            <FileCard
              key={file.id}
              file={file}
              userProfile={userProfile}
              isAdminMode={isAdminView}
              isPersonal={viewMode === 'my-uploads'}
              onApprove={async () => {
                setIsProcessing(true);
                try {
                  // Ensure folders exist - fetch all to avoid filtering issues during admin check
                  const allFolders = await NexusServer.fetchFolders('All');

                  let semFolder = allFolders.find(f => f.type === 'semester' && f.name.trim() === file.semester.trim() && f.program === file.program);
                  if (!semFolder) {
                    await NexusServer.createFolder(file.semester.trim(), 'semester', null, file.program);
                    const fresh = await NexusServer.fetchFolders('All');
                    semFolder = fresh.find(f => f.type === 'semester' && f.name.trim() === file.semester.trim() && (f.program === file.program || f.program === 'All'));
                  }

                  let subjFolder = allFolders.find(f => f.type === 'subject' && f.name.trim() === file.subject.trim() && f.parent_id === semFolder?.id && f.program === file.program);
                  if (!subjFolder && semFolder) {
                    await NexusServer.createFolder(file.subject.trim(), 'subject', semFolder.id, file.program);
                    const fresh = await NexusServer.fetchFolders('All');
                    subjFolder = fresh.find(f => f.type === 'subject' && f.name.trim() === file.subject.trim() && f.parent_id === semFolder.id && (f.program === file.program || f.program === 'All'));
                  }

                  if (file.type && file.type.trim()) {
                    let catFolder = allFolders.find(f => f.type === 'category' && f.name.trim() === file.type.trim() && f.parent_id === subjFolder?.id && f.program === file.program);
                    if (!catFolder && subjFolder) {
                      await NexusServer.createFolder(file.type.trim(), 'category', subjFolder.id, file.program);
                    }
                  }

                  await NexusServer.approveFile(file.id);
                  fetchFromSource(false);
                } catch (e: any) {
                  alert("Approval error: " + e.message);
                } finally {
                  setIsProcessing(false);
                }
              }}
              onReject={() => { if (confirm("Reject and remove this file?")) { setIsProcessing(true); NexusServer.rejectFile(file.id).then(() => fetchFromSource(false)).finally(() => setIsProcessing(false)); } }}
              onDemote={() => { if (confirm("Send this file back to pending review?")) { setIsProcessing(true); NexusServer.demoteFile(file.id).then(() => fetchFromSource(false)).finally(() => setIsProcessing(false)); } }}
              onEdit={() => { setSelectedFile(file); setMetaForm({ name: file.name, description: file.description || '', semester: file.semester, subject: file.subject, type: file.type }); setShowEditModal(true); }}
              onDelete={() => { if (confirm("Permanently delete this file?")) { setIsProcessing(true); NexusServer.deleteFile(file.id, file.storage_path).then(() => fetchFromSource(false)).finally(() => setIsProcessing(false)); } }}
              onAccess={() => handleFileAccess(file)}
              onShowDetails={() => { setSelectedFile(file); setShowDetailsModal(true); }}
            />
          ))}
          {displayFiles.length === 0 && currentFolders.length === 0 && !isLoading && <div className="col-span-full py-20 text-center text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] opacity-40">No files found.</div>}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedFile && (
        <div className="fixed inset-0 z-[200] flex items-start md:items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-fade-in overflow-y-auto">
          <div ref={modalRef} className="bg-[#050505] rounded-[48px] w-full max-w-2xl border border-white/10 shadow-[0_32px_128px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col my-auto max-h-[90vh]">
            <header className="p-8 md:p-12 border-b border-white/5 bg-black flex items-start justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-600/10 flex items-center justify-center text-orange-500 border border-orange-600/20">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                  </div>

                </div>
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white leading-tight">{selectedFile.name}</h3>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="p-2 text-white/30 hover:text-white transition-colors border-none bg-transparent">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 no-scrollbar">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Semester', val: selectedFile.semester },
                  { label: 'Subject', val: selectedFile.subject },
                  { label: 'Category', val: selectedFile.type },
                  { label: 'File Size', val: selectedFile.size }
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">{item.label}</p>
                    <p className="text-xs font-black uppercase tracking-tight text-white">{item.val || 'N/A'}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Description</h4>
                <p className="text-sm font-medium text-slate-300 leading-relaxed italic bg-white/5 p-6 rounded-3xl border border-white/5">
                  {selectedFile.description || "No description provided."}
                </p>
              </div>

              <div className="flex items-center justify-between p-6 bg-orange-600/5 border border-orange-600/20 rounded-3xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center font-black text-xs">
                    {selectedFile.uploader_username?.[0] || 'V'}
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-orange-600 uppercase tracking-widest">Uploader</p>
                    <p className="text-xs font-black uppercase">@{selectedFile.uploader_username}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black uppercase text-white">{new Date(selectedFile.uploadDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <footer className="p-8 md:p-12 bg-black border-t border-white/5 flex gap-4">
              <button onClick={() => setShowDetailsModal(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Discard</button>
              {selectedFile.status === 'approved' && (
                <button onClick={() => { setShowDetailsModal(false); handleFileAccess(selectedFile); }} className="flex-[2] py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all border-none">View Document ↗</button>
              )}
            </footer>
          </div>
        </div>
      )}

      {showFolderModal && userProfile?.is_admin && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div ref={modalRef} className="bg-white dark:bg-black rounded-[30px] w-full max-w-sm shadow-2xl border border-white/10 overflow-hidden flex flex-col my-auto">
            <div className="bg-black p-6 text-white flex justify-between items-center"><h3 className="text-lg font-black uppercase tracking-widest">New Node</h3><button onClick={() => setShowFolderModal(false)} className="opacity-50 hover:opacity-100 transition-opacity border-none bg-transparent"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6"><path d="M18 6L6 18M6 6l12 12" /></svg></button></div>
            <div className="p-6 space-y-4">
              <input autoFocus placeholder="Name..." value={newFolderName} onChange={e => setNewFolderName(e.target.value)} className="w-full bg-slate-100 dark:bg-black/60 p-4 rounded-xl font-bold border dark:border-white/10 text-sm dark:text-white outline-none focus:ring-2 focus:ring-orange-500" />
              <button onClick={handleCreateFolder} disabled={isProcessing} className="w-full bg-orange-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 disabled:opacity-50 transition-all border-none">{isProcessing ? 'Saving...' : 'Create Folder'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Upload/Edit Modal */}
      {(showUploadModal || showEditModal) && (
        <div className="fixed inset-0 z-[200] flex items-start md:items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-fade-in overflow-y-auto">
          <div ref={modalRef} className="bg-[#050505] rounded-[48px] w-full max-w-xl border border-white/10 shadow-[0_32px_128px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col my-auto">
            <header className="p-8 border-b border-white/5 bg-black flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black uppercase tracking-widest text-white">{showUploadModal ? 'Contribute' : 'Edit Metadata'}</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{showUploadModal ? 'Share with community' : 'Refine file info'}</p>
              </div>
              <button onClick={() => { setShowUploadModal(false); setShowEditModal(false); setPendingFile(null); setIsCreatingNew({ program: false, semester: false, subject: false, type: false }); }} className="p-2 text-white/30 hover:text-white transition-colors border-none bg-transparent">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </header>
            <div className="p-8 space-y-6 overflow-y-auto max-h-[60vh] pb-40">
              <div className="space-y-2 relative z-[95]">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Target Program</label>
                {!isCreatingNew.program ? (
                  <NexusDropdown
                    options={availablePrograms}
                    value={metaForm.program}
                    onChange={(val) => {
                      setMetaForm({ ...metaForm, program: val, semester: '', subject: '', type: '' });
                      setSelectedProgram(val);
                    }}
                    placeholder="Select Program"
                    className="w-full"
                    renderCustomMenu={(close) => (
                      <>
                        {availablePrograms.map(opt => (
                          <button key={opt} type="button" onClick={() => { setMetaForm({ ...metaForm, program: opt, semester: '', subject: '', type: '' }); setSelectedProgram(opt); close(); }} className={`w-full text-left px-4 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-between group border-none ${metaForm.program === opt ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-slate-400 hover:text-orange-600 hover:bg-white/5'}`}>
                            {opt}
                            {metaForm.program === opt && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-3.5 h-3.5"><path d="M20 6 9 17 4 12" /></svg>}
                          </button>
                        ))}
                        <button type="button" onClick={() => { setIsCreatingNew({ ...isCreatingNew, program: true }); setMetaForm({ ...metaForm, program: '' }); close(); }} className="w-full text-left px-4 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.15em] text-orange-500 hover:bg-orange-500/10 transition-all border-none flex items-center gap-2 mt-2 border-t border-white/5 pt-4">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M12 5v14M5 12h14" /></svg>
                          Add New Program
                        </button>
                      </>
                    )}
                  />
                ) : (
                  <div className="flex gap-2">
                    <input autoFocus placeholder="New Program Name..." value={metaForm.program} onChange={e => setMetaForm({ ...metaForm, program: e.target.value })} className="flex-1 bg-white/5 p-4 rounded-2xl font-bold border border-orange-500/50 text-white outline-none focus:ring-2 focus:ring-orange-500 text-[10px]" />
                    <button onClick={() => { setIsCreatingNew({ ...isCreatingNew, program: false }); setMetaForm({ ...metaForm, program: '' }); }} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-slate-500 hover:text-white transition-colors"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
                  </div>
                )}
              </div>

              <div className="space-y-2 relative z-[90]">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Document Name</label>
                <input value={metaForm.name} onChange={e => setMetaForm({ ...metaForm, name: e.target.value })} className="w-full bg-white/5 p-4 rounded-2xl font-bold border border-white/5 text-white outline-none focus:ring-2 focus:ring-orange-500" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-[80]">
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Semester</label>
                  {!isCreatingNew.semester ? (
                    <NexusDropdown
                      options={modalSemesters}
                      value={metaForm.semester}
                      onChange={(val) => setMetaForm({ ...metaForm, semester: val, subject: '', type: '' })}
                      placeholder="Select Semester"
                      className="w-full"
                      renderCustomMenu={(close) => (
                        <>
                          {modalSemesters.map(opt => (
                            <button key={opt} type="button" onClick={() => { setMetaForm({ ...metaForm, semester: opt, subject: '', type: '' }); close(); }} className={`w-full text-left px-4 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-between group border-none ${metaForm.semester === opt ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-slate-400 hover:text-orange-600 hover:bg-white/5'}`}>
                              {opt}
                              {metaForm.semester === opt && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-3.5 h-3.5"><path d="M20 6 9 17 4 12" /></svg>}
                            </button>
                          ))}
                          <button type="button" onClick={() => { setIsCreatingNew({ ...isCreatingNew, semester: true }); setMetaForm({ ...metaForm, semester: '' }); close(); }} className="w-full text-left px-4 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.15em] text-orange-500 hover:bg-orange-500/10 transition-all border-none flex items-center gap-2 mt-2 border-t border-white/5 pt-4">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M12 5v14M5 12h14" /></svg>
                            Create New Folder
                          </button>
                        </>
                      )}
                    />
                  ) : (
                    <div className="flex gap-2">
                      <input autoFocus placeholder="New Semester Name..." value={metaForm.semester} onChange={e => setMetaForm({ ...metaForm, semester: e.target.value })} className="flex-1 bg-white/5 p-4 rounded-2xl font-bold border border-orange-500/50 text-white outline-none focus:ring-2 focus:ring-orange-500 text-[10px]" />
                      <button onClick={() => { setIsCreatingNew({ ...isCreatingNew, semester: false }); setMetaForm({ ...metaForm, semester: '' }); }} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-slate-500 hover:text-white transition-colors"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
                    </div>
                  )}
                </div>
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Subject</label>
                  {!isCreatingNew.subject ? (
                    <NexusDropdown
                      options={modalSubjects}
                      value={metaForm.subject}
                      onChange={(val) => setMetaForm({ ...metaForm, subject: val, type: '' })}
                      placeholder="Select Subject"
                      className="w-full"
                      renderCustomMenu={(close) => (
                        <>
                          {modalSubjects.map(opt => (
                            <button key={opt} type="button" onClick={() => { setMetaForm({ ...metaForm, subject: opt, type: '' }); close(); }} className={`w-full text-left px-4 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-between group border-none ${metaForm.subject === opt ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-slate-400 hover:text-orange-600 hover:bg-white/5'}`}>
                              {opt}
                              {metaForm.subject === opt && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-3.5 h-3.5"><path d="M20 6 9 17 4 12" /></svg>}
                            </button>
                          ))}
                          <button type="button" onClick={() => { setIsCreatingNew({ ...isCreatingNew, subject: true }); setMetaForm({ ...metaForm, subject: '' }); close(); }} className="w-full text-left px-4 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.15em] text-orange-500 hover:bg-orange-500/10 transition-all border-none flex items-center gap-2 mt-2 border-t border-white/5 pt-4">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M12 5v14M5 12h14" /></svg>
                            Create New Folder
                          </button>
                        </>
                      )}
                    />
                  ) : (
                    <div className="flex gap-2">
                      <input autoFocus placeholder="New Subject Name..." value={metaForm.subject} onChange={e => setMetaForm({ ...metaForm, subject: e.target.value })} className="flex-1 bg-white/5 p-4 rounded-2xl font-bold border border-orange-500/50 text-white outline-none focus:ring-2 focus:ring-orange-500 text-[10px]" />
                      <button onClick={() => { setIsCreatingNew({ ...isCreatingNew, subject: false }); setMetaForm({ ...metaForm, subject: '' }); }} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-slate-500 hover:text-white transition-colors"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2 relative z-[70]">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Category / Type</label>
                {!isCreatingNew.type ? (
                  <NexusDropdown
                    options={modalCategories}
                    value={metaForm.type}
                    onChange={(val) => setMetaForm({ ...metaForm, type: val })}
                    placeholder="Select Category"
                    className="w-full"
                    renderCustomMenu={(close) => (
                      <>
                        {modalCategories.map(opt => (
                          <button key={opt} type="button" onClick={() => { setMetaForm({ ...metaForm, type: opt }); close(); }} className={`w-full text-left px-4 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-between group border-none ${metaForm.type === opt ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-slate-400 hover:text-orange-600 hover:bg-white/5'}`}>
                            {opt}
                            {metaForm.type === opt && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-3.5 h-3.5"><path d="M20 6 9 17 4 12" /></svg>}
                          </button>
                        ))}
                        <button type="button" onClick={() => { setIsCreatingNew({ ...isCreatingNew, type: true }); setMetaForm({ ...metaForm, type: '' }); close(); }} className="w-full text-left px-4 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.15em] text-orange-500 hover:bg-orange-500/10 transition-all border-none flex items-center gap-2 mt-2 border-t border-white/5 pt-4">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M12 5v14M5 12h14" /></svg>
                          Create New Folder
                        </button>
                      </>
                    )}
                  />
                ) : (
                  <div className="flex gap-2">
                    <input autoFocus placeholder="New Category Name..." value={metaForm.type} onChange={e => setMetaForm({ ...metaForm, type: e.target.value })} className="flex-1 bg-white/5 p-4 rounded-2xl font-bold border border-orange-500/50 text-white outline-none focus:ring-2 focus:ring-orange-500 text-[10px]" />
                    <button onClick={() => { setIsCreatingNew({ ...isCreatingNew, type: false }); setMetaForm({ ...metaForm, type: '' }); }} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-slate-500 hover:text-white transition-colors"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
                  </div>
                )}
              </div>
              <div className="space-y-2 relative z-[50]">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Description</label>
                <textarea rows={3} value={metaForm.description} onChange={e => setMetaForm({ ...metaForm, description: e.target.value })} className="w-full bg-white/5 p-6 rounded-[32px] font-medium border border-white/5 text-slate-300 outline-none focus:ring-2 focus:ring-orange-500 resize-none italic" />
              </div>
            </div>
            <footer className="p-8 bg-black border-t border-white/5">
              <button
                onClick={showUploadModal ? handleUpload : handleEditSubmission}
                disabled={isProcessing || !metaForm.name || !metaForm.semester || !metaForm.subject}
                className="w-full bg-orange-600 text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-[0_12px_48px_rgba(234,88,12,0.3)] hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all border-none"
              >
                {isProcessing ? 'Processing...' : showUploadModal ? 'Submit Verification' : 'Update Record'}
              </button>
            </footer>
          </div>
        </div>
      )}

      <input type="file" ref={fileInputRef} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setPendingFile(f); setMetaForm(p => ({ ...p, name: f.name.replace(/\.[^/.]+$/, ""), description: '', semester: activeSemester?.name || '', subject: activeSubject?.name || '', type: activeCategory?.name || '', program: selectedProgram === 'All' ? availablePrograms[0] : selectedProgram })); setShowUploadModal(true); } }} />

      {viewerInfo.show && (
        <PDFViewer
          url={viewerInfo.url}
          fileName={viewerInfo.name}
          onClose={() => setViewerInfo({ show: false, url: '', name: '' })}
        />
      )}
    </div>
  );
};

const FileCard: React.FC<{
  file: LibraryFile;
  userProfile: UserProfile | null;
  isAdminMode: boolean;
  isPersonal?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  onDemote?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAccess: () => void;
  onShowDetails: () => void;
}> = ({ file, userProfile, isAdminMode, isPersonal, onApprove, onReject, onDemote, onEdit, onDelete, onAccess, onShowDetails }) => {
  const isAdmin = userProfile?.is_admin || false;
  const statusConfig = {
    pending: { label: 'Queued', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    approved: { label: 'Verified', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    rejected: { label: 'Redacted', color: 'text-red-500', bg: 'bg-red-500/10' }
  };
  const status = statusConfig[file.status] || statusConfig.pending;

  return (
    <div onClick={onShowDetails} className="group p-5 rounded-[30px] border border-slate-100 dark:border-white/5 bg-white dark:bg-black/40 hover:border-orange-500 hover:shadow-xl transition-all relative overflow-hidden flex flex-col min-h-[160px] cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <div className="w-9 h-9 bg-slate-100 dark:bg-black rounded-xl flex items-center justify-center group-hover:text-orange-500 transition-colors"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg></div>
      </div>
      <h3 className="text-xs md:text-sm font-black text-slate-800 dark:text-white tracking-tight leading-tight line-clamp-2 mb-2 group-hover:text-orange-500 transition-colors">{file.name}</h3>
      <div className="pt-3 mt-auto border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{file.size}</span>
        <div className="flex gap-1.5">
          {isAdminMode ? (
            <div className="flex gap-1.5">
              {file.status !== 'approved' && (
                <button onClick={(e) => { e.stopPropagation(); onApprove?.(); }} className="w-8 h-8 bg-black text-emerald-500 rounded-lg flex items-center justify-center shadow-lg hover:bg-emerald-500 hover:text-white transition-all border-none" title="Approve">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><polyline points="20 6 9 17 4 12" /></svg>
                </button>
              )}
              <button onClick={(e) => { e.stopPropagation(); onEdit?.(); }} className="w-8 h-8 bg-black text-orange-500 rounded-lg flex items-center justify-center shadow-lg hover:bg-orange-500 hover:text-white transition-all border-none" title="Edit Metadata">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              </button>
              {file.status === 'approved' ? (
                <button onClick={(e) => { e.stopPropagation(); onDemote?.(); }} className="w-8 h-8 bg-black text-orange-500 rounded-lg flex items-center justify-center shadow-lg hover:bg-orange-500 hover:text-white transition-all border-none" title="Demote to Pending">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                </button>
              ) : (
                <button onClick={(e) => { e.stopPropagation(); onReject?.(); }} className="w-8 h-8 bg-black text-red-500 rounded-lg flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-all border-none" title="Reject & Remove">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              )}
            </div>
          ) : isAdmin ? (
            <div className="flex gap-1.5">
              <button onClick={(e) => { e.stopPropagation(); onEdit?.(); }} className="w-8 h-8 bg-black text-orange-600 rounded-lg flex items-center justify-center shadow-lg hover:bg-orange-600 hover:text-white transition-all border-none" title="Edit Metadata"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button>
              <button onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className="w-8 h-8 bg-black text-red-500 rounded-lg flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-all border-none" title="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg></button>
              <button onClick={(e) => { e.stopPropagation(); onAccess(); }} className="w-8 h-8 bg-black text-emerald-500 rounded-lg flex items-center justify-center shadow-lg hover:bg-emerald-500 hover:text-white transition-all border-none" title="Access File"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg></button>
            </div>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); onAccess(); }} className="bg-slate-100 dark:bg-black text-orange-600 px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 hover:bg-orange-600 hover:text-white transition-all shadow-md border-none">Access <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg></button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentLibrary;
