# Word Glimpse (لمحة)

Word Glimpse is a zero-install, mobile-friendly multiplayer vocabulary web game designed to help players practice English in a fast-paced, interactive party setting. Players take turns acting as a "Clue-Giver" to explain a target word without using forbidden words, while "Guessers" race to hit the buzzer and answer correctly.

## Project Structure

The project follows a standard React (Vite) structure, optimized for component reusability and clean state management.

word-glimpse-1/

├── public/

├── src/

│   ├── assets/

│   ├── components/

│   │   └── Card.jsx          \# Reusable UI for the vocabulary card

│   ├── data/

│   │   └── vocabulary.json   \# The deck of vocabulary words and metadata

│   ├── views/                \# Full-screen components representing game phases

│   │   ├── Auth.jsx          \# Sign In, Sign Up, and Guest Entry

│   │   ├── Lobby.jsx         \# Join or Host a room

│   │   ├── WaitingRoom.jsx   \# Pre-game lobby and host settings

│   │   ├── ClueGiver.jsx     \# Active speaker and referee dashboard

│   │   ├── Guesser.jsx       \# Player interface with the buzzer

│   │   ├── Reveal.jsx        \# End-of-turn answer reveal and "I Know It" logic

│   │   ├── Rating.jsx        \# 25-second peer review phase

│   │   ├── EndSummary.jsx    \# Podium, leaderboard, and missed vocabulary review

│   │   ├── Profile.jsx       \# User statistics and saved words

│   │   ├── Settings.jsx      \# Theme, audio, and haptic preferences

│   │   └── Policy.jsx        \# Game rules and privacy policy

│   ├── App.jsx               \# Main state machine, router, and top navigation

│   ├── index.css             \# Tailwind CSS entry and custom animations

│   └── main.jsx              \# React DOM mounting point

├── package.json

└── vite.config.js

## Tech Stack

* **Frontend Framework:** React (bootstrapped with Vite for fast local development).  
* **Styling:** Tailwind CSS (mobile-first, utility-class styling).  
* **Animations:** Framer Motion (for smooth neumorphic screen transitions and micro-interactions).  
* **Backend / Realtime (Phase 4 \- Pending):** Node.js with Socket.io (to handle room codes, synchronize timers, and manage buzzer race conditions).

## Key Features & Mechanics

* **Zero-Install Entry:** Play instantly via a room link or QR code.  
* **Guest-First Authentication:** Play without friction using a temporary nickname, with an optional account creation prompt at the end to save vocabulary.  
* **Dynamic Vocabulary Tiers:** Words are categorized into A (Hard, 3 pts), B (Medium, 2 pts), and C (Easy, 1 pt). The host can filter the active deck.  
* **Synchronized Timers:** The Clue-Giver has 45-90 seconds to explain. Guessers have a separate answering window (60-180 seconds).  
* **Speed-Based Scoring:** Guesser points scale down based on the minute interval the guess is made. Incorrect guesses grant a 0.5-point consolation.  
* **Referee Controls:** The Clue-Giver judges the answer (Correct, Incorrect, or Skip).  
* **Peer Review:** A 25-second post-round rating phase where players score the Clue-Giver's explanation (1-10), determining the Clue-Giver's score.  
* **Personal Vocabulary Tracking:** Players can mark words with "I Know It" during the reveal phase to exclude them from their final missed words list.

## Setup & Local Development

1. **Install Node.js:** Ensure Node.js is installed on your machine.  
2. **Initialize Project:**  
     
   npm create vite@latest word-glimpse-1 \-- \--template react  
     
   cd word-glimpse-1  
     
3. **Install Dependencies:**  
     
   npm install  
     
   npm install \-D tailwindcss postcss autoprefixer  
     
   npm install framer-motion  
     
4. **Configure Tailwind:**  
     
   npx tailwindcss init \-p  
     
   *(Ensure your `tailwind.config.js` is set up to scan your `src` files.)*  
     
5. **Run Development Server:**  
     
   npm run dev

## Development Phases

* **Phase 1:** Environment Setup (Vite, React, Tailwind).  
* **Phase 2:** Data Structure (JSON) & Basic Views.  
* **Phase 3:** Complete UI & State Machine (App.jsx router, dark neumorphic gamified styling). **(COMPLETED)**  
* **Phase 4:** Backend & Real-time Synchronization (Node.js, Socket.io, centralized timers, buzzer logic). **(NEXT)**  
* **Phase 5:** Final Polish & Deployment.