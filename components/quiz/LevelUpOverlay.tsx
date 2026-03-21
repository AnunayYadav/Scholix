import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizDashboardStore } from '../../stores/quizStore';

const PARTICLE_COUNT = 60;
const COLORS = ['#FF6B00', '#FF3D00', '#FFD600', '#FFAB00', '#00E676', '#2196F3', '#E040FB', '#FF4081'];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  life: number;
  maxLife: number;
  shape: 'circle' | 'square' | 'triangle';
}

const LevelUpOverlay: React.FC = () => {
  const { showLevelUp, setShowLevelUp, lastXPResult } = useQuizDashboardStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);

  const initParticles = useCallback(() => {
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 12,
        vy: Math.random() * -15 - 5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        life: 0,
        maxLife: Math.random() * 80 + 60,
        shape: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)] as any,
      });
    }
    particlesRef.current = particles;
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particlesRef.current.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // gravity
      p.rotation += p.rotationSpeed;
      p.life++;

      const alpha = Math.max(0, 1 - p.life / p.maxLife);
      if (alpha <= 0) return;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'square') {
        ctx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2);
      } else {
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size, p.size);
        ctx.lineTo(-p.size, p.size);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    });

    // Remove dead particles
    particlesRef.current = particlesRef.current.filter((p) => p.life < p.maxLife);

    if (particlesRef.current.length > 0) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, []);

  useEffect(() => {
    if (!showLevelUp) return;

    initParticles();
    animationRef.current = requestAnimationFrame(animate);

    // Auto-dismiss after 5 seconds
    const timeout = setTimeout(() => setShowLevelUp(false), 5000);

    return () => {
      cancelAnimationFrame(animationRef.current);
      clearTimeout(timeout);
    };
  }, [showLevelUp, initParticles, animate, setShowLevelUp]);

  if (!lastXPResult?.newLevel) return null;

  return createPortal(
    <AnimatePresence>
      {showLevelUp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="modal-overlay"
          style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
          onClick={() => setShowLevelUp(false)}
        >
          {/* Confetti canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
          />

          {/* Level up content */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.3, opacity: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
            className="relative z-10 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow ring */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.5, 1.2, 1.3] }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="absolute inset-0 m-auto w-72 h-72 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 blur-3xl"
            />

            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.3, damping: 10 }}
              className="relative text-8xl mb-4"
            >
              {lastXPResult.newLevel.icon}
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <h2 className="text-3xl font-semibold text-white tracking-tight mb-1">Level Up!</h2>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-5xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                  Level {lastXPResult.newLevel.level}
                </span>
              </div>
              <p className="text-lg font-semibold text-amber-400">
                {lastXPResult.newLevel.title}
              </p>
            </motion.div>

            {/* Dismiss hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="text-[11px] font-semibold text-white/40 mt-8"
            >
              Tap anywhere to continue
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.getElementById('modal-root') || document.body
  );
};

export default LevelUpOverlay;
