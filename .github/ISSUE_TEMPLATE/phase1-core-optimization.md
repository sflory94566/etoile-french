---
name: "Phase 1 – Stabilize & Optimize Current Core"
about: Track all tasks for Phase 1 development work
title: "Phase 1 – Stabilize & Optimize Current Core"
labels: enhancement, phase1
assignees: ''
---

## 🎯 Goal
Complete all tasks in **Phase 1** to stabilize, clean up, and optimize the current French learning app before adding new features.

---

## ✅ Task Checklist

### **Core Feature Fixes**
- [ ] **Flashcards** – Verify navigation works in all modes, ensure correct word/translation display, fix animations.
- [ ] **Voice Selection** – Load French voices in all major browsers, save preference to local storage.
- [ ] **Pronunciation Recording (Basic)** – Test microphone access prompts, ensure recording and playback work.
- [ ] **Progress Tracking (Basic)** – Confirm correct tracking of studied cards, persist in local storage.

### **Code Refactoring**
- [ ] **Split `App.tsx`** into smaller modules:
  - [ ] `utils/speech.ts` – speech synthesis/recognition helpers.
  - [ ] `utils/similarity.ts` – similarity scoring functions.
  - [ ] `hooks/useQuiz.ts` – quiz logic hook.
- [ ] **Centralize Vocabulary Data** in `src/data/words.ts`, remove duplicates.
- [ ] **Add Strong Typing** via `src/types/index.ts`:
  ```ts
  export interface Word { fr: string; en: string; hint?: string }
  export interface QA { question: string; answer: string }
  ```

### **Theme & UI Consistency**
- [ ] Apply new theme colors/typography in `tailwind.config.js`.
- [ ] Standardize padding/margin across components.
- [ ] Add responsive breakpoints for mobile/tablet.
- [ ] Ensure buttons/links have hover/focus states + ARIA labels.

### **Quality Assurance**
- [ ] Install ESLint + Prettier:
  ```bash
  npm install --save-dev eslint prettier eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks @typescript-eslint/parser @typescript-eslint/eslint-plugin
  ```
- [ ] Add linting script in `package.json`:
  ```json
  "scripts": {
    "lint": "eslint 'src/**/*.{ts,tsx}' --fix"
  }
  ```
- [ ] Create basic tests (React Testing Library) for:
  - Rendering a flashcard.
  - Navigating between cards.
  - Loading voices.

---

## 🗂 Tracking
Add this issue to the **Phase 1 Kanban board** in GitHub Projects.  
Move to **In Progress** when work starts, and to **Done** when all tasks are checked.

---

**Notes:**  
- Keep commits small and focused — one task per commit if possible.  
- If blockers appear, note them in this issue so they’re visible to the whole team.
