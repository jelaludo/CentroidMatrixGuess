import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Target, Check, ArrowRight, Info, Calculator, TrendingUp, Clock } from 'lucide-react';

const CentroidGame = () => {
  const [numDots, setNumDots] = useState(8);
  const [dots, setDots] = useState([]);
  const [userGuess, setUserGuess] = useState(null);
  const [actualCentroid, setActualCentroid] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ totalMoves: 0, rounds: 0 });
  const [gameStarted, setGameStarted] = useState(false);
  const [currentRoundScore, setCurrentRoundScore] = useState(null);
  const [showingAnswer, setShowingAnswer] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerPenalty, setTimerPenalty] = useState(0);

  // Mobile-optimized grid size
  const GRID_SIZE = 12; // Reduced from 20 for mobile
  const CELL_SIZE = 16; // Reduced from 20 for mobile
  const MAX_ROUNDS = 10;
  const TIMER_PENALTY_THRESHOLD = 3; // Start adding penalty after 3 seconds

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && !showResult && !showingAnswer) {
      interval = setInterval(() => {
        setTimer(prevTimer => {
          const newTimer = prevTimer + 1;
          // Add penalty point for each second after 3 seconds
          if (newTimer > TIMER_PENALTY_THRESHOLD) {
            setTimerPenalty(prev => prev + 1);
          }
          return newTimer;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, showResult, showingAnswer]);

  // Start timer when user makes a guess
  useEffect(() => {
    if (showResult || showingAnswer) {
      setIsTimerRunning(false);
    }
  }, [showResult, showingAnswer]);

  // Start timer when new round begins
  useEffect(() => {
    if (gameStarted && dots.length > 0 && !showResult && !showingAnswer && !userGuess) {
      setIsTimerRunning(true);
    }
  }, [gameStarted, dots, showResult, showingAnswer, userGuess]);

  // Difficulty configuration
  const getDifficultyConfig = (round) => {
    const baseConfig = {
      minDots: 3,
      maxDots: 12, // Reduced for mobile
      clusterBias: 0, // 0 = no clustering, 1 = strong clustering
      clusterRadius: 3
    };

    if (round <= 3) {
      // Early rounds: 3-5 dots, no clustering
      return {
        ...baseConfig,
        minDots: 3,
        maxDots: 5,
        clusterBias: 0
      };
    } else if (round <= 6) {
      // Middle rounds: 4-8 dots, light clustering
      return {
        ...baseConfig,
        minDots: 4,
        maxDots: 8,
        clusterBias: 0.3,
        clusterRadius: 3
      };
    } else {
      // Later rounds: 6-12 dots, strong clustering
      return {
        ...baseConfig,
        minDots: 6,
        maxDots: 12,
        clusterBias: 0.6,
        clusterRadius: 4
      };
    }
  };

  // Handle numDots changes only when game hasn't started
  useEffect(() => {
    if (!gameStarted) {
      const newDots = generateRandomDots(1);
      setDots(newDots);
      setActualCentroid(calculateCentroid(newDots));
    }
  }, [numDots, gameStarted]);

  const generateRandomDots = (round = 1) => {
    const config = getDifficultyConfig(round);
    const actualNumDots = Math.floor(Math.random() * (config.maxDots - config.minDots + 1)) + config.minDots;
    
    const newDots = [];
    const usedPositions = new Set();
    
    // Generate cluster centers if clustering is enabled
    let clusterCenters = [];
    if (config.clusterBias > 0 && Math.random() < config.clusterBias) {
      const numClusters = Math.max(1, Math.floor(actualNumDots / 4));
      for (let i = 0; i < numClusters; i++) {
        clusterCenters.push({
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE)
        });
      }
    }
    
    while (newDots.length < actualNumDots) {
      let x, y;
      
      // Decide whether to place near a cluster or randomly
      if (clusterCenters.length > 0 && Math.random() < config.clusterBias) {
        // Place near a random cluster center
        const center = clusterCenters[Math.floor(Math.random() * clusterCenters.length)];
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * config.clusterRadius;
        
        x = Math.max(0, Math.min(GRID_SIZE - 1, Math.round(center.x + distance * Math.cos(angle))));
        y = Math.max(0, Math.min(GRID_SIZE - 1, Math.round(center.y + distance * Math.sin(angle))));
      } else {
        // Place randomly
        x = Math.floor(Math.random() * GRID_SIZE);
        y = Math.floor(Math.random() * GRID_SIZE);
      }
      
      const key = `${x},${y}`;
      
      if (!usedPositions.has(key)) {
        newDots.push({ x, y });
        usedPositions.add(key);
      }
    }
    
    return newDots;
  };

  const calculateCentroid = (dotArray) => {
    if (dotArray.length === 0) return { x: 0, y: 0 };
    
    const sumX = dotArray.reduce((sum, dot) => sum + dot.x, 0);
    const sumY = dotArray.reduce((sum, dot) => sum + dot.y, 0);
    
    return {
      x: sumX / dotArray.length,
      y: sumY / dotArray.length
    };
  };

  const calculateManhattanDistance = (point1, point2) => {
    return Math.abs(point1.x - point2.x) + Math.abs(point1.y - point2.y);
  };

  const findNearestGridPoint = (centroid) => {
    return {
      x: Math.round(centroid.x),
      y: Math.round(centroid.y)
    };
  };

  const startNewRound = () => {
    if (score.rounds >= MAX_ROUNDS) return;
    
    const newDots = generateRandomDots(score.rounds + 1);
    setDots(newDots);
    setActualCentroid(calculateCentroid(newDots));
    setUserGuess(null);
    setShowResult(false);
    setCurrentRoundScore(null);
    setShowingAnswer(false);
    setShowExplanation(false);
    setTimer(0);
    setTimerPenalty(0);
    setIsTimerRunning(false);
  };

  const proceedToNextRound = () => {
    setShowingAnswer(false);
    setShowExplanation(false);
    startNewRound();
  };

  const showAnswer = () => {
    setShowingAnswer(true);
    setShowExplanation(true);
  };

  const handleCellClick = (x, y) => {
    if (showResult || showingAnswer) return;
    setUserGuess({ x, y });
  };

  const validateGuess = () => {
    if (!userGuess || !actualCentroid) return;
    
    const nearestGridPoint = findNearestGridPoint(actualCentroid);
    const distance = calculateManhattanDistance(userGuess, nearestGridPoint);
    const totalScore = distance + timerPenalty;
    
    setCurrentRoundScore(totalScore);
    setScore(prev => ({
      totalMoves: prev.totalMoves + totalScore,
      rounds: prev.rounds + 1
    }));
    setShowResult(true);
    setIsTimerRunning(false);
  };

  const resetGame = () => {
    setDots([]);
    setUserGuess(null);
    setActualCentroid(null);
    setShowResult(false);
    setScore({ totalMoves: 0, rounds: 0 });
    setGameStarted(false);
    setCurrentRoundScore(null);
    setShowingAnswer(false);
    setShowExplanation(false);
    setTimer(0);
    setTimerPenalty(0);
    setIsTimerRunning(false);
  };

  const getCurrentDifficulty = () => {
    const round = score.rounds + 1;
    if (round <= 3) return { name: "Easy", color: "text-green-600" };
    if (round <= 6) return { name: "Medium", color: "text-yellow-600" };
    return { name: "Hard", color: "text-red-600" };
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timer <= TIMER_PENALTY_THRESHOLD) return "text-green-600";
    return "text-red-600";
  };

  const renderGrid = () => {
    const cells = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const isDot = dots.some(dot => dot.x === x && dot.y === y);
        const isUserGuess = userGuess && userGuess.x === x && userGuess.y === y;
        const isActualCentroid = actualCentroid && 
          Math.round(actualCentroid.x) === x && 
          Math.round(actualCentroid.y) === y;
        
        let cellClass = "border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors";
        let cellContent = null;
        
        if (isDot) {
          cellClass += " bg-blue-500 border-blue-600";
          cellContent = <div className="w-full h-full bg-blue-500 rounded-sm"></div>;
        } else if (isUserGuess && showResult) {
          cellClass += " bg-red-500 border-red-600";
          cellContent = <div className="w-full h-full bg-red-500 rounded-sm"></div>;
        } else if (isActualCentroid && showResult) {
          cellClass += " bg-green-500 border-green-600";
          cellContent = <div className="w-full h-full bg-green-500 rounded-sm"></div>;
        } else if (isUserGuess && !showResult) {
          cellClass += " bg-orange-400 border-orange-500";
          cellContent = <div className="w-full h-full bg-orange-400 rounded-sm"></div>;
        }
        
        cells.push(
          <div
            key={`${x}-${y}`}
            className={cellClass}
            onClick={() => handleCellClick(x, y)}
          >
            {cellContent}
          </div>
        );
      }
    }
    return cells;
  };

  const renderVectors = () => {
    if (!actualCentroid || !showResult) return null;
    
    const nearestGridPoint = findNearestGridPoint(actualCentroid);
    const vectors = [];
    
    dots.forEach((dot, index) => {
      const startX = dot.x * CELL_SIZE + CELL_SIZE / 2;
      const startY = dot.y * CELL_SIZE + CELL_SIZE / 2;
      const endX = nearestGridPoint.x * CELL_SIZE + CELL_SIZE / 2;
      const endY = nearestGridPoint.y * CELL_SIZE + CELL_SIZE / 2;
      
      vectors.push(
        <line
          key={`vector-${index}`}
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke="green"
          strokeWidth="1"
          opacity="0.6"
        />
      );
    });
    
    return vectors;
  };

  const getCentroidExplanation = () => {
    if (!actualCentroid || !dots.length) return null;
    
    const sumX = dots.reduce((sum, dot) => sum + dot.x, 0);
    const sumY = dots.reduce((sum, dot) => sum + dot.y, 0);
    const count = dots.length;
    const avgX = sumX / count;
    const avgY = sumY / count;
    const nearestGridPoint = findNearestGridPoint(actualCentroid);
    
    return {
      exactCentroid: { x: avgX.toFixed(2), y: avgY.toFixed(2) },
      nearestGridPoint,
      calculation: {
        count,
        sumX,
        sumY,
        avgX: avgX.toFixed(2),
        avgY: avgY.toFixed(2)
      }
    };
  };

  const averageScore = score.rounds > 0 ? (score.totalMoves / score.rounds).toFixed(1) : 0;
  const isGameComplete = score.rounds >= MAX_ROUNDS;
  const explanation = getCentroidExplanation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-2">
      {/* Compact Timer at Top */}
      {gameStarted && (
        <div className="mb-2">
          <div className="bg-white rounded-lg shadow px-3 py-1 flex items-center gap-2">
            <Clock className="text-gray-600" size={14} />
            <div className={`text-sm font-bold ${getTimerColor()}`}>
              {formatTime(timer)}
            </div>
            {timerPenalty > 0 && (
              <div className="text-xs text-red-600">+{timerPenalty}</div>
            )}
          </div>
        </div>
      )}

      {/* Centered Header */}
      <div className="text-center mb-3 max-w-[192px]">
        <h1 className="text-lg font-bold text-gray-800 mb-1">Centroid Matrix Game</h1>
        
        {/* Compact game info */}
        <div className="text-xs text-gray-600">
          {!gameStarted ? (
            <div>
              <p>Complete {MAX_ROUNDS} rounds</p>
              <p>Lowest score wins</p>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <span>R{score.rounds + 1}/{MAX_ROUNDS}</span>
              <span className={`font-medium ${getCurrentDifficulty().color}`}>
                {getCurrentDifficulty().name}
              </span>
              {score.rounds > 0 && (
                <span className="text-red-600">T:{score.totalMoves}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {!gameStarted ? (
        <button
          onClick={() => {
            setGameStarted(true);
            startNewRound();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
        >
          <Target size={16} />
          Start Game
        </button>
      ) : (
        <div className="flex flex-col items-center space-y-2 max-w-[192px]">
          {/* Grid - Maximum Size */}
          <div className="relative bg-white rounded-lg shadow p-2">
            <div
              className="grid gap-0 border border-gray-400"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                width: GRID_SIZE * CELL_SIZE,
                height: GRID_SIZE * CELL_SIZE,
              }}
            >
              {renderGrid()}
            </div>
            
            {(showResult || showingAnswer) && (
              <svg
                className="absolute top-2 left-2 pointer-events-none"
                width={GRID_SIZE * CELL_SIZE}
                height={GRID_SIZE * CELL_SIZE}
              >
                {renderVectors()}
              </svg>
            )}
          </div>

          {/* Compact Status Messages */}
          <div className="text-xs text-gray-600 text-center w-full">
            {!userGuess && gameStarted && !showResult && (
              <p>Tap to estimate centroid</p>
            )}
            {userGuess && !showResult && (
              <p>Click Validate</p>
            )}
            {showResult && (
              <div>
                <span className="text-green-600">Green</span> = optimal, 
                <span className="text-red-600">Red</span> = guess
                {currentRoundScore === 0 && <span className="text-green-600 font-bold">Perfect!</span>}
              </div>
            )}
            {currentRoundScore !== null && (
              <div className="text-orange-600 font-medium">
                Round: {currentRoundScore} pts
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-1">
            {userGuess && !showResult && !showingAnswer && (
              <button
                onClick={validateGuess}
                className="w-full flex items-center justify-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors text-xs"
              >
                <Check size={12} />
                Validate
              </button>
            )}

            {showResult && score.rounds < MAX_ROUNDS && (
              <button
                onClick={proceedToNextRound}
                className="w-full flex items-center justify-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors text-xs"
              >
                <ArrowRight size={12} />
                Next Round
              </button>
            )}

            {showResult && isGameComplete && (
              <div className="bg-white rounded shadow p-2 text-center">
                <div className="text-xs font-bold text-blue-600 mb-1">Complete!</div>
                <div className="text-xs text-gray-600 mb-1">
                  Score: <span className="font-bold text-red-600">{score.totalMoves}</span>
                </div>
                <button
                  onClick={resetGame}
                  className="w-full flex items-center justify-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors text-xs"
                >
                  <RotateCcw size={12} />
                  Play Again
                </button>
              </div>
            )}
          </div>

          {/* Optional View Solution */}
          {showResult && !showingAnswer && (
            <div className="text-center">
              <button
                onClick={showAnswer}
                className="text-xs text-gray-500 underline hover:text-gray-700"
              >
                View solution (optional)
              </button>
            </div>
          )}

          {/* Compact Solution Display */}
          {showingAnswer && explanation && (
            <div className="bg-white rounded shadow p-2 text-xs w-full">
              <div className="font-bold text-gray-800 mb-1">Calculation</div>
              <div className="space-y-0.5 text-gray-600">
                <div>Dots: {explanation.calculation.count}</div>
                <div>Sum: ({explanation.calculation.sumX}, {explanation.calculation.sumY})</div>
                <div>Avg: ({explanation.calculation.avgX}, {explanation.calculation.avgY})</div>
                <div>Grid: ({explanation.nearestGridPoint.x}, {explanation.nearestGridPoint.y})</div>
                <div className="text-red-600 font-medium">Distance: {currentRoundScore}</div>
              </div>
            </div>
          )}

          {/* Reset Button */}
          <div className="text-center">
            <button
              onClick={resetGame}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors mx-auto"
            >
              <RotateCcw size={10} />
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CentroidGame; 