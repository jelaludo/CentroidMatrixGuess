# ✅ TODO – Centroid Matrix Game

## �� Core Game Flow
- [x] Initialize project with ClojureScript + Reagent
- [x] Set up canvas or SVG-based 20×20 grid renderer
- [x] Handle user click input on grid
- [x] Display blue dots (randomly placed)
- [x] Compute and show centroid (green) and guess (red)
- [x] Draw vector lines from dots to centroid
- [x] Compute Manhattan score
- [x] Display score feedback with delay
- [x] Advance through 10 rounds with increasing difficulty

## 🧠 Logic Modules
- [x] Centroid calculation (mean of x/y, rounded)
- [x] Manhattan distance scoring
- [x] Dot generation with cluster bias
- [x] Round manager with progression logic

## 🔄 Game State
- [x] Store round number, scores, dots, guess, status
- [x] State transitions (guess → reveal → next)
- [x] Visual update triggers

## 🧪 Testing
- [ ] Unit tests for centroid and distance
- [ ] Simulate round logic with preset dot arrays
- [ ] Manual test of game flow and visuals

## 🔧 Dev Tooling
- [x] Logging state transitions and scores
- [x] Dev-only toggle for debug overlays

## 🧼 Final Polish
- [x] Center grid in layout
- [x] Responsive grid sizing
- [x] Instructions and UI labels
- [x] Total + per-round scoring summary

## 🚀 Ready to Run
- [x] Complete project structure
- [x] All source files implemented
- [x] CSS styling and responsive design
- [x] Development server setup
- [x] README with instructions

## 🎮 Next Steps
1. Run `lein figwheel` to start development server
2. Open browser to `http://localhost:3449`
3. Test all game functionality
4. Add unit tests if desired
5. Deploy to production if needed

