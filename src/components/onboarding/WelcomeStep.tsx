import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.preload = 'auto';
    video.pause();

    const handleCanPlay = () => {
      if (video.readyState >= 3) {
        video.currentTime = 0.01;
        video.pause();
        setVideoReady(true);
      }
    };

    video.addEventListener('canplay', handleCanPlay);
    video.load();

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-6 bg-[#FDFBF7] overflow-hidden relative">
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(134,168,115,0.35) 0%, transparent 70%)' }}
      />

      <div className="relative w-64 h-64 md:w-80 md:h-80 mb-6 flex items-center justify-center">
        {!videoReady && (
          <motion.div
            animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-40 h-40 rounded-full bg-gradient-to-tr from-sage-200 to-sage-100 blur-2xl"
          />
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: videoReady ? 0.85 : 0, scale: 1 }}
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
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
        className="relative z-10"
      >
        <h1 className="font-serif text-3xl md:text-4xl text-slate-800 mb-4 tracking-tight leading-snug">
          Your Journey, <span className="text-sage-600 italic">Seen.</span>
        </h1>
        <p className="font-sans text-slate-500 text-sm md:text-base leading-relaxed max-w-xs mx-auto mb-8">
          PCOS is multi-layered. Like this lotus, we help you bloom across the symptoms and goals that matter most to you.
        </p>

        <motion.label
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="flex items-start gap-3 max-w-xs mx-auto mb-8 cursor-pointer group"
        >
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={ageConfirmed}
              onChange={(e) => setAgeConfirmed(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                ageConfirmed
                  ? 'bg-sage-600 border-sage-600'
                  : 'bg-white border-slate-300 group-hover:border-sage-400'
              }`}
            >
              {ageConfirmed && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-xs text-slate-500 leading-relaxed text-left">
            I confirm I am 18 years of age or older and agree to the{' '}
            <span className="text-sage-600 underline underline-offset-2">Terms of Use</span>
            {' '}and{' '}
            <span className="text-sage-600 underline underline-offset-2">Privacy Policy</span>.
          </span>
        </motion.label>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          onClick={ageConfirmed ? onNext : undefined}
          disabled={!ageConfirmed}
          className={`group relative px-8 py-4 rounded-full font-medium shadow-xl flex items-center gap-3 mx-auto transition-all duration-300 ${
            ageConfirmed
              ? 'bg-slate-800 text-[#FDFBF7] hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          Begin Journey
          <ChevronRight size={18} className={ageConfirmed ? 'group-hover:translate-x-1 transition-transform duration-200' : ''} />
        </motion.button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-8 text-[10px] text-slate-400 uppercase tracking-[0.2em]"
      >
        Your data stays yours. Always.
      </motion.p>
    </div>
  );
}
