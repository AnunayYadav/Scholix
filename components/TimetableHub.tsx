
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
  const parts = timeStr.trim().split(' ');
  const time = parts[0];
  const modifier = parts[1]?.toUpperCase();
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier) {
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
  } else {
    if (hours >= 1 && hours < 8) hours += 12;
  }
  return hours * 60 + minutes;
};

const minutesToTime = (mins: number) => {
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
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
  const [showMetadataModal, setShowMetadataModal] = useState(false);
  const [isClosingMetadata, setIsClosingMetadata] = useState(false);
  
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [targetForAction, setTargetForAction] = useState<'me' | 'friend'>('me');

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
      setPendingTimetable(combinedSchedules);
      setEditingPresetId(null);
      setMetadata({ section: '', year: '', branch: '', semester: '' });
      setIsClosingUpload(true);
      setTimeout(() => { setShowUploadModal(false); setIsClosingUpload(false); }, 250);
      setShowMetadataModal(true);
    } catch (err) {
      showToast("OCR Error. Clear images required.", "error");
    } finally {
      setIsProcessingAI(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const applyPreset = async (batch: any, targetId?: string) => {
    const id = targetId || (targetForAction === 'me' ? (userProfile?.id || 'local-me') : `friend-${Math.random().toString(36).substr(2, 9)}`);
    const data: TimetableData = {
      ownerId: id,
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
    showToast(`Added ${data.ownerName}`, "success");
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

  const commonBreaks = useMemo(() => {
    if (selectedEntityId === 'me' || !myTimetable || !activeTimetable || !myTimetable.schedule || !activeTimetable.schedule) return [];
    const myDay = myTimetable.schedule.find(s => s.day === activeDay);
    const frDay = activeTimetable.schedule.find(s => s.day === activeDay);
    if (!myDay || !frDay) return [];

    const getGaps = (day: DaySchedule) => {
      const sorted = [...day.slots].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
      const gaps = [];
      for (let i = 0; i < sorted.length - 1; i++) {
        const end = timeToMinutes(sorted[i].endTime);
        const nextStart = timeToMinutes(sorted[i + 1].startTime);
        if (nextStart > end) gaps.push({ start: end, end: nextStart });
      }
      return gaps;
    };

    const myGaps = getGaps(myDay);
    const frGaps = getGaps(frDay);
    const overlaps = [];
    for (const mg of myGaps) {
      for (const fg of frGaps) {
        const overlapStart = Math.max(mg.start, fg.start);
        const overlapEnd = Math.min(mg.end, fg.end);
        if (overlapEnd > overlapStart) {
          overlaps.push({
            start: minutesToTime(overlapStart),
            end: minutesToTime(overlapEnd),
            duration: overlapEnd - overlapStart
          });
        }
      }
    }
    return overlaps;
  }, [myTimetable, activeTimetable, activeDay, selectedEntityId]);

  const removeFriend = (id: string) => {
    setFriendTimetables(prev => prev.filter(f => f.ownerId !== id));
    if (selectedEntityId === id) setSelectedEntityId('me');
    showToast("Connection removed", "info");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20 px-4 md:px-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-zinc-800 dark:text-white mb-2 tracking-tighter">
            Timetable <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Hub</span>
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 font-medium text-xs">Manage multiple schedules and find common breaks.</p>
        </div>
        <div className="flex gap-3">
          <NexusDropdown
            placeholder="Find Connections"
            options={[]}
            onChange={() => { }}
            renderCustomMenu={(close) => (
              <div className="w-[320px] md:w-[400px] p-4 space-y-4 max-h-[500px] overflow-y-auto no-scrollbar bg-white dark:bg-[#0c0c0c] border border-zinc-200 dark:border-white/5 rounded-3xl shadow-2xl">
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Community Presets</h4>
                <div className="space-y-2">
                  {communityPresets.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setTargetForAction('friend');
                        applyPreset(preset);
                        close();
                      }}
                      className="w-full p-4 bg-zinc-50 dark:bg-white/[0.02] border-none rounded-2xl text-left hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-all flex items-center justify-between group"
                    >
                      <div>
                        <p className="text-[11px] font-bold text-zinc-800 dark:text-white truncate">{preset.name}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{preset.section} • {preset.branch}</p>
                      </div>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 text-zinc-300 group-hover:text-orange-500 transition-colors"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                  ))}
                </div>
              </div>
            )}
          />
          <button onClick={() => { setTargetForAction('me'); setShowUploadModal(true); }} className="px-6 py-3 bg-orange-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-orange-600/20 active:scale-95 transition-all border-none">Upload My SS</button>
        </div>
      </header>

      <div className="flex gap-2 p-1.5 bg-zinc-100 dark:bg-white/5 rounded-3xl overflow-x-auto no-scrollbar">
        {DAYS.map(day => (
          <button key={day} onClick={() => setActiveDay(day)} className={`flex-shrink-0 px-6 py-2.5 rounded-2xl text-xs font-bold transition-all border-none ${activeDay === day ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}>
            {day}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar: Profiles */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">My Profiles</h3>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedEntityId('me')}
              className={`w-full p-4 rounded-2xl text-left transition-all border-none flex items-center gap-3 ${selectedEntityId === 'me' ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/20' : 'bg-white dark:bg-white/[0.03] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/[0.05]'}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${selectedEntityId === 'me' ? 'bg-white/20' : 'bg-zinc-100 dark:bg-white/5'}`}>ME</div>
              <span className="font-bold text-xs">My Timetable</span>
            </button>

            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1 pt-4">Connections</h3>
            {friendTimetables.map(friend => (
              <div key={friend.ownerId} className="relative group">
                <button
                  onClick={() => setSelectedEntityId(friend.ownerId)}
                  className={`w-full p-4 rounded-2xl text-left transition-all border-none flex items-center gap-3 ${selectedEntityId === friend.ownerId ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/20' : 'bg-white dark:bg-white/[0.03] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/[0.05]'}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${selectedEntityId === friend.ownerId ? 'bg-white/20' : 'bg-zinc-100 dark:bg-white/5'}`}>{friend.ownerName.charAt(0)}</div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs truncate">{friend.ownerName}</p>
                    <p className={`text-[10px] ${selectedEntityId === friend.ownerId ? 'text-white/60' : 'text-zinc-500'}`}>{friend.section}</p>
                  </div>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); removeFriend(friend.ownerId); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all text-zinc-400 border-none bg-transparent"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                </button>
              </div>
            ))}
            {friendTimetables.length === 0 && (
              <p className="text-[10px] text-zinc-500 p-4 text-center italic">No connections added.</p>
            )}
          </div>
        </div>

        {/* Main Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-white">{activeDay} Schedule</h3>
            <span className="text-[10px] font-bold text-zinc-400 uppercase">{daySlotsWithBreaks.filter(s => s.type !== 'break').length} Classes</span>
          </div>
          {daySlotsWithBreaks.length > 0 ? (
            daySlotsWithBreaks.map((slot, idx) => (
              <div key={slot.id || idx} className={`relative group p-6 rounded-[2rem] border transition-all duration-300 ${slot.type === 'break' ? 'bg-zinc-50/50 dark:bg-white/[0.01] border-dashed border-zinc-200 dark:border-white/5 opacity-60' : 'bg-white dark:bg-white/[0.03] border-zinc-100 dark:border-white/5 hover:border-orange-500/30'}`}>
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="space-y-1 min-w-[70px]">
                      <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{slot.startTime}</p>
                      <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{slot.endTime}</p>
                    </div>
                    <div className="w-[1px] h-8 bg-zinc-100 dark:bg-white/5" />
                    <div className="space-y-1">
                      <h4 className={`text-sm font-bold ${slot.type === 'break' ? 'text-zinc-400' : 'text-zinc-800 dark:text-zinc-100'}`}>{slot.subject}</h4>
                      {slot.room !== 'N/A' && <p className="text-[10px] font-medium text-zinc-500">{slot.room}</p>}
                    </div>
                  </div>
                  {slot.type !== 'break' && <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${slot.type === 'lab' ? 'bg-blue-500/10 text-blue-500' : 'bg-orange-500/10 text-orange-500'}`}>{slot.type}</div>}
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center space-y-4 bg-zinc-50 dark:bg-white/[0.02] rounded-[40px] border border-dashed border-zinc-200 dark:border-white/5">
              <p className="text-xs text-zinc-500">No classes scheduled for {activeDay}.</p>
            </div>
          )}
        </div>

        {/* Insights: Shared Gaps */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 bg-zinc-900 rounded-[2rem] text-white space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">Shared Gaps</h3>
            {selectedEntityId === 'me' ? (
              <p className="text-[11px] text-zinc-400 leading-relaxed">Select a connection to find common free windows for meeting up.</p>
            ) : commonBreaks.length > 0 ? (
              <div className="space-y-3">
                {commonBreaks.map((b, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-[9px] font-bold text-zinc-500 uppercase">Gap</p>
                      <span className="text-[9px] font-bold text-orange-500">{b.duration}m</span>
                    </div>
                    <p className="text-sm font-bold">{b.start} — {b.end}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-zinc-400 leading-relaxed">No common free windows found for this day.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modals remain mostly the same but with clean UI */}
      {showUploadModal && createPortal(
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isClosingUpload ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowUploadModal(false)} />
          <div className="relative w-full max-w-xl bg-white dark:bg-[#0c0c0c] border border-zinc-200 dark:border-white/5 rounded-[40px] shadow-2xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold">Upload Schedule</h3>
              <button onClick={() => setShowUploadModal(false)} className="w-10 h-10 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5 flex items-center justify-center border-none bg-transparent transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-zinc-400"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            {isProcessingAI ? (
              <div className="py-12 text-center space-y-6">
                <div className="w-24 h-24 mx-auto relative">
                   <div className="absolute inset-0 border-4 border-orange-600/10 rounded-full" />
                   <div className="absolute inset-0 border-4 border-orange-600 rounded-full border-t-transparent animate-spin" />
                   <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-orange-500">{Math.round(ocrProgress)}%</div>
                </div>
                <p className="text-sm font-bold">{processingStatus}</p>
              </div>
            ) : (
              <div onClick={() => fileInputRef.current?.click()} className="py-20 border-2 border-dashed border-zinc-200 dark:border-white/10 rounded-[32px] text-center hover:border-orange-500/50 transition-all cursor-pointer bg-zinc-50/50 dark:bg-white/[0.01]">
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Tap to select or Drag & Drop</p>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileUpload} />
              </div>
            )}
          </div>
        </div>,
        document.getElementById('modal-root') || document.body
      )}

      {showMetadataModal && createPortal(
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isClosingMetadata ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowMetadataModal(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-[#0c0c0c] border border-zinc-200 dark:border-white/5 rounded-[32px] shadow-2xl p-8 space-y-6">
            <h3 className="text-xl font-bold">Finalize Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Section</label>
                <input type="text" value={metadata.section} onChange={e => setMetadata({...metadata, section: e.target.value.toUpperCase()})} placeholder="e.g. K22MX" className="w-full p-4 bg-zinc-50 dark:bg-white/5 border-none rounded-2xl text-sm outline-none" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Branch</label>
                <input type="text" value={metadata.branch} onChange={e => setMetadata({...metadata, branch: e.target.value.toUpperCase()})} placeholder="CSE" className="w-full p-4 bg-zinc-50 dark:bg-white/5 border-none rounded-2xl text-sm outline-none" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Year</label>
                <input type="text" value={metadata.year} onChange={e => setMetadata({...metadata, year: e.target.value})} placeholder="1st" className="w-full p-4 bg-zinc-50 dark:bg-white/5 border-none rounded-2xl text-sm outline-none" />
              </div>
            </div>
            <button 
              onClick={async () => {
                const name = `${metadata.section} - ${metadata.branch}`;
                const data: TimetableData = { ownerId: userProfile?.id || 'anon', ownerName: userProfile?.username || 'Student', schedule: pendingTimetable || [], ...metadata };
                await NexusServer.createTimetablePreset(data);
                if (targetForAction === 'me') setMyTimetable(data);
                setShowMetadataModal(false);
                showToast("Timetable Synced", "success");
              }} 
              className="w-full py-4 bg-orange-600 text-white rounded-2xl font-bold text-sm border-none shadow-xl shadow-orange-600/20"
            >
              Sync & Publish
            </button>
          </div>
        </div>,
        document.getElementById('modal-root') || document.body
      )}
    </div>
  );
};

export default TimetableHub;
