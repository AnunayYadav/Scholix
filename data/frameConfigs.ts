export interface FrameConfig {
  padding: string;
  scale: number;
  navbarScale: number;
  translateY?: string; // Optional vertical offset
  id: string;
}

export const FRAME_CONFIGS: Record<string, FrameConfig> = {
  'Beginner.png': {
    id: 'Beginner.png',
    padding: '7%',
    scale: 1.15,
    navbarScale: 1.1,
    translateY: '0%',
  },
  'Learner.png': {
    id: 'Learner.png',
    padding: '8%',
    scale: 1.2,
    navbarScale: 1.15,
    translateY: '0%',
  },
  'Master.png': {
    id: 'Master.png',
    padding: '9%',
    scale: 1.3,
    navbarScale: 1.2,
    translateY: '-1%',
  },
  'Legend.png': {
    id: 'Legend.png',
    padding: '9.5%',
    scale: 1.4,
    navbarScale: 1.3,
    translateY: '-1.5%',
  },
  'Grandmaster.png': {
    id: 'Grandmaster.png',
    padding: '10%',
    scale: 1.5,
    navbarScale: 1.4,
    translateY: '-2%',
  },
  'Immortal.png': {
    id: 'Immortal.png',
    padding: '11%',
    scale: 1.6,
    navbarScale: 1.5,
    translateY: '-3%',
  },
  'default': {
    id: 'default',
    padding: '0%',
    scale: 1.2,
    navbarScale: 1.15,
    translateY: '0%',
  }
};

export const getFrameConfig = (frameName: string): FrameConfig => {
  return FRAME_CONFIGS[frameName] || FRAME_CONFIGS['default'];
};
