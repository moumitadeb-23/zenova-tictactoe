# ZENOVA — Ultra-Premium Tic Tac Toe

ZENOVA is a polished, installable Tic Tac Toe web app built with **vanilla HTML5, CSS3 and JavaScript**. No framework, npm install, bundler or external runtime dependency is required.

## 🌐 Live Demo

### 🚀 Play ZENOVA Online

👉 **https://moumitadeb-23.github.io/zenova-tictactoe/**

No installation or download is required.

Open the link on desktop or mobile and start playing instantly. 🎮

> 📱 **Mobile:** On supported browsers, ZENOVA can be added to your home screen and launched like a native app.

## ✨ Features

- Player vs Player local mode
- Player vs Nova (computer)
- Easy, Medium and Hard/Unbeatable Minimax AI
- Win/draw detection and animated winning line
- Persistent X/O/draw scores with localStorage
- Undo last move
- Move history
- Custom player names
- Optional 10-second move timer with countdown ring
- Dark/light theme with saved preference
- High-contrast mode
- Web Audio sound effects — no audio files required
- Confetti celebration
- Animated splash screen and micro-interactions
- Keyboard controls: Tab, Arrow keys, Enter/Space
- ARIA labels and semantic HTML
- Responsive mobile/tablet/desktop layout
- PWA install support with manifest + service worker
- Offline app-shell caching after the first successful load
- Custom SVG app icon/favicon
- About and Settings panels
- No backend and no external assets required for the app to function

## ▶️ Run

### Simplest
Extract the ZIP and open `index.html`.

### Recommended for PWA/offline testing
A service worker normally requires a secure context (`https://`) or `localhost`. Opening `index.html` directly still runs the game, but install/offline service-worker behavior is best tested through a local server.

For example with Python:

```bash
python -m http.server 8000
```

Then open:

`http://localhost:8000`

## 📱 Install like a mobile app

Deploy the folder to any HTTPS static host (GitHub Pages, Netlify, Vercel, etc.), open it on a supported mobile browser and use the browser's **Add to Home Screen / Install App** option.

The app includes:
- `manifest.json`
- `sw.js`
- `icon.svg`
- standalone display metadata

## 📁 Folder structure

```text
zenova-tictactoe/
├── index.html       # App structure and accessible UI
├── style.css        # Responsive premium visual system + animations
├── script.js        # Game engine, AI, UI, audio, storage, confetti
├── manifest.json    # Progressive Web App metadata
├── sw.js            # Offline app-shell cache
├── icon.svg         # App icon + favicon
└── README.md        # Documentation
```

## 🛠️ v2.2 fixes

- Fixed the Player vs Player / Player vs Nova toggle state so the visual toggle, turn indicator, score labels and game logic always use the same mode.
- Removed the old global mode dependency that could leave the UI showing Player vs Player while the engine was playing against Nova.
- Mode changes now immediately reset the current round, update the side panel and persist the selected mode.
- Timer expiry now correctly makes Nova move when it is Nova's turn.
- Updated script/style cache-busting and service-worker cache version to prevent stale deployed assets.

## 🧠 AI

- **Easy:** random legal move
- **Medium:** takes immediate wins, blocks obvious wins, then prefers center
- **Hard:** full Minimax search. Tic Tac Toe has a small enough state space that this implementation is effectively unbeatable.

## ♿ Accessibility

The board uses semantic buttons and ARIA grid roles. Each cell has an accessible label and visible keyboard focus. Arrow keys move between cells; Enter or Space selects a cell.

## 🔐 Privacy

ZENOVA has no backend and sends no game data anywhere. Scores, settings and names are stored locally in the browser using `localStorage`.

## 🎨 Design

The visual identity is intentionally branded as **ZENOVA**: a futuristic, calm, premium game-room aesthetic with glass surfaces, ambient glow, animated pieces, tactile controls and cinematic transitions.
