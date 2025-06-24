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
  const [perfectGuess, setPerfectGuess] = useState(false);
  const [gameMode, setGameMode] = useState('GRID'); // 'GRID' or 'DOTS'
  const [roundHistory, setRoundHistory] = useState([]);
  const [showRecap, setShowRecap] = useState(false);

  // Congratulatory messages
  const congratulatoryMessages = [
    "🎉 Amazing work! You've mastered the centroid challenge!",
    "🌟 Outstanding performance! Your spatial reasoning is top-notch!",
    "🏆 Brilliant! You've conquered the centroid matrix!",
    "💫 Exceptional! Your precision is truly remarkable!",
    "🎯 Phenomenal! You've hit the centroid bullseye!",
    "⭐ Spectacular! Your geometric intuition is incredible!",
    "🔥 Fantastic! You've aced the centroid game!",
    "✨ Magnificent! Your spatial awareness is outstanding!",
    "🚀 Incredible! You've soared through the centroid challenge!",
    "💎 Perfect! You've polished your centroid skills to perfection!",
    "Wow, you absolutely crushed it!",
    "Dude, that was straight-up legendary!",
    "Holy cow, how did you pull that off?!",
    "You're a freakin' rockstar!",
    "Nailed it like a pro!",
    "That was pure genius, my friend!",
    "Yo, you're killing it out there!",
    "Mind. Blown. You're incredible!",
    "Take a bow, that was phenomenal!",
    "Well, hot damn, you did it!",
    "OMG, you're an actual wizard!",
    "Heck yeah, you're unstoppable!",
    "That was next-level awesome!",
    "You just raised the bar, champ!",
    "Whoa, you're on fire!",
    "Epic win, you total boss!",
    "Dang, you made that look easy!",
    "You're out here slaying it!",
    "Bravo, that was pure magic!",
    "Sweet moves, you nailed it!",
    "Are you kidding me? That was insane!",
    "Big props, you're a superstar!",
    "That was clutch—way to go!",
    "You're a master at this, wow!",
    "Holy moly, you're unstoppable!",
    "Look at you, shining bright!",
    "Yesss, you totally owned that!",
    "Incredible work, you genius!",
    "Way to flex those skills!",
    "Dang, you're making us all proud!"
  ];

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

  const calculateEuclideanDistance = (point1, point2) => {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
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
    setPerfectGuess(false);
    setShowRecap(false);
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
    
    let distance, totalScore;
    
    if (gameMode === 'GRID') {
      // GRID mode: Manhattan distance to nearest grid point
      const nearestGridPoint = findNearestGridPoint(actualCentroid);
      distance = calculateManhattanDistance(userGuess, nearestGridPoint);
      totalScore = distance + timerPenalty;
    } else {
      // DOTS mode: Euclidean distance to exact centroid
      distance = calculateEuclideanDistance(userGuess, actualCentroid);
      // Perfect guess (within 0.5 units) scores 0, otherwise scale by 2
      const baseScore = distance < 0.5 ? 0 : Math.round(distance * 2);
      totalScore = baseScore + timerPenalty;
    }
    
    const currentRound = score.rounds + 1;
    const roundData = {
      round: currentRound,
      score: totalScore,
      distance: distance,
      timerPenalty: timerPenalty,
      difficulty: getCurrentDifficulty().name,
      perfect: gameMode === 'GRID' ? distance === 0 : distance < 0.5
    };
    
    setCurrentRoundScore(totalScore);
    setRoundHistory(prev => [...prev, roundData]);
    
    // Only increment rounds after validation
    setScore(prev => ({
      totalMoves: prev.totalMoves + totalScore,
      rounds: prev.rounds + 1
    }));
    setShowResult(true);
    setIsTimerRunning(false);
    
    // Set perfect guess effect if distance is very close (within 0.5 for DOTS, 0 for GRID)
    const isPerfect = gameMode === 'GRID' ? distance === 0 : distance < 0.5;
    if (isPerfect) {
      setPerfectGuess(true);
      // Clear the effect after 2 seconds
      setTimeout(() => setPerfectGuess(false), 2000);
    }
    
    // Show recap if this was the final round
    if (currentRound >= MAX_ROUNDS) {
      setTimeout(() => setShowRecap(true), 1000);
    }
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
    setPerfectGuess(false);
    setRoundHistory([]);
    setShowRecap(false);
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
      {/* Persistent Header with Game Mode Selector */}
      <div className="w-full max-w-[192px] mb-3">
        <div className="bg-white rounded-lg shadow p-2">
          <div className="flex gap-1">
            <button
              onClick={() => {
                setGameMode('GRID');
                resetGame();
              }}
              className={`flex-1 py-1 px-2 text-xs font-medium rounded transition-colors ${
                gameMode === 'GRID' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              GRID
            </button>
            <button
              onClick={() => {
                setGameMode('DOTS');
                resetGame();
              }}
              className={`flex-1 py-1 px-2 text-xs font-medium rounded transition-colors ${
                gameMode === 'DOTS' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              DOTS
            </button>
          </div>
        </div>
      </div>

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
        <h1 className="text-lg font-bold text-gray-800 mb-1">
          {gameMode === 'GRID' ? 'Centroid Matrix Game' : 'Centroid Dots Game'}
        </h1>
        
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
      ) : gameMode === 'GRID' ? (
        <div className="flex flex-col items-center space-y-2 max-w-[192px]">
          {/* Grid - Maximum Size */}
          <div className={`relative bg-white rounded-lg shadow p-2 transition-all duration-300 ${
            perfectGuess ? 'animate-pulse bg-yellow-50 shadow-lg shadow-yellow-200' : ''
          }`}>
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
            
            {/* Perfect Guess Celebration */}
            {perfectGuess && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-2xl font-bold text-yellow-500 animate-bounce">
                  ✨
                </div>
              </div>
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
              <div className={`transition-all duration-300 ${perfectGuess ? 'text-yellow-600 font-bold scale-110' : ''}`}>
                <span className="text-green-600">Green</span> = optimal, 
                <span className="text-red-600">Red</span> = guess
                {currentRoundScore === 0 && <span className="text-green-600 font-bold">Perfect!</span>}
              </div>
            )}
            {currentRoundScore !== null && (
              <div className={`font-medium transition-all duration-300 ${perfectGuess ? 'text-yellow-600 scale-110' : 'text-orange-600'}`}>
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
      ) : (
        <div className="flex flex-col items-center space-y-2 max-w-[192px]">
          {/* DOTS Mode - Black background with pale blue dots */}
          <div className={`relative bg-black rounded-lg shadow p-2 transition-all duration-300 ${
            perfectGuess ? 'animate-pulse shadow-lg shadow-yellow-200' : ''
          }`}>
            <div
              className="relative"
              style={{
                width: GRID_SIZE * CELL_SIZE,
                height: GRID_SIZE * CELL_SIZE,
              }}
            >
              {/* Render dots */}
              {dots.map((dot, index) => (
                <div
                  key={index}
                  className="absolute bg-blue-300 rounded-full"
                  style={{
                    width: 8,
                    height: 8,
                    left: dot.x * CELL_SIZE + CELL_SIZE / 2 - 4,
                    top: dot.y * CELL_SIZE + CELL_SIZE / 2 - 4,
                  }}
                />
              ))}
              
              {/* User's guess */}
              {userGuess && (
                <div
                  className={`absolute rounded-full ${
                    showResult ? 'bg-red-500' : 'bg-orange-400'
                  }`}
                  style={{
                    width: 8,
                    height: 8,
                    left: userGuess.x * CELL_SIZE + CELL_SIZE / 2 - 4,
                    top: userGuess.y * CELL_SIZE + CELL_SIZE / 2 - 4,
                  }}
                />
              )}
              
              {/* Actual centroid */}
              {showResult && actualCentroid && (
                <div
                  className="absolute bg-green-500 rounded-full"
                  style={{
                    width: 8,
                    height: 8,
                    left: Math.round(actualCentroid.x) * CELL_SIZE + CELL_SIZE / 2 - 4,
                    top: Math.round(actualCentroid.y) * CELL_SIZE + CELL_SIZE / 2 - 4,
                  }}
                />
              )}
              
              {/* Clickable area for placing dots */}
              <div
                className="absolute inset-0 cursor-crosshair"
                onClick={(e) => {
                  if (showResult || showingAnswer) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
                  const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
                  if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
                    setUserGuess({ x, y });
                  }
                }}
              />
            </div>
            
            {/* Perfect Guess Celebration */}
            {perfectGuess && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-2xl font-bold text-yellow-500 animate-bounce">
                  ✨
                </div>
              </div>
            )}
          </div>

          {/* DOTS Mode Status Messages */}
          <div className="text-xs text-gray-600 text-center w-full">
            {!userGuess && gameStarted && !showResult && (
              <p>Click to place your dot</p>
            )}
            {userGuess && !showResult && (
              <p>Click Validate</p>
            )}
            {showResult && (
              <div className={`transition-all duration-300 ${perfectGuess ? 'text-yellow-600 font-bold scale-110' : ''}`}>
                <span className="text-green-600">Green</span> = optimal, 
                <span className="text-red-600">Red</span> = your dot
                {currentRoundScore === 0 && <span className="text-green-600 font-bold">Perfect!</span>}
              </div>
            )}
            {currentRoundScore !== null && (
              <div className={`font-medium transition-all duration-300 ${perfectGuess ? 'text-yellow-600 scale-110' : 'text-orange-600'}`}>
                Round: {currentRoundScore} pts
              </div>
            )}
          </div>

          {/* DOTS Mode Action Buttons */}
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
      
      {/* Recap Screen */}
      {showRecap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-[300px] w-full max-h-[80vh] overflow-y-auto">
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold text-gray-800 mb-2">Game Complete!</h2>
              <p className="text-sm text-gray-600 mb-3">
                {congratulatoryMessages[Math.floor(Math.random() * congratulatoryMessages.length)]}
              </p>
              <div className="text-lg font-bold text-blue-600">
                Final Score: {score.totalMoves} points
              </div>
            </div>
            
            {/* Round History */}
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-800 mb-2">Round Performance</h3>
              <div className="space-y-2">
                {roundHistory.map((round, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Round {round.round}:</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${
                        round.perfect ? 'text-green-600' : 
                        round.score <= 5 ? 'text-blue-600' : 
                        round.score <= 10 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {round.score} pts
                      </span>
                      {round.perfect && <span className="text-green-600">✨</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Emoji Histogram: stack ◽️ for each instance */}
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-800 mb-2">Score Distribution</h3>
              <div className="flex items-end gap-1 h-24">
                {Array.from({ length: 10 }, (_, i) => {
                  const count = roundHistory.filter(r => r.score === i).length;
                  return (
                    <div key={i} className="flex-1 flex flex-col-reverse items-center h-24 justify-end">
                      {/* Stack ◽️ for each instance */}
                      {count > 0 ? (
                        Array.from({ length: count }).map((_, idx) => (
                          <span key={idx} className="text-2xl leading-none">◽️</span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-lg leading-none">-</span>
                      )}
                      <span className="text-xs text-gray-500 mt-0.5">{i}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Stats */}
            <div className="mb-4 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Perfect rounds:</span>
                <span className="font-medium">{roundHistory.filter(r => r.perfect).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Average score:</span>
                <span className="font-medium">
                  {(roundHistory.reduce((sum, r) => sum + r.score, 0) / roundHistory.length).toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Best round:</span>
                <span className="font-medium">
                  {Math.min(...roundHistory.map(r => r.score))}
                </span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowRecap(false);
                  resetGame();
                }}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors text-sm"
              >
                <RotateCcw size={14} />
                Play Again
              </button>
              <button
                onClick={() => setShowRecap(false)}
                className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-medium transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CentroidGame; 