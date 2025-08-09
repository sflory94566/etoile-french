import React, { useMemo, useState } from "react";

type QA = { fr: string; en: string };

const bank: QA[] = [
  { fr: "Bonjour", en: "Hello" },
  { fr: "Merci", en: "Thank you" },
  { fr: "Pomme", en: "Apple" },
  { fr: "École", en: "School" },
  { fr: "Chien", en: "Dog" },
  { fr: "Chat", en: "Cat" },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function MultipleChoice() {
  const [reverse, setReverse] = useState(false); // EN→FR when true
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const q = bank[idx];

  const { prompt, options, answer } = useMemo(() => {
    // Reverse ON -> prompt = English, options = French spellings
    // Reverse OFF -> prompt = French, options = English meanings
    const prompt = reverse ? q.en : q.fr;
    const correct = reverse ? q.fr : q.en;

    const pool = shuffle(bank)
      .map((x) => (reverse ? x.fr : x.en))
      .filter((v, i, a) => a.indexOf(v) === i);

    const opts = shuffle([correct, ...pool.filter((x) => x !== correct)].slice(0, 4));
    return { prompt, options: opts, answer: correct };
  }, [idx, reverse]);

  const choose = (opt: string) => {
    if (selected) return;
    setSelected(opt);
  };

  const next = () => {
    setIdx((i) => (i + 1) % bank.length);
    setSelected(null);
  };

  return (
    <div className="card">
      <h2>Multiple Choice</h2>
      <div className="muted" style={{ marginBottom: 8 }}>
        Mode: {reverse ? "EN → FR (French spellings)" : "FR → EN (English meanings)"}
      </div>
      <p style={{ fontSize: "1.25rem" }}>
        Translate: <strong>{prompt}</strong>
      </p>
      <div className="row">
        {options.map((opt) => {
          const correct = opt === answer;
          const bg =
            selected === null
              ? undefined
              : opt === selected
              ? correct
                ? "green"
                : "crimson"
              : undefined;
          return (
            <button key={opt} onClick={() => choose(opt)} style={{ backgroundColor: bg }}>
              {opt}
            </button>
          );
        })}
      </div>

      {selected && (
        <p style={{ marginTop: 8 }}>
          {selected === answer ? "✅ Correct!" : `❌ Not quite — it’s ${answer}`}
        </p>
      )}

      <div className="row" style={{ marginTop: 8 }}>
        <button onClick={next}>Next</button>
        <button onClick={() => setReverse((v) => !v)}>Toggle Reverse</button>
      </div>
    </div>
  );
}