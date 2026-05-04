
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { UserProfile, TimetableData, DaySchedule, TimetableSlot } from '../types.ts';
import NexusServer from '../services/nexusServer.ts';
import { extractTimetableWithTesseract, parseTimetableText } from '../services/ocrService.ts';
import NexusDropdown from './NexusDropdown.tsx';
import { useUniversity } from '../hooks/useUniversity.tsx';
import { showToast, showConfirm } from './Toast.tsx';
import NexusAd from './NexusAd.tsx';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const timeToMinutes = (time: string) => {
  if (!time) return 0;
  
  // Normalize: remove dots, internal spaces, and handle common OCR glitches for AM/PM
  // Added common misreads like RM, FM, BN, etc.
  const clean = time.toUpperCase()
    .replace(/[\s.]/g, '')
    .replace('AN', 'AM')
    .replace('PN', 'PM')
    .replace('RM', 'PM')
    .replace('FM', 'PM')
    .replace('AM.', 'AM')
    .replace('PM.', 'PM')
    .replace('BM', 'AM');
  
  // Match 12-hour with AM/PM suffix (e.g. 9:00AM, 05:00 PM)
  const match12 = clean.match(/(\d{1,2})[:]?(\d{0,2})\s*([AP]M)/);
  if (match12) {
    let hours = parseInt(match12[1]);
    const minutes = match12[2] ? parseInt(match12[2]) : 0;
    const period = match12[3];
    
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }
  
  // Match 24-hour or simple 12-hour with heuristic (e.g. 09:00, 5:00)
  const match24 = clean.match(/(\d{1,2})[:]?(\d{0,2})/);
  if (match24) {
    let hours = parseInt(match24[1]);
    const minutes = match24[2] ? parseInt(match24[2]) : 0;
    
    // LPU Heuristic: Classes between 1-7 are almost certainly PM
    // 8:00 and onwards are AM. 1:00 to 7:00 are PM.
    if (hours >= 1 && hours <= 7) {
      hours += 12;
    }
    
    return hours * 60 + minutes;
  }
  
  return 0;
};

const minutesToTime = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
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

  // Added for update profile selection
  const [selectedUpdateProfile, setSelectedUpdateProfile] = useState<any>(null);

  const [importStep, setImportStep] = useState<'input' | 'destination'>('input');
  const [extractedData, setExtractedData] = useState<TimetableData | null>(null);

  const handleCloseUpload = () => {
    setIsClosingUpload(true);
    setTimeout(() => {
      setShowUploadModal(false);
      setIsClosingUpload(false);
      setRawPastedText('');
      setIsUpdatingPreset(false);
      setPresetToUpdateId(null);
      setSelectedUpdateProfile(null);
      setImportStep('input');
      setExtractedData(null);
    }, 400);
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

  const handleCloseSlot = () => {
    setIsClosingSlot(true);
    setTimeout(() => {
      setShowSlotModal(false);
      setIsClosingSlot(false);
      setEditingSlot(null);
      setSlotForm({ subject: '', room: '', startTime: '09:00', endTime: '10:00', type: 'class' });
    }, 250);
  };

  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [targetForAction, setTargetForAction] = useState<'me' | 'friend'>('me');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [uploadMethod, setUploadMethod] = useState<'ums' | 'manual'>('ums');
  const [rawPastedText, setRawPastedText] = useState('');
  const [manualEntry, setManualEntry] = useState({ name: '', semester: 1 });

  const [pendingTimetable, setPendingTimetable] = useState<DaySchedule[] | null>(null);
  const [metadata, setMetadata] = useState({ section: '', year: '', branch: '', semester: '' });
  const [communityPresets, setCommunityPresets] = useState<any[]>([]);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [isUpdatingPreset, setIsUpdatingPreset] = useState(false);
  const [presetToUpdateId, setPresetToUpdateId] = useState<string | null>(null);
  const [presetSearchQuery, setPresetSearchQuery] = useState('');
  const [dropdownSearchQuery, setDropdownSearchQuery] = useState('');
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [isClosingSlot, setIsClosingSlot] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [slotForm, setSlotForm] = useState({ subject: '', room: '', startTime: '09:00', endTime: '10:00', type: 'class' as 'class' | 'lab' });

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
    if (!myTimetable) loadMyTimetableFromServer();
  }, [userProfile, myTimetable]);

  const loadCommunityPresets = async () => {
    const data = await NexusServer.fetchCommunityTimetables();
    setCommunityPresets(data);
  };

  const loadMyTimetableFromServer = async () => {
    const records = await NexusServer.fetchRecords(userProfile?.id || null, 'timetable_main');
    if (records && records.length > 0) {
      setMyTimetable(records[0].content);
    } else {
      setMyTimetable({ ownerId: userProfile?.id || 'local-me', ownerName: userProfile?.username || 'My Profile', schedule: [] });
    }
  };

  const handleRename = async () => {
    if (!renameTargetId || !newName.trim()) return;

    if (renameTargetId === 'me' && myTimetable) {
      const updated = { ...myTimetable, ownerName: newName.trim() };
      setMyTimetable(updated);
      await NexusServer.saveRecord(userProfile?.id || null, 'timetable_main', 'My Timetable', updated);
    } else {
      setFriendTimetables(prev => prev.map(f => f.ownerId === renameTargetId ? { ...f, ownerName: newName.trim() } : f));
    }

    handleCloseRename();
  };

  const handleDeletePreset = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const confirmed = await showConfirm("Are you sure you want to delete this community preset?");
    if (confirmed) {
      try {
        await NexusServer.deleteCommunityTimetable(id);
        showToast("Preset removed from community.", "success");
        loadCommunityPresets();
      } catch (err) {
        showToast("Failed to delete preset.", "error");
      }
    }
  };

  const handleEditPresetMetadata = (preset: any, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingPresetId(preset.id);
    setMetadata({
      section: preset.section || '',
      year: preset.year || '',
      branch: preset.branch || '',
      semester: preset.semester || ''
    });
    setPendingTimetable(preset.schedule);
    setShowMetadataModal(true);
  };

  const handleRemoveFriend = async (friendId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const confirmed = await showConfirm("Remove this profile from your connections?");
    if (confirmed) {
      setFriendTimetables(prev => prev.filter(f => f.ownerId !== friendId));
      if (selectedEntityId === friendId) {
        setSelectedEntityId('me');
      }
    }
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleParsePastedData = () => {
    if (!rawPastedText.trim()) return;

    setIsProcessingAI(true);
    setOcrProgress(50);
    setProcessingStatus('Analyzing patterns...');

    try {
      const combinedSchedules = parseTimetableText(rawPastedText);

      if (combinedSchedules.length === 0 || combinedSchedules.every(d => d.slots.length === 0)) {
        throw new Error("Could not detect any valid timetable patterns. Please ensure the text format is correct.");
      }
      
      setPendingTimetable(combinedSchedules);
      setImportStep('destination');
    } catch (err: any) {
      showToast(err.message || "Failed to parse text. Use screenshots instead.", "error");
    } finally {
      setIsProcessingAI(false);
      setOcrProgress(0);
      setProcessingStatus('');
    }
  };

  const handleFinalizeImport = async () => {
    // If we have text but no parsed data yet, parse it now
    if (rawPastedText.length > 20 && importStep === 'destination' && (!pendingTimetable || pendingTimetable.length === 0)) {
      try {
        const combinedSchedules = parseTimetableText(rawPastedText);

        if (combinedSchedules.length === 0 || combinedSchedules.every(d => d.slots.length === 0)) {
          showToast("Could not detect any valid timetable patterns. Try cleaning the text or using a screenshot.", "error");
          return;
        }
        
        setPendingTimetable(combinedSchedules);
      } catch (err) {
        showToast("Failed to parse text. Please check the format.", "error");
        return;
      }
    }

    // Now handle the Update/New logic
    if (isUpdatingPreset && presetToUpdateId) {
      const existingProfile = [myTimetable, ...friendTimetables, ...communityPresets].find(p => (p?.id || p?.ownerId) === presetToUpdateId);
      if (existingProfile) {
        setMetadata({
          section: existingProfile.section || '',
          branch: existingProfile.branch || '',
          year: existingProfile.year || '',
          semester: existingProfile.semester || ''
        });
        setEditingPresetId(presetToUpdateId);
      }
    } else {
      setEditingPresetId(null);
      setMetadata({ section: '', year: '', branch: '', semester: '' });
    }

    handleCloseUpload();
    setShowMetadataModal(true);
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
            existing.slots = [...existing.slots, ...newDay.slots].filter((v, idx, a) => 
              a.findIndex(t => t.startTime === v.startTime && t.subject === v.subject) === idx
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

      // Final sort of days
      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      combinedSchedules.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));

      setPendingTimetable(combinedSchedules);
      setImportStep('destination');
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

  const handleMetadataSubmit = async () => {
    const { section, branch, year, semester } = metadata;
    if (!section || !branch || !year || !semester) {
      showToast("Please fill all details to continue.", "info");
      return;
    }

    const generatedName = `${section} - ${branch} ${year} Year Sem ${semester}`;

    if (editingPresetId) {
      try {
        // 1. Update Community/Preset if it exists
        await NexusServer.updateCommunityTimetable(editingPresetId, metadata, pendingTimetable);
        loadCommunityPresets();

        // 2. Update Local Record if it matches the editing ID
        if (myTimetable && (myTimetable.ownerId === editingPresetId || editingPresetId === 'me' || editingPresetId === (userProfile?.id || 'local-me'))) {
          const updated = { ...myTimetable, ...metadata, ownerName: generatedName, schedule: pendingTimetable || myTimetable.schedule };
          setMyTimetable(updated);
          await NexusServer.saveRecord(userProfile?.id || null, 'timetable_main', generatedName, updated);
        } else {
          setFriendTimetables(prev => prev.map(f => f.ownerId === editingPresetId ? { ...f, ...metadata, ownerName: generatedName, schedule: pendingTimetable || f.schedule } : f));
        }

        showToast("Timetable updated successfully!", "success");
        handleCloseMetadata();
      } catch (e) { console.error(e); showToast("Failed to update preset info.", "error"); }
      return;
    }

    if (!pendingTimetable) return;

    const newId = `friend-${Math.random().toString(36).substr(2, 9)}`;
    const data: TimetableData = {
      ownerId: targetForAction === 'me' ? (userProfile?.id || 'local-me') : newId,
      ownerName: generatedName,
      schedule: pendingTimetable,
      section,
      year,
      branch,
      semester
    };

    if (targetForAction === 'me') {
      await NexusServer.saveRecord(userProfile?.id || null, 'timetable_main', generatedName, data);
      setMyTimetable(data);
      setSelectedEntityId('me');
    } else {
      setFriendTimetables(prev => [...prev, data]);
      setSelectedEntityId(newId);
    }

    // Push to community presets
    try {
      await NexusServer.shareTimetable(data, metadata);
      loadCommunityPresets();
    } catch (e) { }

    handleCloseMetadata();
    setPendingTimetable(null);
    setMetadata({ section: '', year: '', branch: '', semester: '' });
  };

  const currentMinutes = useMemo(() => {
    return currentTime.getHours() * 60 + currentTime.getMinutes();
  }, [currentTime]);

  const isCurrentDay = useMemo(() => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return today === activeDay;
  }, [activeDay]);

  const updateTimetableState = async (updatedSchedule: DaySchedule[]) => {
    if (!activeTimetable) return;
    const updatedTimetable = { ...activeTimetable, schedule: updatedSchedule };
    
    if (selectedEntityId === 'me') {
      setMyTimetable(updatedTimetable);
      await NexusServer.saveRecord(userProfile?.id || null, 'timetable_main', updatedTimetable.ownerName, updatedTimetable);
    } else {
      setFriendTimetables(prev => prev.map(f => f.ownerId === selectedEntityId ? updatedTimetable : f));
    }

    // Sync with community if applicable
    if (activeTimetable.originPresetId) {
       const preset = communityPresets.find(p => p.id === activeTimetable.originPresetId);
       if (preset && (preset.owner_id === userProfile?.id || userProfile?.is_admin)) {
          try {
            await NexusServer.updateCommunityTimetable(preset.id, preset, updatedSchedule);
            loadCommunityPresets();
          } catch (e) {
            console.error("Failed to sync with community:", e);
          }
       }
    }
  };

  const handleOpenAddSlot = () => {
    setEditingSlot(null);
    setSlotForm({ subject: '', room: '', startTime: '09:00', endTime: '10:00', type: 'class' });
    setShowSlotModal(true);
  };

  const handleOpenEditSlot = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setSlotForm({ subject: slot.subject, room: slot.room, startTime: slot.startTime, endTime: slot.endTime, type: slot.type });
    setShowSlotModal(true);
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!activeTimetable) return;
    const confirmed = await showConfirm("Delete this class from the schedule?");
    if (!confirmed) return;

    const updatedSchedule = activeTimetable.schedule.map(day => {
      if (day.day === activeDay) {
        return { ...day, slots: day.slots.filter(s => s.id !== slotId) };
      }
      return day;
    });

    await updateTimetableState(updatedSchedule);
  };

  const handleSaveSlot = async () => {
    if (!activeTimetable || !slotForm.subject) return;

    const newSlot: TimetableSlot = {
      id: editingSlot?.id || `slot-${Math.random().toString(36).substr(2, 9)}`,
      ...slotForm
    };

    let updatedSchedule = [...activeTimetable.schedule];
    let dayData = updatedSchedule.find(s => s.day === activeDay);
    
    if (!dayData) {
      dayData = { day: activeDay, slots: [] };
      updatedSchedule.push(dayData);
    }

    if (editingSlot) {
      dayData.slots = dayData.slots.map(s => s.id === editingSlot.id ? newSlot : s);
    } else {
      dayData.slots.push(newSlot);
    }
    
    dayData.slots.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    
    await updateTimetableState(updatedSchedule);
    handleCloseSlot();
  };

  const activeTimetable = useMemo(() => {
    if (selectedEntityId === 'me') return myTimetable;
    return friendTimetables.find(f => f.ownerId === selectedEntityId) || null;
  }, [selectedEntityId, myTimetable, friendTimetables]);

  const canEditCurrent = useMemo(() => {
    if (!userProfile) return false;
    if (userProfile.is_admin) return true;
    if (selectedEntityId === 'me') return true;
    return false;
  }, [selectedEntityId, userProfile]);

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

  const applyPreset = async (batch: any, targetId?: string) => {
    // Check if any other profile (me or friends) already has this batch
    const allProfiles = [myTimetable, ...friendTimetables].filter(Boolean) as TimetableData[];
    const isDuplicate = allProfiles.some(p =>
      p.ownerId !== (targetId || (targetForAction === 'me' ? (userProfile?.id || 'local-me') : 'new')) &&
      p.section === batch.section &&
      p.branch === batch.branch &&
      p.semester === batch.semester
    );

    if (isDuplicate) {
      showToast(`A connection with batch ${batch.section} already exists.`, "error");
      return;
    }

    const data: TimetableData = {
      ownerId: targetId || (targetForAction === 'me' ? (userProfile?.id || 'local-me') : `friend-${Math.random().toString(36).substr(2, 9)}`),
      ownerName: targetForAction === 'me' || targetId ? (batch.name) : (batch.name || `${batch.section} ${batch.branch}`),
      schedule: batch.schedule,
      section: batch.section,
      year: batch.year,
      branch: batch.branch,
      semester: batch.semester,
      originPresetId: batch.id
    };

    if (targetForAction === 'me' && !targetId) {
      await NexusServer.saveRecord(userProfile?.id || null, 'timetable_main', batch.name, data);
      setMyTimetable(data);
      setSelectedEntityId('me');
    } else {
      setFriendTimetables(prev => {
        const exists = prev.find(f => f.ownerId === data.ownerId);
        if (exists) {
          return prev.map(f => f.ownerId === data.ownerId ? data : f);
        }
        return [...prev, data];
      });
      setSelectedEntityId(data.ownerId);
    }
    setShowUploadModal(false);
  };

  const handleAddEmptyConnection = () => {
    const newId = `friend-${Math.random().toString(36).substr(2, 9)}`;
    const newFriend: TimetableData = {
      ownerId: newId,
      ownerName: 'New Connection',
      schedule: []
    };
    setFriendTimetables(prev => [...prev, newFriend]);
    setSelectedEntityId(newId);
    showToast("Empty connection added. Select a batch preset to load schedule.", "info");
  };

  const handleAdminEdit = (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPresetId(item.ownerId || item.id);
    setMetadata({
      section: item.section || '',
      branch: item.branch || '',
      year: item.year || '',
      semester: item.semester || ''
    });
    setShowMetadataModal(true);
  };

  const handleAdminDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = await showConfirm("Admin Action: Permanently delete this community preset?");
    if (confirmed) {
      try {
        await NexusServer.deleteCommunityTimetable(id);
        loadCommunityPresets();
      } catch (e) { showToast("Delete failed.", "error"); }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20 px-4 md:px-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-medium text-zinc-800 dark:text-white mb-2 tracking-tighter">
            Timetable <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 font-semibold">Hub</span>
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium text-[11px] sm:text-xs">Organize your classes and find time to meet with friends.</p>
        </div>
        <div className="flex gap-3">
          <NexusDropdown
            placeholder="Batch Presets"
            options={[]}
            onChange={() => { }}
            className="flex-shrink-0"
            align="right"
            renderCustomMenu={(close) => (
              <div className="w-[300px] sm:w-[350px] md:w-[400px] p-4 space-y-6 max-h-[500px] overflow-y-auto no-scrollbar bg-white dark:bg-[#0d0d0d] rounded-[24px] border border-zinc-100 dark:border-white/5 shadow-xl">
                <div className="sticky top-0 z-20 pb-2 bg-white dark:bg-[#0d0d0d]">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search batches or sections..."
                      value={dropdownSearchQuery}
                      onChange={e => setDropdownSearchQuery(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/5 rounded-2xl px-4 py-3 text-[11px] font-medium outline-none focus:ring-2 focus:ring-orange-600/20 transition-all"
                    />
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  </div>
                </div>



                {communityPresets.filter(p => p.name.toLowerCase().includes(dropdownSearchQuery.toLowerCase()) || p.section.toLowerCase().includes(dropdownSearchQuery.toLowerCase())).length > 0 && (
                  <section className="space-y-3">
                  <h4 className="text-[11px] font-medium text-orange-500/80 tracking-tight ml-1">Community uploads</h4>
                    <div className="space-y-2">
                      {communityPresets.filter(p => p.name.toLowerCase().includes(dropdownSearchQuery.toLowerCase()) || p.section.toLowerCase().includes(dropdownSearchQuery.toLowerCase())).map(preset => {
                        const isOwner = userProfile?.id === preset.owner_id;
                        const isAdmin = userProfile?.is_admin;
                        const canEdit = isOwner || isAdmin;
                        
                        return (
                          <div key={preset.id} className="relative group/card">
                            <button
                              onClick={() => {
                                setTargetForAction(selectedEntityId === 'me' ? 'me' : 'friend');
                                applyPreset(preset, selectedEntityId === 'me' ? undefined : selectedEntityId);
                                close();
                              }}
                              className="w-full p-4 bg-zinc-50 dark:bg-orange-600/[0.02] border border-transparent rounded-2xl text-left hover:border-orange-500/30 hover:bg-zinc-100 dark:hover:bg-orange-600/[0.04] transition-all flex items-center justify-between group"
                            >
                              <div className="min-w-0 pr-20">
                                <p className="text-[11px] sm:text-xs font-medium text-zinc-800 dark:text-white truncate">{preset.name}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] font-medium text-zinc-400">{preset.branch}</span>
                                  <span className="w-1 h-1 bg-zinc-200 dark:bg-white/10 rounded-full" />
                                  <span className="text-[10px] font-medium text-zinc-400">{preset.year} Year</span>
                                </div>
                              </div>
                              <div className="w-8 h-8 rounded-xl bg-orange-600/0 group-hover:bg-orange-600/10 flex items-center justify-center transition-all">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5 text-zinc-300 group-hover:text-orange-600 transition-colors"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                              </div>
                            </button>

                            {canEdit && (
                              <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-all z-10 bg-white/80 dark:bg-[#0d0d0d]/80 backdrop-blur-md p-1 rounded-xl shadow-lg border border-zinc-100 dark:border-white/10">
                                <button 
                                  onClick={(e) => handleEditPresetMetadata(preset, e)}
                                  title="Edit metadata"
                                  className="w-8 h-8 rounded-lg hover:bg-orange-600/10 flex items-center justify-center text-zinc-400 hover:text-orange-600 transition-colors border-none bg-transparent"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                </button>
                                <button 
                                  onClick={(e) => handleDeletePreset(preset.id, e)}
                                  title="Delete preset"
                                  className="w-8 h-8 rounded-lg hover:bg-red-600/10 flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors border-none bg-transparent"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
                
                {dropdownSearchQuery && communityPresets.filter(b => b.name.toLowerCase().includes(dropdownSearchQuery.toLowerCase()) || b.section.toLowerCase().includes(dropdownSearchQuery.toLowerCase())).length === 0 && (
                  <div className="py-12 text-center space-y-2">
                    <p className="text-[11px] font-semibold text-zinc-400">No matching presets found</p>
                    <p className="text-[10px] text-zinc-500">Try searching with section code or branch</p>
                  </div>
                )}
              </div>
            )}
          />
          <button onClick={() => { setTargetForAction('me'); setShowUploadModal(true); }} className="px-8 py-3 bg-orange-600 text-white rounded-2xl text-[11px] sm:text-xs font-medium shadow-xl shadow-orange-600/20 active:scale-95 transition-all flex items-center gap-2 border-none">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            Upload Screenshots
          </button>
        </div>
      </header>

      {/* Top Banner Ad */}
      <NexusAd slot="2912081909" format="horizontal" hideLabel className="!my-2" />

      <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
        {DAYS.map(day => (
          <button 
            key={day} 
            onClick={() => setActiveDay(day)} 
            className={`flex-shrink-0 px-6 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-300 border-none ${
              activeDay === day 
                ? 'bg-orange-600/10 text-orange-600' 
                : 'bg-zinc-100 dark:bg-white/5 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-white/10'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          {(!activeTimetable || !activeTimetable.schedule || activeTimetable.schedule.length === 0) ? (
            <div className="glass-panel p-16 rounded-[48px] border-4 border-dashed border-zinc-200 dark:border-white/5 flex flex-col items-center justify-center text-center bg-zinc-100 dark:bg-[#0a0a0a]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-20 h-20 mb-6"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              <h3 className="text-xl font-medium text-zinc-800 dark:text-white">No Schedule Data</h3>
              <p className="text-[11px] sm:text-xs font-medium text-zinc-500 mt-2">Use a Batch Preset or Upload screenshots for {activeTimetable?.ownerName || (selectedEntityId === 'me' ? 'your profile' : 'this friend')}.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-4">
                <h3 className="text-[12px] font-medium text-orange-600/80 tracking-tight">{activeDay} schedule</h3>
                <span className="text-[10px] font-medium text-zinc-400">{daySlotsWithBreaks.filter(s => s.type !== 'break').length} Activities</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {canEditCurrent && (
                  <button 
                    onClick={handleOpenAddSlot}
                    className="col-span-full py-8 rounded-[32px] border-2 border-dashed border-zinc-200 dark:border-white/5 hover:border-orange-500/30 hover:bg-orange-600/[0.03] transition-all flex flex-col items-center justify-center gap-2 group border-none"
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-600/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5 text-orange-600"><path d="M12 5v14M5 12h14" /></svg>
                    </div>
                    <span className="text-[11px] font-semibold text-zinc-500 group-hover:text-orange-600 tracking-tight transition-colors">Add Class for {activeDay}</span>
                  </button>
                )}
                {daySlotsWithBreaks.length === 0 ? (
                  <div className="col-span-full p-10 bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-100 dark:border-white/5 rounded-[32px] text-center"><p className="text-[11px] sm:text-xs font-medium text-zinc-400">No events found for {activeDay}.</p></div>
                ) : (
                  daySlotsWithBreaks.map(slot => {
                    const startMin = timeToMinutes(slot.startTime);
                    const endMin = timeToMinutes(slot.endTime);

                    const isActive = isCurrentDay && currentMinutes >= startMin && currentMinutes < endMin;
                    const isFinished = isCurrentDay && currentMinutes >= endMin;
                    const isUpcoming = isCurrentDay && currentMinutes < startMin;
                    const isBreak = slot.type === 'break';

                    return (
                      <div key={slot.id} className={`group relative p-5 rounded-[22px] transition-all flex flex-col justify-between ${isActive ? 'bg-orange-600/[0.03] border border-orange-500/20 shadow-sm' : isFinished ? 'opacity-40 grayscale' : 'bg-white dark:bg-white/[0.01] border border-zinc-100 dark:border-white/5 hover:border-orange-500/20'}`}>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'bg-zinc-100 dark:bg-white/5 text-zinc-400'}`}>
                                {isBreak ? (
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
                                ) : (
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                                )}
                              </div>
                              <span className={`text-[11px] font-medium tabular-nums ${isActive ? 'text-orange-600' : 'text-zinc-500'}`}>
                                {slot.startTime} — {slot.endTime}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {isActive && <span className="text-[9px] font-semibold text-orange-500 animate-pulse tracking-wider mr-2">Live</span>}
                              {canEditCurrent && !isBreak && (
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                  <button onClick={(e) => { e.stopPropagation(); handleOpenEditSlot(slot); }} className="p-1.5 hover:text-orange-500 text-zinc-300 transition-colors border-none bg-transparent">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); handleDeleteSlot(slot.id); }} className="p-1.5 hover:text-red-500 text-zinc-300 transition-colors border-none bg-transparent">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="min-w-0">
                            <h4 className={`text-lg font-medium leading-tight mb-1 truncate ${isActive ? 'text-orange-600' : isBreak ? 'text-zinc-400' : 'text-zinc-800 dark:text-zinc-100'}`}>
                              {slot.subject}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${slot.type === 'lab' ? 'bg-blue-500/10 text-blue-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                {slot.type}
                              </span>
                              {!isBreak && slot.room !== 'N/A' && (
                                <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                                  Room {slot.room}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
          
          {/* Article Ad at the bottom of main schedule */}
          <NexusAd slot="7296989983" layout="in-article" format="fluid" hideLabel />
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="p-8 rounded-[40px] bg-zinc-100 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-[12px] font-medium text-orange-600/80 tracking-tight mb-6">Shared gaps</h3>
              {selectedEntityId === 'me' ? (
                <div className="py-4 text-center">
                  <p className="text-sm text-zinc-400">Select a connection below to find common free time.</p>
                </div>
              ) : commonBreaks.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-sm text-zinc-400">No common gaps found for {activeDay}.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {commonBreaks.map((b, i) => (
                    <div key={i} className="p-4 bg-white dark:bg-white/[0.03] rounded-2xl border border-zinc-100 dark:border-white/5">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-[10px] font-medium text-zinc-400 tracking-tight">Common break</p>
                        <span className="text-[10px] font-medium text-orange-600">{b.duration} mins</span>
                      </div>
                      <p className="text-lg font-medium text-zinc-800 dark:text-zinc-100">{b.start} — {b.end}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel p-8 rounded-[48px] border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#0a0a0a]">
            <h3 className="text-[11px] sm:text-xs font-medium text-zinc-400 mb-6">Your Connections</h3>
            <div className="space-y-4">
              <div
                onClick={() => setSelectedEntityId('me')}
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${selectedEntityId === 'me' ? 'bg-orange-600/10 border-orange-600' : 'bg-white dark:bg-[#0a0a0a] border-zinc-200 dark:border-white/5 hover:border-orange-500/30'}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center font-semibold text-[11px] sm:text-xs flex-shrink-0">{userProfile?.username?.[0] || 'M'}</div>
                  <div className="min-w-0 truncate">
                    <span className={`text-[11px] font-medium block truncate ${selectedEntityId === 'me' ? 'text-orange-500' : 'text-zinc-700 dark:text-white'}`}>
                      {myTimetable?.ownerName || 'My Profile'}
                    </span>
                    {myTimetable?.branch && (
                      <span className="text-[10px] font-medium text-zinc-500">{myTimetable.branch} • {myTimetable.year} • S{myTimetable.semester}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setRenameTargetId('me'); setNewName(myTimetable?.ownerName || ''); setShowRenameModal(true); }}
                    className="p-1.5 hover:text-orange-500 text-zinc-300 dark:text-white/20 transition-colors border-none bg-transparent"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  </button>
                </div>
              </div>

              {friendTimetables.map(friend => (
                <div key={friend.ownerId} className="space-y-2">
                  <div
                    onClick={() => setSelectedEntityId(friend.ownerId)}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${selectedEntityId === friend.ownerId ? 'bg-blue-600/10 border-blue-600' : 'bg-white dark:bg-[#0a0a0a] border-zinc-200 dark:border-white/5 hover:border-orange-500/30'}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-semibold text-[11px] sm:text-xs flex-shrink-0">{friend.ownerName?.[0] || 'F'}</div>
                      <div className="min-w-0 truncate">
                        <span className={`text-[11px] font-medium block truncate ${selectedEntityId === friend.ownerId ? 'text-blue-500' : 'text-zinc-700 dark:text-white'}`}>
                          {friend.ownerName}
                        </span>
                        {friend.branch && (
                          <span className="text-[10px] font-medium text-zinc-500">{friend.branch} • {friend.year} • S{friend.semester}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setRenameTargetId(friend.ownerId); setNewName(friend.ownerName); setShowRenameModal(true); }}
                        className="p-1.5 hover:text-blue-500 text-zinc-300 dark:text-white/20 transition-colors border-none bg-transparent"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveFriend(friend.ownerId, e)}
                        className="p-1.5 group/del hover:bg-red-500 transition-all border-none bg-transparent rounded-lg"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 text-zinc-300 dark:text-white/20 group-hover/del:text-white"><path d="M18 6L6 18M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={handleAddEmptyConnection}
                className="w-full p-4 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-white/5 hover:border-orange-500/30 hover:bg-orange-600/5 transition-all flex items-center justify-center gap-2 group border-none"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 text-zinc-400 group-hover:text-orange-500 transition-colors"><path d="M12 5v14M5 12h14" /></svg>
                <span className="text-[11px] sm:text-xs font-medium text-zinc-500 group-hover:text-orange-500 transition-colors">Add New Connection</span>
              </button>

            </div>
          </div>
        </div>
      </div>

      {showRenameModal && createPortal(
        <div
          className={`modal-overlay modal-overlay-fade ${isClosingRename ? 'closing' : ''}`}
          style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseRename(); }}
        >
          <div className={`nexus-modal w-full max-w-sm bg-white dark:bg-[#0d0d0d] rounded-[24px] border border-zinc-100 dark:border-white/5 shadow-xl ${isClosingRename ? 'closing' : ''}`}>
            <div className="p-8 text-center">
              <h3 className="text-xl font-medium text-zinc-800 dark:text-white mb-2">Rename Profile</h3>
              <p className="text-zinc-500 text-xs font-medium mb-8">Personalize the name for easier access.</p>
              
              <input
                autoFocus
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Enter name..."
                onKeyDown={e => e.key === 'Enter' && handleRename()}
                className="w-full bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/5 rounded-2xl px-5 py-3.5 text-sm font-medium text-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-orange-600/20 transition-all"
              />
              
              <div className="flex gap-3 mt-8">
                <button onClick={handleCloseRename} className="flex-1 py-3 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors border-none bg-transparent">Cancel</button>
                <button onClick={handleRename} className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-medium text-xs shadow-lg shadow-orange-600/20 active:scale-95 transition-all border-none">Update</button>
              </div>
            </div>
          </div>
        </div>,
        document.getElementById('modal-root') || document.body
      )}
      {showMetadataModal && createPortal(
        <div
          className={`modal-overlay modal-overlay-fade ${isClosingMetadata ? 'closing' : ''}`}
          style={{ backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)' }}
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseMetadata(); }}
        >
          <div className={`nexus-modal w-full max-w-lg bg-white dark:bg-[#0d0d0d] border border-zinc-100 dark:border-white/5 shadow-xl rounded-[32px] overflow-hidden ${isClosingMetadata ? 'closing' : ''}`}>
            <div className="p-10 pb-4 text-center">
              <div className="w-14 h-14 bg-orange-600/[0.03] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-orange-600/5 relative group">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 text-orange-600/80"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              </div>
              <h3 className="text-2xl font-medium text-zinc-800 dark:text-white mb-2 tracking-tight">
                {editingPresetId ? 'Update Timetable' : 'Extraction Complete'}
              </h3>
              <p className="text-zinc-500 text-xs font-medium opacity-80">
                {editingPresetId ? 'Review academic details before updating' : 'Provide details to categorize this schedule'}
              </p>
            </div>
            
            <div className="p-10 pt-4 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-zinc-400 ml-1 tracking-wider">Section code</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 325QB" 
                    value={metadata.section} 
                    onChange={e => setMetadata({ ...metadata, section: e.target.value.toUpperCase() })} 
                    className="w-full bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/5 rounded-2xl px-5 py-4 text-sm font-medium text-zinc-800 dark:text-white outline-none focus:ring-4 focus:ring-orange-600/5 transition-all placeholder:text-zinc-300 shadow-sm" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-zinc-400 ml-1 tracking-wider">Branch</label>
                  <input 
                    type="text" 
                    placeholder="e.g. CSE" 
                    value={metadata.branch} 
                    onChange={e => setMetadata({ ...metadata, branch: e.target.value.toUpperCase() })} 
                    className="w-full bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/5 rounded-2xl px-5 py-4 text-sm font-medium text-zinc-800 dark:text-white outline-none focus:ring-4 focus:ring-orange-600/5 transition-all placeholder:text-zinc-300 shadow-sm" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-zinc-400 ml-1 tracking-wider">Academic year</label>
                  <NexusDropdown
                    placeholder="Select Year"
                    options={['1st', '2nd', '3rd', '4th', '5th']}
                    value={metadata.year}
                    onChange={(val) => setMetadata({ ...metadata, year: val })}
                    className="w-full"
                    buttonClassName="!rounded-2xl !bg-zinc-50 dark:!bg-white/[0.03] !border-zinc-100 dark:!border-white/5 !px-5 !py-4 !min-w-0 !text-sm !font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-zinc-400 ml-1 tracking-wider">Semester</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10" 
                    placeholder="1-10" 
                    value={metadata.semester} 
                    onChange={e => setMetadata({ ...metadata, semester: e.target.value })} 
                    className="w-full bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/5 rounded-2xl px-5 py-4 text-sm font-medium text-zinc-800 dark:text-white outline-none focus:ring-4 focus:ring-orange-600/5 transition-all placeholder:text-zinc-300 shadow-sm" 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[11px] font-medium text-zinc-400">Activity map</p>
                  <span className="text-[10px] font-medium text-orange-600 bg-orange-600/5 px-3 py-1 rounded-full border border-orange-600/5">Verified extraction</span>
                </div>
                <div className="grid grid-cols-6 gap-2 p-4 bg-zinc-50 dark:bg-white/[0.01] border border-zinc-100 dark:border-white/5 rounded-3xl shadow-inner">
                  {DAYS.map(dayName => {
                    const dayData = pendingTimetable?.find(d => d.day === dayName);
                    const hasSlots = dayData && dayData.slots.length > 0;
                    return (
                      <div key={dayName} className="flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${hasSlots ? 'bg-white dark:bg-white/10 shadow-sm border border-zinc-100 dark:border-white/10' : 'opacity-20 grayscale'}`}>
                          <span className={`text-[11px] font-semibold ${hasSlots ? 'text-zinc-800 dark:text-white' : 'text-zinc-400'}`}>{dayName.substring(0, 1)}</span>
                        </div>
                        <span className={`text-[10px] font-medium transition-colors ${hasSlots ? 'text-orange-600' : 'text-zinc-300'}`}>
                          {dayData?.slots.length || 0}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <button 
                  onClick={handleMetadataSubmit} 
                  className="w-full py-5 bg-orange-600 text-white rounded-2xl font-semibold text-[14px] shadow-lg shadow-orange-600/10 active:scale-[0.96] hover:bg-orange-500 transition-all border-none relative overflow-hidden group"
                >
                  <span className="relative z-10">{editingPresetId ? 'Save Changes' : 'Confirm & Save'}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </button>
                <button 
                  onClick={handleCloseMetadata} 
                  className="w-full py-2 text-[11px] font-medium text-zinc-400 hover:text-red-500 transition-colors border-none bg-transparent"
                >
                  Discard results
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.getElementById('modal-root') || document.body
      )}
      {showUploadModal && createPortal(
        <div
          className={`modal-overlay modal-overlay-fade ${isClosingUpload ? 'closing' : ''}`}
          style={{ backdropFilter: 'blur(32px) saturate(160%)', WebkitBackdropFilter: 'blur(32px) saturate(160%)' }}
          onClick={(e) => { if (e.target === e.currentTarget && !isProcessingAI) handleCloseUpload(); }}
        >
          <div className={`nexus-modal w-full max-w-lg bg-white dark:bg-[#0d0d0d] border border-zinc-100 dark:border-white/5 shadow-2xl rounded-[24px] overflow-hidden ${isClosingUpload ? 'closing' : ''}`}>
            {/* Header - Reduced padding and size */}
            <div className="px-6 py-5 flex items-center justify-between border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.01]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-600/[0.03] dark:bg-orange-600/[0.05] border border-orange-600/5 rounded-xl flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-orange-600/80"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-800 dark:text-white tracking-tight">Import timetable</h3>
                  <p className="text-[10px] font-medium text-orange-600/60 tracking-tight">Step {importStep === 'input' ? '1' : '2'}: {importStep === 'input' ? 'Source' : 'Destination'}</p>
                </div>
              </div>
              <button 
                onClick={handleCloseUpload} 
                className="w-8 h-8 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-white/10 rounded-lg transition-all border-none bg-transparent text-zinc-400 hover:text-zinc-800 dark:hover:text-white"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6">
              {isProcessingAI ? (
                <div className="py-16 text-center space-y-6">
                  <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 border-[4px] border-orange-600/5 rounded-full" />
                    <div className="absolute inset-0 border-[4px] border-orange-600 rounded-full border-t-transparent animate-spin" style={{ animationDuration: '0.8s' }} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-semibold text-zinc-800 dark:text-white tabular-nums tracking-tighter">{Math.round(ocrProgress)}%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-zinc-800 dark:text-white animate-pulse">{processingStatus}</p>
                    <p className="text-[10px] text-zinc-500 font-medium leading-relaxed max-w-[200px] mx-auto opacity-70">Extracting schedule details...</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="max-h-[60vh] overflow-y-auto pr-1 no-scrollbar">
                    {importStep === 'input' ? (
                      <div className="space-y-6 animate-fade-in">
                        {/* Quick Paste Area */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between px-1">
                            <label className="text-[11px] font-semibold text-zinc-400 tracking-tight">Quick paste</label>
                            <span className="text-[9px] font-bold text-orange-600/80 bg-orange-600/5 px-2 py-0.5 rounded-full">Text mode</span>
                          </div>
                          <textarea
                            value={rawPastedText}
                            onChange={e => setRawPastedText(e.target.value)}
                            className="w-full h-32 bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 rounded-2xl p-4 text-[13px] font-medium focus:ring-4 focus:ring-orange-600/5 transition-all outline-none resize-none placeholder:text-zinc-300 shadow-inner"
                            placeholder="Paste your UMS Timetable text here..."
                          />
                        </div>

                        <div className="relative flex items-center gap-4 py-2">
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-200 dark:via-white/10 to-transparent"></div>
                          <span className="text-[9px] font-bold text-zinc-300 dark:text-zinc-600 tracking-[0.3em]">OR</span>
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-200 dark:via-white/10 to-transparent"></div>
                        </div>

                        {/* Screenshot Upload Area */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between px-1">
                            <label className="text-[11px] font-semibold text-zinc-400 tracking-tight">Snapshots</label>
                            <span className="text-[9px] font-bold text-zinc-500/80 bg-zinc-100 dark:bg-white/5 px-2 py-0.5 rounded-full">Visual mode</span>
                          </div>
                          <div 
                            onClick={() => fileInputRef.current?.click()} 
                            className="border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-2xl p-8 text-center hover:border-orange-500/50 hover:bg-orange-600/[0.01] transition-all cursor-pointer group bg-zinc-50/30 dark:bg-white/[0.01]"
                          >
                            <div className="space-y-3">
                              <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-xl border border-zinc-100 dark:border-white/5 flex items-center justify-center mx-auto group-hover:scale-105 transition-all shadow-sm">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-orange-600"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                              </div>
                              <div>
                                <p className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-100 tracking-tight">Select Screenshots</p>
                                <p className="text-[10px] font-medium text-zinc-400 mt-1 opacity-60">Drag images or click to browse</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {rawPastedText.length > 20 && (
                          <div className="pt-2 animate-slide-up">
                            <button 
                              onClick={() => setImportStep('destination')}
                              className="w-full py-3.5 bg-orange-600 text-white rounded-xl text-[12px] font-bold shadow-lg shadow-orange-600/10 active:scale-[0.98] transition-all border-none flex items-center justify-center gap-2"
                            >
                              Continue to destination
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6 animate-fade-in">
                        <div className="flex p-1 bg-zinc-100 dark:bg-white/[0.03] rounded-xl border border-zinc-200 dark:border-white/5 shadow-inner">
                          <button 
                            onClick={() => { setIsUpdatingPreset(false); setPresetToUpdateId(null); setSelectedUpdateProfile(null); }}
                            className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold transition-all border-none ${!isUpdatingPreset ? 'bg-white dark:bg-white/10 text-orange-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                          >
                            New Profile
                          </button>
                          <button 
                            onClick={() => setIsUpdatingPreset(true)}
                            className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold transition-all border-none ${isUpdatingPreset ? 'bg-white dark:bg-white/10 text-orange-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                          >
                            Update Existing
                          </button>
                        </div>

                        {isUpdatingPreset && !presetToUpdateId ? (
                          <div className="space-y-4 animate-fade-in">
                            <div className="relative">
                              <input 
                                type="text" 
                                placeholder="Search connections..." 
                                value={presetSearchQuery}
                                onChange={e => setPresetSearchQuery(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5 rounded-xl px-4 py-3 text-[13px] font-medium outline-none focus:ring-4 focus:ring-orange-600/10 transition-all placeholder:text-zinc-400 shadow-inner"
                              />
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-300"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                            </div>
                            
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                              {[myTimetable, ...friendTimetables]
                                .filter(Boolean)
                                .filter(p => p!.ownerName.toLowerCase().includes(presetSearchQuery.toLowerCase()))
                                .map(p => (
                                  <button
                                    key={p!.ownerId}
                                    onClick={() => { setPresetToUpdateId(p!.ownerId); setSelectedUpdateProfile(p); }}
                                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.01] border border-zinc-100 dark:border-white/5 text-left transition-all flex items-center justify-between group hover:border-orange-500/30 hover:bg-orange-600/[0.02]"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/5 border border-zinc-100 dark:border-white/5 flex items-center justify-center font-bold text-xs text-zinc-400 group-hover:text-orange-600 transition-all">
                                        {p!.ownerName[0]}
                                      </div>
                                      <div>
                                        <p className="text-[13px] font-semibold text-zinc-800 dark:text-white truncate group-hover:text-orange-600 transition-colors">{p!.ownerName}</p>
                                        <p className="text-[9px] font-medium text-zinc-400 tracking-tight">{p!.section || 'LOCAL'} • {p!.branch || 'UNSET'}</p>
                                      </div>
                                    </div>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-orange-600 opacity-0 group-hover:opacity-100 transition-all"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                  </button>
                                ))}

                              {communityPresets
                                .filter(p => p.name.toLowerCase().includes(presetSearchQuery.toLowerCase()))
                                .map(preset => (
                                  <button
                                    key={preset.id}
                                    onClick={() => { setPresetToUpdateId(preset.id); setSelectedUpdateProfile(preset); }}
                                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.01] border border-zinc-100 dark:border-white/5 text-left transition-all flex items-center justify-between group hover:border-orange-500/30 hover:bg-orange-600/[0.03]"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-orange-600/5 border border-orange-600/10 flex items-center justify-center font-bold text-xs text-orange-600/40 group-hover:text-orange-600 transition-all">
                                        H
                                      </div>
                                      <div>
                                        <p className="text-[13px] font-semibold text-zinc-800 dark:text-white truncate group-hover:text-orange-600 transition-colors">{preset.name}</p>
                                        <p className="text-[9px] font-medium text-zinc-400 tracking-tight">{preset.section} • Sem {preset.semester}</p>
                                      </div>
                                    </div>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-orange-600 opacity-0 group-hover:opacity-100 transition-all"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                  </button>
                                ))}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-6 animate-fade-in">
                            {isUpdatingPreset && selectedUpdateProfile && (
                              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-600/5 border border-orange-100 dark:border-orange-500/10 rounded-xl">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center shadow-sm">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-white"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                  </div>
                                  <div>
                                      <p className="text-[9px] font-bold text-orange-600/60 uppercase tracking-widest">Target profile</p>
                                      <p className="text-[13px] font-semibold text-zinc-800 dark:text-white truncate">{selectedUpdateProfile.ownerName || selectedUpdateProfile.name}</p>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => { setPresetToUpdateId(null); setSelectedUpdateProfile(null); }}
                                  className="px-3 py-1.5 text-[10px] font-bold text-zinc-500 hover:text-orange-600 transition-colors bg-zinc-100 dark:bg-white/5 rounded-lg border-none"
                                >
                                  Change
                                </button>
                              </div>
                            )}

                            <div className="flex flex-col gap-3">
                              <button 
                                onClick={handleFinalizeImport}
                                className="w-full py-3 bg-orange-600 text-white rounded-xl text-[12px] font-bold shadow-lg shadow-orange-600/20 active:scale-[0.98] transition-all border-none"
                              >
                                {isUpdatingPreset ? 'Sync with selected profile' : 'Create new profile'}
                              </button>
                              <button 
                                onClick={() => { setImportStep('input'); setPendingTimetable([]); }}
                                className="w-full py-2 text-[10px] font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors border-none bg-transparent"
                              >
                                ← Back to source
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      handleFileUpload(e);
                      // After file selection, the logic in handleFileUpload should probably handle the next step
                      // But the user wants the option to pick destination LATER.
                      // So we let the OCR happen, and then we'll be in 'destination' step.
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>,
        document.getElementById('modal-root') || document.body
      )}
    </div>
  );
};

export default TimetableHub;
