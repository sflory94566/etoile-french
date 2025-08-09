import React, { useEffect, useState } from "react";

export default function Preferences() {
  const [voice, setVoice] = useState<string>("");

  // Load system voices (if available)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    const sync = () => setVoices(window.speechSynthesis.getVoices() || []);
    try {
      sync();
      window.speechSynthesis.addEventListener("voiceschanged", sync);
      return () => window.speechSynthesis.removeEventListener("voiceschanged", sync);
    } catch {}
  }, []);

  return (
    <div className="card">
      <h2>Preferences</h2>
      <div style={{ marginTop: 8 }}>
        <label>
          Voice (Pronounce):
          <select
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            style={{ marginLeft: "0.5rem" }}
          >
            <option value="">Auto (French if available)</option>
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.name}>
                {v.name} — {v.lang}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="muted" style={{ marginTop: 8 }}>
        Tip: choose <em>French (France)</em> if available. (Mic is disabled in this build.)
      </p>
    </div>
  );
}