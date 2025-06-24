# 🧠 Centroid Matrix Game

An educational browser-based game where players estimate the centroid of randomly placed dots on a 20×20 grid. The game helps develop spatial reasoning and mathematical intuition.

## 🎯 How to Play

1. **Objective**: Estimate the centroid (geometric center) of blue dots on the grid
2. **Scoring**: Your score is the Manhattan distance from your guess to the optimal centroid
3. **Goal**: Complete 10 rounds with the lowest total score possible
4. **Lower scores are better!**

## 🎮 Game Flow

1. **Start**: Click "Start Game" to begin
2. **Estimate**: Click on the grid where you think the centroid should be
3. **Validate**: Click "Validate" to see your score
4. **Review**: Click "View Answer" to see the optimal centroid and connecting vectors
5. **Continue**: Click "Next Round" to proceed
6. **Complete**: After 10 rounds, see your final score and average

## 🚀 Quick Start

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open browser**:
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## 🛠️ Development

### Project Structure
```
src/
├── components/
│   └── CentroidGame.jsx    # Main game component
├── utils/                  # Utility functions (future)
├── hooks/                  # Custom React hooks (future)
├── styles/                 # Additional styles (future)
├── App.jsx                 # Root component
├── main.jsx               # Entry point
└── index.css              # Global styles
```

### Key Features

- **20×20 Grid**: Pixel-style grid with clickable cells
- **Dynamic Difficulty**: Adjustable number of dots (3-15)
- **Visual Feedback**: 
  - Blue dots (data points)
  - Red square (your guess)
  - Green square (optimal centroid)
  - Green lines (vectors to centroid)
- **Scoring System**: Manhattan distance calculation
- **Round Management**: 10 rounds with cumulative scoring
- **Responsive Design**: Works on desktop and mobile

### Technical Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## 🧪 Testing

Run linting:
```bash
npm run lint
npm run lint:fix
```

## 🎯 Game Mechanics

### Centroid Calculation
The centroid is calculated as the mean of all x and y coordinates:
- `centroid.x = sum(x_coordinates) / number_of_dots`
- `centroid.y = sum(y_coordinates) / number_of_dots`

### Scoring (Manhattan Distance)
Distance between your guess and the optimal centroid:
- `distance = |guess.x - centroid.x| + |guess.y - centroid.y|`

### Difficulty Progression
- Early rounds: Fewer dots, more spread out
- Later rounds: More dots, potentially clustered

## 🔮 Future Enhancements

See `v_2_features.md` for planned improvements including:
- Educational step-by-step calculations
- Persistent leaderboards
- Adaptive difficulty
- Multiplayer modes
- Research data export

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📊 Performance

- Lightweight client-side only
- No external dependencies beyond React ecosystem
- Responsive design for all screen sizes
- Efficient grid rendering with CSS Grid

---

**Enjoy playing and improving your spatial reasoning skills!** 🧠✨ 