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
    padding: '8%',
    scale: 1.25,
    navbarScale: 1.2,
    translateY: '0%',
  },
  'Learner.png': {
    id: 'Learner.png',
    padding: '9%',
    scale: 1.3,
    navbarScale: 1.25,
    translateY: '0%',
  },
  'Master.png': {
    id: 'Master.png',
    padding: '10%',
    scale: 1.4,
    navbarScale: 1.3,
    translateY: '-1%',
  },
  'Legend.png': {
    id: 'Legend.png',
    padding: '10.5%',
    scale: 1.5,
    navbarScale: 1.4,
    translateY: '-2%',
  },
  'Grandmaster.png': {
    id: 'Grandmaster.png',
    padding: '11%',
    scale: 1.6,
    navbarScale: 1.5,
    translateY: '-3%',
  },
  'Immortal.png': {
    id: 'Immortal.png',
    padding: '12%',
    scale: 1.75,
    navbarScale: 1.65,
    translateY: '-4%',
  },
  'default': {
    id: 'default',
    padding: '0%',
    scale: 1.3,
    navbarScale: 1.2,
    translateY: '0%',
  }
};

export const getFrameConfig = (frameName: string): FrameConfig => {
  return FRAME_CONFIGS[frameName] || FRAME_CONFIGS['default'];
};
