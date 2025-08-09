export default function App() {
  return (
    <div>
      <h1>Étoile - Learn French</h1>
      <p>import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Star, BookOpen, Flame, Trophy, Headphones, Volume2, Sparkles, Globe2, CalendarDays, CheckCircle2, XCircle, RotateCcw, Shuffle, Settings, GraduationCap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// =====================================================
// Étoile — single-file React app for Canvas (UTF-8 safe)
// Stable demo build (no mic); TTS + MC + Quiz + Dictée
// =====================================================

const starterDeck = [
  { fr: "bonjour", en: "hello", hint: "greeting" },
  { fr: "merci", en: "thank you", hint: "gratitude" },
  { fr: "s'il vous plaît", en: "please", hint: "polite" },
  { fr: "au revoir", en: "goodbye", hint: "parting" },
  { fr: "pomme", en: "apple", hint: "fruit" },
  { fr: "pain", en: "bread", hint: "bakery" },
  { fr: "fromage", en: "cheese", hint: "dairy" },
  { fr: "eau", en: "water", hint: "drink" },
  { fr: "chien", en: "dog", hint: "animal" },
  { fr: "chat", en: "cat", hint: "animal" },
  { fr: "lundi", en: "monday", hint: "day" },
  { fr: "froid", en: "cold", hint: "weather" },
  { fr: "chaud", en: "hot", hint: "weather" },
  { fr: "maison", en: "house", hint: "home" },
  { fr: "école", en: "school", hint: "place" },
  { fr: "livre", en: "book", hint: "object" },
  { fr: "amis", en: "friends", hint: "people" },
  { fr: "famille", en: "family", hint: "people" },
  { fr: "beau", en: "beautiful", hint: "adjective" },
  { fr: "vite", en: "fast", hint: "adverb" },
];

const cafeWallpaper =
  "radial-gradient(20px 20px at 10px 10px, rgba(255,255,255,0.12) 2px, transparent 2px), radial-gradient(20px 20px at 30px 30px, rgba(255,255,255,0.08) 2px, transparent 2px)";

const LS_KEY = "etoile.french.progress.v1";

// ---- Speech synthesis & audio unlock ----
let __voices = [];
let __voiceLoaded = false;
(function initVoices(){
  if (typeof window === 'undefined') return;
  const synth = window.speechSynthesis;
  const load = () => { __voices = synth.getVoices() || []; __voiceLoaded = true; };
  load();
  synth.addEventListener && synth.addEventListener('voiceschanged', load);
})();

function getPreferredVoice(lang = 'fr-FR'){
  if (!__voiceLoaded) {
    try { window.speechSynthesis.getVoices(); } catch {}
  }
  const byName = window.__etoileVoiceName;
  if (byName) {
    const v = (__voices||[]).find(v => v.name === byName);
    if (v) return v;
  }
  const frVoices = (__voices||[]).filter(v => (v.lang||'').toLowerCase().startsWith('fr'));
  return frVoices[0] || (__voices||[])[0] || null;
}

let __audioUnlocked = false;
function unlockAudio() {
  if (__audioUnlocked) return;
  try {
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    if (synth && synth.resume) synth.resume();
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) {
      const ctx = new Ctx();
      if (ctx.state === 'suspended') ctx.resume().catch(()=>{});
    }
  } catch {}
  __audioUnlocked = true;
}

function speak(text, lang = "fr-FR") {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = (typeof window !== 'undefined' && window.__etoileSlow) ? 0.8 : 0.95;
    u.pitch = 1;
    const v = getPreferredVoice(lang);
    if (v) u.voice = v;
    try { window.speechSynthesis.resume && window.speechSynthesis.resume(); } catch {}
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {}
}

// ---- Helpers for tolerant comparisons ----
function stripDiacritics(s){
  return (s||"")
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g,'')
    .replace(/[^a-z'\s-]/g,'')
    .replace(/\s+/g,' ')
    .trim();
}
function levenshtein(a,b){
  a = stripDiacritics(a); b = stripDiacritics(b);
  const m=a.length, n=b.length; if(!m) return n; if(!n) return m;
  const dp=new Array(n+1).fill(0); for(let j=0;j<=n;j++) dp[j]=j;
  for(let i=1;i<=m;i++){
    let prev=dp[0]; dp[0]=i;
    for(let j=1;j<=n;j++){
      const tmp=dp[j];
      dp[j]=Math.min(
        dp[j]+1,
        dp[j-1]+1,
        prev + (a[i-1]===b[j-1]?0:1)
      );
      prev=tmp;
    }
  }
  return dp[n];
}
function similarity(a,b){
  a=stripDiacritics(a); b=stripDiacritics(b);
  if(!a||!b) return 0;
  const d=levenshtein(a,b);
  const maxLen=Math.max(a.length,b.length);
  return Math.max(0, 1 - d/Math.max(1,maxLen));
}

// ---- lightweight self-tests (no UI impact) ----
(function __selfTests(){
  try {
    console.assert(stripDiacritics('école') === 'ecole', 'stripDiacritics removes accents');
    console.assert(stripDiacritics('français') === 'francais', 'stripDiacritics handles ç');
    console.assert(similarity('bonjour','bonjour') === 1, 'similarity exact match');
    console.assert(similarity('école','ecole') > 0.95, 'accent-insensitive');
    console.assert(similarity('bonjur','bonjour') > 0.8, 'tolerant of 1 typo');
  } catch {}
})();

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}
function yyyymmdd(d) { return d.toISOString().slice(0, 10); }
function addDays(d, n) { const c = new Date(d); c.setDate(c.getDate() + n); return c; }

export default function EtoileFrenchApp() {
  // Voice selector state
  const [voices, setVoices] = useState([]);
  const [voiceName, setVoiceName] = useState(typeof window !== 'undefined' ? (window.__etoileVoiceName || '') : '');
  useEffect(() => {
    const sync = () => setVoices((window.speechSynthesis?.getVoices?.() || []).slice());
    try { sync(); window.speechSynthesis?.addEventListener?.('voiceschanged', sync); } catch {}
    return () => { try { window.speechSynthesis?.removeEventListener?.('voiceschanged', sync); } catch {} };
  }, []);
  useEffect(() => { if (typeof window !== 'undefined') window.__etoileVoiceName = voiceName || undefined; }, [voiceName]);

  // Review session state
  const [reviewSession, setReviewSession] = useState({ active: false, startCount: 0 });

  const [name, setName] = useState("");
  const [reverseMode, setReverseMode] = useState(false);
  const [mcMode, setMcMode] = useState(true); // Multiple Choice on
  const [mcOptions, setMcOptions] = useState([]);
  const [mcCorrect, setMcCorrect] = useState(null);
  const [mcSelection, setMcSelection] = useState(null);
  const [deck, setDeck] = useState(starterDeck);
  const [tab, setTab] = useState("flashcards");
  const [goal, setGoal] = useState(30);
  const [state, setState] = useState(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
    return { xp: 0, streak: 0, lastActive: null, history: [], level: 1,
      reviews: starterDeck.map((c,i)=>({ i, ease:2.5, interval:0, due: todayStr() })) };
  });

  useEffect(() => { localStorage.setItem(LS_KEY, JSON.stringify(state)); }, [state]);

  useEffect(() => {
    const last = state.lastActive ? new Date(state.lastActive) : null;
    const now = new Date();
    const today = yyyymmdd(now);
    if (!last) { setState(s=>({ ...s, lastActive: today, streak: 1 })); return; }
    const lastDay = yyyymmdd(last);
    if (lastDay !== today) {
      const yesterday = yyyymmdd(addDays(now, -1));
      const continued = lastDay === yesterday;
      setState(s => ({
        ...s,
        streak: continued ? s.streak + 1 : 1,
        lastActive: today,
        history: s.history.find(h=>h.date===lastDay) ? s.history : [...s.history, { date: lastDay, xp: s.xp }],
        xp: 0,
      }));
    }
  }, []);

  const chartData = useMemo(() => {
    const map = new Map(state.history.map(h => [h.date, h.xp]));
    map.set(todayStr(), state.xp);
    return Array.from({ length: 14 })
      .map((_, i) => yyyymmdd(addDays(new Date(), i - 13)))
      .map(d => ({ date: d.slice(5), xp: map.get(d) || 0 }));
  }, [state.history, state.xp]);

  const addXP = (n=5)=> setState(s=>({ ...s, xp: s.xp + n, level: Math.min(50, s.level + (s.xp + n >= s.level*100 ? 1 : 0)) }));
  const resetProgress = () => { if (!confirm('Reset all progress?')) return; localStorage.removeItem(LS_KEY); window.location.reload(); };

  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const dueQueue = useMemo(()=>{
    const today = todayStr();
    const entries = state.reviews || [];
    return entries.filter(r=>r.due <= today).sort((a,b)=>(a.interval||0)-(b.interval||0));
  }, [state.reviews]);
  useEffect(()=>{ if (dueQueue.length>0) setCurrentIdx(dueQueue[0].i); }, [dueQueue.length]);

  // Build Multiple Choice options for current card
  // • Normal (FR→EN): options are English meanings
  // • Reverse (EN→FR): options are FRENCH spellings (as requested)
  useEffect(()=>{
    if (!mcMode || deck.length < 2) { setMcOptions([]); setMcCorrect(null); setMcSelection(null); return; }
    const idx = currentIdx;
    if (idx == null || !deck[idx]) return;
    const correct = reverseMode ? deck[idx].fr : deck[idx].en;
    const choices = new Set([correct]);
    while (choices.size < Math.min(4, deck.length)) {
      const j = Math.floor(Math.random()*deck.length);
      choices.add(reverseMode ? deck[j].fr : deck[j].en);
    }
    const opts = Array.from(choices).sort(()=>Math.random()-0.5);
    setMcOptions(opts);
    setMcCorrect(correct);
    setMcSelection(null);
    setShowAnswer(false);
  }, [mcMode, currentIdx, reverseMode, deck.length]);

  // Auto-start/stop review session when due items change
  useEffect(()=>{
    if (tab === 'flashcards' && dueQueue.length > 0 && !reviewSession.active) setReviewSession({ active: true, startCount: dueQueue.length });
    if (reviewSession.active && dueQueue.length === 0) setReviewSession({ active: false, startCount: 0 });
  }, [tab, dueQueue.length, reviewSession.active]);

  function rateCard(grade){
    const today = new Date();
    const entry = (state.reviews||[]).find(r=>r.i===currentIdx);
    if (!entry) return;
    let { ease, interval } = entry;
    if (grade===0) { interval = 0; } else {
      ease = Math.max(1.3, ease + (grade===3 ? 0.15 : grade===2 ? 0 : -0.15));
      interval = interval===0 ? 1 : Math.round(interval * ease);
    }
    const due = yyyymmdd(addDays(today, Math.max(1, interval)));
    setState(s=>({ ...s, reviews: s.reviews.map(r=> r.i===currentIdx ? { ...r, ease, interval, due } : r) }));
    setShowAnswer(false);
    addXP(grade===0?0:grade===1?3:grade===2?5:7);
  }

  // Quiz
  const [quizQ, setQuizQ] = useState(null);
  const [quizFeedback, setQuizFeedback] = useState(null);
  function nextQuiz(){
    const idx = Math.floor(Math.random()*deck.length);
    const correct = reverseMode ? deck[idx].fr : deck[idx].en;
    const prompt = reverseMode ? deck[idx].en : deck[idx].fr;
    const choices = new Set([correct]);
    while (choices.size < 4) { const j = Math.floor(Math.random()*deck.length); choices.add(reverseMode ? deck[j].fr : deck[j].en); }
    const options = Array.from(choices).sort(()=>Math.random()-0.5);
    setQuizQ({ idx, prompt, correct, options }); setQuizFeedback(null);
  }
  useEffect(()=>{ nextQuiz(); }, [reverseMode]);
  function answerQuiz(choice){ const ok = choice===quizQ.correct; setQuizFeedback(ok?"Correct!":`Not quite. ✔︎ ${quizQ.correct}`); addXP(ok?6:1); setTimeout(nextQuiz, 600); }

  // Listening (dictée)
  const [listenQ, setListenQ] = useState(null);
  const [listenGuess, setListenGuess] = useState("");
  const [listenFeedback, setListenFeedback] = useState(null);
  function nextListen(){ const idx = Math.floor(Math.random()*deck.length); const word = deck[idx].fr; const gloss = deck[idx].en; setListenQ({ idx, word, gloss }); setListenGuess(""); setListenFeedback(null); speak(word, 'fr-FR'); }
  useEffect(()=>{ nextListen(); }, []);
  function submitListen(e){ e.preventDefault(); if (!listenQ) return; const ok = listenGuess.trim().toLowerCase() === listenQ.word.toLowerCase(); setListenFeedback(ok?"Bien joué!":`Réponse: ${listenQ.word}`); addXP(ok?8:2); setTimeout(nextListen, 700); }

  const gradientHeader = "bg-gradient-to-r from-rose-300/30 via-amber-200/30 to-emerald-200/30";
  const percentToGoal = () => Math.min(100, Math.round((state.xp / goal) * 100));

  return (
    <div className="min-h-screen w-full" style={{ backgroundImage: cafeWallpaper + ", linear-gradient(180deg, #f8fafc, #fff)", backgroundAttachment: "fixed" }}>
      <div className="mx-auto max-w-6xl p-4 md:p-8">
        <Card className={`border-0 shadow-lg ${gradientHeader} mb-6 overflow-hidden`}>
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center gap-4">
              <motion.div initial={{ rotate: -10, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring" }} className="p-3 rounded-2xl bg-white/70 shadow"><Star className="h-7 w-7" /></motion.div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-4xl font-semibold tracking-tight flex items-center gap-3">Étoile — Learn French with Joy <Badge variant="secondary" className="rounded-full text-xs md:text-sm">Parisian Café Theme</Badge></h1>
                <p className="text-sm md:text-base text-slate-600 mt-2 max-w-2xl">Gentle, steady practice—every day. We honor tradition (vocabulary, pronunciation, repetition) with a modern, welcoming UI.</p>
              </div>
              <div className="hidden md:flex flex-col items-end gap-2">
                <div className="flex items-center gap-2"><Flame className="h-5 w-5" /><span className="font-medium">Streak</span><Badge>{state.streak} days</Badge></div>
                <div className="flex items-center gap-2"><Trophy className="h-5 w-5" /><span className="font-medium">Level</span><Badge variant="outline">{state.level}</Badge></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><BookOpen className="h-5 w-5"/>Daily Goal</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Input type="number" min={10} max={150} value={goal} onChange={(e)=>setGoal(parseInt(e.target.value||"0"))} className="w-24"/>
                <span className="text-sm text-slate-600">XP / day</span>
              </div>
              <div className="mt-3"><Progress value={percentToGoal()} /><div className="text-xs text-slate-600 mt-1">{state.xp} / {goal} XP • {percentToGoal()}%</div></div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><CalendarDays className="h-5 w-5"/>Progress (14d)</CardTitle></CardHeader>
            <CardContent className="h-36">
              <ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ left: 0, right: 8, top: 5, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} width={30} /><Tooltip /><Line type="monotone" dataKey="xp" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Settings className="h-5 w-5"/>Preferences</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between py-1"><span className="text-sm">Your name</span><Input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Optional" className="w-40" /></div>
              <div className="flex items-center justify-between py-1"><span className="text-sm">Reverse mode (EN→FR)</span><Switch checked={reverseMode} onCheckedChange={setReverseMode} /></div>
              <div className="flex items-center justify-between py-1"><span className="text-sm">Flashcards: Multiple choice</span><Switch checked={mcMode} onCheckedChange={setMcMode} /></div>
              <div className="py-2">
                <div className="text-sm mb-1">Voice (Pronounce)</div>
                <select className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm" value={voiceName} onChange={(e)=>setVoiceName(e.target.value)}>
                  <option value="">Auto (French if available)</option>
                  {voices.filter(v => (v.lang||'').toLowerCase().startsWith('fr')).map(v => (<option key={v.voiceURI} value={v.name}>{v.name} — {v.lang}</option>))}
                  {voices.filter(v => !(v.lang||'').toLowerCase().startsWith('fr')).map(v => (<option key={v.voiceURI} value={v.name}>{v.name} — {v.lang}</option>))}
                </select>
                <div className="mt-1 text-xs text-slate-500">Tip: choose <em>French (France)</em> if available. Click Pronounce to test.</div>
                <div className="mt-2 flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={unlockAudio}>Enable audio</Button>
                </div>
              </div>
              <div className="flex items-center justify-between py-1"><span className="text-sm">Reset everything</span><Button variant="outline" size="sm" onClick={resetProgress}><RotateCcw className="h-4 w-4 mr-1"/>Reset</Button></div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-3 md:w-2/3">
            <TabsTrigger value="flashcards" onClick={()=>setTab('flashcards')} className="flex items-center gap-2"><Sparkles className="h-4 w-4"/>Flashcards</TabsTrigger>
            <TabsTrigger value="quiz" onClick={()=>setTab('quiz')} className="flex items-center gap-2"><GraduationCap className="h-4 w-4"/>Quiz</TabsTrigger>
            <TabsTrigger value="listening" onClick={()=>setTab('listening')} className="flex items-center gap-2"><Headphones className="h-4 w-4"/>Listening</TabsTrigger>
          </TabsList>

          <TabsContent value="flashcards" className="mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="shadow-lg">
                <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-5 w-5"/>Spaced Review <Badge variant="outline" className="ml-2">Due today: {dueQueue.length}</Badge></CardTitle></CardHeader>
                <CardContent>
                  {/* Review session controls */}
                  {reviewSession.active && (
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="w-full md:w-1/2">
                        <Progress value={reviewSession.startCount ? Math.round(((reviewSession.startCount - dueQueue.length)/reviewSession.startCount)*100) : 0} />
                        <div className="text-xs text-slate-600 mt-1">{reviewSession.startCount - dueQueue.length} / {reviewSession.startCount} reviewed</div>
                      </div>
                      <Button variant="outline" onClick={()=> setReviewSession({ active:false, startCount:0 })}>End session</Button>
                    </div>
                  )}

                  {dueQueue.length === 0 ? (
                    <div className="text-center py-10 text-slate-600">No cards due—bravo! Come back later for reviews.</div>
                  ) : (
                    <div className="flex flex-col items-center py-4">
                      <motion.div initial={{ rotateX: 180 }} animate={{ rotateX: 0 }} transition={{ duration: 0.4 }} className="w-full">
                        <div className="bg-white rounded-2xl border p-8 min-h-[160px] flex items-center justify-center text-center">
                          <div>
                            <div className="uppercase text-xs tracking-wider text-slate-500 mb-2">{reverseMode ? "English" : "Français"}</div>
                            <div className="text-2xl md:text-4xl font-semibold">{reverseMode ? deck[currentIdx].en : deck[currentIdx].fr}</div>
                            <div className="mt-3 text-sm text-slate-500">Hint: {deck[currentIdx].hint}</div>
                          </div>
                        </div>
                      </motion.div>

                      <div className="mt-4 flex items-center gap-2">
                        {!mcMode && (
                          <Button variant="secondary" onClick={()=>setShowAnswer(!showAnswer)}>
                            {showAnswer ? "Hide" : "Show"} answer
                          </Button>
                        )}
                        {!reverseMode && (
                          <Button variant="outline" onClick={()=>{ unlockAudio(); speak(deck[currentIdx].fr); }}>
                            <Volume2 className="h-4 w-4 mr-1"/>Pronounce
                          </Button>
                        )}
                        <Button variant="ghost" onClick={()=>setCurrentIdx((i)=>(i+1)%deck.length)}>
                          <Shuffle className="h-4 w-4 mr-1"/>Shuffle
                        </Button>
                      </div>

                      {mcMode && (
                        <div className="mt-4 w-full">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {mcOptions.map(opt => {
                              const selected = mcSelection === opt;
                              const correct = mcCorrect === opt;
                              const variant = mcSelection ? (correct ? 'secondary' : (selected ? 'destructive' : 'outline')) : 'secondary';
                              return (
                                <Button key={opt} variant={variant} className="justify-start" onClick={()=>{ if (!mcSelection) { setMcSelection(opt); setShowAnswer(true); if (opt === mcCorrect) { addXP(5); unlockAudio(); speak(deck[currentIdx].fr); } } }}>{opt}</Button>
                              );
                            })}
                          </div>
                          {mcSelection && (
                            <div className="mt-3 text-sm">{mcSelection === mcCorrect ? 'Correct!' : `Not quite. ✔︎ ${mcCorrect}`}</div>
                          )}
                        </div>
                      )}

                      {showAnswer && (
                        <div className="mt-6 w-full">
                          <div className="bg-slate-50 rounded-xl p-4 text-center">
                            <div className="text-sm text-slate-600">Answer</div>
                            <div className="text-lg font-medium">{reverseMode ? deck[currentIdx].fr : deck[currentIdx].en}</div>
                          </div>
                          <div className="mt-4 grid grid-cols-4 gap-2">
                            <Button onClick={()=>rateCard(0)} variant="destructive" className="w-full"><XCircle className="h-4 w-4 mr-1"/>Wrong</Button>
                            <Button onClick={()=>rateCard(1)} variant="outline" className="w-full">Hard</Button>
                            <Button onClick={()=>rateCard(2)} className="w-full" variant="secondary">Good</Button>
                            <Button onClick={()=>rateCard(3)} className="w-full" variant="default"><CheckCircle2 className="h-4 w-4 mr-1"/>Easy</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Globe2 className="h-5 w-5"/>Add Your Own Words</CardTitle></CardHeader>
                <CardContent>
                  <AddWordForm onAdd={(w)=>{ setDeck(d=>[...d, w]); setState(s=> ({...s, reviews: [...(s.reviews||[]), { i: deck.length, ease: 2.5, interval: 0, due: todayStr() }]})); }}/>
                  <div className="mt-4 text-xs text-slate-500">Tip: learn the words you’ll use daily. Five minutes, every day, beats a cram session.</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="quiz" className="mt-4">
            <Card className="shadow-lg">
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><GraduationCap className="h-5 w-5"/>Multiple Choice</CardTitle></CardHeader>
              <CardContent>
                {quizQ && (
                  <div className="max-w-xl mx-auto">
                    <div className="text-sm text-slate-600 mb-2">Translate:</div>
                    <div className="text-2xl font-semibold mb-4">{quizQ.prompt}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {quizQ.options.map(opt => (<Button key={opt} variant="secondary" className="justify-start" onClick={()=>answerQuiz(opt)}>{opt}</Button>))}
                    </div>
                    {quizFeedback && (<div className="mt-4 text-sm font-medium">{quizFeedback}</div>)}
                  </div>
                )}
              </CardContent>
              <CardFooter className="justify-end"><Button onClick={nextQuiz}>Next</Button></CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="listening" className="mt-4">
            <Card className="shadow-lg">
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Headphones className="h-5 w-5"/>Dictée (Type What You Hear)</CardTitle></CardHeader>
              <CardContent>
                {listenQ && (
                  <div className="max-w-xl mx-auto">
                    <div className="flex items-center justify-between"><div className="text-sm text-slate-600">Listen and type the French word.</div><Button variant="outline" onClick={()=>{ unlockAudio(); speak(listenQ.word); }}><Volume2 className="h-4 w-4 mr-1"/>Replay</Button></div>
                    <form onSubmit={submitListen} className="mt-4 flex items-center gap-2"><Input value={listenGuess} onChange={(e)=>setListenGuess(e.target.value)} placeholder="Type in French…" /><Button type="submit">Check</Button></form>
                    {listenFeedback && (<div className="mt-3 text-sm text-slate-700">{listenFeedback}</div>)}
                    <div className="mt-2 text-xs text-slate-500">Meaning: {listenQ.gloss}</div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="justify-end"><Button onClick={nextListen}>New word</Button></CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Card className="shadow-sm"><CardContent className="p-5 text-sm text-slate-700"><div className="font-medium mb-1">A classic routine</div>Five new words. Five minutes of review. One listening round. Keep it daily and the streak will do the heavy lifting.</CardContent></Card>
          <Card className="shadow-sm"><CardContent className="p-5 text-sm text-slate-700"><div className="font-medium mb-1">Theme & mood</div>Subtle café textures, warm light, and simple motion—steadfast, welcoming, and distraction‑free.</CardContent></Card>
          <Card className="shadow-sm"><CardContent className="p-5 text-sm text-slate-700"><div className="font-medium mb-1">Your progress</div>Earn XP with every correct step. Hit your goal to fill the bar. Streaks celebrate consistency over speed.</CardContent></Card>
        </div>

        <div className="text-center text-xs text-slate-500 mt-6 mb-2">v1.5 — MC in Reverse shows French spellings; mic removed for stability. Bon courage{ name ? ", " + name : "" }!</div>
      </div>
    </div>
  );
}

// ------------------- Inline UI bits -------------------
function Button({ children, className = '', variant='default', size='md', disabled=false, ...props }){
  const base = 'inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition shadow-sm disabled:opacity-50';
  const variants = { default: 'bg-blue-600 text-white hover:bg-blue-700', secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300', outline: 'border border-slate-300 hover:bg-slate-50', ghost: 'hover:bg-slate-100', destructive: 'bg-rose-600 text-white hover:bg-rose-700' };
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2' };
  return <button className={[base, variants[variant]||variants.default, sizes[size]||sizes.md, className].join(' ')} disabled={disabled} {...props}>{children}</button>;
}
function Card({ className='', children, ...props }){ return <div className={['bg-white rounded-2xl border border-slate-200', className].join(' ')} {...props}>{children}</div>; }
function CardHeader({ className='', children }){ return <div className={['p-4 border-b border-slate-100', className].join(' ')}>{children}</div> }
function CardTitle({ className='', children }){ return <div className={['text-lg font-semibold', className].join(' ')}>{children}</div> }
function CardContent({ className='', children }){ return <div className={['p-4', className].join(' ')}>{children}</div> }
function CardFooter({ className='', children }){ return <div className={['p-4 border-t border-slate-100 flex items-center gap-2', className].join(' ')}>{children}</div> }
function Tabs({ value, onValueChange, children }){ return <div>{children}</div> }
function TabsList({ className='', children }){ return <div className={['inline-grid bg-slate-100 rounded-xl p-1', className].join(' ')}>{children}</div> }
function TabsTrigger({ value, className='', children, onClick }){ return <button onClick={onClick} className={['px-4 py-2 rounded-lg text-sm hover:bg-white', className].join(' ')}>{children}</button>; }
function TabsContent({ value, className='', children }){ return <div className={className}>{children}</div> }
function Progress({ value=0 }){ return <div className='w-full h-3 bg-slate-200 rounded-full overflow-hidden'><div className='h-full bg-emerald-500' style={{width: `${Math.min(100, Math.max(0, value))}%`}}/></div>; }
function Badge({ children, variant='default', className='' }){ const variants = { default: 'bg-slate-900 text-white', secondary: 'bg-slate-200 text-slate-900', outline: 'border border-slate-300 text-slate-700 bg-white' }; return <span className={['px-2.5 py-1 rounded-full text-xs font-medium', variants[variant]||variants.default, className].join(' ')}>{children}</span>; }
function Input({ className='', ...props }){ return <input className={['border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400', className].join(' ')} {...props} />; }
function Switch({ checked=false, onCheckedChange }){ return <button onClick={()=>onCheckedChange(!checked)} className={'w-12 h-6 rounded-full transition ' + (checked ? 'bg-emerald-500' : 'bg-slate-300')}><div className={'w-5 h-5 bg-white rounded-full transition ' + (checked ? 'translate-x-6' : 'translate-x-1')} /></button>; }
function AddWordForm({ onAdd }){ const [fr, setFr] = useState(""); const [en, setEn] = useState(""); const [hint, setHint] = useState(""); const canAdd = fr.trim() && en.trim(); return (<div><div className="grid grid-cols-1 md:grid-cols-3 gap-2"><Input value={fr} onChange={(e)=>setFr(e.target.value)} placeholder="French (fr)" /><Input value={en} onChange={(e)=>setEn(e.target.value)} placeholder="English (en)" /><Input value={hint} onChange={(e)=>setHint(e.target.value)} placeholder="Hint (optional)" /></div><div className="mt-3 flex justify-end"><Button disabled={!canAdd} onClick={()=>{ onAdd({ fr: fr.trim(), en: en.trim(), hint: hint.trim()||"custom" }); setFr(""); setEn(""); setHint(""); }}>Add word</Button></div></div>); }
</p>
    </div>
  )
}
