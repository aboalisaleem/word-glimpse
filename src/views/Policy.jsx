export default function Policy({ onBack }) {
  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in-up">
      <button onClick={onBack} className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 hover:text-white">← Back</button>
      <div className="bg-[#1a202c] rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
        <h2 className="text-lg font-black text-white uppercase tracking-widest border-b border-slate-700/50 pb-4 mb-4">Privacy Policy</h2>
        <div className="space-y-4 text-xs text-slate-400 leading-relaxed max-h-96 overflow-y-auto custom-scrollbar pr-2">
          <p>Welcome to Word Glimpse. Your privacy is critical to us.</p>
          <p className="font-bold text-slate-200">1. Data Collection</p>
          <p>If you play as a guest, we only store temporary session data. If you create an account, we store your email and gameplay statistics (vocabulary progress).</p>
          <p className="font-bold text-slate-200">2. Usage</p>
          <p>We do not sell your data. Vocabulary tracking is purely to enhance your English learning experience.</p>
          <p className="font-bold text-slate-200">3. Security</p>
          <p>We implement industry-standard security measures to protect your data. However, no method of transmission over the Internet is 100% secure. <b className="text-red-500">Do not use global passwords shared across multiple sites to protect your accounts.</b></p>
        </div>
      </div>
    </div>
  );
}