export interface FrameConfig {
  padding: string;
  scale: number;
  navbarScale: number;
  translateY?: string; // Optional vertical offset
  id: string;
}

export const FRAME_CONFIGS: Record<string, FrameConfig> = {
  'Learner.png': {
    id: 'Learner.png',
    padding: '6.5%', 
    scale: 1.45,
    navbarScale: 1.4,
    translateY: '-2%', // Slight upward shift for learner
  },
  'Master.png': {
    id: 'Master.png',
    padding: '8%',
    scale: 1.6,
    navbarScale: 1.5,
    translateY: '-5%', // Shift up to account for bottom wings/accents
  },
  'Legend.png': {
    id: 'Legend.png',
    padding: '10%',
    scale: 1.7,
    navbarScale: 1.6,
    translateY: '-6%',
  },
  'Grandmaster.png': {
    id: 'Grandmaster.png',
    padding: '12%',
    scale: 1.8,
    navbarScale: 1.7,
    translateY: '-7%',
  },
  'Immortal.png': {
    id: 'Immortal.png',
    padding: '14%',
    scale: 1.9,
    navbarScale: 1.8,
    translateY: '-8%',
  },
  'default': {
    id: 'default',
    padding: '6%',
    scale: 1.5,
    navbarScale: 1.45,
    translateY: '0%',
  }
};

export const getFrameConfig = (frameName: string | undefined): FrameConfig => {
  if (!frameName) return FRAME_CONFIGS['default'];
  return FRAME_CONFIGS[frameName] || FRAME_CONFIGS['default'];
};
