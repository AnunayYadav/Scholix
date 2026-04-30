
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
  const isCreatingSessionRef = useRef<boolean>(false);
  const sessionStartTimeRef = useRef<number>(Date.now());
  const lastPathRef = useRef<string>(location.pathname);
  const INTERVAL = 30000; // Update every 30 seconds for better precision

  // Determine the base module route
  const getBaseRoute = (path: string) => {
    return STUDY_ROUTES.find(route => path.startsWith(route)) || null;
  };

  const currentBaseRoute = getBaseRoute(location.pathname);

  useEffect(() => {
    if (!userId || !currentBaseRoute) {
      // If we move out of a study module, the cleanup handles the final update
      return;
    }

    // Start a new session or keep current if same module
    const startOrResumeSession = async () => {
      // If we already have a session for this module, don't restart it
      if (sessionRecordIdRef.current || isCreatingSessionRef.current) return;

      isCreatingSessionRef.current = true;
      sessionStartTimeRef.current = Date.now();
      const initialPath = location.pathname;

      try {
        const record = await NexusServer.saveRecord(userId, 'study_session', `Studying in ${getModuleName(initialPath)}`, { 
          duration: 0, 
          path: initialPath,
          startTime: new Date(sessionStartTimeRef.current).toISOString(),
          status: 'active'
        });

        if (record?.id) {
          sessionRecordIdRef.current = record.id;
        }
      } catch (err) {
        console.error("[StudyHeartbeat] Failed to start session:", err);
      } finally {
        isCreatingSessionRef.current = false;
      }
    };

    startOrResumeSession();

    const heartbeat = setInterval(async () => {
      if (!sessionRecordIdRef.current) return;
      
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - sessionStartTimeRef.current) / 1000);
      
      try {
        await NexusServer.updateRecord(sessionRecordIdRef.current, { 
          duration: elapsedSeconds, 
          path: location.pathname, // Update with current sub-path
          startTime: new Date(sessionStartTimeRef.current).toISOString(),
          lastPulse: new Date().toISOString(),
          status: 'active'
        });
      } catch (err) {
        console.error("[StudyHeartbeat] Heartbeat update failed:", err);
      }
    }, INTERVAL);

    return () => {
      clearInterval(heartbeat);
      
      // We only clear the record ID and finalize if we are leaving the module entirely
      // or if the userId changed.
      // But since location.pathname is a dependency, this cleanup runs on every path change.
      // To prevent session churn, we check if the NEXT base route is different.
    };
  }, [currentBaseRoute, userId]);

  // Handle module transitions and final cleanup
  useEffect(() => {
    const handleUnmount = async () => {
      if (sessionRecordIdRef.current) {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - sessionStartTimeRef.current) / 1000);
        const recordId = sessionRecordIdRef.current;
        const finalPath = lastPathRef.current;
        const startTime = sessionStartTimeRef.current;

        sessionRecordIdRef.current = null; // Clear immediately to prevent double updates

        try {
          await NexusServer.updateRecord(recordId, { 
            duration: elapsedSeconds, 
            path: finalPath,
            startTime: new Date(startTime).toISOString(),
            endTime: new Date().toISOString(),
            status: 'completed'
          });
        } catch (err) {
          console.error("[StudyHeartbeat] Final session update failed:", err);
        }
      }
    };

    // Keep track of path for final cleanup
    lastPathRef.current = location.pathname;

    // If we moved out of a study module, finalize the session
    if (!currentBaseRoute && sessionRecordIdRef.current) {
      handleUnmount();
    }

    return () => {
      // This runs on unmount of the whole component (usually on app close or logout)
    };
  }, [location.pathname, currentBaseRoute]);

  // Final catch-all for component unmount
  useEffect(() => {
    return () => {
      if (sessionRecordIdRef.current) {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - sessionStartTimeRef.current) / 1000);
        // Fire and forget final update
        NexusServer.updateRecord(sessionRecordIdRef.current, { 
          duration: elapsedSeconds, 
          path: lastPathRef.current,
          startTime: new Date(sessionStartTimeRef.current).toISOString(),
          endTime: new Date().toISOString(),
          status: 'completed'
        });
      }
    };
  }, []);

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
