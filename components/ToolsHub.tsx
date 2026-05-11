
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Calculator, Briefcase } from 'lucide-react';
import AttendanceTracker from './AttendanceTracker';
import CGPACalculator from './CGPACalculator';
import PlacementPrefect from './PlacementPrefect';
import { UserProfile, ModuleType } from '../types';
import { useUniversity } from '../hooks/useUniversity';
import NexusAd from './NexusAd';

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
  const [activeTab, setActiveTab] = useState<'attendance' | 'cgpa' | 'placement'>('attendance');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'attendance' || tab === 'cgpa' || tab === 'placement') {
      setActiveTab(tab as any);
    } else {
      // Logic to handle default tab based on enabled modules
      if (universityInfo) {
        if (universityInfo.features.enabledModules.includes(ModuleType.ATTENDANCE)) {
          setActiveTab('attendance');
        } else if (universityInfo.features.enabledModules.includes(ModuleType.CGPA)) {
          setActiveTab('cgpa');
        } else if (universityInfo.features.enabledModules.includes(ModuleType.PLACEMENT)) {
          setActiveTab('placement');
        }
      }
    }
  }, [location.search, universityInfo]);

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

  return (
    <div className="w-full min-h-full animate-fade-in space-y-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-none mb-2">
              Tools <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Hub</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-bold text-[10px] md:text-xs uppercase tracking-widest">
              Essential academic utilities
            </p>
          </div>
          
          <div className="flex items-center p-1 bg-zinc-100 dark:bg-white/5 rounded-2xl md:rounded-3xl border border-zinc-200 dark:border-white/5 shadow-inner overflow-x-auto no-scrollbar max-w-full">
            {visibleTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id as any)}
                className={`
                  flex items-center gap-2 px-3 md:px-6 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-[11px] md:text-xs font-bold transition-all duration-300 border-none relative
                  ${activeTab === tab.id 
                    ? 'bg-white dark:bg-[#0a0a0a] text-brand-primary shadow-lg scale-[1.02] z-10' 
                    : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }
                `}
              >
                <span className={activeTab === tab.id ? 'text-brand-primary' : 'opacity-40'}>{tab.icon}</span>
                <span className="text-[10px] sm:text-xs whitespace-nowrap">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

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
