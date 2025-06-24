# 🧠 Centroid Matrix Game – Implementation Plan

## 🎯 Working Goal
Build a browser-based educational game using **ClojureScript** that displays a **pixel-style 20×20 grid**. Users estimate the **centroid** of 3–15 randomly (sometimes clustered) placed blue dots by clicking the grid. After each guess, the game provides **visual feedback** showing:
- True centroid (green square)
- User guess (red square)
- Vector lines from each point to true centroid
- Manhattan distance score
- A short delay for study before continuing

The game consists of **10 rounds**, increasing in difficulty, with cumulative scoring.

---

## 📁 Modules & Structure

### 1. UI Grid Renderer
- **Canvas or SVG grid**: 20×20 pixel-style
- Highlight hovered and clicked squares
- Efficient re-rendering for dot placements and feedback

### 2. Game State Manager
- Current round (1–10)
- Dot positions for each round
- User guess
- True centroid
- Score (current + total)
- Game status ("guess", "reveal", "next")

### 3. Dot Generator
- Randomly place 3–15 dots
- Introduce bias for clustering in higher rounds
  - Clustered placement (e.g., group of nearby coordinates)
- Prevent overlapping dots

### 4. Centroid Calculation
- Compute the mean x and y of all dots
- Round to nearest integer (to match grid)
- Used for scoring and rendering green square

### 5. Scoring Logic
- Manhattan Distance = |x1 − x2| + |y1 − y2|
- Running total, current round score
- Average per round computed at end

### 6. Feedback Visualization
- Red square (user guess)
- Green square (true centroid)
- Vector lines from each dot to the centroid
- Show score as numeric overlay

### 7. Game Flow Controller
- Step 1: Wait for user click (state: "guess")
- Step 2: Compute and show answer with vectors (state: "reveal")
- Step 3: Delay (e.g. 3 seconds) then auto-advance (state: "next")
- Step 4: Generate new round until 10

### 8. Difficulty Progression
- Early rounds: 3–5 dots, more spread out
- Later rounds: up to 15 dots, tighter clusters
- Adjustable via lookup table or config map

### 9. Debugging & Logging
- Console log state transitions and scoring
- Toggle verbose debug mode
- Option to simulate rounds for test coverage

---

## 🧪 Testing Strategy
- Unit tests for centroid logic, Manhattan distance
- Simulated rounds with predefined dot sets
- UI tests (click on cell → check feedback)

---

## 📦 Files (suggested)
- `core.cljs` – Entry point
- `grid.cljs` – UI rendering
- `logic.cljs` – Centroid + scoring
- `state.cljs` – Game state
- `rounds.cljs` – Round generation logic
- `utils.cljs` – Helpers, logging

---

## 🛡️ Constraints
- Temporary session state (no storage)
- 100% client-side
- Lightweight, responsive

---

## 🧠 Future Enhancements (v2)
Stored separately in `v2-features.md`

---

## ✅ Next: Build `todo.md` and `v2-features.md`

