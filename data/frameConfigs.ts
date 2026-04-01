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
    padding: '1%', // Adding a small amount to match shield geometry
    scale: 1.25,
    navbarScale: 1.2,
    translateY: '-1%', // Slight upward shift for better alignment
  },
  'Master.png': {
    id: 'Master.png',
    padding: '2.5%', // Increased padding to prevent edge bleed
    scale: 1.4,
    navbarScale: 1.35,
    translateY: '-5%', // Shifted more UP
  },
  'Legend.png': {
    id: 'Legend.png',
    padding: '3.5%', // Increased padding to prevent edge bleed
    scale: 1.5,
    navbarScale: 1.45,
    translateY: '-8%', // Shifted more UP
  },
  'Grandmaster.png': {
    id: 'Grandmaster.png',
    padding: '5%', // Increased padding to prevent edge bleed
    scale: 1.6,
    navbarScale: 1.55,
    translateY: '-10%', // Shifted more UP
  },
  'Immortal.png': {
    id: 'Immortal.png',
    padding: '6%', // Increased padding to prevent edge bleed
    scale: 1.7,
    navbarScale: 1.65,
    translateY: '-12%', // Shifted more UP
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
