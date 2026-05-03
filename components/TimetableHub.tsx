
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { UserProfile, TimetableData, DaySchedule, TimetableSlot } from '../types.ts';
import NexusServer from '../services/nexusServer.ts';
import { extractTimetableWithTesseract } from '../services/ocrService.ts';
import NexusDropdown from './NexusDropdown.tsx';
import { useUniversity } from '../hooks/useUniversity.tsx';
import { showToast, showConfirm } from './Toast.tsx';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const timeToMinutes = (timeStr: string) => {
  if (!timeStr) return 0;
  // Handle both "09:00 AM" and "14:00" and "02:00"
  const parts = timeStr.trim().split(' ');
  const time = parts[0];
  const modifier = parts[1]?.toUpperCase();

  let [hours, minutes] = time.split(':').map(Number);
  
  if (modifier) {
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
  } else {
    // Heuristic for university: 1-7 is likely PM
    if (hours >= 1 && hours < 8) hours += 12;
  }
  
  return hours * 60 + minutes;
};

const minutesToTime = (mins: number) => {
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; // the hour '0' should be '12'
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
};

const TimetableHub: React.FC<{ userProfile: UserProfile | null }> = ({ userProfile }) => {
  const { university } = useUniversity();
  const [activeDay, setActiveDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }) === 'Sunday' ? 'Monday' : new Date().toLocaleDateString('en-US', { weekday: 'long' }));
  const [myTimetable, setMyTimetable] = useState<TimetableData | null>(null);
  const [friendTimetables, setFriendTimetables] = useState<TimetableData[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string>('me');

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isClosingUpload, setIsClosingUpload] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [isClosingRename, setIsClosingRename] = useState(false);
  const [showMetadataModal, setShowMetadataModal] = useState(false);
  const [isClosingMetadata, setIsClosingMetadata] = useState(false);
  
  const [renameTargetId, setRenameTargetId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [targetForAction, setTargetForAction] = useState<'me' | 'friend'>('me');
  const [currentTime, setCurrentTime] = useState(new Date());

  const [pendingTimetable, setPendingTimetable] = useState<DaySchedule[] | null>(null);
  const [metadata, setMetadata] = useState({ section: '', year: '', branch: '', semester: '' });
  const [communityPresets, setCommunityPresets] = useState<any[]>([]);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedFriends = localStorage.getItem('nexus_timetable_friends');
    if (savedFriends) {
      try { setFriendTimetables(JSON.parse(savedFriends)); } catch (e) { }
    }
    const savedMe = localStorage.getItem('nexus_timetable_me');
    if (savedMe) {
      try { setMyTimetable(JSON.parse(savedMe)); } catch (e) { }
    }
    loadCommunityPresets();
  }, []);

  useEffect(() => {
    localStorage.setItem('nexus_timetable_friends', JSON.stringify(friendTimetables));
  }, [friendTimetables]);

  useEffect(() => {
    if (myTimetable) {
      localStorage.setItem('nexus_timetable_me', JSON.stringify(myTimetable));
    }
  }, [myTimetable]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!myTimetable && userProfile) loadMyTimetableFromServer();
  }, [userProfile]);

  const loadCommunityPresets = async () => {
    try {
      const data = await NexusServer.getTimetablePresets();
      setCommunityPresets(data || []);
    } catch (e) {
      console.error("Failed to load presets", e);
    }
  };

  const loadMyTimetableFromServer = async () => {
    const records = await NexusServer.fetchRecords(userProfile?.id || null, 'timetable_main');
    if (records && records.length > 0) {
      setMyTimetable(records[0].content);
    } else {
      setMyTimetable({ ownerId: userProfile?.id || 'local-me', ownerName: userProfile?.username || 'My Profile', schedule: [] });
    }
  };

  const handleCloseUpload = () => {
    setIsClosingUpload(true);
    setTimeout(() => {
      setShowUploadModal(false);
      setIsClosingUpload(false);
    }, 250);
  };

  const handleCloseRename = () => {
    setIsClosingRename(true);
    setTimeout(() => {
      setShowRenameModal(false);
      setIsClosingRename(false);
      setRenameTargetId(null);
      setNewName('');
    }, 250);
  };

  const handleCloseMetadata = () => {
    setIsClosingMetadata(true);
    setTimeout(() => {
      setShowMetadataModal(false);
      setIsClosingMetadata(false);
      setEditingPresetId(null);
    }, 250);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingAI(true);
    setOcrProgress(0);
    const combinedSchedules: DaySchedule[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        setProcessingStatus(`Analyzing Image ${i + 1}/${files.length}...`);
        
        const daySchedules = await extractTimetableWithTesseract(files[i], (p) => {
          const overallProgress = ((i / files.length) + (p / files.length)) * 100;
          setOcrProgress(overallProgress);
        });

        daySchedules.forEach(newDay => {
          const existing = combinedSchedules.find(s => s.day === newDay.day);
          if (existing) {
            existing.slots = [...existing.slots, ...newDay.slots].filter((v, i, a) => 
              a.findIndex(t => t.startTime === v.startTime) === i
            );
            existing.slots.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
          } else {
            newDay.slots.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
            combinedSchedules.push(newDay);
          }
        });
      }

      if (combinedSchedules.length === 0) {
        throw new Error("No timetable data found in images.");
      }

      setPendingTimetable(combinedSchedules);
      setEditingPresetId(null);
      setMetadata({ section: '', year: '', branch: '', semester: '' });
      handleCloseUpload();
      setShowMetadataModal(true);
    } catch (err) {
      console.error(err);
      showToast("Unable to read timetable. Please ensure screenshots are clear.", "error");
    } finally {
      setIsProcessingAI(false);
      setOcrProgress(0);
      setProcessingStatus('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const applyPreset = async (batch: any, targetId?: string) => {
    const data: TimetableData = {
      ownerId: targetId || (targetForAction === 'me' ? (userProfile?.id || 'local-me') : `friend-${Math.random().toString(36).substr(2, 9)}`),
      ownerName: batch.name || `${batch.section} ${batch.branch}`,
      schedule: batch.schedule,
      section: batch.section,
      year: batch.year,
      branch: batch.branch,
      semester: batch.semester
    };

    if (targetForAction === 'me' && !targetId) {
      await NexusServer.saveRecord(userProfile?.id || null, 'timetable_main', data.ownerName, data);
      setMyTimetable(data);
      setSelectedEntityId('me');
    } else {
      setFriendTimetables(prev => {
        const exists = prev.find(f => f.ownerId === data.ownerId);
        if (exists) return prev.map(f => f.ownerId === data.ownerId ? data : f);
        return [...prev, data];
      });
      setSelectedEntityId(data.ownerId);
    }
    showToast(`Loaded ${data.ownerName}`, "success");
  };

  const activeTimetable = useMemo(() => {
    if (selectedEntityId === 'me') return myTimetable;
    return friendTimetables.find(f => f.ownerId === selectedEntityId) || null;
  }, [selectedEntityId, myTimetable, friendTimetables]);

  const daySlotsWithBreaks = useMemo(() => {
    if (!activeTimetable || !activeTimetable.schedule) return [];
    const dayData = activeTimetable.schedule.find(s => s.day === activeDay);
    if (!dayData || dayData.slots.length === 0) return [];

    const sorted = [...dayData.slots].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    const result: TimetableSlot[] = [];

    for (let i = 0; i < sorted.length; i++) {
      result.push(sorted[i]);
      if (i < sorted.length - 1) {
        const currentEnd = timeToMinutes(sorted[i].endTime);
        const nextStart = timeToMinutes(sorted[i + 1].startTime);
        if (nextStart > currentEnd) {
          result.push({
            id: `break-${i}`,
            subject: 'Free Window',
            room: 'N/A',
            startTime: sorted[i].endTime,
            endTime: sorted[i + 1].startTime,
            type: 'break'
          });
        }
      }
    }
    return result;
  }, [activeTimetable, activeDay]);

  const MetadataModal = () => {
    const [isUpdatingExisting, setIsUpdatingExisting] = useState(false);
    const [selectedExistingId, setSelectedExistingId] = useState('');

    const handleSubmit = async () => {
      if (isUpdatingExisting) {
        if (!selectedExistingId) {
          showToast("Please select a preset to update", "error");
          return;
        }
        const existing = communityPresets.find(p => p.id === selectedExistingId);
        if (existing && pendingTimetable) {
          try {
            await NexusServer.updateTimetablePreset(selectedExistingId, {
              ...existing,
              schedule: pendingTimetable
            });
            showToast("Timetable updated successfully", "success");
            loadCommunityPresets();
            handleCloseMetadata();
          } catch (err) {
            showToast("Failed to update timetable", "error");
          }
        }
      } else {
        if (!metadata.section || !metadata.branch) {
          showToast("Please provide section and branch", "error");
          return;
        }
        try {
          const name = `${metadata.section} - ${metadata.branch} ${metadata.year} Year Sem ${metadata.semester}`;
          const data: TimetableData = {
            ownerId: userProfile?.id || 'anonymous',
            ownerName: userProfile?.username || 'Anonymous Student',
            schedule: pendingTimetable || [],
            ...metadata
          };
          await NexusServer.createTimetablePreset(data);
          showToast("Timetable shared with community!", "success");
          
          // Also save as "My Timetable" if target was 'me'
          if (targetForAction === 'me') {
            await NexusServer.saveRecord(userProfile?.id || null, 'timetable_main', name, data);
            setMyTimetable(data);
            setSelectedEntityId('me');
          }

          loadCommunityPresets();
          handleCloseMetadata();
        } catch (err) {
          showToast("Failed to share timetable", "error");
        }
      }
    };

    return (
      <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isClosingMetadata ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={handleCloseMetadata} />
        <div className="relative w-full max-w-md bg-white dark:bg-[#0c0c0c] border border-zinc-200 dark:border-white/5 rounded-[32px] shadow-2xl overflow-hidden">
          <div className="p-8 space-y-6">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Finalize Details</h3>
              <p className="text-xs text-zinc-500">Tag your timetable for the community.</p>
            </div>

            <div className="flex p-1 bg-zinc-100 dark:bg-white/5 rounded-2xl">
              <button 
                onClick={() => setIsUpdatingExisting(false)}
                className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition-all border-none ${!isUpdatingExisting ? 'bg-white dark:bg-white/10 text-orange-600 shadow-sm' : 'text-zinc-500'}`}
              >
                Create New
              </button>
              <button 
                onClick={() => setIsUpdatingExisting(true)}
                className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition-all border-none ${isUpdatingExisting ? 'bg-white dark:bg-white/10 text-orange-600 shadow-sm' : 'text-zinc-500'}`}
              >
                Update Existing
              </button>
            </div>

            {isUpdatingExisting ? (
              <div className="space-y-4">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Select Preset to Overwrite</label>
                <div className="max-h-[200px] overflow-y-auto space-y-2 no-scrollbar pr-1">
                  {communityPresets.map(preset => (
                    <button 
                      key={preset.id}
                      onClick={() => setSelectedExistingId(preset.id)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all ${selectedExistingId === preset.id ? 'bg-orange-600/10 border-orange-600' : 'bg-transparent border-zinc-200 dark:border-white/5 hover:border-orange-500/30'}`}
                    >
                      <p className="text-[11px] font-bold text-zinc-800 dark:text-zinc-100">{preset.name}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{preset.section} • {preset.branch}</p>
                    </button>
                  ))}
                  {communityPresets.length === 0 && (
                    <p className="text-[11px] text-center text-zinc-500 py-4 italic">No community presets found.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Section Code</label>
                  <input type="text" value={metadata.section} onChange={e => setMetadata({...metadata, section: e.target.value.toUpperCase()})} placeholder="e.g. K22MX" className="w-full p-4 bg-zinc-50 dark:bg-white/5 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Branch</label>
                  <input type="text" value={metadata.branch} onChange={e => setMetadata({...metadata, branch: e.target.value.toUpperCase()})} placeholder="e.g. CSE" className="w-full p-4 bg-zinc-50 dark:bg-white/5 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Year</label>
                  <input type="text" value={metadata.year} onChange={e => setMetadata({...metadata, year: e.target.value})} placeholder="e.g. 1st" className="w-full p-4 bg-zinc-50 dark:bg-white/5 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 transition-all outline-none" />
                </div>
              </div>
            )}

            <button onClick={handleSubmit} className="w-full py-4 bg-orange-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-orange-600/20 active:scale-[0.98] transition-all border-none">
              {isUpdatingExisting ? 'Update Timetable' : 'Publish to Community'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20 px-4 md:px-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-zinc-800 dark:text-white mb-2 tracking-tighter">
            Timetable <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Hub</span>
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 font-medium text-[11px] sm:text-xs">Organize your classes and sync with the community.</p>
        </div>
        <div className="flex gap-3">
          <NexusDropdown
            placeholder="Community Presets"
            options={[]}
            onChange={() => { }}
            className="flex-shrink-0"
            renderCustomMenu={(close) => (
              <div className="w-[320px] md:w-[400px] p-4 space-y-4 max-h-[500px] overflow-y-auto no-scrollbar bg-white dark:bg-[#0c0c0c] border border-zinc-200 dark:border-white/5 rounded-3xl shadow-2xl">
                <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Community Uploads</h4>
                <div className="space-y-2">
                  {communityPresets.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        applyPreset(preset);
                        close();
                      }}
                      className="w-full p-4 bg-zinc-50 dark:bg-white/[0.02] border-none rounded-2xl text-left hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-all flex items-center justify-between group"
                    >
                      <div>
                        <p className="text-[11px] font-bold text-zinc-800 dark:text-white truncate">{preset.name}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{preset.section} • {preset.branch} • {preset.year} Year</p>
                      </div>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 text-zinc-300 group-hover:text-orange-500 transition-colors"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                  ))}
                  {communityPresets.length === 0 && <p className="text-[10px] text-zinc-500 p-4 text-center italic">No presets available yet.</p>}
                </div>
              </div>
            )}
          />
          <button 
            onClick={() => {
              setTargetForAction('me');
              setShowUploadModal(true);
            }}
            className="px-6 py-3 bg-orange-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-orange-600/20 active:scale-95 transition-all border-none"
          >
            Upload
          </button>
        </div>
      </header>

      {/* Days Tabs */}
      <div className="flex gap-2 p-1.5 bg-zinc-100 dark:bg-white/5 rounded-3xl overflow-x-auto no-scrollbar">
        {DAYS.map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`flex-shrink-0 px-6 py-2.5 rounded-2xl text-xs font-bold transition-all border-none ${activeDay === day ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Main Schedule View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {daySlotsWithBreaks.length > 0 ? (
            daySlotsWithBreaks.map((slot, idx) => (
              <div 
                key={slot.id || idx}
                className={`relative group p-6 rounded-[2.5rem] border transition-all duration-300 ${
                  slot.type === 'break' 
                    ? 'bg-zinc-50/50 dark:bg-white/[0.01] border-dashed border-zinc-200 dark:border-white/5 opacity-60' 
                    : 'bg-white dark:bg-white/[0.03] border-zinc-100 dark:border-white/5 hover:border-orange-500/30 hover:shadow-xl'
                }`}
              >
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="space-y-1 min-w-[80px]">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{slot.startTime}</p>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{slot.endTime}</p>
                    </div>
                    <div className="w-[1px] h-10 bg-zinc-100 dark:bg-white/5" />
                    <div className="space-y-1">
                      <h4 className={`text-base font-bold ${slot.type === 'break' ? 'text-zinc-400' : 'text-zinc-800 dark:text-zinc-100'}`}>
                        {slot.subject}
                      </h4>
                      {slot.room !== 'N/A' && (
                        <p className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                          {slot.room}
                        </p>
                      )}
                    </div>
                  </div>
                  {slot.type !== 'break' && (
                    <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${slot.type === 'lab' ? 'bg-blue-500/10 text-blue-500' : 'bg-orange-500/10 text-orange-500'}`}>
                      {slot.type}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center space-y-4 bg-zinc-50 dark:bg-white/[0.02] rounded-[40px] border border-dashed border-zinc-200 dark:border-white/5">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto text-2xl">😴</div>
              <div>
                <h4 className="font-bold text-zinc-800 dark:text-zinc-200">No classes scheduled</h4>
                <p className="text-xs text-zinc-500">Enjoy your free day!</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar / Info */}
        <div className="space-y-6">
          <div className="p-8 bg-zinc-900 rounded-[2.5rem] text-white space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/20 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-orange-600/30 transition-all duration-700" />
            <div className="relative z-10 space-y-4">
              <h3 className="text-lg font-bold">Today's Progress</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                  <span>Current Class</span>
                  <span className="text-orange-500">Live</span>
                </div>
                <p className="text-xl font-bold tracking-tight">CSE121: Programming</p>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="w-1/2 h-full bg-orange-500 rounded-full" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-8 bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 rounded-[2.5rem] space-y-4">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-white uppercase tracking-widest">About Community</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Timetable Hub is a crowdsourced directory. Upload your schedule to help others find their classes and sync with you.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && createPortal(
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isClosingUpload ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={handleCloseUpload} />
          <div className="relative w-full max-w-xl bg-white dark:bg-[#0c0c0c] border border-zinc-200 dark:border-white/5 rounded-[40px] shadow-2xl overflow-hidden">
            <div className="p-8 space-y-8">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Upload Schedule</h3>
                  <p className="text-xs text-zinc-500">Sync multiple screenshots for a full week.</p>
                </div>
                <button onClick={handleCloseUpload} className="w-10 h-10 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5 flex items-center justify-center transition-colors border-none">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-zinc-400"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>

              {isProcessingAI ? (
                <div className="py-12 text-center space-y-6">
                  <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 border-4 border-orange-600/10 rounded-full" />
                    <div 
                      className="absolute inset-0 border-4 border-orange-600 rounded-full border-t-transparent animate-spin"
                      style={{ borderRightColor: 'transparent', transition: 'width 0.3s' }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-orange-500">
                      {Math.round(ocrProgress)}%
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{processingStatus}</p>
                    <p className="text-xs text-zinc-500">Using Tesseract AI Engine</p>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files) {
                      const event = { target: { files: e.dataTransfer.files } } as any;
                      handleFileUpload(event);
                    }
                  }}
                  className="group relative py-20 border-2 border-dashed border-zinc-200 dark:border-white/10 rounded-[32px] text-center hover:border-orange-500/50 transition-all cursor-pointer bg-zinc-50/50 dark:bg-white/[0.01]"
                >
                  <div className="w-16 h-16 bg-zinc-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8 text-zinc-400 group-hover:text-orange-500 transition-colors"><path d="M12 5v14M5 12h14" /></svg>
                  </div>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Tap to select or Drag & Drop</p>
                  <p className="text-xs text-zinc-500 mt-1">Upload clear screenshots of your timetable</p>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileUpload} />
                </div>
              )}
            </div>
          </div>
        </div>,
        document.getElementById('modal-root') || document.body
      )}

      {/* Metadata Modal */}
      {showMetadataModal && createPortal(<MetadataModal />, document.getElementById('modal-root') || document.body)}
    </div>
  );
};

export default TimetableHub;
