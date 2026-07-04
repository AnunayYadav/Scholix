
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Calculator, Briefcase } from 'lucide-react';
import AttendanceTracker from './AttendanceTracker';
import CGPACalculator from './CGPACalculator';
import PlacementPrefect from './PlacementPrefect';
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
  
  // Tabs: attendance, cgpa, placement
  const [activeTab, setActiveTab] = useState<'attendance' | 'cgpa' | 'placement' | null>(null);

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
    if (tab === 'attendance' || tab === 'cgpa' || tab === 'placement') {
      setActiveTab(tab as any);
    } else {
      setActiveTab(null);
    }
  }, [location.search]);

  const switchTab = (tab: 'attendance' | 'cgpa' | 'placement') => {
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
    }
  };

  return (
    <div className="w-full min-h-full animate-fade-in space-y-6">
      {activeTab === null ? (
        <div className="max-w-4xl mx-auto px-4 sm:px-0 flex flex-col items-center">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-semibold text-zinc-800 dark:text-white tracking-tight leading-none mb-2">
              Tools <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Hub</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium text-[11px] sm:text-xs">
              Essential academic utilities
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-3xl">
            {visibleTabs.map(tab => {
              const detail = cardDetails[tab.id];
              return (
                <div
                  key={tab.id}
                  onClick={() => switchTab(tab.id as any)}
                  className={`group p-6 rounded-[28px] border border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02] ${detail.hoverBorder} relative overflow-hidden flex flex-col justify-between min-h-[190px] transition-all duration-300 hover:shadow-[0_12px_30px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_12px_30px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 cursor-pointer`}
                >
                  {/* Aurora glow on hover */}
                  <div 
                    className="absolute -right-20 -top-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ backgroundColor: detail.glow }}
                  />

                  {/* Giant background faint logo */}
                  <div className="absolute -right-3 -bottom-3 opacity-[0.05] dark:opacity-[0.03] pointer-events-none z-0">
                    {React.cloneElement(tab.icon, { className: "w-20 h-20 text-zinc-400 dark:text-zinc-500" })}
                  </div>

                  <div className="relative z-10 w-full flex-1 flex flex-col justify-between">
                    <div className="flex items-center justify-between w-full">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${detail.color}`}>
                        {React.cloneElement(tab.icon, { className: "w-5 h-5" })}
                      </div>
                      <div className="text-zinc-400 dark:text-zinc-600 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-primary">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4.5 h-4.5"><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></svg>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-sm sm:text-base font-bold text-zinc-800 dark:text-white transition-colors group-hover:text-brand-primary">{tab.name}</h3>
                      <p className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-1.5 leading-relaxed font-medium">{detail.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dashboard Insights Section */}
          <div className="w-full max-w-3xl mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            {/* Column 1: Academic Quick Stats */}
            <div className="md:col-span-2 space-y-4">
              <h2 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Academic Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Stat 1: Attendance */}
                <div className="p-5 rounded-2xl border border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.01] flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase">Avg Attendance</span>
                    <h4 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
                      {attendanceStats.hasData ? `${attendanceStats.avg}%` : 'N/A'}
                    </h4>
                    <span className={`text-[10px] font-semibold ${attendanceStats.hasData ? (attendanceStats.safe ? 'text-emerald-500' : 'text-red-500') : 'text-zinc-400'}`}>
                      {attendanceStats.hasData 
                        ? `${attendanceStats.safe ? 'Safe' : 'Critical'} (${attendanceStats.safe ? '+' : '-'}${attendanceStats.margin}% margin)` 
                        : 'No active courses'}
                    </span>
                  </div>
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${attendanceStats.hasData ? (attendanceStats.safe ? 'border-emerald-500/20 border-t-emerald-500 text-emerald-500' : 'border-red-500/20 border-t-red-500 text-red-500') : 'border-zinc-200 dark:border-white/10 text-zinc-400'}`}>
                    {attendanceStats.hasData ? `${Math.round(attendanceStats.avg)}%` : '0%'}
                  </div>
                </div>

                {/* Stat 2: CGPA */}
                <div className="p-5 rounded-2xl border border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.01] flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase">Current CGPA</span>
                    <h4 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
                      {cgpaStats.hasData ? cgpaStats.cgpa.toFixed(2) : 'N/A'}
                    </h4>
                    <span className="text-[10px] text-orange-500 font-semibold">
                      {cgpaStats.hasData ? `Targeting ${cgpaStats.target.toFixed(1)}` : 'No reports archived'}
                    </span>
                  </div>
                  <div className={`w-10 h-10 rounded-full border-2 border-orange-500/20 border-t-orange-500 flex items-center justify-center text-orange-500 text-[10px] font-bold`}>
                    {cgpaStats.hasData ? cgpaStats.cgpa.toFixed(1) : '0.0'}
                  </div>
                </div>
              </div>

              {/* Quick tip notification box */}
              <div className="p-5 rounded-3xl border border-brand-primary/10 bg-brand-primary/[0.02] flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary flex-shrink-0 mt-0.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Hub Smart Forecast</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                    {attendanceStats.hasData 
                      ? `Your attendance is currently ${attendanceStats.safe ? 'safe' : 'under goal'} across subjects. Try simulating your upcoming exam grades in the CGPA Hub to see how your overall score will be affected.`
                      : 'Add your subjects in the Attendance Tracker to monitor class goals, safety margin requirements, and overall status.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Column 2: Placement Prep Status */}
            <div className="space-y-4">
              <h2 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Placement Readiness</h2>
              <div className="p-5 rounded-2xl border border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.01] space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase">Profile Completion</span>
                  <span className="text-[11px] font-bold text-blue-500">{placementStats.completion}%</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${placementStats.completion}%` }} />
                </div>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`w-3.5 h-3.5 ${placementStats.resumeUploaded ? 'text-emerald-500' : 'text-zinc-400'}`}>
                      {placementStats.resumeUploaded ? (
                        <polyline points="20 6 9 17 4 12" />
                      ) : (
                        <line x1="18" y1="6" x2="6" y2="18" />
                      )}
                    </svg>
                    Resume Uploaded
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`w-3.5 h-3.5 ${placementStats.preferencesSet ? 'text-emerald-500' : 'text-zinc-400'}`}>
                      {placementStats.preferencesSet ? (
                        <polyline points="20 6 9 17 4 12" />
                      ) : (
                        <line x1="18" y1="6" x2="6" y2="18" />
                      )}
                    </svg>
                    Preferences Set
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`w-3.5 h-3.5 ${placementStats.pendingCount > 0 ? 'text-orange-500' : 'text-zinc-400'}`}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                    {placementStats.pendingCount} Pending Application{placementStats.pendingCount !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-4 sm:px-0">
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => navigate(prefix + '/tools')} 
              className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-colors bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 px-4 py-2 rounded-xl shadow-sm hover:shadow-md cursor-pointer self-start"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
              Back to Hub
            </button>
            {activeTab !== 'cgpa' && (
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-zinc-800 dark:text-white tracking-tight leading-none mb-2">
                  {activeTab === 'attendance' && 'Attendance Tracker'}
                  {activeTab === 'placement' && 'Placement Prefect'}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium text-[11px] sm:text-xs">
                  {activeTab === 'attendance' && 'Log and monitor your daily course attendance'}
                  {activeTab === 'placement' && 'Track applications and prepare for placements'}
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
          {activeTab === 'attendance' && <AttendanceTracker userProfile={userProfile} hideHeader={true} />}
          {activeTab === 'cgpa' && <CGPACalculator userProfile={userProfile} hideHeader={true} />}
          {activeTab === 'placement' && (
            <PlacementPrefect 
              userProfile={userProfile} 
              hideHeader={true} 
              reportIdOverride={new URLSearchParams(location.search).get('id') || undefined} 
            />
          )}
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
