import React, { useState } from "react";

const words = [
  { fr: "Bonjour", en: "Hello" },
  { fr: "Merci", en: "Thank you" },
  { fr: "Pomme", en: "Apple" },
  { fr: "École", en: "School" },
];

export default function Flashcards() {
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(false);

  const next = () => {
    setIndex((prev) => (prev + 1) % words.length);
    setShow(false);
  };

  return (
    <div className="card">
      <h2>Flashcards</h2>
      <div className="big">{show ? words[index].en : words[index].fr}</div>
      <div className="row">
        <button onClick={() => setShow((s) => !s)}>
          {show ? "Show French" : "Show English"}
        </button>
        <button onClick={next}>Next</button>
      </div>
      <div className="muted">Hint: tap “Next” to cycle through the set.</div>
    </div>
  );
}