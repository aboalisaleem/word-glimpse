import Card from './components/Card';
import vocabulary from './data/vocabulary.json';

export default function App() {
  // Load the first card from the JSON deck
  const activeCard = vocabulary[0];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card cardData={activeCard} />
    </div>
  );
}