
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Star, BookOpen, Flame, Trophy, Headphones, Volume2, Sparkles, Globe2, CalendarDays, CheckCircle2, XCircle, RotateCcw, Shuffle, Settings, GraduationCap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

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

const LS_KEY = "etoile.french.progress.v1";

function speak(text: string, lang = "fr-FR") {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.95;
    u.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {}
}

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function yyyymmdd(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number) {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

const cafeWallpaper =
  "radial-gradient(20px 20px at 10px 10px, rgba(255,255,255,0.12) 2px, transparent 2px), radial-gradient(20px 20px at 30px 30px, rgba(255,255,255,0.08) 2px, transparent 2px)";

export default function App() {
  const [name, setName] = useState("");
  const [reverseMode, setReverseMode] = useState(false); // EN→FR vs FR→EN
  const [deck, setDeck] = useState(starterDeck);
  const [tab, setTab] = useState("flashcards");
  const [goal, setGoal] = useState(30); // XP goal per day
  const [state, setState] = useState<any>(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
    return {
      xp: 0,
      streak: 0,
      lastActive: null,
      history: [], // {date, xp}
      level: 1,
      reviews: starterDeck.map((c, i) => ({ i, ease: 2.5, interval: 0, due: todayStr() })),
    };
  });

  // Persist
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }, [state]);

  // Daily streak management
  useEffect(() => {
    const last = state.lastActive ? new Date(state.lastActive) : null;
    const now = new Date();
    const today = yyyymmdd(now);

    if (!last) {
      setState((s: any) => ({ ...s, lastActive: today }));
      return;
    }
    const lastDay = yyyymmdd(last);
    if (lastDay !== today) {
      const yesterday = yyyymmdd(addDays(now, -1));
      const continued = lastDay === yesterday;
      setState((s: any) => ({
        ...s,
        streak: continued ? s.streak + 1 : 1,
        lastActive: today,
        history: s.history.find((h: any) => h.date === lastDay)
          ? s.history
          : [...s.history, { date: lastDay, xp: s.xp }],
        xp: 0, // reset daily XP
      }));
    }
  }, []); // run once

  // Compute chart data (last 14 days)
  const chartData = useMemo(() => {
    const map = new Map((state.history as any[]).map((h: any) => [h.date, h.xp]));
    map.set(todayStr(), state.xp);
    const days = Array.from({ length: 14 })
      .map((_, i) => yyyymmdd(addDays(new Date(), i - 13)))
      .map((d) => ({ date: d.slice(5), xp: (map.get(d) as number) || 0 }));
    return days;
  }, [state.history, state.xp]);

  const addXP = (n = 5) =>
    setState((s: any) => ({ ...s, xp: s.xp + n, level: Math.min(50, s.level + (s.xp + n >= s.level * 100 ? 1 : 0)) }));

  const resetProgress = () => {
    if (!confirm("Reset all progress?")) return;
    localStorage.removeItem(LS_KEY);
    window.location.reload();
  };

  // ---------- Flashcards with tiny SM-2-like scheduling ----------
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const dueQueue = useMemo(() => {
    const today = todayStr();
    const entries = state.reviews || [];
    return entries
      .filter((r: any) => r.due <= today)
      .sort((a: any, b: any) => (a.interval || 0) - (b.interval || 0));
  }, [state.reviews]);

  useEffect(() => {
    if (dueQueue.length > 0) setCurrentIdx(dueQueue[0].i);
  }, [dueQueue.length]);

  function rateCard(grade: number) {
    // grade: 0 wrong, 1 hard, 2 good, 3 easy
    const today = new Date();
    const entry = (state.reviews || []).find((r: any) => r.i === currentIdx);
    if (!entry) return;

    let { ease, interval } = entry;
    if (grade === 0) {
      interval = 0; // repeat soon
    } else {
      ease = Math.max(1.3, ease + (grade === 3 ? 0.15 : grade === 2 ? 0 : -0.15));
      interval = interval === 0 ? 1 : Math.round(interval * ease);
    }
    const due = yyyymmdd(addDays(today, Math.max(1, interval)));

    setState((s: any) => ({
      ...s,
      reviews: s.reviews.map((r: any) => (r.i === currentIdx ? { ...r, ease, interval, due } : r)),
    }));

    setShowAnswer(false);
    addXP(grade === 0 ? 0 : grade === 1 ? 3 : grade === 2 ? 5 : 7);
  }

  // ---------- Quiz (multiple choice) ----------
  const [quizQ, setQuizQ] = useState<any>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  function nextQuiz() {
    const idx = Math.floor(Math.random() * deck.length);
    const correct = reverseMode ? deck[idx].fr : deck[idx].en;
    const prompt = reverseMode ? deck[idx].en : deck[idx].fr;
    const choices = new Set([correct]);
    while (choices.size < 4) {
      const j = Math.floor(Math.random() * deck.length);
      choices.add(reverseMode ? deck[j].fr : deck[j].en);
    }
    const options = Array.from(choices).sort(() => Math.random() - 0.5);
    setQuizQ({ idx, prompt, correct, options });
    setQuizFeedback(null);
  }
  useEffect(() => { nextQuiz(); }, [reverseMode]);

  function answerQuiz(choice: string) {
    if (!quizQ) return;
    const ok = choice === quizQ.correct;
    setQuizFeedback(ok ? "Correct!" : `Not quite. ✔︎ ${quizQ.correct}`);
    addXP(ok ? 6 : 1);
    setTimeout(nextQuiz, 600);
  }

  // ---------- Listening (speak & type) ----------
  const [listenQ, setListenQ] = useState<any>(null);
  const [listenGuess, setListenGuess] = useState("");
  const [listenFeedback, setListenFeedback] = useState<string | null>(null);

  function nextListen() {
    const idx = Math.floor(Math.random() * deck.length);
    const word = deck[idx].fr;
    const gloss = deck[idx].en;
    setListenQ({ idx, word, gloss });
    setListenGuess("");
    setListenFeedback(null);
    speak(word, "fr-FR");
  }
  useEffect(() => { nextListen(); }, []);

  function submitListen(e: React.FormEvent) {
    e.preventDefault();
    if (!listenQ) return;
    const ok = listenGuess.trim().toLowerCase() === listenQ.word.toLowerCase();
    setListenFeedback(ok ? "Bien joué!" : `Réponse: ${listenQ.word}`);
    addXP(ok ? 8 : 2);
    setTimeout(nextListen, 700);
  }

  function percentToGoal() {
    return Math.min(100, Math.round((state.xp / goal) * 100));
  }

  const gradientHeader = "bg-gradient-to-r from-rose-300/30 via-amber-200/30 to-emerald-200/30";

  return (
    <div className="min-h-screen w-full" style={{
      backgroundImage: cafeWallpaper + ", linear-gradient(180deg, #f8fafc, #fff)",
      backgroundAttachment: "fixed",
    }}>
      <div className="mx-auto max-w-6xl p-4 md:p-8">
        <div className={`border-0 shadow-lg ${gradientHeader} mb-6 overflow-hidden bg-white/40 rounded-2xl`}> 
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-4">
              <motion.div initial={{ rotate: -10, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring" }} className="p-3 rounded-2xl bg-white/70 shadow">
                <Star className="h-7 w-7" />
              </motion.div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-4xl font-semibold tracking-tight flex items-center gap-3">
                  Étoile — Learn French with Joy
                  <Badge variant="secondary" className="rounded-full text-xs md:text-sm">Parisian Café Theme</Badge>
                </h1>
                <p className="text-sm md:text-base text-slate-600 mt-2 max-w-2xl">
                  Gentle, steady practice—every day. We’ll honor tradition—vocabulary, pronunciation, repetition—while using modern tools to keep it lively.
                </p>
              </div>
              <div className="hidden md:flex flex-col items-end gap-2">
                <div className="flex items-center gap-2"><Flame className="h-5 w-5" /><span className="font-medium">Streak</span><Badge>{state.streak} days</Badge></div>
                <div className="flex items-center gap-2"><Trophy className="h-5 w-5" /><span className="font-medium">Level</span><Badge variant="outline">{state.level}</Badge></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="shadow-sm bg-white rounded-2xl border border-slate-200">
            <div className="p-4 border-b"><div className="text-base flex items-center gap-2 font-semibold"><BookOpen className="h-5 w-5"/>Daily Goal</div></div>
            <div className="p-4">
              <div className="flex items-center gap-3">
                <Input type="number" min={10} max={150} value={goal} onChange={(e:any)=>setGoal(parseInt(e.target.value||"0"))} className="w-24"/>
                <span className="text-sm text-slate-600">XP / day</span>
              </div>
              <div className="mt-3">
                <Progress value={percentToGoal()} />
                <div className="text-xs text-slate-600 mt-1">{state.xp} / {goal} XP • {percentToGoal()}%</div>
              </div>
            </div>
          </div>

          <div className="shadow-sm bg-white rounded-2xl border border-slate-200">
            <div className="p-4 border-b"><div className="text-base flex items-center gap-2 font-semibold"><CalendarDays className="h-5 w-5"/>Progress (14d)</div></div>
            <div className="h-36 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ left: 0, right: 8, top: 5, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} width={30} />
                  <Tooltip />
                  <Line type="monotone" dataKey="xp" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="shadow-sm bg-white rounded-2xl border border-slate-200">
            <div className="p-4 border-b"><div className="text-base flex items-center gap-2 font-semibold"><Settings className="h-5 w-5"/>Preferences</div></div>
            <div className="p-4">
              <div className="flex items-center justify-between py-1">
                <span className="text-sm">Your name</span>
                <Input value={name} onChange={(e:any)=>setName(e.target.value)} placeholder="Optional" className="w-40" />
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm">Reverse mode (EN→FR)</span>
                <Switch checked={reverseMode} onCheckedChange={setReverseMode} />
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm">Reset everything</span>
                <Button variant="outline" size="sm" onClick={resetProgress}><RotateCcw className="h-4 w-4 mr-1"/>Reset</Button>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab} >
          <TabsList className="grid grid-cols-3 md:w-2/3">
            <TabsTrigger value="flashcards" className="flex items-center gap-2" onClick={()=>setTab('flashcards')}><Sparkles className="h-4 w-4"/>Flashcards</TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center gap-2" onClick={()=>setTab('quiz')}><GraduationCap className="h-4 w-4"/>Quiz</TabsTrigger>
            <TabsTrigger value="listening" className="flex items-center gap-2" onClick={()=>setTab('listening')}><Headphones className="h-4 w-4"/>Listening</TabsTrigger>
          </TabsList>

          <TabsContent value="flashcards" className="mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="shadow-lg bg-white rounded-2xl border border-slate-200">
                <div className="p-4 border-b"><div className="text-base flex items-center gap-2 font-semibold"><Sparkles className="h-5 w-5"/>Spaced Review</div></div>
                <div className="p-4">
                  {dueQueue.length === 0 ? (
                    <div className="text-center py-10 text-slate-600">No cards due—bravo! Come back later for reviews.</div>
                  ) : (
                    <div className="flex flex-col items-center py-4">
                      <motion.div initial={{ rotateX: 180 }} animate={{ rotateX: 0 }} transition={{ duration: 0.4 }} className="w-full">
                        <div className="bg-white rounded-2xl border p-8 min-h-[160px] flex items-center justify-center text-center">
                          <div>
                            <div className="uppercase text-xs tracking-wider text-slate-500 mb-2">{reverseMode ? "English" : "Français"}</div>
                            <div className="text-2xl md:text-4xl font-semibold">
                              {reverseMode ? deck[currentIdx].en : deck[currentIdx].fr}
                            </div>
                            <div className="mt-3 text-sm text-slate-500">Hint: {deck[currentIdx].hint}</div>
                          </div>
                        </div>
                      </motion.div>

                      <div className="mt-4 flex items-center gap-2">
                        <Button variant="secondary" onClick={()=>setShowAnswer(!showAnswer)}>{showAnswer?"Hide":"Show"} answer</Button>
                        {!reverseMode && (
                          <Button variant="outline" onClick={()=>speak(deck[currentIdx].fr)}><Volume2 className="h-4 w-4 mr-1"/>Pronounce</Button>
                        )}
                        <Button variant="ghost" onClick={()=>setCurrentIdx((i)=>(i+1)%deck.length)}><Shuffle className="h-4 w-4 mr-1"/>Shuffle</Button>
                      </div>

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
                </div>
              </div>

              <div className="shadow-lg bg-white rounded-2xl border border-slate-200">
                <div className="p-4 border-b"><div className="text-base flex items-center gap-2 font-semibold"><Globe2 className="h-5 w-5"/>Add Your Own Words</div></div>
                <div className="p-4">
                  <AddWordForm onAdd={(w:any)=>{
                    setDeck((d)=>[...d, w]);
                    setState((s:any)=> ({...s, reviews: [...(s.reviews||[]), { i: deck.length, ease: 2.5, interval: 0, due: todayStr() }]}));
                  }}/>
                  <div className="mt-4 text-xs text-slate-500">Tip: Keep it classic—learn the words you’ll use daily. Five minutes, every day, beats a cram session.</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="quiz" className="mt-4">
            <div className="shadow-lg bg-white rounded-2xl border border-slate-200">
              <div className="p-4 border-b"><div className="text-base flex items-center gap-2 font-semibold"><GraduationCap className="h-5 w-5"/>Multiple Choice</div></div>
              <div className="p-4">
                {quizQ && (
                  <div className="max-w-xl mx-auto">
                    <div className="text-sm text-slate-600 mb-2">Translate:</div>
                    <div className="text-2xl font-semibold mb-4">{quizQ.prompt}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {quizQ.options.map((opt: string) => (
                        <Button key={opt} variant="secondary" className="justify-start" onClick={()=>answerQuiz(opt)}>{opt}</Button>
                      ))}
                    </div>
                    {quizFeedback && (
                      <div className="mt-4 text-sm font-medium">{quizFeedback}</div>
                    )}
                  </div>
                )}
              </div>
              <div className="p-4 border-t flex justify-end"><Button onClick={nextQuiz}>Next</Button></div>
            </div>
          </TabsContent>

          <TabsContent value="listening" className="mt-4">
            <div className="shadow-lg bg-white rounded-2xl border border-slate-200">
              <div className="p-4 border-b"><div className="text-base flex items-center gap-2 font-semibold"><Headphones className="h-5 w-5"/>Dictée (Type What You Hear)</div></div>
              <div className="p-4">
                {listenQ && (
                  <div className="max-w-xl mx-auto">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-600">Listen and type the French word.</div>
                      <Button variant="outline" onClick={()=>speak(listenQ.word)}><Volume2 className="h-4 w-4 mr-1"/>Replay</Button>
                    </div>
                    <form onSubmit={submitListen} className="mt-4 flex items-center gap-2">
                      <Input value={listenGuess} onChange={(e:any)=>setListenGuess(e.target.value)} placeholder="Type in French…" />
                      <Button type="submit">Check</Button>
                    </form>
                    {listenFeedback && (
                      <div className="mt-3 text-sm text-slate-700">{listenFeedback}</div>
                    )}
                    <div className="mt-2 text-xs text-slate-500">Meaning: {listenQ.gloss}</div>
                  </div>
                )}
              </div>
              <div className="p-4 border-t flex justify-end"><Button onClick={nextListen}>New word</Button></div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="shadow-sm bg-white rounded-2xl border border-slate-200 p-5 text-sm text-slate-700">
            <div className="font-medium mb-1">A classic routine</div>
            Five new words. Five minutes of review. One listening round. Keep it daily and the streak will do the heavy lifting.
          </div>
          <div className="shadow-sm bg-white rounded-2xl border border-slate-200 p-5 text-sm text-slate-700">
            <div className="font-medium mb-1">Theme & mood</div>
            Subtle café textures, warm light, and simple motion—steadfast, welcoming, and distraction‑free.
          </div>
          <div className="shadow-sm bg-white rounded-2xl border border-slate-200 p-5 text-sm text-slate-700">
            <div className="font-medium mb-1">Your progress</div>
            Earn XP with every correct step. Hit your goal to fill the bar. Streaks celebrate consistency over speed.
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 mt-6 mb-2">v1.0 — Local-only data. Add words anytime. Bon courage{ name ? ", " + name : "" }!</div>
      </div>
    </div>
  );
}

function AddWordForm({ onAdd }:{ onAdd: (w:any)=>void }) {
  const [fr, setFr] = useState("");
  const [en, setEn] = useState("");
  const [hint, setHint] = useState("");
  const canAdd = fr.trim() && en.trim();
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Input value={fr} onChange={(e:any)=>setFr(e.target.value)} placeholder="French (fr)" />
        <Input value={en} onChange={(e:any)=>setEn(e.target.value)} placeholder="English (en)" />
        <Input value={hint} onChange={(e:any)=>setHint(e.target.value)} placeholder="Hint (optional)" />
      </div>
      <div className="mt-3 flex justify-end">
        <Button disabled={!canAdd} onClick={()=>{ onAdd({ fr: fr.trim(), en: en.trim(), hint: hint.trim()||"custom" }); setFr(""); setEn(""); setHint(""); }}>Add word</Button>
      </div>
    </div>
  );
}
