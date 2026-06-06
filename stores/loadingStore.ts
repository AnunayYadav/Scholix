import { create } from 'zustand';

interface LoadingState {
  progress: number;
  visible: boolean;
  start: () => void;
  finish: () => void;
  setProgress: (p: number) => void;
}

export const useLoadingStore = create<LoadingState>((set, get) => {
  let timer: any = null;
  let fadeTimeout: any = null;

  return {
    progress: 0,
    visible: false,

    start: () => {
      if (timer) clearInterval(timer);
      if (fadeTimeout) clearTimeout(fadeTimeout);
      
      set({ progress: 10, visible: true });

      // Simulate progress increments up to 90%
      timer = setInterval(() => {
        const { progress } = get();
        if (progress < 80) {
          // Increment by random values between 2% and 8%
          set({ progress: progress + (Math.random() * 6 + 2) });
        } else if (progress < 95) {
          // Slow down near the end
          set({ progress: progress + 0.5 });
        } else {
          clearInterval(timer);
        }
      }, 100);
    },

    finish: () => {
      if (timer) clearInterval(timer);
      if (fadeTimeout) clearTimeout(fadeTimeout);
      
      set({ progress: 100 });

      // Fade out after the width transition completes
      fadeTimeout = setTimeout(() => {
        set({ visible: false, progress: 0 });
      }, 300);
    },

    setProgress: (p) => set({ progress: p }),
  };
});
