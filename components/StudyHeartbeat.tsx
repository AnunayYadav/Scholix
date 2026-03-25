
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
  const lastPulseRef = useRef<number>(Date.now());
  const INTERVAL = 60000; // 1 minute pulse for analytic efficiency

  useEffect(() => {
    // Analytics only active for authenticated students
    if (!userId) return;

    // Determine if current view is a study-focused module
    const isStudyModule = STUDY_ROUTES.some(route => 
      location.pathname.startsWith(route) || (location.pathname === '/' && route === '/')
    );

    if (!isStudyModule) return;

    // Reset last pulse when entering a study module
    lastPulseRef.current = Date.now();

    const heartbeat = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - lastPulseRef.current) / 1000);
      
      // Persist study session segment to history
      NexusServer.saveRecord(userId, 'study_session', `Studying in ${getModuleName(location.pathname)}`, { 
        duration: elapsedSeconds, 
        path: location.pathname,
        timestamp: new Date().toISOString()
      });
      
      lastPulseRef.current = now;
    }, INTERVAL);

    return () => clearInterval(heartbeat);
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
