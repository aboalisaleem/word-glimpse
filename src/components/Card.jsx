export default function Card({ cardData }) {
  return (
    <div className="w-80 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 text-center">
        <h2 className="text-3xl font-bold">{cardData.word}</h2>
        <p className="text-blue-200 text-sm mt-1 uppercase tracking-wide">
          {cardData.partOfSpeech} • Tier {cardData.difficulty}
        </p>
      </div>
      
      {/* Image Placeholder */}
      <div className="h-40 bg-gray-200 flex items-center justify-center text-gray-500 italic">
        [ Image: {cardData.imageUrl} ]
      </div>

      {/* Body - Word Meaning (NEW) */}
      <div className="p-4 bg-blue-50 border-b border-gray-100 text-center">
        <p className="text-sm text-blue-800 font-semibold uppercase tracking-wider mb-1">Meaning</p>
        <p className="text-gray-700 text-sm">{cardData.meaning}</p>
      </div>
      
      {/* Body - Sentence Hint */}
      <div className="p-5 border-b border-gray-100">
        <p className="text-gray-800 text-center font-medium text-lg leading-snug">
          "{cardData.sentenceHint}"
        </p>
      </div>
      
      {/* Footer - Forbidden Words */}
      <div className="p-4 bg-red-50">
        <p className="text-xs text-red-600 font-bold uppercase tracking-wider mb-2 text-center">
          Forbidden Words
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {cardData.forbiddenWords.map((word, index) => (
            <span key={index} className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}