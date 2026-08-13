
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Calculator, Briefcase, PlayCircle } from 'lucide-react';
import AttendanceTracker from './AttendanceTracker';
import CGPACalculator from './CGPACalculator';
import PlacementPrefect from './PlacementPrefect';
import LecturesHub from './LecturesHub';
import { UserProfile, ModuleType } from '../types';
import { useUniversity } from '../hooks/useUniversity';
import NexusAd from './NexusAd';
import NexusServer from '../services/nexusServer.ts';

const GRADE_POINTS: Record<string, number> = {
  'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'P': 4, 'F': 0
};

const LPU_BTECH_CREDITS: Record<number, number> = {
  1: 18, 2: 27, 3: 24, 4: 24, 5: 25, 6: 22, 7: 10, 8: 16
};

interface ToolsHubProps {
  userProfile: UserProfile | null;
}

const ToolsHub: React.FC<ToolsHubProps> = ({ userProfile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedUniversity, universityInfo } = useUniversity();
  
  const getUniSlug = (id: string): string => {
    if (id === 'lpu') return 'lpu';
    if (id === 'iitm_bs') return 'iitm';
    return '';
  };

  const uniSlug = getUniSlug(selectedUniversity);
  const prefix = uniSlug ? `/${uniSlug}` : '';
  
  // Tabs: attendance, cgpa, placement, lectures
  const [activeTab, setActiveTab] = useState<'attendance' | 'cgpa' | 'placement' | 'lectures' | null>(null);

  const [attendanceStats, setAttendanceStats] = useState<{ avg: number; margin: number; safe: boolean; hasData: boolean }>({
    avg: 0, margin: 0, safe: true, hasData: false
  });
  const [cgpaStats, setCgpaStats] = useState<{ cgpa: number; target: number; hasData: boolean }>({
    cgpa: 0, target: 9.0, hasData: false
  });
  const [placementStats, setPlacementStats] = useState<{ resumeUploaded: boolean; preferencesSet: boolean; pendingCount: number; completion: number }>({
    resumeUploaded: false, preferencesSet: false, pendingCount: 0, completion: 10
  });

  // Load real aggregate data from local storage and NexusServer
  useEffect(() => {
    // 1. Fetch real Attendance details
    const savedAttendance = localStorage.getItem('nexus_attendance');
    if (savedAttendance) {
      try {
        const parsed = JSON.parse(savedAttendance);
        const activeSubjects = parsed.filter((s: any) => !s.archived);
        if (activeSubjects.length > 0) {
          let totalPresent = 0;
          let totalClasses = 0;
          let totalGoal = 0;
          activeSubjects.forEach((s: any) => {
            totalPresent += (s.present || 0) + (s.dutyLeaves || 0);
            totalClasses += (s.total || 0);
            totalGoal += (s.goal || 75);
          });
          
          const avg = totalClasses > 0 ? (totalPresent / totalClasses) * 100 : 0;
          const avgGoal = totalGoal / activeSubjects.length;
          const margin = avg - avgGoal;
          setAttendanceStats({
            avg: Number(avg.toFixed(1)),
            margin: Number(Math.abs(margin).toFixed(1)),
            safe: margin >= 0,
            hasData: true
          });
        } else {
          setAttendanceStats({ avg: 0, margin: 0, safe: true, hasData: false });
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      setAttendanceStats({ avg: 0, margin: 0, safe: true, hasData: false });
    }

    // 2. Fetch real CGPA snapshot from backend server
    const loadCgpa = async () => {
      try {
        const records = await NexusServer.fetchRecords(userProfile?.id || null, 'cgpa_snapshot');
        if (records && records.length > 0) {
          const latest = records[0].content;
          const courses = latest.courses || [];
          const prevCGPA = Number(latest.prevCGPA) || 0;
          const prevTotalCredits = latest.prevTotalCredits !== '' && latest.prevTotalCredits !== undefined ? Number(latest.prevTotalCredits) : null;
          const currentSemester = latest.currentSemester || 1;
          
          let totalPoints = 0, totalCredits = 0;
          courses.forEach((c: any) => {
            totalPoints += (GRADE_POINTS[c.grade] || 0) * (Number(c.credits) || 0);
            totalCredits += Number(c.credits) || 0;
          });
          
          let archivedCredits = 0;
          if (prevTotalCredits !== null) {
            archivedCredits = prevTotalCredits;
          } else {
            for (let i = 1; i < currentSemester; i++) {
              archivedCredits += LPU_BTECH_CREDITS[i] || 20;
            }
          }
          
          const combinedPoints = (prevCGPA * archivedCredits) + totalPoints;
          const combinedCredits = archivedCredits + totalCredits;
          const cgpa = combinedCredits === 0 ? 0 : (combinedPoints / combinedCredits);
          const target = Number(latest.targetCGPA) || 9.0;
          
          setCgpaStats({
            cgpa: Number(cgpa.toFixed(2)),
            target: Number(target.toFixed(1)),
            hasData: true
          });
        } else {
          setCgpaStats({ cgpa: 0, target: 9.0, hasData: false });
        }
      } catch (e) {
        console.error(e);
      }
    };
    if (userProfile?.id) {
      loadCgpa();
    } else {
      setCgpaStats({ cgpa: 0, target: 9.0, hasData: false });
    }

    // 3. Fetch real Placement Readiness details
    const savedResumeReports = localStorage.getItem('nexus_resume_reports');
    let resumeUploaded = false;
    let pendingCount = 0;
    if (savedResumeReports) {
      try {
        const reports = JSON.parse(savedResumeReports);
        resumeUploaded = reports.length > 0;
        pendingCount = reports.filter((r: any) => r.status === 'pending' || !r.status).length;
      } catch (e) {
        console.error(e);
      }
    }
    
    const preferencesSet = !!userProfile?.program;
    let completion = 10;
    if (resumeUploaded) completion += 40;
    if (preferencesSet) completion += 42;
    
    setPlacementStats({
      resumeUploaded,
      preferencesSet,
      pendingCount,
      completion
    });
  }, [userProfile, activeTab]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'attendance' || tab === 'cgpa' || tab === 'placement' || tab === 'lectures') {
      setActiveTab(tab as any);
    } else {
      setActiveTab(null);
    }
  }, [location.search]);

  const switchTab = (tab: 'attendance' | 'cgpa' | 'placement' | 'lectures') => {
    setActiveTab(tab);
    navigate(`${prefix}/tools?tab=${tab}`, { replace: true });
  };

  const tabs = [
    { 
      id: 'attendance', 
      name: 'Attendance', 
      icon: <CheckCircle2 className="w-5 h-5" />,
      module: ModuleType.ATTENDANCE
    },
    { 
      id: 'cgpa', 
      name: 'CGPA Hub', 
      icon: <Calculator className="w-5 h-5" />,
      module: ModuleType.CGPA
    },
    { 
      id: 'placement', 
      name: 'Placement', 
      icon: <Briefcase className="w-5 h-5" />,
      module: ModuleType.PLACEMENT
    },
    { 
      id: 'lectures', 
      name: 'YT Lectures', 
      icon: <PlayCircle className="w-5 h-5" />,
      module: ModuleType.LECTURES
    }
  ];

  const visibleTabs = tabs.filter(t => !universityInfo || universityInfo.features.enabledModules.includes(t.module));

  const cardDetails: Record<string, { desc: string; color: string; hoverBorder: string; glow: string }> = {
    attendance: {
      desc: 'Log and monitor your daily course attendance, calculate safety margin, and get alerts.',
      color: 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/10',
      hoverBorder: 'hover:border-emerald-500/30',
      glow: 'rgba(16, 185, 129, 0.15)'
    },
    cgpa: {
      desc: 'Calculate and forecast your SGPA and CGPA, manage grades, and share reports.',
      color: 'text-orange-500 dark:text-orange-400 bg-orange-500/10',
      hoverBorder: 'hover:border-orange-500/30',
      glow: 'rgba(245, 158, 11, 0.15)'
    },
    placement: {
      desc: 'Track job applications, optimize your profile, and practice interview topics.',
      color: 'text-blue-500 dark:text-blue-400 bg-blue-500/10',
      hoverBorder: 'hover:border-blue-500/30',
      glow: 'rgba(59, 130, 246, 0.15)'
    },
    lectures: {
      desc: 'Browse and watch university lectures inline without distraction.',
      color: 'text-red-500 dark:text-red-400 bg-red-500/10',
      hoverBorder: 'hover:border-red-500/30',
      glow: 'rgba(239, 68, 68, 0.15)'
    }
  };

  return (
    <div className="w-full min-h-full animate-fade-in space-y-6">
      {activeTab === null ? (
        <div className="max-w-4xl mx-auto px-4 sm:px-0 relative">
          <header className="pt-2 mb-8 animate-fade-in">
            <p className="text-[10px] font-semibold tracking-wider text-zinc-500 mb-1 ml-0.5">
              Welcome, {userProfile?.name || 'User'}
            </p>
            <h1 className="text-2xl font-bold text-zinc-800 dark:text-white tracking-tight">
              Tools <span className="text-brand-primary">Hub</span>
            </h1>
          </header>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-4xl">
            {visibleTabs.map(tab => {
              const detail = cardDetails[tab.id];

              return (
                <div
                  key={tab.id}
                  onClick={() => switchTab(tab.id as any)}
                  className="relative flex flex-col items-start p-5 rounded-[2.2rem] border-none shadow-none transition-all duration-500 text-left group overflow-hidden active:scale-95 bg-zinc-100 dark:bg-[#111113] hover:bg-zinc-200/60 dark:hover:bg-[#161618] hover:shadow-2xl hover:-translate-y-1.5 cursor-pointer w-full"
                >
                  {/* Glow overlay on hover */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" 
                    style={{ background: `radial-gradient(circle at 50% 50%, ${detail.glow} 0%, transparent 100%)` }} 
                  />

                  {/* Icon container */}
                  <div className={`relative p-3 rounded-2xl mb-4 transition-all duration-500 border-none shadow-none group-hover:scale-110 group-hover:shadow-md ${detail.color}`}>
                    {React.cloneElement(tab.icon, { className: "w-5 h-5 sm:w-6 sm:h-6" })}
                  </div>
                  
                  {/* Title and One-line Info */}
                  <div className="relative">
                    <span className="block text-[11px] sm:text-xs font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors duration-500 font-sans">
                      {tab.id === 'cgpa' ? 'CGPA Hub' : tab.name}
                    </span>
                    <span className="block text-[10px] font-medium mt-1 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors duration-500 leading-snug">
                      {tab.id === 'attendance' && (
                        attendanceStats.hasData 
                          ? `Avg: ${attendanceStats.avg}% (${attendanceStats.safe ? 'Safe' : 'Low'})` 
                          : 'Track safety margins.'
                      )}
                      {tab.id === 'cgpa' && (
                        cgpaStats.hasData 
                          ? `Current: ${cgpaStats.cgpa}` 
                          : 'Forecast grades.'
                      )}
                      {tab.id === 'placement' && (
                        `Readiness: ${placementStats.completion}%`
                      )}
                      {tab.id === 'lectures' && (
                        'Ad-free video player.'
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dashboard Insights Section */}
          <div className="w-full max-w-4xl mt-12 space-y-4 animate-fade-in">
            <h2 className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-1">
              Pro Capabilities
            </h2>
            
            <div className="space-y-3 w-full">
              {/* Feature 1 */}
              <div className="group relative p-5 rounded-[24px] border-none shadow-none bg-zinc-100 dark:bg-[#111113] hover:bg-zinc-200/60 dark:hover:bg-[#161618] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer">
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-2xl font-black text-emerald-500/90 dark:text-emerald-400/90 tracking-tighter font-mono w-8 group-hover:scale-105 transition-transform duration-300">01</span>
                  <span className="text-[8px] font-extrabold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full uppercase tracking-wider group-hover:scale-105 transition-transform duration-300">Track</span>
                </div>
                <div className="space-y-1 flex-1">
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors duration-300">Smart Attendance Tracking</h4>
                  <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 leading-normal font-medium">
                    Calculates exact class safety margins, tracks how many lectures you can safely skip, and logs attendance histories with automatic threshold alerts.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group relative p-5 rounded-[24px] border-none shadow-none bg-zinc-100 dark:bg-[#111113] hover:bg-zinc-200/60 dark:hover:bg-[#161618] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer">
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-2xl font-black text-orange-500/90 dark:text-orange-400/90 tracking-tighter font-mono w-8 group-hover:scale-105 transition-transform duration-300">02</span>
                  <span className="text-[8px] font-extrabold bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full uppercase tracking-wider group-hover:scale-105 transition-transform duration-300">Simulate</span>
                </div>
                <div className="space-y-1 flex-1">
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors duration-300">CGPA & TGPA Forecasts</h4>
                  <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 leading-normal font-medium">
                    Predicts term TGPA based on marks or grades, references official grading standards, and includes collapsible degree forecasts to model future semesters.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group relative p-5 rounded-[24px] border-none shadow-none bg-zinc-100 dark:bg-[#111113] hover:bg-zinc-200/60 dark:hover:bg-[#161618] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer">
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-2xl font-black text-blue-500/90 dark:text-blue-400/90 tracking-tighter font-mono w-8 group-hover:scale-105 transition-transform duration-300">03</span>
                  <span className="text-[8px] font-extrabold bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full uppercase tracking-wider group-hover:scale-105 transition-transform duration-300">Prepare</span>
                </div>
                <div className="space-y-1 flex-1">
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300">Placement Readiness Analyzer</h4>
                  <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 leading-normal font-medium">
                    Evaluates resume ATS compatibility score, tracks active job applications, and builds custom placement readiness reports to target profiles.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="group relative p-5 rounded-[24px] border-none shadow-none bg-zinc-100 dark:bg-[#111113] hover:bg-zinc-200/60 dark:hover:bg-[#161618] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer">
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-2xl font-black text-red-500/90 dark:text-red-400/90 tracking-tighter font-mono w-8 group-hover:scale-105 transition-transform duration-300">04</span>
                  <span className="text-[8px] font-extrabold bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full uppercase tracking-wider group-hover:scale-105 transition-transform duration-300">Stream</span>
                </div>
                <div className="space-y-1 flex-1">
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors duration-300">Ad-Free YouTube Lectures</h4>
                  <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 leading-normal font-medium">
                    Browse and stream curriculum-mapped lectures inline with a distraction-free, ad-free video player to keep your study sessions focused.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-4 sm:px-0">
          <div className="flex flex-col gap-4 mb-4">
            <button 
              onClick={() => navigate(prefix + '/tools')} 
              className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-colors bg-zinc-100 dark:bg-[#111113] border-none shadow-none hover:bg-zinc-200/70 dark:hover:bg-[#161618] px-5 py-2.5 rounded-full cursor-pointer self-start active:scale-95"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
              Back to Hub
            </button>
            {activeTab !== 'cgpa' && activeTab !== 'attendance' && activeTab !== 'placement' && activeTab !== 'lectures' && (
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-zinc-800 dark:text-white tracking-tight leading-none mb-2">
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium text-[11px] sm:text-xs">
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tools Hub Ad */}
      <div className="max-w-5xl mx-auto px-4 sm:px-0">
        <NexusAd slot="2912081909" format="horizontal" hideLabel />
      </div>

      <div className="relative">
        <div className="transition-all duration-500 transform">
          {activeTab === 'attendance' && <AttendanceTracker userProfile={userProfile} hideHeader={false} />}
          {activeTab === 'cgpa' && <CGPACalculator userProfile={userProfile} hideHeader={true} />}
          {activeTab === 'placement' && (
            <PlacementPrefect 
              userProfile={userProfile} 
              hideHeader={false} 
              reportIdOverride={new URLSearchParams(location.search).get('id') || undefined} 
            />
          )}
          {activeTab === 'lectures' && <LecturesHub userProfile={userProfile} />}
        </div>
      </div>

      {/* Footer Ad */}
      <div className="max-w-5xl mx-auto px-4 sm:px-0 mt-10">
        <NexusAd 
          slot="7296989983" 
          layout="in-article" 
          format="fluid" 
        />
      </div>
    </div>
  );
};

export default ToolsHub;
