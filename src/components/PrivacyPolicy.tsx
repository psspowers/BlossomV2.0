import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 pb-24 font-sans selection:bg-emerald-200">
      <header className="sticky top-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-md px-4 py-4 border-b border-stone-100 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 text-stone-500 hover:bg-stone-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <span className="font-serif text-lg font-medium text-stone-800">Privacy Policy</span>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto px-6 pt-8 space-y-8"
      >
        <div className="text-center mb-10">
          <div className="mx-auto w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck size={28} />
          </div>
          <h1 className="font-serif text-3xl text-stone-900 mb-2">Blossom Privacy Policy</h1>
          <p className="text-sm text-stone-500 uppercase tracking-widest">Last updated: April 4, 2026</p>
        </div>

        <div className="prose prose-stone prose-emerald max-w-none leading-relaxed">
          <p className="text-lg font-serif italic text-emerald-800/80 text-center px-4 mb-8">
            "At Blossom, your privacy is our North Star. We built this app because we believe you should own and control your own health data — especially with a condition as personal as PCOS."
          </p>

          <h2 className="font-serif text-xl text-stone-800 border-b border-stone-200 pb-2 mt-8 mb-4">What we collect and store</h2>
          <ul className="space-y-2 text-stone-600">
            <li><strong className="text-stone-700">All your logs, symptoms, cycle data, Blossom Score, and Daily Wisdom cards are stored only on your device</strong> using IndexedDB (local browser storage).</li>
            <li>No health data is ever sent to our servers or any third party.</li>
          </ul>

          <h2 className="font-serif text-xl text-stone-800 border-b border-stone-200 pb-2 mt-8 mb-4">What we do NOT do</h2>
          <ul className="space-y-2 text-stone-600">
            <li>We do <strong>not</strong> track you.</li>
            <li>We do <strong>not</strong> collect analytics or usage data.</li>
            <li>We do <strong>not</strong> show ads.</li>
            <li>We do <strong>not</strong> sell or share any of your information.</li>
            <li>We do <strong>not</strong> store your symptoms, cycles, or any personal health information in the cloud.</li>
          </ul>

          <h2 className="font-serif text-xl text-stone-800 border-b border-stone-200 pb-2 mt-8 mb-4">Authentication</h2>
          <p className="text-stone-600">
            We use Supabase for secure login (email + password). This system only handles your email and password — it never sees or stores any of your PCOS data.
          </p>

          <h2 className="font-serif text-xl text-stone-800 border-b border-stone-200 pb-2 mt-8 mb-4">Your rights</h2>
          <ul className="space-y-2 text-stone-600">
            <li>You can export all your data as JSON at any time.</li>
            <li>You can delete everything (local + any non-health account data) with one tap.</li>
            <li>You are in complete control.</li>
          </ul>

          <h2 className="font-serif text-xl text-stone-800 border-b border-stone-200 pb-2 mt-8 mb-4">Clinical Summary & Sharing</h2>
          <p className="text-stone-600">
            When you export the Clinical Summary PDF, it is generated entirely on your device and never leaves your phone until you choose to share it yourself.
          </p>

          <h2 className="font-serif text-xl text-stone-800 border-b border-stone-200 pb-2 mt-8 mb-4">Children & Sensitive Data</h2>
          <p className="text-stone-600">
            Blossom is designed for adults. We do not knowingly collect data from anyone under 18.
          </p>

          <h2 className="font-serif text-xl text-stone-800 border-b border-stone-200 pb-2 mt-8 mb-4">Changes to this policy</h2>
          <p className="text-stone-600">
            We will update this page if anything changes and let you know. Because we are privacy-first, any change will always keep your data on your device.
          </p>

          <h2 className="font-serif text-xl text-stone-800 border-b border-stone-200 pb-2 mt-8 mb-4">Contact</h2>
          <p className="text-stone-600">
            If you have any questions about privacy, email <a href="mailto:blossom@yamdagni.com" className="text-emerald-600 hover:text-emerald-700 underline underline-offset-4">blossom@yamdagni.com</a>. We answer personally.
          </p>

          <div className="mt-12 p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
            <p className="font-serif text-lg text-emerald-900 mb-2">Thank you for trusting us with something as personal as your PCOS journey.</p>
            <p className="text-emerald-800/80 mb-4">Your data is yours — always.</p>
            <p className="font-serif font-bold text-emerald-900">— Ritika Yamdagni, Founder of Blossom</p>
          </div>
        </div>
      </motion.main>
    </div>
  );
};
