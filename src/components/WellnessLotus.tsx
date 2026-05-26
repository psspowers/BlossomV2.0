import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { SeasonState } from '../lib/logic/seasons';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip';

interface WellnessLotusProps {
  health: number;
  scoreDelta?: number;
  season: SeasonState;
  mode: 'nurture' | 'steady' | 'thrive';
  name?: string;
  hasLoggedToday?: boolean;
}

type RevealStage = 'centered' | 'centered-with-delta' | 'corners';

export const WellnessLotus: React.FC<WellnessLotusProps> = ({
  health,
  scoreDelta = 0,
  season,
  name = 'Your Journey',
  hasLoggedToday = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [revealStage, setRevealStage] = useState<RevealStage>('centered');
  const animationFrameRef = useRef<number>();
  const cornerTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const prefersReducedMotion = useRef<boolean>(
    typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // 1. INITIALIZATION
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.preload = 'auto';
    video.pause();

    const handleMetadata = () => {
      setVideoDuration(video.duration);
      video.currentTime = 0;
    };

    const handleCanPlay = () => {
      if (video.readyState >= 3) setIsReady(true);
    };

    video.addEventListener('loadedmetadata', handleMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.load();

    return () => {
      video.removeEventListener('loadedmetadata', handleMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (cornerTimerRef.current) clearTimeout(cornerTimerRef.current);
    };
  }, []);

  // 2. THE "ALWAYS BLOOM" ENGINE + CHOREOGRAPHY
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isReady || !videoDuration) return;

    // Reset choreography on each bloom
    if (cornerTimerRef.current) clearTimeout(cornerTimerRef.current);

    if (prefersReducedMotion.current) {
      setRevealStage('corners');
    } else {
      setRevealStage('centered');
    }

    video.currentTime = 0.1;
    video.play();

    const targetTime = Math.max(0.1, (health / 100) * (videoDuration * 0.95));

    const scheduleCornerRetreat = () => {
      if (prefersReducedMotion.current) return;
      setRevealStage('centered-with-delta');
      cornerTimerRef.current = setTimeout(() => {
        setRevealStage('corners');
      }, 2000);
    };

    const checkProgress = () => {
      if (!video) return;
      const currentTime = video.currentTime;

      if (currentTime >= targetTime) {
        video.pause();
        video.currentTime = targetTime;
        scheduleCornerRetreat();
        return;
      }

      const diff = targetTime - currentTime;
      if (diff < 0.5) {
        video.playbackRate = 0.8;
      } else {
        video.playbackRate = 1.2;
      }

      animationFrameRef.current = requestAnimationFrame(checkProgress);
    };

    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(checkProgress);

    // Fallback: if the animation loop never completes for some reason,
    // ensure the stage still progresses so the score isn't stuck centred.
    const fallbackTimer = setTimeout(() => {
      scheduleCornerRetreat();
    }, 6000);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (cornerTimerRef.current) clearTimeout(cornerTimerRef.current);
      clearTimeout(fallbackTimer);
    };
  }, [health, isReady, videoDuration]);

  // When scoreDelta changes after initial reveal, briefly re-surface the delta.
  // Guard: only trigger if the user has actually logged today to prevent
  // phantom animation on zero-log days.
  useEffect(() => {
    if (!hasLoggedToday) return;
    if (revealStage !== 'corners') return;
    if (prefersReducedMotion.current) return;
    setRevealStage('centered-with-delta');
    if (cornerTimerRef.current) clearTimeout(cornerTimerRef.current);
    cornerTimerRef.current = setTimeout(() => {
      setRevealStage('corners');
    }, 2000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scoreDelta]);

  const deltaColor =
    scoreDelta > 0 ? 'text-sage-700' : scoreDelta < 0 ? 'text-rose-600' : 'text-slate-500';

  const DeltaIcon = () =>
    scoreDelta > 0 ? (
      <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
    ) : scoreDelta < 0 ? (
      <ArrowDown className="w-4 h-4" strokeWidth={2.5} />
    ) : (
      <Minus className="w-4 h-4" strokeWidth={2.5} />
    );

  const ariaLabel = hasLoggedToday
    ? `Your current Healing Blossom Score: ${health}. ${
        scoreDelta > 0
          ? `Up ${scoreDelta} from yesterday`
          : scoreDelta < 0
            ? `Down ${Math.abs(scoreDelta)} from yesterday`
            : 'Unchanged from yesterday'
      }.`
    : `Your current Healing Blossom Score: ${health}.`;

  const showCentered = revealStage === 'centered' || revealStage === 'centered-with-delta';
  const showCorners = revealStage === 'corners';

  return (
    <div className="flex flex-col items-center py-2">

      {/* Atmosphere glow */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[100px] -z-10 pointer-events-none opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(255,182,193,0.4) 0%, transparent 70%)' }}
      />

      {/* Header label */}
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.85 }}
        className="text-xs font-sans font-semibold text-slate-600 tracking-[0.2em] uppercase mb-3"
      >
        {name}
      </motion.h2>

      {/* Video zone */}
      <div className="relative w-full max-w-[300px] sm:max-w-[360px] aspect-[3/4] mx-auto">

        {/* Loading pulse */}
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-20">
            <motion.div
              animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-40 h-40 rounded-full bg-gradient-to-tr from-rose-200 to-slate-200 blur-2xl"
            />
            <p className="text-slate-500 font-serif italic text-sm animate-pulse tracking-wide">
              Preparing bloom...
            </p>
          </div>
        )}

        {/* Video */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isReady ? 1 : 0 }}
          transition={{ duration: 1.5 }}
          className="w-full h-full"
        >
          <video
            ref={videoRef}
            src="/lotus-bloom.mp4"
            className="w-full h-full object-contain mix-blend-multiply"
            muted
            playsInline
            disablePictureInPicture
          />
        </motion.div>

        {/* CENTERED STAGE — during bloom and just after */}
        <AnimatePresence>
          {isReady && showCentered && (
            <motion.div
              key="centered-score"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
              aria-live="polite"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="pointer-events-auto flex flex-col items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-full cursor-help"
                      style={{
                        background:
                          'radial-gradient(circle, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.35) 60%, rgba(255,255,255,0) 100%)',
                        backdropFilter: 'blur(6px)',
                        WebkitBackdropFilter: 'blur(6px)'
                      }}
                      aria-label={ariaLabel}
                    >
                      <span className="text-[11px] uppercase tracking-[0.22em] text-slate-600 font-medium">
                        Score
                      </span>
                      <span
                        className="font-serif font-semibold text-slate-800 leading-none"
                        style={{
                          fontSize: 'clamp(2.75rem, 9vw, 3.5rem)',
                          textShadow: '0 1px 2px rgba(255,255,255,0.6)'
                        }}
                      >
                        {health}
                      </span>
                      <AnimatePresence>
                        {hasLoggedToday && scoreDelta !== 0 && revealStage === 'centered-with-delta' && (
                          <motion.div
                            key="delta-row"
                            initial={{ opacity: 0, scale: 0.7, y: 4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                            className={`mt-1 flex items-center gap-1 text-xs font-semibold ${deltaColor}`}
                          >
                            <DeltaIcon />
                            <span>{`${scoreDelta > 0 ? '+' : ''}${scoreDelta} vs yesterday`}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs bg-white border-slate-200 shadow-xl">
                    <p className="text-xs text-slate-700 leading-relaxed">
                      Your Healing Blossom Score is a personal progress companion, not a medical diagnosis. The arrow shows how today compares to yesterday.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CORNERS STAGE — number bottom-left, delta bottom-right */}
        <AnimatePresence>
          {isReady && showCorners && (
            <React.Fragment key="corners">
              {/* Score chip — bottom left */}
              <motion.div
                key="corner-score"
                initial={{ opacity: 0, scale: 1.4, x: '50%', y: '-60%' }}
                animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                transition={{ type: 'spring', stiffness: 180, damping: 22 }}
                className="absolute bottom-2 left-2 z-20"
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="flex items-baseline gap-1 px-2.5 py-1 rounded-full cursor-help"
                        style={{
                          background: 'rgba(255,255,255,0.72)',
                          backdropFilter: 'blur(6px)',
                          WebkitBackdropFilter: 'blur(6px)',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
                        }}
                        aria-label={`Score ${health}`}
                      >
                        <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-medium">
                          Score
                        </span>
                        <span
                          className="font-serif font-semibold text-slate-800 leading-none"
                          style={{ fontSize: '1.25rem' }}
                        >
                          {health}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs bg-white border-slate-200 shadow-xl">
                      <p className="text-xs text-slate-700 leading-relaxed">
                        Your Healing Blossom Score — a personal progress companion, not a medical diagnosis.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>

              {/* Delta chip — bottom right (only shown when user has logged today with a non-zero delta) */}
              {hasLoggedToday && scoreDelta !== 0 && (
                <motion.div
                  key="corner-delta"
                  initial={{ opacity: 0, scale: 1.4, x: '-50%', y: '-60%' }}
                  animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                  transition={{ type: 'spring', stiffness: 180, damping: 22, delay: 0.05 }}
                  className="absolute bottom-2 right-2 z-20"
                >
                  <div
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold ${deltaColor}`}
                    style={{
                      background: 'rgba(255,255,255,0.72)',
                      backdropFilter: 'blur(6px)',
                      WebkitBackdropFilter: 'blur(6px)',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
                    }}
                    aria-label={
                      scoreDelta > 0
                        ? `Up ${scoreDelta} from yesterday`
                        : `Down ${Math.abs(scoreDelta)} from yesterday`
                    }
                  >
                    <DeltaIcon />
                    <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>
                      {`${scoreDelta > 0 ? '+' : ''}${scoreDelta}`}
                    </span>
                  </div>
                </motion.div>
              )}
            </React.Fragment>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
