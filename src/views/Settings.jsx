export default function Settings({ onBack }) {
  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in-up">
      <button onClick={onBack} className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 hover:text-white">← Back</button>
      <div className="bg-[#1a202c] rounded-3xl p-6 border border-slate-700/50 shadow-2xl space-y-4">
        <h2 className="text-lg font-black text-white uppercase tracking-widest border-b border-slate-700/50 pb-4 mb-4">Settings</h2>
        <div className="flex justify-between items-center bg-[#0f141e] p-4 rounded-xl border border-slate-700">
          <span className="text-sm font-bold text-slate-300">Sound Effects</span>
          <div className="w-10 h-5 bg-cyan-500 rounded-full relative"><div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5"></div></div>
        </div>
        <div className="flex justify-between items-center bg-[#0f141e] p-4 rounded-xl border border-slate-700">
          <span className="text-sm font-bold text-slate-300">Haptic Vibrations</span>
          <div className="w-10 h-5 bg-cyan-500 rounded-full relative"><div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5"></div></div>
        </div>
        <button className="w-full mt-4 py-4 bg-red-900/20 text-red-500 font-bold rounded-xl border border-red-900/50 uppercase tracking-widest text-xs">Logout</button>
      </div>
    </div>
  );
}