
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { UserProfile, TimetableData, DaySchedule, TimetableSlot } from '../types.ts';
import NexusServer from '../services/nexusServer.ts';
import { extractTimetableFromImage } from '../services/geminiService.ts';
import NexusDropdown from './NexusDropdown.tsx';
import { useUniversity } from '../hooks/useUniversity.tsx';
import { showToast, showConfirm } from './Toast.tsx';
import NexusAd from './NexusAd.tsx';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const timeToMinutes = (time: string) => {
  if (!time) return 0;
  let [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const MX325_SCHEDULE: DaySchedule[] = [
  {
    day: 'Monday',
    slots: [
      { id: 'm1', subject: 'MTH166', room: '27-407A', startTime: '09:00', endTime: '10:00', type: 'class' },
      { id: 'm2', subject: 'INT306', room: '27-407A', startTime: '10:00', endTime: '11:00', type: 'class' },
      { id: 'm3', subject: 'INT306', room: '27-407A', startTime: '11:00', endTime: '12:00', type: 'class' },
      { id: 'm4', subject: 'PEL130', room: '28-406', startTime: '13:00', endTime: '14:00', type: 'lab' },
      { id: 'm5', subject: 'CSE101', room: '27-101', startTime: '15:00', endTime: '16:00', type: 'lab' },
      { id: 'm6', subject: 'CSE101', room: '27-101', startTime: '16:00', endTime: '17:00', type: 'lab' },
    ]
  },
  {
    day: 'Tuesday',
    slots: [
      { id: 't1', subject: 'INT306', room: '37-906', startTime: '09:00', endTime: '10:00', type: 'lab' },
      { id: 't2', subject: 'INT306', room: '37-906', startTime: '10:00', endTime: '11:00', type: 'lab' },
      { id: 't3', subject: 'ECE279', room: '36-101', startTime: '11:00', endTime: '12:00', type: 'lab' },
      { id: 't4', subject: 'ECE279', room: '36-101', startTime: '12:00', endTime: '13:00', type: 'lab' },
      { id: 't5', subject: 'PEL130', room: '28-507A', startTime: '13:00', endTime: '14:00', type: 'class' },
      { id: 't6', subject: 'ECE249', room: '27-101', startTime: '15:00', endTime: '16:00', type: 'class' },
      { id: 't7', subject: 'CSE320', room: '27-101', startTime: '16:00', endTime: '17:00', type: 'class' },
    ]
  },
  {
    day: 'Wednesday',
    slots: [
      { id: 'w1', subject: 'PEL130', room: '37-708', startTime: '09:00', endTime: '10:00', type: 'lab' },
      { id: 'w2', subject: 'PEL130', room: '37-708', startTime: '10:00', endTime: '11:00', type: 'lab' },
      { id: 'w3', subject: 'CHE110', room: '37-609', startTime: '11:00', endTime: '12:00', type: 'class' },
      { id: 'w4', subject: 'MTH166', room: '28-308', startTime: '13:00', endTime: '14:00', type: 'class' },
      { id: 'w5', subject: 'CSE320', room: '27-101A', startTime: '14:00', endTime: '15:00', type: 'class' },
      { id: 'w6', subject: 'CSE121', room: '26-505', startTime: '16:00', endTime: '17:00', type: 'class' },
    ]
  },
  {
    day: 'Thursday',
    slots: [
      { id: 'th1', subject: 'INT306', room: '37-609', startTime: '09:00', endTime: '10:00', type: 'class' },
      { id: 'th2', subject: 'MTH166', room: '37-609', startTime: '10:00', endTime: '11:00', type: 'class' },
      { id: 'th3', subject: 'CSE101', room: '37-609', startTime: '11:00', endTime: '12:00', type: 'class' },
      { id: 'th4', subject: 'CSE101', room: '37-609', startTime: '12:00', endTime: '13:00', type: 'class' },
      { id: 'th5', subject: 'ECE249', room: '37-703', startTime: '14:00', endTime: '15:00', type: 'class' },
      { id: 'th6', subject: 'CSE320', room: '37-703', startTime: '15:00', endTime: '16:00', type: 'class' },
      { id: 'th7', subject: 'CSE121', room: '37-703', startTime: '16:00', endTime: '17:00', type: 'class' },
    ]
  },
  {
    day: 'Friday',
    slots: [
      { id: 'f1', subject: 'CSE101', room: '27-309', startTime: '11:00', endTime: '12:00', type: 'class' },
      { id: 'f2', subject: 'ECE249', room: '27-407A', startTime: '14:00', endTime: '15:00', type: 'class' },
      { id: 'f3', subject: 'CHE110', room: '27-407A', startTime: '15:00', endTime: '16:00', type: 'class' },
      { id: 'f4', subject: 'MTH166', room: '27-106', startTime: '16:00', endTime: '17:00', type: 'class' },
    ]
  }
];

// Fix: Added missing schedule constants to resolve name errors in batch presets
const SECTION_325QB_SCHEDULE: DaySchedule[] = [
  {
    day: 'Monday',
    slots: [
      { id: 'qb-m1', subject: 'CSE320', room: '37-907', startTime: '09:00', endTime: '10:00', type: 'class' },
      { id: 'qb-m2', subject: 'CSE101', room: '37-907', startTime: '10:00', endTime: '11:00', type: 'class' },
      { id: 'qb-m3', subject: 'CSE101', room: '37-907', startTime: '11:00', endTime: '12:00', type: 'class' },
      { id: 'qb-m4', subject: 'PEL125', room: '29-305', startTime: '13:00', endTime: '14:00', type: 'lab' },
      { id: 'qb-m5', subject: 'ECE249', room: '37-708', startTime: '14:00', endTime: '15:00', type: 'class' },
      { id: 'qb-m6', subject: 'INT306', room: '37-707', startTime: '15:00', endTime: '16:00', type: 'lab' },
      { id: 'qb-m7', subject: 'INT306', room: '37-707', startTime: '16:00', endTime: '17:00', type: 'lab' },
    ]
  },
  {
    day: 'Tuesday',
    slots: [
      { id: 'qb-t1', subject: 'INT306', room: '37-902', startTime: '09:00', endTime: '10:00', type: 'class' },
      { id: 'qb-t2', subject: 'INT306', room: '37-902', startTime: '10:00', endTime: '11:00', type: 'class' },
      { id: 'qb-t3', subject: 'CSE320', room: '37-902', startTime: '11:00', endTime: '12:00', type: 'class' },
      { id: 'qb-t4', subject: 'PEL125', room: '34-508', startTime: '13:00', endTime: '14:00', type: 'class' },
      { id: 'qb-t5', subject: 'CHE110', room: '27-402', startTime: '14:00', endTime: '15:00', type: 'class' },
      { id: 'qb-t6', subject: 'CSE121', room: '37-702', startTime: '15:00', endTime: '16:00', type: 'class' },
      { id: 'qb-t7', subject: 'ECE249', room: '37-702', startTime: '16:00', endTime: '17:00', type: 'class' },
    ]
  },
  {
    day: 'Wednesday',
    slots: [
      { id: 'qb-w1', subject: 'PEL125', room: '34-506', startTime: '09:00', endTime: '10:00', type: 'lab' },
      { id: 'qb-w2', subject: 'PEL125', room: '34-506', startTime: '10:00', endTime: '11:00', type: 'lab' },
      { id: 'qb-w3', subject: 'CSE101', room: '37-607', startTime: '11:00', endTime: '12:00', type: 'class' },
      { id: 'qb-w4', subject: 'MTH166', room: '37-607', startTime: '12:00', endTime: '13:00', type: 'class' },
      { id: 'qb-w5', subject: 'CHE110', room: '27-101', startTime: '14:00', endTime: '15:00', type: 'class' },
      { id: 'qb-w6', subject: 'INT306', room: '27-101', startTime: '15:00', endTime: '16:00', type: 'class' },
      { id: 'qb-w7', subject: 'ECE249', room: '27-101', startTime: '16:00', endTime: '17:00', type: 'class' },
    ]
  },
  {
    day: 'Thursday',
    slots: [
      { id: 'qb-th1', subject: 'MTH166', room: '37-907', startTime: '09:00', endTime: '10:00', type: 'class' },
      { id: 'qb-th2', subject: 'CSE101', room: '37-907', startTime: '10:00', endTime: '11:00', type: 'lab' },
      { id: 'qb-th3', subject: 'CSE101', room: '37-907', startTime: '11:00', endTime: '12:00', type: 'lab' },
      { id: 'qb-th4', subject: 'MTH166', room: '37-908', startTime: '15:00', endTime: '16:00', type: 'class' },
    ]
  },
  {
    day: 'Friday',
    slots: [
      { id: 'qb-f1', subject: 'MTH166', room: '37-808', startTime: '11:00', endTime: '12:00', type: 'class' },
      { id: 'qb-f2', subject: 'ECE279', room: '36-104', startTime: '13:00', endTime: '14:00', type: 'lab' },
      { id: 'qb-f3', subject: 'ECE279', room: '36-104', startTime: '14:00', endTime: '15:00', type: 'lab' },
      { id: 'qb-f4', subject: 'CSE121', room: '37-907', startTime: '15:00', endTime: '16:00', type: 'class' },
      { id: 'qb-f5', subject: 'CSE320', room: '37-907', startTime: '16:00', endTime: '17:00', type: 'class' },
    ]
  }
];

const SECTION_325QG_SCHEDULE: DaySchedule[] = [
  {
    day: 'Monday',
    slots: [
      { id: 'qg-m1', subject: 'PEL121', room: '37-903', startTime: '09:00', endTime: '10:00', type: 'class' },
      { id: 'qg-m2', subject: 'INT306', room: '37-903', startTime: '10:00', endTime: '11:00', type: 'class' },
      { id: 'qg-m3', subject: 'ECE279', room: '33-102', startTime: '11:00', endTime: '12:00', type: 'lab' },
      { id: 'qg-m4', subject: 'ECE279', room: '33-102', startTime: '12:00', endTime: '13:00', type: 'lab' },
      { id: 'qg-m5', subject: 'ECE249', room: '37-706', startTime: '14:00', endTime: '15:00', type: 'class' },
      { id: 'qg-m6', subject: 'CSE101', room: '37-706', startTime: '15:00', endTime: '16:00', type: 'class' },
      { id: 'qg-m7', subject: 'CSE101', room: '37-706', startTime: '16:00', endTime: '17:00', type: 'class' },
    ]
  },
  {
    day: 'Tuesday',
    slots: [
      { id: 'qg-t1', subject: 'MTH166', room: '37-809', startTime: '09:00', endTime: '10:00', type: 'class' },
      { id: 'qg-t2', subject: 'PEL121', room: '37-809', startTime: '10:00', endTime: '11:00', type: 'lab' },
      { id: 'qg-t3', subject: 'CSE101', room: '37-901', startTime: '11:00', endTime: '12:00', type: 'class' },
      { id: 'qg-t4', subject: 'CHE110', room: '37-901', startTime: '12:00', endTime: '13:00', type: 'class' },
      { id: 'qg-t5', subject: 'ECE249', room: '37-609', startTime: '14:00', endTime: '15:00', type: 'class' },
      { id: 'qg-t6', subject: 'CSE320', room: '37-609', startTime: '15:00', endTime: '16:00', type: 'class' },
    ]
  },
  {
    day: 'Wednesday',
    slots: [
      { id: 'qg-w1', subject: 'MTH166', room: '37-902', startTime: '09:00', endTime: '10:00', type: 'class' },
      { id: 'qg-w2', subject: 'CSE121', room: '37-902', startTime: '10:00', endTime: '11:00', type: 'class' },
      { id: 'qg-w3', subject: 'CSE121', room: '37-902', startTime: '11:00', endTime: '12:00', type: 'class' },
      { id: 'qg-w4', subject: 'PEL121', room: '37-605', startTime: '13:00', endTime: '14:00', type: 'lab' },
      { id: 'qg-w5', subject: 'PEL121', room: '37-605', startTime: '14:00', endTime: '15:00', type: 'lab' },
      { id: 'qg-w6', subject: 'CSE320', room: '37-710', startTime: '15:00', endTime: '16:00', type: 'class' },
    ]
  },
  {
    day: 'Thursday',
    slots: [
      { id: 'qg-th1', subject: 'MTH166', room: '37-607', startTime: '09:00', endTime: '10:00', type: 'class' },
      { id: 'qg-th2', subject: 'INT306', room: '37-607', startTime: '10:00', endTime: '11:00', type: 'lab' },
      { id: 'qg-th3', subject: 'INT306', room: '37-607', startTime: '11:00', endTime: '12:00', type: 'lab' },
      { id: 'qg-th4', subject: 'ECE249', room: '37-607', startTime: '12:00', endTime: '13:00', type: 'class' },
      { id: 'qg-th5', subject: 'CHE110', room: '37-701', startTime: '14:00', endTime: '15:00', type: 'class' },
      { id: 'qg-th6', subject: 'CSE320', room: '37-701', startTime: '15:00', endTime: '16:00', type: 'class' },
    ]
  },
  {
    day: 'Friday',
    slots: [
      { id: 'qg-f1', subject: 'MTH166', room: '37-807', startTime: '09:00', endTime: '10:00', type: 'class' },
      { id: 'qg-f2', subject: 'INT306', room: '37-807', startTime: '10:00', endTime: '11:00', type: 'class' },
      { id: 'qg-f3', subject: 'INT306', room: '37-807', startTime: '11:00', endTime: '12:00', type: 'class' },
      { id: 'qg-f4', subject: 'CSE101', room: '28-408', startTime: '13:00', endTime: '14:00', type: 'lab' },
      { id: 'qg-f5', subject: 'CSE101', room: '28-408', startTime: '14:00', endTime: '15:00', type: 'lab' },
    ]
  }
];

const PRESET_BATCHES = [
  { id: '325qb-2026', name: '325QB - CSE 2nd Sem 2026', schedule: SECTION_325QB_SCHEDULE, section: '325QB', branch: 'CSE', year: '2nd', semester: '2' },
  { id: '325qg-2026', name: '325QG - CSE 2nd Sem 2026', schedule: SECTION_325QG_SCHEDULE, section: '325QG', branch: 'CSE', year: '2nd', semester: '2' },
  { id: '325mx-2026', name: '325MX - CSE 2nd Sem 2026', schedule: MX325_SCHEDULE, section: '325MX', branch: 'CSE', year: '2nd', semester: '2' },
];

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

  const [isProcessingAI, setIsProcessingAI] = useState(false);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingAI(true);
    const combinedSchedules: DaySchedule[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        setProcessingStatus(`Scanning Day ${i + 1}/${files.length}...`);
        const base64 = await readFileAsDataURL(files[i]);
        const daySchedule = await extractTimetableFromImage(base64, university.name);

        daySchedule.forEach(newDay => {
          const existing = combinedSchedules.find(s => s.day === newDay.day);
          if (existing) {
            existing.slots = [...existing.slots, ...newDay.slots].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
          } else {
            combinedSchedules.push(newDay);
          }
        });
      }

      setPendingTimetable(combinedSchedules);
      setEditingPresetId(null);
      setMetadata({ section: '', year: '', branch: '', semester: '' });
      handleCloseUpload();
      setShowMetadataModal(true);
    } catch (err) {
      showToast("AI was unable to process those images. Please ensure they are clear screenshots from LPU Touch.", "error");
    } finally {
      setIsProcessingAI(false);
      setProcessingStatus('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const submitMetadata = async () => {
    const { section, branch, year, semester } = metadata;
    if (!section || !branch || !year || !semester) {
      showToast("Please fill all details to continue.", "info");
      return;
    }

    if (editingPresetId) {
      try {
        const generatedName = `${section} - ${branch} ${year} Year Sem ${semester}`;

        // 1. Update Community/Preset if it exists
        await NexusServer.updateCommunityTimetable(editingPresetId, metadata);
        loadCommunityPresets();

        // 2. Update Local Record if it matches the editing ID
        if (myTimetable && (myTimetable.ownerId === editingPresetId || editingPresetId === 'me' || editingPresetId === (userProfile?.id || 'local-me'))) {
          const updated = { ...myTimetable, ...metadata, ownerName: generatedName };
          setMyTimetable(updated);
          await NexusServer.saveRecord(userProfile?.id || null, 'timetable_main', generatedName, updated);
        } else {
          setFriendTimetables(prev => prev.map(f => f.ownerId === editingPresetId ? { ...f, ...metadata, ownerName: generatedName } : f));
        }

        handleCloseMetadata();
      } catch (e) { console.error(e); showToast("Failed to update preset info.", "error"); }
      return;
    }

    if (!pendingTimetable) return;

    const generatedName = `${section} - ${branch} ${year} Year Sem ${semester}`;
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
      semester: batch.semester
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
          <h2 className="text-3xl font-bold text-zinc-800 dark:text-white mb-2 tracking-tighter">
            Timetable <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Hub</span>
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 font-medium text-[11px] sm:text-xs">Organize your classes and find time to meet with friends.</p>
        </div>
        <div className="flex gap-3">
          <NexusDropdown
            placeholder="Batch Presets"
            options={[]}
            onChange={() => { }}
            className="flex-shrink-0"
            renderCustomMenu={(close) => (
              <div className="w-[320px] md:w-[400px] p-4 space-y-6 max-h-[500px] overflow-y-auto no-scrollbar">
                <section className="space-y-3">
                  <h4 className="text-[11px] sm:text-xs font-medium text-zinc-500 ml-1">Standard Batches</h4>
                  <div className="space-y-2">
                    {PRESET_BATCHES.map(batch => (
                      <div key={batch.id} className="relative group/card">
                        <button
                          onClick={() => {
                            setTargetForAction(selectedEntityId === 'me' ? 'me' : 'friend');
                            applyPreset(batch, selectedEntityId === 'me' ? undefined : selectedEntityId);
                            close();
                          }}
                          className="w-full p-4 bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5 rounded-2xl text-left hover:border-orange-500/50 hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-all flex items-center justify-between group border-none"
                        >
                          <div className="min-w-0 pr-12">
                            <p className="text-[11px] sm:text-xs font-medium text-zinc-800 dark:text-white truncate">{batch.name}</p>
                            <p className="text-[11px] sm:text-xs font-bold text-zinc-500 uppercase mt-0.5">Full 5-Day Schedule</p>
                          </div>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 text-white/20 group-hover:text-orange-600 transition-colors"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                {communityPresets.length > 0 && (
                  <section className="space-y-3">
                    <h4 className="text-[11px] sm:text-xs font-medium text-orange-500 ml-1">Community Uploads</h4>
                    <div className="space-y-2">
                      {communityPresets.map(preset => (
                        <div key={preset.id} className="relative group/card">
                          <button
                            onClick={() => {
                              setTargetForAction(selectedEntityId === 'me' ? 'me' : 'friend');
                              applyPreset(preset, selectedEntityId === 'me' ? undefined : selectedEntityId);
                              close();
                            }}
                            className="w-full p-4 bg-zinc-50 dark:bg-orange-600/[0.03] border border-zinc-200 dark:border-orange-600/10 rounded-2xl text-left hover:border-orange-500/50 hover:bg-zinc-100 dark:hover:bg-orange-600/[0.05] transition-all flex items-center justify-between group border-none"
                          >
                            <div className="min-w-0 pr-16">
                              <p className="text-[11px] sm:text-xs font-medium text-zinc-800 dark:text-white truncate">{preset.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[11px] sm:text-xs font-black text-zinc-500 uppercase tracking-widest">{preset.branch}</span>
                                <span className="w-1 h-1 bg-white/10 rounded-full" />
                                <span className="text-[11px] sm:text-xs font-black text-zinc-500 uppercase tracking-widest">{preset.year}</span>
                              </div>
                            </div>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 text-white/20 group-hover:text-orange-600 transition-colors"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
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
          <button key={day} onClick={() => setActiveDay(day)} className={`flex-shrink-0 px-8 py-4 rounded-3xl text-[11px] sm:text-xs font-medium transition-all border-none ${activeDay === day ? 'bg-orange-600 text-white shadow-2xl scale-105' : 'bg-white/5 text-zinc-500 hover:text-white'}`}>{day}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          {(!activeTimetable || !activeTimetable.schedule || activeTimetable.schedule.length === 0) ? (
            <div className="glass-panel p-16 rounded-[48px] border-4 border-dashed border-zinc-200 dark:border-white/5 flex flex-col items-center justify-center text-center bg-zinc-100 dark:bg-[#0a0a0a]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-20 h-20 mb-6"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              <h3 className="text-xl font-mediumer">No Schedule Data</h3>
              <p className="text-[11px] sm:text-xs font-bold mt-2">Use a Batch Preset or Upload screenshots for {activeTimetable?.ownerName || (selectedEntityId === 'me' ? 'your profile' : 'this friend')}.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-4">
                <h3 className="text-[11px] sm:text-xs font-medium text-orange-600">{activeDay} Schedule ({activeTimetable.ownerName})</h3>
                <span className="text-[11px] sm:text-xs font-bold text-zinc-500 uppercase">{daySlotsWithBreaks.filter(s => s.type !== 'break').length} Activities Today</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
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

                    let statusLabel = 'Plan';
                    if (isCurrentDay) {
                      if (isActive) statusLabel = 'Now';
                      else if (isFinished) statusLabel = 'Done';
                      else if (isUpcoming) statusLabel = 'Next';
                    }

                    return (
                      <div key={slot.id} className={`group relative p-3.5 md:p-5 rounded-[24px] md:rounded-[32px] transition-all flex flex-col justify-between ${isActive ? 'bg-orange-600/10 border border-orange-500 shadow-2xl scale-[1.02] z-10' : isFinished ? 'bg-zinc-50 dark:bg-white/[0.01] border border-transparent opacity-40 grayscale' : isBreak ? 'bg-zinc-50/50 dark:bg-white/[0.02] border border-dashed border-zinc-200 dark:border-white/10' : 'bg-white dark:bg-[#0a0a0a] border border-zinc-100 dark:border-white/5 hover:border-orange-500/30'}`}>

                        <div className="space-y-2 md:space-y-4">
                          <div className="flex justify-between items-center gap-2">
                            <div className={`px-2 py-0.5 md:px-3 md:py-1.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black whitespace-nowrap tabular-nums ${isActive ? 'bg-orange-600 text-white' : 'bg-zinc-100 dark:bg-white/5 text-zinc-500'}`}>
                              {slot.startTime} — {slot.endTime}
                            </div>
                            <div className={`px-2 py-0.5 text-[9px] md:text-xs font-black uppercase tracking-widest rounded-md ${isActive ? 'text-orange-500 animate-pulse' : isFinished ? 'text-zinc-400' : 'text-zinc-300'}`}>
                              {statusLabel}
                            </div>
                          </div>

                          <div className="min-w-0">
                            <h4 className={`text-sm md:text-xl font-bold leading-tight mb-0.5 md:mb-2 truncate ${isActive ? 'text-orange-600' : isBreak ? 'text-zinc-400' : 'text-zinc-800 dark:text-white'}`}>
                              {slot.subject}
                            </h4>
                            <p className="text-[9px] md:text-xs font-bold text-zinc-500 dark:text-zinc-400/60 uppercase tracking-widest leading-tight truncate">
                              {isBreak ? 'Free Window' : `Room ${slot.room} • ${slot.type}`}
                            </p>
                          </div>
                        </div>

                        {isActive && (
                          <div className="mt-2 md:mt-4 flex items-center gap-1.5 overflow-hidden">
                            <span className="flex h-1 w-1 md:h-1.5 md:w-1.5 relative shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1 w-1 md:h-1.5 md:w-1.5 bg-orange-500"></span>
                            </span>
                            <span className="text-[9px] md:text-xs font-black text-orange-600 uppercase tracking-widest truncate">Session in progress</span>
                          </div>
                        )}
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
          <div className="p-8 rounded-[48px] bg-gradient-to-br from-orange-600 to-red-700 text-white shadow-2xl relative overflow-hidden group border-none">
            <div className="relative z-10">
              <h3 className="text-[11px] sm:text-xs font-medium opacity-80 mb-6">Shared Gaps</h3>
              {selectedEntityId === 'me' ? (
                <div className="py-4 text-center">
                  <p className="text-[11px] sm:text-xs font-medium opacity-60 tracking-widest">Select a connection below to compare free time.</p>
                </div>
              ) : commonBreaks.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-[11px] sm:text-xs font-medium opacity-60 tracking-widest">No common gaps found for {activeDay}.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {commonBreaks.map((b, i) => (
                    <div key={i} className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-[11px] sm:text-xs font-medium">Common Break</p>
                        <span className="text-[11px] sm:text-xs font-bold opacity-50">{b.duration} mins</span>
                      </div>
                      <p className="text-lg font-black tracking-tight">{b.start} — {b.end}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 blur-[60px] rounded-full pointer-events-none" />
          </div>

          <div className="glass-panel p-8 rounded-[48px] border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#0a0a0a]">
            <h3 className="text-[11px] sm:text-xs font-medium text-zinc-400 mb-6">Your Connections</h3>
            <div className="space-y-4">
              <div
                onClick={() => setSelectedEntityId('me')}
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${selectedEntityId === 'me' ? 'bg-orange-600/10 border-orange-600' : 'bg-white dark:bg-[#0a0a0a] border-zinc-200 dark:border-white/5 hover:border-orange-500/30'}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center font-black text-[11px] sm:text-xs uppercase flex-shrink-0">{userProfile?.username?.[0] || 'M'}</div>
                  <div className="min-w-0 truncate">
                    <span className={`text-[11px] font-bold block truncate ${selectedEntityId === 'me' ? 'text-orange-500' : 'text-zinc-700 dark:text-white'}`}>
                      {myTimetable?.ownerName || 'My Profile'}
                    </span>
                    {myTimetable?.branch && (
                      <span className="text-[11px] sm:text-xs font-black text-zinc-500 uppercase tracking-widest">{myTimetable.branch} • {myTimetable.year} • S{myTimetable.semester}</span>
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
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-black text-[11px] sm:text-xs uppercase flex-shrink-0">{friend.ownerName?.[0] || 'F'}</div>
                      <div className="min-w-0 truncate">
                        <span className={`text-[11px] font-bold block truncate ${selectedEntityId === friend.ownerId ? 'text-blue-500' : 'text-zinc-700 dark:text-white'}`}>
                          {friend.ownerName}
                        </span>
                        {friend.branch && (
                          <span className="text-[11px] sm:text-xs font-black text-zinc-500 uppercase tracking-widest">{friend.branch} • {friend.year} • S{friend.semester}</span>
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
          <div className={`nexus-modal w-full max-w-sm ${isClosingRename ? 'closing' : ''}`}>
            <div className="p-8 text-center text-zinc-800 dark:text-white">
              <h3 className="text-xl font-bold tracking-tight uppercase mb-2">Rename Profile</h3>
              <p className="text-zinc-500 text-[11px] sm:text-xs font-medium">Personalize the name</p>
              <div className="mt-8">
                <input
                  autoFocus
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Enter name..."
                  onKeyDown={e => e.key === 'Enter' && handleRename()}
                  className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-zinc-800 dark:text-white outline-none focus:ring-4 focus:ring-orange-600/10 transition-all"
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button onClick={handleCloseRename} className="flex-1 py-3 text-[11px] sm:text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors border-none bg-transparent">Cancel</button>
                <button onClick={handleRename} className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-black text-[11px] sm:text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all border-none">Update</button>
              </div>
            </div>
          </div>
        </div>,
        document.getElementById('modal-root') || document.body
      )}

      {showMetadataModal && createPortal(
        <div
          className={`modal-overlay modal-overlay-fade ${isClosingMetadata ? 'closing' : ''}`}
          style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseMetadata(); }}
        >
          <div className={`nexus-modal w-full max-w-sm ${isClosingMetadata ? 'closing' : ''}`}>
            <div className="p-8 text-center space-y-2">
              <div className="w-16 h-16 bg-orange-600/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-orange-600/20">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8 text-orange-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              </div>
              <h3 className="text-2xl font-bold tracking-tight uppercase text-zinc-800 dark:text-white">{editingPresetId ? 'Edit Preset' : 'Scan Success'}</h3>
              <p className="text-zinc-500 text-[11px] sm:text-xs font-medium">{editingPresetId ? 'Update details' : 'Verify timetable parameters'}</p>
            </div>
            <div className="p-8 pt-0 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] sm:text-xs font-medium text-zinc-500 ml-1">Section Code</label>
                <input type="text" placeholder="e.g. 325QB" value={metadata.section} onChange={e => setMetadata({ ...metadata, section: e.target.value.toUpperCase() })} className="w-full bg-zinc-50 dark:bg-[#0a0a0a]/40 border border-zinc-200 dark:border-white/10 rounded-2xl px-5 py-4 text-[11px] sm:text-xs font-bold text-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-orange-600 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] sm:text-xs font-medium text-zinc-500 ml-1">Branch</label>
                <input type="text" placeholder="e.g. CSE" value={metadata.branch} onChange={e => setMetadata({ ...metadata, branch: e.target.value.toUpperCase() })} className="w-full bg-zinc-50 dark:bg-[#0a0a0a]/40 border border-zinc-200 dark:border-white/10 rounded-2xl px-5 py-4 text-[11px] sm:text-xs font-bold text-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-orange-600 transition-all" />
              </div>
              <div className="space-y-2 text-left">
                <NexusDropdown
                  label="Current Year"
                  placeholder="Select Year"
                  options={['1st', '2nd', '3rd', '4th']}
                  value={metadata.year}
                  onChange={(val) => setMetadata({ ...metadata, year: val })}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] sm:text-xs font-medium text-zinc-500 ml-1">Semester</label>
                <input type="number" min="1" max="8" placeholder="1-8" value={metadata.semester} onChange={e => setMetadata({ ...metadata, semester: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-[11px] sm:text-xs font-bold text-white outline-none focus:ring-2 focus:ring-orange-600 transition-all" />
              </div>
              <div className="col-span-2 pt-6">
                <button onClick={submitMetadata} className="w-full py-5 bg-orange-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-orange-600/30 hover:scale-[1.02] active:scale-95 transition-all border-none">{editingPresetId ? 'Save Admin Changes' : 'Save to Community Presets'}</button>
                {editingPresetId && (
                  <button onClick={handleCloseMetadata} className="w-full mt-2 py-3 text-[11px] sm:text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors border-none bg-transparent">Cancel Edit</button>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.getElementById('modal-root') || document.body
      )}

      {showUploadModal && createPortal(
        <div
          className={`modal-overlay modal-overlay-fade ${isClosingUpload ? 'closing' : ''}`}
          style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
          onClick={(e) => { if (e.target === e.currentTarget && !isProcessingAI) handleCloseUpload(); }}
        >
          <div className={`nexus-modal w-full max-w-sm ${isClosingUpload ? 'closing' : ''}`}>
            <div className="p-8 text-center relative bg-zinc-50 dark:bg-[#0a0a0a]/20 border-b border-zinc-100 dark:border-white/5">
              <button onClick={handleCloseUpload} className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors border-none bg-transparent">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
              <div className="w-14 h-14 bg-orange-600/10 rounded-[24px] flex items-center justify-center mx-auto mb-4 border border-orange-600/20">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-7 h-7 text-orange-600"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              </div>
              <h3 className="text-2xl font-bold tracking-tight uppercase leading-none">Upload</h3>
              <p className="text-zinc-500 text-[11px] sm:text-xs font-black mt-2 uppercase tracking-widest">Connect screenshots for {targetForAction === 'me' ? (myTimetable?.ownerName || 'Profile') : 'Identity'}</p>
            </div>
            <div className="p-8 space-y-6">
              {isProcessingAI ? (
                <div className="py-10 text-center space-y-6">
                  <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-[10px] font-medium tracking-0.2em text-orange-600 animate-pulse">{processingStatus}</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <label className="block text-[11px] sm:text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Paste UMS Content</label>
                    <textarea
                      value={rawPastedText}
                      className="w-full h-40 bg-white dark:bg-[#0c0c0c] border-2 border-zinc-100 dark:border-white/5 rounded-3xl p-6 text-[11px] sm:text-xs font-medium focus:border-orange-500/50 transition-all outline-none resize-none"
                      placeholder="Select and Copy everything from your UMS Timetable page (Ctrl+A, Ctrl+C) and paste it here..."
                    />
                  </div>
                  <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-white/10 rounded-[32px] p-12 text-center hover:border-orange-500/50 transition-all cursor-pointer bg-white/[0.02] group">
                    <p className="text-[11px] sm:text-xs font-medium text-zinc-500 group-hover:text-white transition-colors">Select Images</p>
                    <p className="text-[11px] sm:text-xs font-bold uppercase text-zinc-600 mt-2">Upload multiple images for a full week</p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
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
