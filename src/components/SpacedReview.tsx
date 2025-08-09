import React, { useState } from "react";

const reviewItems = [
  { fr: "Bonjour", en: "Hello" },
  { fr: "Merci", en: "Thank you" },
  { fr: "École", en: "School" },
];

export default function SpacedReview() {
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(false);

  const next = () => {
    setIndex((prev) => (prev + 1) % reviewItems.length);
    setShow(false);
  };

  return (
    <div className="card">
      <h2>Spaced Review</h2>
      <p style={{ fontSize: "1.25rem" }}>{reviewItems[index].fr}</p>
      {show && <p className="muted">Answer: {reviewItems[index].en}</p>}
      <div className="row">
        <button onClick={() => setShow((s) => !s)}>{show ? "Hide answer" : "Show answer"}</button>
        <button onClick={next}>Next</button>
      </div>
    </div>
  );
}