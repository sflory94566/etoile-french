import React, { useState } from "react";
import Flashcards from "./components/Flashcards";
import MultipleChoice from "./components/MultipleChoice";
import Preferences from "./components/Preferences";
import ProgressTracker from "./components/ProgressTracker";
import SpacedReview from "./components/SpacedReview";

export default function App() {
  const [view, setView] = useState<"flashcards"|"multiple"|"review"|"prefs"|"progress">("flashcards");

  return (
    <>
      <header>
        <h1>🌟 Étoile – Learn French</h1>
        <nav>
          <button onClick={() => setView("flashcards")}>Flashcards</button>
          <button onClick={() => setView("multiple")}>Multiple Choice</button>
          <button onClick={() => setView("review")}>Spaced Review</button>
          <button onClick={() => setView("prefs")}>Preferences</button>
          <button onClick={() => setView("progress")}>Progress</button>
        </nav>
      </header>

      <main>
        {view === "flashcards" && <Flashcards />}
        {view === "multiple" && <MultipleChoice />}
        {view === "review" && <SpacedReview />}
        {view === "prefs" && <Preferences />}
        {view === "progress" && <ProgressTracker />}
      </main>
    </>
  );
}