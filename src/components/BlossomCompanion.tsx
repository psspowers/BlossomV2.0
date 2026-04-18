import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ShieldCheck } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { sendMessage, isDataQuestion, ChatMessage } from '../lib/services/blossomChatService';
import { isCrisisMessage, triggerEscalation } from '../lib/services/escalationService';
import { CrisisSupport } from './CrisisSupport';
import { db } from '../lib/db';
import {
  normalizeSymptom, normalizeSleep, normalizeDiet, normalizeExercise,
  normalizeMood, normalizeStress, normalizeAnxiety
} from '../lib/logic/conversions';
import { v4 as uuidv4 } from 'uuid';

interface BlossomCompanionProps {
  blossomScore: number;
  season: string;
  streak: number;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const SUGGESTED_PROMPTS = [
  "Why do I feel this way?",
  "Is this normal for PCOS?",
  "I'm struggling today 💛",
  "What helps with my symptoms?",
  "Give me some encouragement",
];

const GREETING: ChatMessage = {
  id: 'greeting',
  role: 'assistant',
  content:
    "Hi! I'm Blossom Support 🌸\nI'm your compassionate PCOS companion — here to listen, inform, and support you. What's on your mind today?",
  timestamp: new Date(),
};

const SESSION_COUNT_KEY = 'blossom_session_count';
const SESSION_MAX = 3;

function checkSessionLimit(): boolean {
  const count = parseInt(sessionStorage.getItem(SESSION_COUNT_KEY) || '0');
  return count < SESSION_MAX;
}

function incrementSessionCount(): void {
  const count = parseInt(sessionStorage.getItem(SESSION_COUNT_KEY) || '0');
  sessionStorage.setItem(SESSION_COUNT_KEY, String(count + 1));
}

export function BlossomCompanion({
  blossomScore,
  season,
  streak,
  isOpen: externalIsOpen,
  onOpenChange,
}: BlossomCompanionProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalOpen;

  const setIsOpen = (val: boolean) => {
    if (val && !checkSessionLimit()) return;
    if (val) incrementSessionCount();
    setInternalOpen(val);
    onOpenChange?.(val);
  };

  const latestLog = useLiveQuery(() => db.logs.orderBy('date').last());

  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && !hasOpened) {
      setHasOpened(true);
    }
  }, [isOpen, hasOpened]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
      }, 400);
    }
  }, [isOpen, messages]);

  const handleSend = async (text?: string) => {
    const messageText = (text ?? input).trim();
    if (!messageText || loading) return;

    setInput('');

    if (isCrisisMessage(messageText)) {
      triggerEscalation(messageText);
      setShowCrisis(true);
      return;
    }

    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    if (isDataQuestion(messageText)) {
      const lowerText = messageText.toLowerCase();
      let localReply = "";

      if (lowerText.includes('streak') || lowerText.includes('days')) {
        localReply = streak > 0
          ? `You've been logging for ${streak} day${streak === 1 ? '' : 's'} in a row 🌿 That consistency is real self-care.`
          : "You haven't started a streak yet — but every journey starts with one log. I'm here whenever you're ready 🌸";
      } else if (lowerText.includes('score') && !lowerText.includes('chart')) {
        localReply = `Your current Blossom Score is ${Math.round(blossomScore)}/100 🌸 Keep prioritizing your wellbeing.`;
      } else if (lowerText.includes('chart') || lowerText.includes('radar') || lowerText.includes('web')) {
        if (!latestLog) {
          localReply = "I need a little more data to explain your charts. Try logging your day today! 🌸";
        } else if (lowerText.includes('physical')) {
          const phys: Record<string, number> = {
            "Cramps": normalizeSymptom(latestLog.symptoms?.cramps),
            "Acne": normalizeSymptom(latestLog.symptoms?.acne),
            "Bloating": normalizeSymptom(latestLog.symptoms?.bloat),
            "Hair Loss": normalizeSymptom(latestLog.symptoms?.hairLoss),
            "Facial Hair": normalizeSymptom(latestLog.symptoms?.hirsutism)
          };
          const sorted = Object.entries(phys).sort((a, b) => a[1] - b[1]);
          localReply = `Looking at your Physical Radar 🌸\n\nYour strongest area is **${sorted[4][0]}**. However, **${sorted[0][0]}** is pulling the web inward. The closer a point is to the center, the more that specific symptom is asking for gentle care today.`;
        } else if (lowerText.includes('metabolic') || lowerText.includes('lifestyle')) {
          const meta: Record<string, number> = {
            "Sleep": normalizeSleep(latestLog.lifestyle?.sleep),
            "Diet": normalizeDiet(latestLog.lifestyle?.diet),
            "Movement": normalizeExercise(latestLog.lifestyle?.exercise)
          };
          const sorted = Object.entries(meta).sort((a, b) => a[1] - b[1]);
          localReply = `Looking at your Metabolic Radar 🌿\n\nYou are doing great with **${sorted[2][0]}**. The chart shows that **${sorted[0][0]}** is pulling toward the center, which means it might need a little extra focus. Remember, small consistent changes bloom over time.`;
        } else if (lowerText.includes('emotional') || lowerText.includes('mental')) {
          const emo: Record<string, number> = {
            "Mood": normalizeMood(latestLog.psych?.mood),
            "Stress": normalizeStress(latestLog.psych?.stress),
            "Anxiety": normalizeAnxiety(latestLog.psych?.anxiety)
          };
          const sorted = Object.entries(emo).sort((a, b) => a[1] - b[1]);
          localReply = `Looking at your Emotional Radar 💛\n\nYour **${sorted[2][0]}** is your anchor right now. However, your **${sorted[0][0]}** is pulling the chart inward. It is completely valid to feel this way with PCOS. Be extra kind to yourself today.`;
        } else {
          localReply = `Looking at "Today's Balance" 🌸\n\nThe outer edge represents optimal wellness. Any point pulling toward the center is an area asking for support.\n\nTry asking me specifically about your "Physical chart", "Metabolic chart", or "Emotional chart" to dive deeper!`;
        }
      } else {
        localReply = `Your current score is ${Math.round(blossomScore)}/100 and you're in a ${season.charAt(0).toUpperCase() + season.slice(1)} season 🌸`;
      }

      setLoading(true);
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: 'assistant', content: localReply, id: uuidv4(), timestamp: new Date() }]);
        setLoading(false);
      }, 800);
      return;
    } else {
      const timeout = new Promise<string>((resolve) =>
        setTimeout(
          () =>
            resolve(
              "I'm here for you 🌸 It's taking a little longer than usual — please try again in a moment."
            ),
          15000
        )
      );
      const reply = await Promise.race([sendMessage(messageText, blossomScore, season), timeout]);
      setLoading(false);
      const assistantMsg: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <AnimatePresence>
        {showCrisis && (
          <CrisisSupport onDismiss={() => setShowCrisis(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full z-50 flex items-center justify-center shadow-lg focus:outline-none"
            style={{
              background: 'linear-gradient(135deg, rgb(236,72,153), rgb(244,114,182))',
              boxShadow: '0 4px 20px rgba(236,72,153,0.45)',
            }}
            aria-label="Open Blossom Support"
          >
            <motion.span
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="text-2xl select-none"
            >
              🌸
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-3xl overflow-hidden md:right-6 md:left-auto md:w-[400px] md:bottom-6 md:rounded-3xl"
              style={{
                height: 'min(70vh, 580px)',
                background: 'rgb(24, 24, 27)',
                border: '1px solid rgba(244,114,182,0.2)',
                boxShadow: '0 -8px 40px rgba(236,72,153,0.15)',
              }}
            >
              <div
                className="flex items-center justify-between px-5 py-4 flex-shrink-0"
                style={{ borderBottom: '1px solid rgba(244,114,182,0.15)' }}
              >
                <div>
                  <h2 className="text-base font-serif font-semibold text-white">
                    Blossom Support 🌸
                  </h2>
                  <p className="text-xs" style={{ color: 'rgb(161,161,170)' }}>
                    Your PCOS companion — always here
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="flex items-center gap-1 px-2 py-1 rounded-full"
                    style={{ background: 'rgba(244,114,182,0.08)', border: '1px solid rgba(244,114,182,0.15)' }}
                    title="Your health data never leaves your device"
                  >
                    <ShieldCheck className="w-3 h-3" style={{ color: 'rgb(244,114,182)' }} />
                    <span className="text-xs" style={{ color: 'rgb(161,161,170)' }}>Secure</span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                    style={{ color: 'rgb(161,161,170)' }}
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className="max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line"
                      style={
                        msg.role === 'user'
                          ? {
                              background: 'rgb(236,72,153)',
                              color: 'white',
                              borderBottomRightRadius: '4px',
                            }
                          : {
                              background: 'rgba(39,39,42,0.9)',
                              color: 'rgb(250,250,250)',
                              border: '1px solid rgba(244,114,182,0.15)',
                              borderBottomLeftRadius: '4px',
                            }
                      }
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}

                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div
                      className="px-4 py-3 rounded-2xl"
                      style={{
                        background: 'rgba(39,39,42,0.9)',
                        border: '1px solid rgba(244,114,182,0.15)',
                        borderBottomLeftRadius: '4px',
                      }}
                    >
                      <span className="flex gap-1 items-center">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: 'rgb(244,114,182)' }}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{
                              duration: 1.2,
                              repeat: Infinity,
                              delay: i * 0.2,
                            }}
                          />
                        ))}
                      </span>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div
                className="flex-shrink-0 px-4 pt-2 pb-2"
                style={{ borderTop: '1px solid rgba(244,114,182,0.1)' }}
              >
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSend(prompt)}
                      disabled={loading}
                      className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all disabled:opacity-50"
                      style={{
                        background: 'rgba(236,72,153,0.12)',
                        color: 'rgb(244,114,182)',
                        border: '1px solid rgba(236,72,153,0.25)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pb-2">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value.slice(0, 500))}
                      onKeyDown={handleKeyDown}
                      disabled={loading}
                      placeholder="What's on your mind?"
                      className="w-full px-4 py-2.5 rounded-full text-sm outline-none disabled:opacity-50"
                      style={{
                        background: 'rgba(39,39,42,0.8)',
                        border: '1px solid rgba(244,114,182,0.2)',
                        color: 'rgb(250,250,250)',
                      }}
                    />
                    {input.length > 400 && (
                      <span
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                        style={{ color: input.length >= 500 ? 'rgb(236,72,153)' : 'rgb(161,161,170)' }}
                      >
                        {500 - input.length}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || loading}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-40"
                    style={{
                      background: 'rgb(236,72,153)',
                      color: 'white',
                    }}
                    aria-label="Send"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-center pb-1" style={{ fontSize: '10px', color: 'rgba(161,161,170,0.6)' }}>
                  Your health data never leaves your device — ever
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
