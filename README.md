# 🃏 Word Glimpse (لمحة)

A real-time multiplayer English vocabulary party and learning game where a **Clue-Giver** explains a target word without saying the word itself, its root, or any **Forbidden Words**, while **Guessers** race to **Buzz In** and solve it—followed by peer rating, live voice chat, and a personalized missed-vocabulary review at the end of the match.

---

## 📌 Project Overview

* **Core Gameplay Loop:** Players rotate as the **Clue-Giver** across rounds/cycles while others guess. At the end of a round, guessers rate the Clue-Giver (`1–10`), and at the end of the match players review words they missed (**Your Missed Vocabulary**) and track words they know (**I Know It**).
* **Current State:** Transitioned from speed multipliers to a **fixed scoring model**, separated **peer rating** from match points, added **WebRTC** voice chat (`useVoiceChat.js`), integrated sound/haptic feedback (`feedback.js`), implemented interactive victory animations in `EndSummary.jsx` using **Framer Motion**, and fixed mobile top-bar button wrapping/overlap.

---

## 🛠️ Libraries & Tech Stack

### Frontend
* **React + Vite:** UI framework and build tool (`vite.config.js`, reads `VITE_SERVER_URL` at build time).
* **Socket.io Client (`socket.io-client`):** Shared real-time bridge (`src/socket.js`) with the game server for rooms, timers, buzzers, answer judging, ratings, and live reactions.
* **Framer Motion (`framer-motion`):** View transitions (`AnimatePresence` / `motion`), off-screen avatar drop entrance with fireworks/sparkles in `EndSummary.jsx`, and tap/hover interactions.
* **Tailwind CSS:** Styling, responsive mobile/desktop layouts, and theme support (`dark` / `light` / `system`).
* **WebRTC (`src/hooks/useVoiceChat.js` + Socket.io signaling):** Real-time in-room voice chat with mute/unmute and voice room leave controls.
* **Audio & Haptic Feedback (`src/utils/feedback.js`):** Sound effects and tactile feedback helpers.

### Backend
* **Node.js + Express (`express` / `http`):** HTTP server (`server/index.js`) and basic health/status endpoint.
* **Socket.io Server (`socket.io`):** Real-time game state machine (`waiting`, `playing`, `reveal`, `rating`, `summary`), server-authoritative timers, clue-giver grace periods, reconnection handling, and room cleanup.
* **CORS (`cors`):** Cross-origin access configuration using `CLIENT_URL`.
* **Vocabulary Dataset (`src/data/vocabulary.json`):** Word cards categorized into tiers `A`, `B`, and `C` with forbidden words and meanings.

---

## 🌐 Platforms, Servers & Hosting

* **GitHub:** Source control and repository hosting (`git add`, `git commit`, `git push`).
* **Render (`Web Service`):** Hosts the persistent **Node.js + Socket.io** backend (`server/index.js`).
  * Server URL: `https://word-glimpse-707y.onrender.com`
  * Key Environment Variables: `CLIENT_URL` (set to the Vercel frontend URL) and `PORT`.
* **Vercel:** Hosts the **React + Vite** frontend with automatic **HTTPS**.
  * Key Environment Variables: `VITE_SERVER_URL` (set to the Render backend URL `https://word-glimpse-707y.onrender.com`), followed by a **Redeploy** whenever updated.

---

## 🎮 Game Rules, Scoring & Rating

### 1. Fixed Card Scoring
Speed multipliers were removed in favor of fixed points by card tier:
* **Tier A:** `12` points
* **Tier B:** `8` points
* **Tier C:** `5` points

### 2. Wrong Guess Scoring (`wrongAttempts`)
* **1st wrong attempt on a card:** `+2` points
* **2nd wrong attempt by the same player on the same card:** `-1` point (clamped at `0` minimum)
* **Correct answer after a prior wrong attempt on the same card:** Any prior wrong-attempt bonus on that card is offset so the total gain from that card matches its fixed tier value (`12 / 8 / 5`).

### 3. Peer Rating & `🎓 Best Teacher` (Isolated from Match Score)
* Round ratings (`1–10`) are **completely separate** from match points (`score`).
* Each player's peer rating average (`avgRating`) is accumulated independently and used to award the **🎓 Best Teacher** title alongside the **🏆 Score Champion** on the end screen.

---

## ✨ Key UI & UX Features

* **Waiting Room (`WaitingRoom.jsx`):**
  * Room invite code, copy button, QR code preview, and connected players list (up to 8 players).
  * Host configuration: **Word Glimpse** mode, **Clue Time**, **Guess Time**, **Cycles** (total cards), and deck tier filters (`ALL`, `A & B`, `B & C`, `Just A`, `Just B`, `Just C`).
  * Quick rules **`!`** button on the right to open a concise explanation modal of gameplay, scoring, and peer rating.
* **End Summary (`EndSummary.jsx`):**
  * Side-by-side interactive podium for **🏆 Score Champion** and **🎓 Best Teacher** (or a combined crown when one player earns both).
  * Winner avatar drops in large from outside the screen into the podium with shockwave/fireworks and bursts on tap/click.
  * Final leaderboard, **Your Missed Vocabulary** review list, guest account prompt, and **Play Again / Exit to Lobby** actions.
* **Responsive Top Header (`App.jsx`):**
  * Uses `flex-wrap`, `shrink-0`, and `whitespace-nowrap` so **Voice**, **Exit**, room code **Copy**, theme toggle, profile, and settings buttons do not overlap on narrow mobile screens.

---

## 📁 Project Structure

```text
word-glimpse-1/
├── public/                   # Static public assets
├── server/
│   └── index.js              # Node.js + Express + Socket.io server, timers, scoring & WebRTC signaling
├── src/
│   ├── assets/               # Media and static assets
│   ├── components/           # Shared UI components
│   ├── data/
│   │   └── vocabulary.json   # Card deck with difficulty tiers (A, B, C), forbidden words & meanings
│   ├── hooks/
│   │   └── useVoiceChat.js   # WebRTC voice chat hook (join, mute, unmute, leave, peer streams)
│   ├── utils/
│   │   └── feedback.js       # Sound effects and haptic feedback utilities
│   ├── views/
│   │   ├── Auth.jsx          # Sign-in / guest entry
│   │   ├── ClueGiver.jsx     # Clue-giver card view, timers & answer judgment controls
│   │   ├── EndSummary.jsx    # Interactive victory podium, Best Teacher, leaderboard & missed words
│   │   ├── Guesser.jsx       # Guesser view & live buzzer (Buzz In)
│   │   ├── Lobby.jsx         # Create or join a room by code
│   │   ├── Policy.jsx        # Rules & policies
│   │   ├── Profile.jsx       # Player stats & saved/known vocabulary
│   │   ├── Rating.jsx        # Post-round Clue-Giver rating (1–10)
│   │   ├── Reveal.jsx        # Word reveal, definition & "I Know It" toggle
│   │   ├── Settings.jsx      # Theme, sound & haptics settings
│   │   └── WaitingRoom.jsx   # Lobby settings, players list & (!) quick rules modal
│   ├── App.jsx               # App state, responsive header, phase routing, reactions & debug bar
│   ├── index.css             # Global styles and Tailwind CSS setup
│   ├── main.jsx              # React application entry point
│   └── socket.js             # Shared Socket.io client connected to VITE_SERVER_URL
├── .gitignore                # Ignored files and folders
├── eslint.config.js          # ESLint configuration
├── index.html                # HTML entry template
├── package-lock.json         # Exact dependency lockfile
├── package.json              # Dependencies and scripts
├── README.md                 # Project documentation
├── temperory_notes.md        # Temporary development notes
└── vite.config.js            # Vite bundler configuration
```

---

## 🚀 Running & Deploying the Project

### 1. Local Setup (Running on Your Machine)
1. **Install dependencies:**
   Open a terminal in the root project folder (`word-glimpse-1`) and run:
   ```bash
   npm install
   ```

2. **Start the Backend Server (Node.js + Socket.io):**
   Run the real-time game server on port `3001` (or `process.env.PORT`):
   ```bash
   node server/index.js
   ```
   You should see a confirmation message that the server is running (and visiting `http://localhost:3001` in the browser displays `"Word Glimpse Server is running!"`).

3. **Start the Frontend Dev Server (React + Vite):**
   Open a **second terminal** in the root folder and run:
   ```bash
   npm run dev
   ```
   Open the local URL shown in the terminal (typically `http://localhost:5173`) in two browser tabs or devices to test creating and joining a room.

4. **Optional Local Environment Variables (`.env`):**
   If running locally and pointing to a custom backend URL:
   ```env
   VITE_SERVER_URL=http://localhost:3001
   ```

---

### 2. Cloud Deployment (Render + Vercel)

#### Backend on Render (`Web Service`)
* **Repository:** Connected to the GitHub repository (`word-glimpse`).
* **Build Command:** `npm install`
* **Start Command:** `node server/index.js`
* **Live Server URL:** `https://word-glimpse-707y.onrender.com`
* **Environment Variables on Render:**
  * `CLIENT_URL`: Set to the Vercel frontend URL (e.g., `https://your-app.vercel.app`) to allow CORS / Socket.io connections.

#### Frontend on Vercel (`Vite`)
* **Imported Project:** The frontend app (`/`) from the GitHub repository.
* **Environment Variables on Vercel:**
  * `VITE_SERVER_URL`: Set to `https://word-glimpse-707y.onrender.com` (clean URL without trailing slash).
* **Important:** Whenever `VITE_SERVER_URL` or frontend code changes, trigger a **Redeploy** on Vercel so Vite embeds the updated environment variable into the production build.

---

### 3. Future Maintenance Notes 
* Always restart `node server/index.js` (or restart the Render service) after modifying `server/index.js` so server-side scoring, timer, and room logic updates take effect.
* On free-tier hosting, an idle backend may sleep between sessions and take a few seconds to wake up on the first connection.
* Keep `VITE_SERVER_URL` on Vercel and `CLIENT_URL` on Render in sync whenever deployment URLs change.

---

## 🤖 How It Was Built & AI Usage

### 1. Development Workflow
* **Iterative Feature & Bug-Fix Cycles:** The project was developed iteratively across gameplay phases, real-time room synchronization (`Socket.io`), mobile responsiveness, voice chat (`WebRTC`), and end-of-match animations (`Framer Motion`).
* **Separation of Concerns:** Game rules, scoring (`12 / 8 / 5` tier points and wrong-attempt adjustments), and round timers are managed on the backend (`server/index.js`), while UI views (`src/views/*`), theme toggles, and local learning states (`I Know It` / missed words) are handled on the frontend (`src/`).
* **Isolated Peer Rating:** Round ratings (`1–10`) are tracked independently from match points to highlight the **🎓 Best Teacher** alongside the **🏆 Score Champion**.

### 2. AI Assistance in This Project
* **Architecture & Code Generation:** AI was used as a coding collaborator to structure views, wire Socket.io events, fix scoring and mobile header layout issues, and craft Framer Motion animations in `EndSummary.jsx`.
* **Debugging & Refactoring:** AI assisted in diagnosing real-time state/scoring discrepancies, organizing modular files (`hooks/useVoiceChat.js`, `utils/feedback.js`, `views/*`), and preparing deployment steps for **Render** and **Vercel**.
* **Documentation & Future Maintenance:** AI helped compile this `README.md` as a long-term reference so the codebase, architecture, libraries, and hosting setup remain easy to understand and maintain years later.
