import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Star, BookOpen, Flame, Trophy, Headphones, Volume2, Sparkles, Globe2, CalendarDays, CheckCircle2, XCircle, RotateCcw, Shuffle, Settings, GraduationCap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Sample vocabulary data
const sampleVocabulary = [
  { french: "Bonjour", english: "Hello" },
  { french: "Merci", english: "Thank you" },
  { french: "Pomme", english: "Apple" },
  { french: "Chien", english: "Dog" },
  { french: "Chat", english: "Cat" }
];

export default function EtoileFrenchApp() {
  const [vocab, setVocab] = useState(sampleVocabulary);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [reviewOptions, setReviewOptions] = useState<string[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices.filter(v => v.lang.startsWith("fr")));
      const frenchVoice = availableVoices.find(v => v.lang === "fr-FR");
      setSelectedVoice(frenchVoice || null);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const speak = (text: string) => {
    if (!selectedVoice) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    speechSynthesis.speak(utterance);
  };

  const nextCard = () => {
    setShowTranslation(false);
    setCurrentIndex((prev) => (prev + 1) % vocab.length);
  };

  const prevCard = () => {
    setShowTranslation(false);
    setCurrentIndex((prev) => (prev - 1 + vocab.length) % vocab.length);
  };

  const shuffleCards = () => {
    const shuffled = [...vocab].sort(() => Math.random() - 0.5);
    setVocab(shuffled);
    setCurrentIndex(0);
  };

  const startReview = () => {
    const correctAnswer = vocab[currentIndex].english;
    const allAnswers = [correctAnswer];
    while (allAnswers.length < 4) {
      const random = vocab[Math.floor(Math.random() * vocab.length)].english;
      if (!allAnswers.includes(random)) allAnswers.push(random);
    }
    setReviewOptions(allAnswers.sort(() => Math.random() - 0.5));
  };

  useEffect(() => {
    startReview();
  }, [currentIndex]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 via-white to-indigo-200 p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-800 flex items-center gap-2">
          <Sparkles className="text-yellow-500" /> Étoile - Learn French
        </h1>
        <select
          value={selectedVoice?.name || ""}
          onChange={(e) => {
            const voice = voices.find(v => v.name === e.target.value);
            setSelectedVoice(voice || null);
          }}
          className="border p-1 rounded"
        >
          {voices.map((voice, idx) => (
            <option key={idx} value={voice.name}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      </header>

      <main className="max-w-xl mx-auto">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-4"
        >
          <h2 className="text-4xl font-bold text-center text-indigo-700 mb-4">
            {vocab[currentIndex].french}
          </h2>
          {showTranslation && (
            <p className="text-center text-lg text-gray-700 mb-4">
              {vocab[currentIndex].english}
            </p>
          )}
          <div className="flex justify-center gap-4">
            <Button onClick={() => speak(vocab[currentIndex].french)}>
              <Volume2 className="mr-2" /> Pronounce
            </Button>
            <Button onClick={() => setShowTranslation(true)}>
              Show Answer
            </Button>
          </div>
        </motion.div>

        <div className="flex justify-between">
          <Button onClick={prevCard}><RotateCcw className="mr-2" /> Prev</Button>
          <Button onClick={shuffleCards}><Shuffle className="mr-2" /> Shuffle</Button>
          <Button onClick={nextCard}><RotateCcw className="mr-2 rotate-180" /> Next</Button>
        </div>

        <section className="mt-8 bg-white rounded-xl shadow p-4">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <GraduationCap /> Spaced Review
          </h3>
          <p className="mb-4 text-center text-lg">
            What is the meaning of <strong>{vocab[currentIndex].french}</strong>?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {reviewOptions.map((option, idx) => (
              <Button
                key={idx}
                onClick={() => {
                  if (option === vocab[currentIndex].english) {
                    alert("Correct!");
                  } else {
                    alert(`Incorrect. The correct answer is ${vocab[currentIndex].english}`);
                  }
                  nextCard();
                }}
              >
                {option}
              </Button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function Button({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
    >
      {children}
    </button>
  );
}
