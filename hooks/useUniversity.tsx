import React, { createContext, useContext, useState, useEffect } from 'react';
import { ModuleType } from '../types';

export type UniversityId = 'lpu' | 'iitm_bs' | 'none';

interface UniversityTheme {
  primary: string;
  secondary: string;
  gradient: string;
  glow: string;
}

interface University {
  id: UniversityId;
  name: string;
  shortName: string;
  comingSoon?: boolean;
  adminOnly?: boolean;
  campusMapUrl?: string;
  logo?: string;
  theme: UniversityTheme;
  features: {
    enabledModules: ModuleType[];
    campusTabs?: ('mess' | 'map')[];
  };
}

export const UNIVERSITIES: University[] = [
  { 
    id: 'lpu', 
    name: 'Lovely Professional University', 
    shortName: 'LPU', 
    campusMapUrl: 'https://iviewd.com/lpu2/',
    logo: '/LPU_logo.png',
    theme: {
      primary: '#f97316', // Orange 500
      secondary: '#dc2626', // Red 600
      gradient: 'linear-gradient(to bottom right, #f97316, #dc2626)',
      glow: 'rgba(249, 115, 22, 0.4)'
    },
    features: {
      enabledModules: [
        ModuleType.DASHBOARD,
        ModuleType.QUIZ,
        ModuleType.ATTENDANCE,
        ModuleType.CGPA,
        ModuleType.PLACEMENT,
        ModuleType.LIBRARY,
        ModuleType.CAMPUS,
        ModuleType.AI_TOOLS,
        ModuleType.MARKETPLACE,
        ModuleType.ROOMMATE,
        ModuleType.EMERGENCY,
        ModuleType.HELP,
        ModuleType.ABOUT,
        ModuleType.TIMETABLE
      ],
      campusTabs: ['mess', 'map']
    }
  },
  { 
    id: 'iitm_bs', 
    name: 'Indian Institute of Technology BS Degree', 
    shortName: 'IITM', 
    comingSoon: false, 
    campusMapUrl: 'https://www.iitm.ac.in/it-at-iitm-bs/campus-map',
    logo: '/IIT_Madras_Logo.png',
    theme: {
      primary: '#800000', // Deep Institutional Maroon (Refined)
      secondary: '#b91c1c', // Vibrant Terracotta
      gradient: 'linear-gradient(to bottom right, #800000, #b91c1c)',
      glow: 'rgba(185, 28, 28, 0.4)'
    },
    features: {
      enabledModules: [
        ModuleType.DASHBOARD,
        ModuleType.CGPA,
        ModuleType.LIBRARY,
        ModuleType.CAMPUS,
        ModuleType.EMERGENCY,
        ModuleType.AI_TOOLS,
        ModuleType.QUIZ,
        ModuleType.HELP,
        ModuleType.ABOUT,
        ModuleType.TIMETABLE
      ],
      campusTabs: ['map'] // IITM doesn't have the messy LPU mess menu logic yet
    }
  },
];

interface UniversityContextType {
  selectedUniversity: UniversityId;
  selectUniversity: (id: UniversityId) => void;
  universityInfo: University | null;
  fullBrandName: string;
  shortBrandName: string;
  studentTerm: string;
}

const UniversityContext = createContext<UniversityContextType | undefined>(undefined);

export const UniversityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedUniversity, setSelectedUniversity] = useState<UniversityId>(() => {
    const saved = localStorage.getItem('selected_university');
    return (saved as UniversityId) || 'none';
  });

  const selectUniversity = (id: UniversityId) => {
    setSelectedUniversity(id);
    localStorage.setItem('selected_university', id);
  };

  const universityInfo = UNIVERSITIES.find(u => u.id === selectedUniversity) || null;

  // Sync theme to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    if (universityInfo) {
      root.style.setProperty('--brand-primary', universityInfo.theme.primary);
      root.style.setProperty('--brand-secondary', universityInfo.theme.secondary);
      root.style.setProperty('--brand-gradient', universityInfo.theme.gradient);
      root.style.setProperty('--brand-glow', universityInfo.theme.glow);
    } else {
      root.style.setProperty('--brand-primary', '#f97316');
      root.style.setProperty('--brand-secondary', '#dc2626');
      root.style.setProperty('--brand-gradient', 'linear-gradient(to bottom right, #f97316, #dc2626)');
      root.style.setProperty('--brand-glow', 'rgba(249, 115, 22, 0.4)');
    }
  }, [universityInfo]);

  const getNaming = () => {
    switch (selectedUniversity) {
      case 'lpu':
        return { full: 'LPU Nexus', short: 'Nexus', student: 'Verto' };
      case 'iitm_bs':
        return { full: 'Indian Institute of Technology BS Degree', short: 'IITM', student: 'IITian' };
      default:
        return { full: 'Scholix', short: 'Scholix', student: 'Student' };
    }
  };

  const { full: fullBrandName, short: shortBrandName, student: studentTerm } = getNaming();

  return (
    <UniversityContext.Provider value={React.useMemo(() => ({ 
      selectedUniversity, 
      selectUniversity, 
      universityInfo,
      fullBrandName,
      shortBrandName,
      studentTerm
    }), [selectedUniversity, universityInfo, fullBrandName, shortBrandName, studentTerm])}>
      {children}
    </UniversityContext.Provider>
  );
};

export const useUniversity = () => {
  const context = useContext(UniversityContext);
  if (context === undefined) {
    throw new Error('useUniversity must be used within a UniversityProvider');
  }
  return context;
};
