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
    padding: '12%',
    scale: 1.3,
    navbarScale: 1.25,
    translateY: '0%',
  },
  'Master.png': {
    id: 'Master.png',
    padding: '14%',
    scale: 1.4,
    navbarScale: 1.35,
    translateY: '-0.5%',
  },
  'Legend.png': {
    id: 'Legend.png',
    padding: '2%',
    scale: 1.45,
    navbarScale: 1.4,
    translateY: '-2%',
  },
  'Grandmaster.png': {
    id: 'Grandmaster.png',
    padding: '3%',
    scale: 1.55,
    navbarScale: 1.5,
    translateY: '-2.5%',
  },
  'Immortal.png': {
    id: 'Immortal.png',
    padding: '4.5%',
    scale: 1.65,
    navbarScale: 1.6,
    translateY: '-3%',
  },
  'default': {
    id: 'default',
    padding: '0%',
    scale: 1.3,
    navbarScale: 1.25,
    translateY: '0%',
  }
};

export const getFrameConfig = (frameName: string | undefined): FrameConfig => {
  if (!frameName) return FRAME_CONFIGS['default'];
  return FRAME_CONFIGS[frameName] || FRAME_CONFIGS['default'];
};
