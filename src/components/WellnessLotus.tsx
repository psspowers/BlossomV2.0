import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { SeasonState } from '../lib/logic/seasons';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip';

interface WellnessLotusProps {
  health: number;
  scoreDelta?: number;
  season: SeasonState;
  mode: 'nurture' | 'steady' | 'thrive';
  name?: string;
}

export const WellnessLotus: React.FC<WellnessLotusProps> = ({
  health,
  scoreDelta = 0,
  season,
  name = 'Your Journey'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const animationFrameRef = useRef<number>();

  // 1. INITIALIZATION
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.preload = "auto";
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
    };
  }, []);

  // 2. THE "ALWAYS BLOOM" ENGINE
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isReady || !videoDuration) return;

    // 1. RESET TO START
    video.currentTime = 0.1;
    video.play();

    // 2. CALCULATE DESTINATION
    const targetTime = Math.max(0.1, (health / 100) * (videoDuration * 0.95));

    const checkProgress = () => {
      if (!video) return;
      const currentTime = video.currentTime;

      // 3. STOP AT TARGET
      if (currentTime >= targetTime) {
        video.pause();
        video.currentTime = targetTime;
        return;
      }

      // 4. DYNAMIC SPEED
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

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [health, isReady, videoDuration]);

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

      {/* Video zone — portrait aspect ratio, no overflow-hidden, no fixed viewport height */}
      <div className="relative w-full max-w-[300px] sm:max-w-[360px] aspect-[3/4] mx-auto">

        {/* Loading pulse */}
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-20">
            <motion.div
              animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
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

        {/* Score — centred on the lotus with a delta arrow vs yesterday */}
        {isReady && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
            aria-live="polite"
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="pointer-events-auto flex flex-col items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-full cursor-help"
                    style={{
                      background: 'radial-gradient(circle, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.35) 60%, rgba(255,255,255,0) 100%)',
                      backdropFilter: 'blur(6px)',
                      WebkitBackdropFilter: 'blur(6px)'
                    }}
                    aria-label={`Your current Healing Blossom Score: ${health}. ${
                      scoreDelta > 0
                        ? `Up ${scoreDelta} from yesterday`
                        : scoreDelta < 0
                          ? `Down ${Math.abs(scoreDelta)} from yesterday`
                          : 'Unchanged from yesterday'
                    }.`}
                  >
                    <span className="text-[11px] uppercase tracking-[0.22em] text-slate-600 font-medium">
                      Score
                    </span>
                    <span
                      className="font-serif font-semibold text-slate-800 leading-none"
                      style={{ fontSize: 'clamp(2.75rem, 9vw, 3.5rem)', textShadow: '0 1px 2px rgba(255,255,255,0.6)' }}
                    >
                      {health}
                    </span>
                    <div
                      className={`mt-1 flex items-center gap-1 text-xs font-semibold ${
                        scoreDelta > 0
                          ? 'text-sage-700'
                          : scoreDelta < 0
                            ? 'text-rose-600'
                            : 'text-slate-500'
                      }`}
                    >
                      {scoreDelta > 0 ? (
                        <ArrowUp className="w-3.5 h-3.5" strokeWidth={2.5} />
                      ) : scoreDelta < 0 ? (
                        <ArrowDown className="w-3.5 h-3.5" strokeWidth={2.5} />
                      ) : (
                        <Minus className="w-3.5 h-3.5" strokeWidth={2.5} />
                      )}
                      <span>
                        {scoreDelta === 0
                          ? 'same as yesterday'
                          : `${scoreDelta > 0 ? '+' : ''}${scoreDelta} vs yesterday`}
                      </span>
                    </div>
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
      </div>

      {/* Narrative zone — completely outside the video container, flows naturally below */}
      {isReady && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mt-6 text-center px-4 w-full"
        >
          <div className="flex items-center justify-center gap-3 text-slate-600 text-sm font-medium uppercase tracking-widest mb-3">
            <motion.span
              className="text-2xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              {season.icon}
            </motion.span>
            <span className="font-serif">Season of {season.currentSeason}</span>
          </div>
          <p className="font-serif italic text-slate-700 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
            "{season.message}"
          </p>
          <p className="text-xs text-slate-400 mt-3 font-medium tracking-wide">
            Your journey, seen and supported
          </p>
        </motion.div>
      )}
    </div>
  );
};
