export default function Guesser() {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto pt-12 space-y-10">
      
      {/* 90s Style Blank Card Placeholder */}
      <div className="w-80 h-72 bg-[#dfdfdf] dark:bg-black border-4 border-black dark:border-[#00ff00] border-dashed flex flex-col items-center justify-center p-4 relative">
        <span className="absolute top-2 left-2 text-xs font-bold">CARD_DATA.EXE</span>
        <p className="text-5xl font-black text-black dark:text-[#00ff00] animate-pulse">
          ???
        </p>
        <p className="mt-4 text-sm font-bold bg-black text-white dark:bg-[#00ff00] dark:text-black px-2 py-1">
          WAITING FOR CLUE...
        </p>
      </div>

      <div className="flex flex-col w-full gap-6 px-6">
         {/* Giant Retro Buzzer */}
         <button className="w-full py-8 bg-[#ff0000] dark:bg-red-700 text-white font-black text-4xl tracking-widest uppercase border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-2 cursor-pointer transition-all">
           Buzz In!
         </button>

         {/* I Know It Button */}
         <button className="w-full py-4 bg-[#c0c0c0] dark:bg-gray-900 text-black dark:text-[#00ff00] font-bold text-xl uppercase border-4 border-black dark:border-[#00ff00] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(0,255,0,1)] active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] active:translate-y-1.5 cursor-pointer transition-all">
           [ I Know It ]
         </button>
      </div>
    </div>
  );
}