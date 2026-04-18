import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ExternalLink, ShieldCheck } from 'lucide-react';
import { classifyMessage, RouteContext } from '../lib/services/companionRouter';
import { sendCrisisAlert } from '../lib/services/escalationService';
import { getOrGenerateBotToken } from '../lib/services/tokenService';
import { CrisisSupport } from './CrisisSupport';

interface BlossomCompanionProps {
  blossomScore: number;
  season: 'resting' | 'growing' | 'blooming';
  streak?: number;
}

const SUGGESTED_CHIPS = [
  'Why do I feel so tired?',
  'Tips for better sleep',
  'How to manage cravings',
  'I need some encouragement',
  'Help with stress',
];

const IN_APP_RESPONSES: Record<string, string> = {
  default: "Your Blossom score and logs live privately on your device. Head to the Insights section to explore your personal trends.",
};

const SESSION_LIMIT_KEY = 'companion_telegram_opens_session';

function getSessionOpens(): number {
  return parseInt(sessionStorage.getItem(SESSION_LIMIT_KEY) || '0', 10);
}

function incrementSessionOpens(): void {
  sessionStorage.setItem(SESSION_LIMIT_KEY, String(getSessionOpens() + 1));
}

export function BlossomCompanion({ blossomScore, season, streak = 0 }: BlossomCompanionProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [inAppReply, setInAppReply] = useState<string | null>(null);
  const [telegramUrl, setTelegramUrl] = useState<string | null>(null);
  const [showCrisis, setShowCrisis] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [botToken, setBotToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && !botToken && !tokenLoading) {
      setTokenLoading(true);
      getOrGenerateBotToken().then(token => {
        setBotToken(token);
        setTokenLoading(false);
      });
    }
  }, [open, botToken, tokenLoading]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const context: RouteContext = { blossomScore, season, streak, botToken };

  const handleSubmit = async () => {
    const text = input.trim();
    if (!text) return;

    const decision = classifyMessage(text, context);
    setInput('');
    setInAppReply(null);
    setTelegramUrl(null);
    setRateLimited(false);

    if (decision.destination === 'crisis') {
      setOpen(false);
      setShowCrisis(true);
      await sendCrisisAlert({
        crisisLevel: decision.crisisLevel || 'severe',
        blossomScore,
        season
      });
      return;
    }

    if (decision.destination === 'inapp') {
      setInAppReply(IN_APP_RESPONSES.default);
      return;
    }

    if (decision.destination === 'telegram') {
      if (getSessionOpens() >= 3) {
        setRateLimited(true);
        return;
      }
      setTelegramUrl(decision.telegramUrl || null);
    }
  };

  const handleTelegramOpen = () => {
    if (telegramUrl) {
      incrementSessionOpens();
      window.open(telegramUrl, '_blank', 'noopener,noreferrer');
      setTelegramUrl(null);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setInAppReply(null);
    setTelegramUrl(null);
    setRateLimited(false);
  };

  return (
    <>
      {showCrisis && <CrisisSupport onClose={() => setShowCrisis(false)} />}

      <AnimatePresence>
        {open && (
          <motion.div
            key="companion-sheet"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-28 right-4 sm:right-8 z-50 w-full max-w-sm"
          >
            <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden">
              <div className="bg-gradient-to-r from-rose-400 to-pink-400 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🌸</span>
                  <div>
                    <p className="text-white font-semibold text-sm leading-tight">Ask Blossom</p>
                    <p className="text-rose-100 text-xs">Your companion, always here</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-rose-100 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-5 pt-4 pb-3">
                <div className="flex items-center gap-1.5 mb-3">
                  <ShieldCheck className="w-3.5 h-3.5 text-sage-500 flex-shrink-0" />
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {botToken
                      ? 'Connect to Blossom Support (Secure) — your identity is verified'
                      : tokenLoading
                      ? 'Setting up your secure connection...'
                      : 'Ask me anything about PCOS or wellness. Health data stays private on your device.'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {SUGGESTED_CHIPS.map(chip => (
                    <button
                      key={chip}
                      onClick={() => setInput(chip)}
                      className="text-xs px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-full border border-rose-100 transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {inAppReply && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-3 bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-700 leading-relaxed"
                    >
                      {inAppReply}
                    </motion.div>
                  )}

                  {telegramUrl && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-3 bg-rose-50 border border-rose-100 rounded-xl p-3 space-y-2"
                    >
                      <p className="text-xs text-rose-700 leading-relaxed">
                        I'd love to help with that! Our Telegram companion can give you a more thoughtful response.
                      </p>
                      <button
                        onClick={handleTelegramOpen}
                        className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors underline underline-offset-2"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Continue in Telegram (Secure)
                      </button>
                      <button
                        onClick={() => setTelegramUrl(null)}
                        className="block text-xs text-stone-400 hover:text-stone-600 transition-colors"
                      >
                        Not now
                      </button>
                    </motion.div>
                  )}

                  {rateLimited && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-3 bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 leading-relaxed"
                    >
                      You've opened Telegram a few times this session. Take a breath — I'm still here when you need me.
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    placeholder="How are you feeling today?"
                    className="flex-1 text-sm px-4 py-2.5 bg-rose-50 border border-rose-100 rounded-full placeholder-rose-300 text-stone-700 focus:outline-none focus:border-rose-300 transition-colors"
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={!input.trim()}
                    className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 disabled:opacity-40 rounded-full transition-all shadow-sm"
                    aria-label="Send"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              <div className="px-5 pb-4 pt-1">
                <p className="text-[10px] text-stone-300 text-center">
                  No health data leaves your device. General info only — not medical advice.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-4 sm:right-8 z-40 flex items-center gap-2.5 pl-4 pr-5 py-3 bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white rounded-full shadow-lg transition-all"
        aria-label="Ask Blossom"
      >
        <span className="text-lg leading-none">🌸</span>
        <span className="text-sm font-semibold">Ask Blossom</span>
      </motion.button>
    </>
  );
}
