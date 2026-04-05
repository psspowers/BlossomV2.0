import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TermsOfUse: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 pb-24 font-sans selection:bg-emerald-200">
      <header className="sticky top-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-md px-4 py-4 border-b border-stone-100 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 text-stone-500 hover:bg-stone-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <span className="font-serif text-lg font-medium text-stone-800">Terms of Use</span>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto px-6 pt-8 space-y-8"
      >
        <div className="text-center mb-10">
          <div className="mx-auto w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            <Scale size={28} />
          </div>
          <h1 className="font-serif text-3xl text-stone-900 mb-2">Blossom Terms of Use</h1>
          <p className="text-sm text-stone-500 uppercase tracking-widest">Last updated: April 4, 2026</p>
        </div>

        <div className="prose prose-stone prose-emerald max-w-none leading-relaxed">
          <p className="text-lg font-serif italic text-emerald-800/80 text-center px-4 mb-8">
            Welcome to Blossom — your 100% on-device, privacy-first Living Healing Companion for PCOS. By using Blossom, you agree to these Terms of Use. Please read them carefully.
          </p>

          <h2 className="font-serif text-xl text-stone-800 border-b border-stone-200 pb-2 mt-8 mb-4">1. What Blossom Is (and Is Not)</h2>
          <p className="text-stone-600">
            Blossom is a self-monitoring companion tool. It helps you track symptoms, cycles, lifestyle, and see personal patterns through the Blossom Score and Sacred Lotus seasons.
          </p>
          <p className="text-stone-600 font-medium mt-4">Blossom is not:</p>
          <ul className="space-y-2 text-stone-600">
            <li>A substitute for professional medical advice, diagnosis, or treatment</li>
            <li>A medical device</li>
            <li>Able to provide personalised medical recommendations</li>
            <li>For use in emergencies or severe symptoms</li>
          </ul>
          <p className="text-stone-600 font-medium mt-4 italic">
            Always consult your doctor or qualified healthcare provider for medical decisions.
          </p>

          <h2 className="font-serif text-xl text-stone-800 border-b border-stone-200 pb-2 mt-8 mb-4">2. Privacy-First Promise</h2>
          <p className="text-stone-600">
            Your health data (logs, symptoms, scores) never leaves your device. See our Privacy Policy for full details.
          </p>

          <h2 className="font-serif text-xl text-stone-800 border-b border-stone-200 pb-2 mt-8 mb-4">3. Who Can Use Blossom</h2>
          <p className="text-stone-600">
            You must be at least 18 years old. Blossom is designed for adults managing PCOS.
          </p>

          <h2 className="font-serif text-xl text-stone-800 border-b border-stone-200 pb-2 mt-8 mb-4">4. How You May Use Blossom</h2>
          <ul className="space-y-2 text-stone-600">
            <li>Use the app for your personal, non-commercial PCOS journey.</li>
            <li>Log your own data honestly.</li>
            <li>Export or delete your data anytime.</li>
            <li>Share your own Clinical Summary PDF only if you choose to.</li>
          </ul>

          <h2 className="font-serif text-xl text-stone-800 border-b border-stone-200 pb-2 mt-8 mb-4">5. What You Must Not Do</h2>
          <ul className="space-y-2 text-stone-600">
            <li>Use Blossom for self-diagnosis or to replace professional care.</li>
            <li>Rely on the app for emergency or urgent medical situations.</li>
            <li>Attempt to reverse-engineer, copy, or modify the app code.</li>
            <li>Use the app in any way that violates applicable laws.</li>
          </ul>

          <h2 className="font-serif text-xl text-stone-800 border-b border-stone-200 pb-2 mt-8 mb-4">6. No Warranties</h2>
          <p className="text-stone-600">
            Blossom is provided "as is." We do not guarantee that the app will be error-free, uninterrupted, or that it will meet every need. The Blossom Score and insights are for self-monitoring only.
          </p>

          <h2 className="font-serif text-xl text-stone-800 border-b border-stone-200 pb-2 mt-8 mb-4">7. Limitation of Liability</h2>
          <p className="text-stone-600">
            To the fullest extent permitted by law, Ritika Yamdagni and Blossom are not liable for any damages arising from your use of the app.
          </p>

          <h2 className="font-serif text-xl text-stone-800 border-b border-stone-200 pb-2 mt-8 mb-4">8. Changes to These Terms</h2>
          <p className="text-stone-600">
            We may update these Terms occasionally. We will notify you of material changes. Continued use of the app means you accept the updated Terms.
          </p>

          <h2 className="font-serif text-xl text-stone-800 border-b border-stone-200 pb-2 mt-8 mb-4">9. Contact</h2>
          <p className="text-stone-600">
            If you have questions about these Terms, email <a href="mailto:blossom@yamdagni.com" className="text-emerald-600 hover:text-emerald-700 underline underline-offset-4">blossom@yamdagni.com</a>.
          </p>

          <div className="mt-12 p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
            <p className="font-serif text-lg text-emerald-900 mb-4">Thank you for choosing Blossom.</p>
            <p className="text-emerald-800/80 mb-6 italic">We built this for my daughter Ritika and for everyone navigating PCOS with dignity, privacy, and hope.</p>
            <p className="font-serif font-bold text-emerald-900">— Ritika Yamdagni, Founder of Blossom</p>
          </div>
        </div>
      </motion.main>
    </div>
  );
};
