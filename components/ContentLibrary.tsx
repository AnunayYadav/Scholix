
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { LibraryFile, UserProfile, Folder } from '../types.ts';
import NexusServer from '../services/nexusServer.ts';
import PDFViewer from './PDFViewer.tsx';
import NexusDropdown from './NexusDropdown.tsx';
import { showToast, showConfirm } from './Toast.tsx';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  TouchSensor,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
  const [pendingUploads, setPendingUploads] = useState<{
    file: File;
    name: string;
    description: string;
    semester: string;
    subject: string;
    type: string;
    program: string;
  }[]>([]);
  const [activeUploadIndex, setActiveUploadIndex] = useState(0);
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

  const handleFilesSelected = useCallback((files: FileList | File[], forceProgram?: string, forceSemester?: string, forceSubject?: string, forceType?: string) => {
    const newUploads = Array.from(files).map(f => ({
      file: f,
      name: f.name.replace(/\.[^/.]+$/, ""),
      description: '',
      semester: forceSemester || activeSemester?.name || '',
      subject: forceSubject || activeSubject?.name || '',
      type: forceType || activeCategory?.name || '',
      program: forceProgram || selectedProgram
    }));

    setPendingUploads(prev => [...prev, ...newUploads]);
    if (pendingUploads.length === 0) {
      setActiveUploadIndex(0);
      const first = newUploads[0];
      setMetaForm({
        name: first.name,
        description: first.description,
        semester: first.semester,
        subject: first.subject,
        type: first.type,
        program: first.program
      });
    }
    setShowUploadModal(true);
  }, [activeSemester, activeSubject, activeCategory, selectedProgram, availablePrograms, pendingUploads.length]);

  // Sync current metaForm back to pendingUploads
  useEffect(() => {
    if (showUploadModal && pendingUploads.length > 0) {
      setPendingUploads(prev => {
        const next = [...prev];
        if (next[activeUploadIndex]) {
          next[activeUploadIndex] = { ...next[activeUploadIndex], ...metaForm };
        }
        return next;
      });
    }
  }, [metaForm, showUploadModal, activeUploadIndex]);

  const switchActiveUpload = (index: number) => {
    const target = pendingUploads[index];
    if (target) {
      setActiveUploadIndex(index);
      setMetaForm({
        name: target.name,
        description: target.description,
        semester: target.semester,
        subject: target.subject,
        type: target.type,
        program: target.program
      });
    }
  };

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
      // Primary sort: display_order
      const orderA = a.display_order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.display_order ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;

      // Secondary sort: user selected criteria
      if (sortBy === 'newest') return b.uploadDate - a.uploadDate;
      if (sortBy === 'oldest') return a.uploadDate - b.uploadDate;
      if (sortBy === 'az') return a.name.localeCompare(b.name);
      return 0;
    });
    return data;
  }, [allFiles, searchQuery, isAdminView, viewMode, activeSemester, activeSubject, activeCategory, sortBy]);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: any) => {
    if (!userProfile?.is_admin) return;
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id || !userProfile?.is_admin) return;

    const oldIndex = allFiles.findIndex(f => f.id === active.id);
    const newIndex = allFiles.findIndex(f => f.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const movedFiles = arrayMove(allFiles, oldIndex, newIndex) as LibraryFile[];

    // Update display_order in local state so the .sort() in useMemo reflects the new order immediately
    const updatedFiles = movedFiles.map((f, index) => ({
      ...f,
      display_order: index
    }));

    // Update local state for immediate feedback
    setAllFiles(updatedFiles);

    // Persist to DB
    try {
      const fileOrders = updatedFiles.map((f, index) => ({ id: f.id, order: index }));
      await NexusServer.reorderFiles(fileOrders);
      showToast("Order synchronized", "success");
    } catch (e: any) {
      showToast("Failed to save order: " + e.message, "error");
      fetchFromSource(false); // Revert on failure
    }
  };

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
    } catch (e: any) { showToast(e.message, 'error'); } finally { setIsProcessing(false); }
  };

  const handleUpload = async () => {
    if (pendingUploads.length === 0 || !userProfile) return;
    setIsProcessing(true);
    try {
      // Use the latest state of pendingUploads
      for (const upload of pendingUploads) {
        await NexusServer.uploadFile(
          upload.file,
          upload.name.trim(),
          upload.description.trim(),
          upload.subject.trim(),
          upload.semester.trim(),
          upload.type.trim(),
          userProfile.id,
          userProfile.is_admin,
          upload.program.trim()
        );

        if (!availablePrograms.includes(upload.program)) {
          setAvailablePrograms(prev => [...prev, upload.program]);
        }
      }

      setShowUploadModal(false);
      setPendingUploads([]);
      fetchFromSource(false);
    } catch (e: any) {
      showToast(`Upload failed: ${e.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditSubmission = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    try {
      await NexusServer.requestUpdate(selectedFile.id, metaForm, userProfile?.is_admin || false);
      setShowEditModal(false);
      setSelectedFile(null);
      fetchFromSource(false);
    } catch (e: any) { showToast(e.message, 'error'); } finally { setIsProcessing(false); }
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
    } catch (e: any) { showToast(e.message, 'error'); } finally { setIsProcessing(false); }
  };

  const handleDeleteFolder = async (folder: Folder, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userProfile?.is_admin) return;
    const confirmed = await showConfirm(`Permanently delete node "${folder.name}"?`);
    if (!confirmed) return;
    setIsProcessing(true);
    try {
      await NexusServer.deleteFolder(folder.id);
      fetchFromSource(false);
    } catch (e: any) { showToast(e.message, 'error'); } finally { setIsProcessing(false); }
  };

  const toggleAdminView = () => {
    const nextAdminState = !isAdminView;
    setIsAdminView(nextAdminState);
    if (nextAdminState) {
      setSelectedProgram(userProfile?.program || availablePrograms[0]);
    } else {
      setSelectedProgram(userProfile?.program || availablePrograms[0]);
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
      showToast("Error accessing file: " + e.message, 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4 md:px-0">
      <div className="space-y-6 animate-fade-in">
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
            <button onClick={() => { if (!userProfile) { showToast("Sign in required.", "info"); return; } fileInputRef.current?.click(); }} className="px-5 py-2 bg-orange-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-600/20 border-none hover:scale-105 active:scale-95 transition-all flex items-center gap-2"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>Contribute {pendingUploads.length > 0 && `(${pendingUploads.length})`}</button>
          </div>
        </header>

        <div className="flex gap-2 w-full flex-col md:flex-row">
          <div className="flex-1 flex gap-2">
            <NexusDropdown
              options={availablePrograms}
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
          <div className="relative">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={displayFiles.map(f => f.id)}
                strategy={rectSortingStrategy}
                disabled={!userProfile?.is_admin}
              >
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                  {currentFolders.map(folder => (
                    <div key={folder.id} onDragOver={(e) => { if (!userProfile?.is_admin) return; e.preventDefault(); setDraggingOverId(folder.id); }} onDragLeave={() => setDraggingOverId(null)} onDrop={(e) => { if (!userProfile?.is_admin) return; e.preventDefault(); setDraggingOverId(null); const droppedFiles = e.dataTransfer.files; if (droppedFiles && droppedFiles.length > 0) { handleFilesSelected(droppedFiles, folder.program, folder.type === 'semester' ? folder.name : activeSemester?.name, folder.type === 'subject' ? folder.name : activeSubject?.name, folder.type === 'category' ? folder.name : ''); } }} onClick={() => { if (folder.type === 'semester') navigateTo(folder, null, null); else if (folder.type === 'subject') navigateTo(activeSemester, folder, null); else if (folder.type === 'category') navigateTo(activeSemester, activeSubject, folder); }} className={`group p-5 rounded-[30px] border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-center min-h-[140px] ${draggingOverId === folder.id ? 'border-orange-500 bg-orange-500/10 scale-105 shadow-xl z-10' : 'border-slate-100 dark:border-white/5 bg-white dark:bg-black/40 hover:border-orange-500/50 hover:shadow-lg'}`}>
                      {userProfile?.is_admin && (
                        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          <button onClick={(e) => { e.stopPropagation(); setFolderToManage(folder); setNewFolderName(folder.name); setShowRenameModal(true); }} className="p-1.5 bg-slate-100 dark:bg-black rounded-lg text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-900 transition-colors shadow-sm border-none"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button>
                          <button onClick={(e) => handleDeleteFolder(folder, e)} className="p-1.5 bg-slate-100 dark:bg-black rounded-lg text-red-500 hover:bg-red dark:hover:bg-slate-900 transition-colors shadow-sm border-none"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg></button>
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
                          showToast("Approval error: " + e.message, 'error');
                        } finally {
                          setIsProcessing(false);
                        }
                      }}
                      onReject={async () => { const confirmed = await showConfirm("Reject and remove this file?"); if (confirmed) { setIsProcessing(true); NexusServer.rejectFile(file.id).then(() => fetchFromSource(false)).finally(() => setIsProcessing(false)); } }}
                      onDemote={async () => { const confirmed = await showConfirm("Send this file back to pending review?"); if (confirmed) { setIsProcessing(true); NexusServer.demoteFile(file.id).then(() => fetchFromSource(false)).finally(() => setIsProcessing(false)); } }}
                      onEdit={() => { setSelectedFile(file); setMetaForm({ name: file.name, description: file.description || '', semester: file.semester, subject: file.subject, type: file.type }); setShowEditModal(true); }}
                      onDelete={async () => { const confirmed = await showConfirm("Permanently delete this file?"); if (confirmed) { setIsProcessing(true); NexusServer.deleteFile(file.id, file.storage_path).then(() => fetchFromSource(false)).finally(() => setIsProcessing(false)); } }}
                      onAccess={() => handleFileAccess(file)}
                      onShowDetails={() => { setSelectedFile(file); setShowDetailsModal(true); }}
                    />
                  ))}
                  {displayFiles.length === 0 && currentFolders.length === 0 && !isLoading && <div className="col-span-full py-20 text-center text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] opacity-40">No files found.</div>}
                </div>
              </SortableContext>

              {createPortal(
                <DragOverlay dropAnimation={{
                  sideEffects: defaultDropAnimationSideEffects({
                    styles: {
                      active: {
                        opacity: '0.4',
                      },
                    },
                  }),
                }}>
                  {activeId ? (
                    <div className="scale-105 shadow-2xl opacity-90 cursor-grabbing overflow-hidden rounded-[30px] border border-orange-500/50 bg-white dark:bg-black w-[200px] md:w-[220px]">
                      <StaticFileCard
                        file={displayFiles.find(f => f.id === activeId)!}
                        userProfile={userProfile}
                        isAdminMode={isAdminView}
                      />
                    </div>
                  ) : null}
                </DragOverlay>,
                document.body
              )}
            </DndContext>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedFile && (
        <div className="modal-overlay">
          <div ref={modalRef} className="nexus-modal w-full max-w-lg">
            <header className="p-6 md:p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/20 flex items-start justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-600/10 flex items-center justify-center text-orange-500 border border-orange-600/20">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                  </div>
                </div>
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-tight">{selectedFile.name}</h3>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="p-2 text-white/30 hover:text-white transition-colors border-none bg-transparent">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 no-scrollbar">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Semester', val: selectedFile.semester },
                  { label: 'Subject', val: selectedFile.subject },
                  { label: 'Category', val: selectedFile.type },
                  { label: 'File Size', val: selectedFile.size }
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">{item.label}</p>
                    <p className="text-xs font-black uppercase tracking-tight text-slate-800 dark:text-white">{item.val || 'N/A'}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Description</h4>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic bg-slate-50 dark:bg-white/5 p-6 rounded-3xl border border-slate-100 dark:border-white/5">
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
                  <p className="text-xs font-black uppercase text-slate-800 dark:text-white">{new Date(selectedFile.uploadDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <footer className="p-6 md:p-8 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5 flex gap-4">
              <button onClick={() => setShowDetailsModal(false)} className="flex-1 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">Discard</button>
              {selectedFile.status === 'approved' && (
                <button onClick={() => { setShowDetailsModal(false); handleFileAccess(selectedFile); }} className="flex-[2] py-3 bg-orange-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl active:scale-95 transition-all border-none">View Document ↗</button>
              )}
            </footer>
          </div>
        </div>
      )}

      {showFolderModal && userProfile?.is_admin && (
        <div className="modal-overlay">
          <div ref={modalRef} className="nexus-modal w-full max-w-sm">
            <div className="bg-slate-50 dark:bg-black/20 p-6 flex justify-between items-center border-b border-slate-100 dark:border-white/5"><h3 className="text-sm font-black uppercase tracking-widest">New Node</h3><button onClick={() => setShowFolderModal(false)} className="opacity-50 hover:opacity-100 transition-opacity border-none bg-transparent dark:text-white"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6"><path d="M18 6L6 18M6 6l12 12" /></svg></button></div>
            <div className="p-6 space-y-4">
              <input autoFocus placeholder="Name..." value={newFolderName} onChange={e => setNewFolderName(e.target.value)} className="w-full bg-slate-100 dark:bg-black/60 p-4 rounded-xl font-bold border dark:border-white/10 text-sm dark:text-white outline-none focus:ring-2 focus:ring-orange-500" />
              <button onClick={handleCreateFolder} disabled={isProcessing} className="w-full bg-orange-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 disabled:opacity-50 transition-all border-none">{isProcessing ? 'Saving...' : 'Create Folder'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Upload/Edit Modal */}
      {(showUploadModal || showEditModal) && (
        <div className="modal-overlay">
          <div ref={modalRef} className={`nexus-modal w-full ${showUploadModal ? 'max-w-4xl' : 'max-w-sm'} overflow-hidden`}>
            <header className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/20 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black uppercase tracking-widest leading-none">{showUploadModal ? 'Contribute Library' : 'Metadata Edit'}</h3>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2">
                  {showUploadModal ? `Batch Processing: ${pendingUploads.length} File${pendingUploads.length > 1 ? 's' : ''}` : 'Refine file parameters'}
                </p>
              </div>
              <button onClick={() => { setShowUploadModal(false); setShowEditModal(false); setPendingUploads([]); setIsCreatingNew({ program: false, semester: false, subject: false, type: false }); }} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors border-none bg-transparent">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </header>

            <div className={`flex flex-col md:flex-row flex-1 min-h-0 md:h-[60vh]`}>
              {showUploadModal && (
                <div className="w-full md:w-64 border-r border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/10 overflow-y-auto no-scrollbar border-b md:border-b-0">
                  <div className="p-4 space-y-2">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-2 mb-3">Pending Files</p>
                    {pendingUploads.map((up, idx) => (
                      <button
                        key={idx}
                        onClick={() => switchActiveUpload(idx)}
                        className={`w-full text-left p-4 rounded-2xl transition-all border-none relative group ${activeUploadIndex === idx ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'hover:bg-orange-500/5 text-slate-500 hover:text-orange-500'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${activeUploadIndex === idx ? 'bg-white/20' : 'bg-slate-100 dark:bg-black'}`}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-tight truncate">{up.name || up.file.name}</p>
                            <p className={`text-[8px] font-bold opacity-60 truncate ${activeUploadIndex === idx ? 'text-white' : 'text-slate-400'}`}>{(up.file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          {activeUploadIndex === idx && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                          )}
                        </div>
                        {pendingUploads.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const nextUploads = pendingUploads.filter((_, i) => i !== idx);
                              if (nextUploads.length === 0) {
                                setShowUploadModal(false);
                                setPendingUploads([]);
                              } else {
                                setPendingUploads(nextUploads);
                                if (activeUploadIndex >= nextUploads.length) setActiveUploadIndex(nextUploads.length - 1);
                                else switchActiveUpload(activeUploadIndex === idx ? (idx === 0 ? 0 : idx - 1) : (activeUploadIndex > idx ? activeUploadIndex - 1 : activeUploadIndex));
                              }
                            }}
                            className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all border-none bg-transparent"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                          </button>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 custom-scrollbar bg-white dark:bg-black/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 relative z-[95]">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Target Program</label>
                    {!isCreatingNew.program ? (
                      <NexusDropdown
                        options={availablePrograms}
                        value={metaForm.program}
                        onChange={(val) => {
                          setMetaForm({ ...metaForm, program: val, semester: '', subject: '', type: '' });
                        }}
                        placeholder="Select Program"
                        className="w-full"
                        renderCustomMenu={(close) => (
                          <>
                            {availablePrograms.map(opt => (
                              <button key={opt} type="button" onClick={() => { setMetaForm({ ...metaForm, program: opt, semester: '', subject: '', type: '' }); close(); }} className={`w-full text-left px-4 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-between group border-none ${metaForm.program === opt ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-slate-400 hover:text-orange-600 hover:bg-white/5'}`}>
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
                        <input autoFocus placeholder="New Program..." value={metaForm.program} onChange={e => setMetaForm({ ...metaForm, program: e.target.value })} className="flex-1 bg-white/5 p-4 rounded-2xl font-bold border border-orange-500/50 text-white outline-none focus:ring-2 focus:ring-orange-500 text-[10px]" />
                        <button onClick={() => { setIsCreatingNew({ ...isCreatingNew, program: false }); setMetaForm({ ...metaForm, program: '' }); }} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-slate-500 hover:text-white transition-colors border-none"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 relative z-[90]">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Document Title</label>
                    <input value={metaForm.name} onChange={e => setMetaForm({ ...metaForm, name: e.target.value })} className="w-full bg-slate-100 dark:bg-black/40 p-4 rounded-2xl font-bold border border-transparent dark:border-white/5 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 transition-all" />
                  </div>

                  <div className="space-y-2 relative z-[80]">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Semester</label>
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
                        <input autoFocus placeholder="New Sem..." value={metaForm.semester} onChange={e => setMetaForm({ ...metaForm, semester: e.target.value })} className="flex-1 bg-white/5 p-4 rounded-2xl font-bold border border-orange-500/50 text-white outline-none focus:ring-2 focus:ring-orange-500 text-[10px]" />
                        <button onClick={() => { setIsCreatingNew({ ...isCreatingNew, semester: false }); setMetaForm({ ...metaForm, semester: '' }); }} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-slate-500 hover:text-white transition-colors border-none"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 relative z-[75]">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Subject</label>
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
                        <input autoFocus placeholder="New Subject..." value={metaForm.subject} onChange={e => setMetaForm({ ...metaForm, subject: e.target.value })} className="flex-1 bg-white/5 p-4 rounded-2xl font-bold border border-orange-500/50 text-white outline-none focus:ring-2 focus:ring-orange-500 text-[10px]" />
                        <button onClick={() => { setIsCreatingNew({ ...isCreatingNew, subject: false }); setMetaForm({ ...metaForm, subject: '' }); }} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-slate-500 hover:text-white transition-colors border-none"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 relative z-[70]">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Category / Type</label>
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
                        <input autoFocus placeholder="New Category..." value={metaForm.type} onChange={e => setMetaForm({ ...metaForm, type: e.target.value })} className="flex-1 bg-white/5 p-4 rounded-2xl font-bold border border-orange-500/50 text-white outline-none focus:ring-2 focus:ring-orange-500 text-[10px]" />
                        <button onClick={() => { setIsCreatingNew({ ...isCreatingNew, type: false }); setMetaForm({ ...metaForm, type: '' }); }} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-slate-500 hover:text-white transition-colors border-none"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 relative z-[50] md:col-span-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Short Description</label>
                    <textarea rows={2} value={metaForm.description} onChange={e => setMetaForm({ ...metaForm, description: e.target.value })} className="w-full bg-slate-100 dark:bg-black/40 p-4 rounded-3xl font-medium border border-transparent dark:border-white/5 text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-orange-500 resize-none italic text-xs transition-all" placeholder="Tell us more about this file..." />
                  </div>
                </div>
              </div>
            </div>

            <footer className="p-6 md:p-8 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row gap-4">
              {showUploadModal && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-4 bg-slate-100 dark:bg-black text-slate-400 hover:text-orange-500 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-none"
                >
                  Add More
                </button>
              )}
              <button
                onClick={showUploadModal ? handleUpload : handleEditSubmission}
                disabled={isProcessing || !metaForm.name || !metaForm.semester || !metaForm.subject || (showUploadModal && pendingUploads.some(u => !u.name || !u.semester || !u.subject))}
                className="flex-1 bg-orange-600 text-white py-4 rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(234,88,12,0.3)] hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all border-none"
              >
                {isProcessing ? 'Processing Batch...' : showUploadModal ? `Upload ${pendingUploads.length} Item${pendingUploads.length > 1 ? 's' : ''}` : 'Update Record'}
              </button>
            </footer>
          </div>
        </div>
      )}

      <input type="file" ref={fileInputRef} className="hidden" multiple onChange={e => { const files = e.target.files; if (files && files.length > 0) handleFilesSelected(files); }} />

      {viewerInfo.show && (
        <PDFViewer
          url={viewerInfo.url}
          fileName={viewerInfo.name}
          userProfile={userProfile}
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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.3 : 1,
  };

  const isAdmin = userProfile?.is_admin || false;
  const statusConfig = {
    pending: { label: 'Queued', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    approved: { label: 'Verified', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    rejected: { label: 'Redacted', color: 'text-red-500', bg: 'bg-red-500/10' }
  };
  const status = statusConfig[file.status] || statusConfig.pending;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onShowDetails}
      className={`group p-5 rounded-[30px] border border-slate-100 dark:border-white/5 bg-white dark:bg-black/40 hover:border-orange-500 hover:shadow-xl transition-all relative overflow-hidden flex flex-col min-h-[160px] cursor-pointer ${isDragging ? 'shadow-2xl border-orange-500 ring-2 ring-orange-500/20' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="w-9 h-9 bg-slate-100 dark:bg-black rounded-xl flex items-center justify-center group-hover:text-orange-500 transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
        </div>
        {isAdmin && (
          <div
            {...attributes}
            {...listeners}
            className="p-2 -mr-2 text-slate-300 hover:text-orange-500 cursor-grab active:cursor-grabbing transition-colors"
            onClick={(e) => e.stopPropagation()}
            title="Drag to reorder"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>
          </div>
        )}
      </div>
      <h3 className="text-[11px] md:text-[13px] font-black text-slate-800 dark:text-white tracking-tight leading-tight line-clamp-2 mb-2 group-hover:text-orange-500 transition-colors uppercase">{file.name}</h3>
      <div className="pt-3 mt-auto border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{file.size}</span>
        <div className="flex gap-1.5 peer">
          {isAdminMode ? (
            <div className="flex gap-1.5">
              {file.status !== 'approved' && (
                <button onClick={(e) => { e.stopPropagation(); onApprove?.(); }} className="w-8 h-8 bg-slate-100 dark:bg-black text-emerald-500 rounded-lg flex items-center justify-center shadow-lg hover:bg-emerald-500 hover:text-white transition-all border-none" title="Approve">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><polyline points="20 6 9 17 4 12" /></svg>
                </button>
              )}
              <button onClick={(e) => { e.stopPropagation(); onEdit?.(); }} className="w-8 h-8 bg-slate-100 dark:bg-black text-orange-500 rounded-lg flex items-center justify-center shadow-lg hover:bg-orange-500 hover:text-white transition-all border-none" title="Edit Metadata">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              </button>
              {file.status === 'approved' ? (
                <button onClick={(e) => { e.stopPropagation(); onDemote?.(); }} className="w-8 h-8 bg-slate-100 dark:bg-black text-orange-500 rounded-lg flex items-center justify-center shadow-lg hover:bg-orange-500 hover:text-white transition-all border-none" title="Demote to Pending">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                </button>
              ) : (
                <button onClick={(e) => { e.stopPropagation(); onReject?.(); }} className="w-8 h-8 bg-slate-100 dark:bg-black text-red-500 rounded-lg flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-all border-none" title="Reject & Remove">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              )}
            </div>
          ) : isAdmin ? (
            <div className="flex gap-1.5">
              <button onClick={(e) => { e.stopPropagation(); onEdit?.(); }} className="w-8 h-8 bg-slate-100 dark:bg-black text-orange-600 rounded-lg flex items-center justify-center shadow-lg hover:bg-orange-600 hover:text-white transition-all border-none" title="Edit Metadata"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button>
              <button onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className="w-8 h-8 bg-slate-100 dark:bg-black text-red-500 rounded-lg flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-all border-none" title="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg></button>
              <button onClick={(e) => { e.stopPropagation(); onAccess(); }} className="w-8 h-8 bg-slate-100 dark:bg-black text-emerald-500 rounded-lg flex items-center justify-center shadow-lg hover:bg-emerald-500 hover:text-white transition-all border-none" title="Access File"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg></button>
            </div>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); onAccess(); }} className="bg-slate-100 dark:bg-black text-orange-600 px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 hover:bg-orange-600 hover:text-white transition-all shadow-md border-none">Access <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg></button>
          )}
        </div>
      </div>
    </div>
  );
};

// Static version of FileCard for the Drag Overlay to avoid hook issues
const StaticFileCard: React.FC<{
  file: LibraryFile;
  userProfile: UserProfile | null;
  isAdminMode: boolean;
}> = ({ file, userProfile, isAdminMode }) => {
  const isAdmin = userProfile?.is_admin || false;
  return (
    <div className="p-5 rounded-[30px] border border-orange-500 bg-white dark:bg-black/60 flex flex-col min-h-[160px]">
      <div className="flex items-start justify-between mb-2">
        <div className="w-9 h-9 bg-slate-100 dark:bg-black rounded-xl flex items-center justify-center text-orange-500">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
        </div>
        {isAdmin && (
          <div className="p-2 -mr-2 text-orange-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>
          </div>
        )}
      </div>
      <h3 className="text-[11px] md:text-[13px] font-black text-slate-800 dark:text-white tracking-tight leading-tight line-clamp-2 mb-2 uppercase">{file.name}</h3>
      <div className="pt-3 mt-auto border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{file.size}</span>
      </div>
    </div>
  );
};

export default ContentLibrary;
