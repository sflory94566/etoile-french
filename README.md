# etoile-french
French Language Course

---

# Étoile – Learn French

Étoile is a simple, interactive French learning app that displays flashcards with French words, allows you to record your pronunciation (future feature), and tracks your progress. The app is built with **React**, **Vite**, **TypeScript**, and **Tailwind CSS**, and deployed on **Netlify**.

---

## 🚀 Live Demo

[View the live app on Netlify](https://roaring-taiyaki-4b678c.netlify.app/)

---

## 📂 Project Structure

```
Etoile/
├── public/                  # Static assets
├── src/
│   ├── App.tsx               # Main app component
│   ├── components/           # UI components
│   ├── assets/               # Images, sounds
│   ├── styles/               # Tailwind and custom CSS
│   └── main.tsx              # App entry point
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🛠️ Getting Started

### 1. **Clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/etoile.git
cd etoile
```

### 2. **Install dependencies**

```bash
npm install
```

### 3. **Run locally**

```bash
npm run dev
```

This starts the dev server at `http://localhost:5173/`.

### 4. **Build for production**

```bash
npm run build
```

### 5. **Preview the production build**

```bash
npm run preview
```

---

## 🌐 Deployment on Netlify

The repository is connected to Netlify for **automatic deployment**.
Every time you push to the `main` branch on GitHub, Netlify will rebuild and publish your app.

**Build settings in Netlify:**

* **Build Command:** `npm run build`
* **Publish Directory:** `dist`
* **Node Version:** `20`

---

## 🔑 Environment Variables

If using any API keys (future voice recognition features), add them in Netlify:

1. Go to **Site Settings → Environment Variables**.
2. Add the key/value pairs.
3. Redeploy.

---

## 🧩 Tech Stack

* **React + TypeScript** – UI framework
* **Vite** – Lightning-fast build tool
* **Tailwind CSS** – Styling
* **Netlify** – Hosting
* **Recharts** – (Optional) Chart components

---

## 📌 Roadmap

* ✅ Flashcard functionality
* ✅ Netlify deployment
* 🚧 Microphone recording & pronunciation analysis
* 🚧 User progress tracking with charts
* 🚧 Backend integration

---

## 👥 Contributors

* **Stephen** – Project lead
* **Partner** – Testing & review

---

If you like this project, ⭐ star it on GitHub and share it!

---
