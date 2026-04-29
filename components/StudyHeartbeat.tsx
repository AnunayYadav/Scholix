
import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import NexusServer from '../services/nexusServer.ts';

// Routes that contribute to "Study Time"
const STUDY_ROUTES = [
  '/library', 
  '/quiz', 
  '/placement', 
  '/cgpa', 
  '/attendance', 
  '/ai-tools', 
  '/timetable',
  '/freshers'
];

interface StudyHeartbeatProps {
  userId: string | null;
}

/**
 * Tracks and logs active "study time" based on user presence in specific modules.
 * Every 60 seconds of stay on a study route adds to the global user analytics.
 */
const StudyHeartbeat: React.FC<StudyHeartbeatProps> = ({ userId }) => {
  const location = useLocation();
  const sessionRecordIdRef = useRef<string | null>(null);
  const sessionStartTimeRef = useRef<number>(Date.now());
  const INTERVAL = 60000; // Update every minute for safety

  useEffect(() => {
    if (!userId) return;

    const isStudyModule = STUDY_ROUTES.some(route => 
      location.pathname.startsWith(route) || (location.pathname === '/' && route === '/')
    );

    if (!isStudyModule) {
      sessionRecordIdRef.current = null;
      return;
    }

    // Start a new session for this route
    sessionStartTimeRef.current = Date.now();
    const currentPath = location.pathname;
    
    const startSession = async () => {
      const record = await NexusServer.saveRecord(userId, 'study_session', `Studying in ${getModuleName(currentPath)}`, { 
        duration: 0, 
        path: currentPath,
        startTime: new Date(sessionStartTimeRef.current).toISOString(),
        status: 'active'
      });
      if (record?.id) {
        sessionRecordIdRef.current = record.id;
      }
    };

    startSession();

    const heartbeat = setInterval(async () => {
      if (!sessionRecordIdRef.current) return;
      
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - sessionStartTimeRef.current) / 1000);
      
      if (elapsedSeconds > 0) {
        await NexusServer.updateRecord(sessionRecordIdRef.current, { 
          duration: elapsedSeconds, 
          path: currentPath,
          startTime: new Date(sessionStartTimeRef.current).toISOString(),
          lastPulse: new Date().toISOString(),
          status: 'active'
        });
      }
    }, INTERVAL);

    return () => {
      clearInterval(heartbeat);
      if (sessionRecordIdRef.current) {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - sessionStartTimeRef.current) / 1000);
        
        // Final update for this session
        NexusServer.updateRecord(sessionRecordIdRef.current, { 
          duration: elapsedSeconds, 
          path: currentPath,
          startTime: new Date(sessionStartTimeRef.current).toISOString(),
          endTime: new Date().toISOString(),
          status: 'completed'
        });
        
        sessionRecordIdRef.current = null;
      }
    };
  }, [location.pathname, userId]);

  return null;
};

// Helper to get friendly module name for logging
const getModuleName = (path: string): string => {
  if (path.startsWith('/library')) return 'Content Library';
  if (path.startsWith('/quiz')) return 'Quiz Center';
  if (path.startsWith('/placement')) return 'Placement Prefect';
  if (path.startsWith('/cgpa')) return 'CGPA Calculator';
  if (path.startsWith('/attendance')) return 'Attendance Tracker';
  if (path.startsWith('/ai-tools')) return 'AI Tools';
  if (path.startsWith('/timetable')) return 'Schedule Hub';
  if (path.startsWith('/freshers')) return 'Freshers Kit';
  return 'Study Hub';
};

export default StudyHeartbeat;
