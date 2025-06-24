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

  const GRID_SIZE = 20;
  const CELL_SIZE = 20;
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
      maxDots: 15,
      clusterBias: 0, // 0 = no clustering, 1 = strong clustering
      clusterRadius: 3
    };

    if (round <= 3) {
      // Early rounds: 3-6 dots, no clustering
      return {
        ...baseConfig,
        minDots: 3,
        maxDots: 6,
        clusterBias: 0
      };
    } else if (round <= 6) {
      // Middle rounds: 5-10 dots, light clustering
      return {
        ...baseConfig,
        minDots: 5,
        maxDots: 10,
        clusterBias: 0.3,
        clusterRadius: 4
      };
    } else {
      // Later rounds: 8-15 dots, strong clustering
      return {
        ...baseConfig,
        minDots: 8,
        maxDots: 15,
        clusterBias: 0.6,
        clusterRadius: 5
      };
    }
  };

  const generateRandomDots = useCallback((round = 1) => {
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
  }, []);

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

  const startNewRound = useCallback(() => {
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
    setGameStarted(true);
  }, [generateRandomDots, score.rounds]);

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
    const moves = calculateManhattanDistance(userGuess, nearestGridPoint);
    const totalRoundScore = moves + timerPenalty;
    
    setCurrentRoundScore(totalRoundScore);
    setScore(prev => ({
      totalMoves: prev.totalMoves + totalRoundScore,
      rounds: prev.rounds + 1
    }));
    
    setShowResult(true);
    setIsTimerRunning(false);
  };

  const resetGame = () => {
    setScore({ totalMoves: 0, rounds: 0 });
    setGameStarted(false);
    setShowResult(false);
    setUserGuess(null);
    setDots([]);
    setActualCentroid(null);
    setCurrentRoundScore(null);
    setShowingAnswer(false);
    setShowExplanation(false);
    setTimer(0);
    setTimerPenalty(0);
    setIsTimerRunning(false);
  };

  useEffect(() => {
    if (gameStarted && !showResult && !showingAnswer) {
      startNewRound();
    }
  }, [gameStarted, startNewRound]);

  // Handle numDots changes only when game hasn't started
  useEffect(() => {
    if (!gameStarted) {
      const newDots = generateRandomDots(1);
      setDots(newDots);
      setActualCentroid(calculateCentroid(newDots));
    }
  }, [numDots, gameStarted, generateRandomDots]);

  const getCurrentDifficulty = () => {
    const currentRound = score.rounds + 1;
    if (currentRound <= 3) return { name: "Easy", color: "text-green-600" };
    if (currentRound <= 6) return { name: "Medium", color: "text-yellow-600" };
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
    const grid = [];
    
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const hasDot = dots.some(dot => dot.x === x && dot.y === y);
        const isUserGuess = userGuess && userGuess.x === x && userGuess.y === y;
        const isActualCentroid = (showResult || showingAnswer) && actualCentroid && 
          Math.abs(Math.round(actualCentroid.x) - x) === 0 && Math.abs(Math.round(actualCentroid.y) - y) === 0;
        
        let cellClass = "w-5 h-5 border border-gray-300 cursor-pointer hover:bg-gray-100 ";
        
        if (hasDot) {
          cellClass += "bg-blue-600 hover:bg-blue-700 ";
        } else if (isUserGuess && !showResult && !showingAnswer) {
          cellClass += "bg-red-400 hover:bg-red-500 ";
        } else if (isUserGuess && (showResult || showingAnswer)) {
          cellClass += "bg-red-500 ";
        }
        
        if (isActualCentroid) {
          cellClass += "bg-green-500 ";
        }
        
        grid.push(
          <div
            key={`${x}-${y}`}
            className={cellClass}
            onClick={() => handleCellClick(x, y)}
            style={{
              gridColumn: x + 1,
              gridRow: y + 1,
            }}
          />
        );
      }
    }
    
    return grid;
  };

  const renderVectors = () => {
    if ((!showResult && !showingAnswer) || !actualCentroid) return null;
    
    const nearestGridPoint = findNearestGridPoint(actualCentroid);
    
    return dots.map((dot, index) => {
      const startX = (dot.x + 0.5) * CELL_SIZE;
      const startY = (dot.y + 0.5) * CELL_SIZE;
      const endX = (nearestGridPoint.x + 0.5) * CELL_SIZE;
      const endY = (nearestGridPoint.y + 0.5) * CELL_SIZE;
      
      return (
        <line
          key={index}
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke="#10b981"
          strokeWidth="1"
          opacity="0.6"
        />
      );
    });
  };

  const getCentroidExplanation = () => {
    if (!actualCentroid || !dots.length) return null;
    
    const sumX = dots.reduce((sum, dot) => sum + dot.x, 0);
    const sumY = dots.reduce((sum, dot) => sum + dot.y, 0);
    const nearestGridPoint = findNearestGridPoint(actualCentroid);
    
    return {
      exactCentroid: { x: actualCentroid.x.toFixed(2), y: actualCentroid.y.toFixed(2) },
      nearestGridPoint: nearestGridPoint,
      calculation: {
        sumX,
        sumY,
        count: dots.length,
        avgX: (sumX / dots.length).toFixed(2),
        avgY: (sumY / dots.length).toFixed(2)
      }
    };
  };

  const averageScore = score.rounds > 0 ? (score.totalMoves / score.rounds).toFixed(1) : 0;
  const isGameComplete = score.rounds >= MAX_ROUNDS;
  const explanation = getCentroidExplanation();

  return (
    <div className="flex flex-col items-center p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Centroid Matrix Game</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-4">
            {gameStarted && (
              <div className="flex items-center gap-2">
                <TrendingUp className="text-gray-600" size={16} />
                <span className="text-sm font-medium text-gray-700">Difficulty:</span>
                <span className={`text-sm font-bold ${getCurrentDifficulty().color}`}>
                  {getCurrentDifficulty().name}
                </span>
                <span className="text-xs text-gray-500">
                  (Round {score.rounds + 1}/{MAX_ROUNDS})
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="font-medium">Round: </span>
                <span className="text-blue-600">{score.rounds}</span>
                <span className="text-gray-500">/{MAX_ROUNDS}</span>
                {score.rounds > 0 && (
                  <>
                    <span className="text-gray-600 ml-3">Total Moves: </span>
                    <span className="text-red-600 font-medium">{score.totalMoves}</span>
                    <span className="text-gray-600 ml-2">(Avg: {averageScore})</span>
                  </>
                )}
                {currentRoundScore !== null && (
                  <span className="text-orange-600 ml-3 font-medium">
                    This round: {currentRoundScore} moves
                    {timerPenalty > 0 && (
                      <span className="text-red-600"> (+{timerPenalty} time penalty)</span>
                    )}
                  </span>
                )}
              </div>
              
              <button
                onClick={resetGame}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
              >
                <RotateCcw size={14} />
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          {!gameStarted ? (
            <div>
              <p className="mb-2">Goal: Complete {MAX_ROUNDS} rounds with the lowest total score. Lower scores are better!</p>
              <div className="bg-blue-50 p-3 rounded-lg mb-3">
                <p className="font-medium text-blue-800 mb-1">Scoring System:</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• <span className="font-medium">Distance penalty:</span> Manhattan distance from your guess to optimal centroid</li>
                  <li>• <span className="font-medium">Time penalty:</span> +1 point for each second after 3 seconds</li>
                  <li>• <span className="font-medium">Total score:</span> Distance + Time penalties</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="font-medium text-blue-800 mb-1">Difficulty Progression:</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• <span className="font-medium">Rounds 1-3:</span> Easy (3-6 dots, no clustering)</li>
                  <li>• <span className="font-medium">Rounds 4-6:</span> Medium (5-10 dots, light clustering)</li>
                  <li>• <span className="font-medium">Rounds 7-10:</span> Hard (8-15 dots, strong clustering)</li>
                </ul>
              </div>
            </div>
          ) : isGameComplete ? (
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600 mb-2">Game Complete!</div>
              <div className="text-base">
                Final Score: <span className="font-bold text-red-600">{score.totalMoves}</span> total points
                <span className="text-gray-500"> (Average: {averageScore} points per round)</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">Lower scores are better! Try again to improve.</div>
            </div>
          ) : showingAnswer ? (
            <div className="text-center">
              <div className="text-lg font-bold text-green-600 mb-2">
                Round {score.rounds} Solution
              </div>
              <div className="text-base">
                Your total score was <span className="font-bold text-red-600">{currentRoundScore}</span> points
                {timerPenalty > 0 && (
                  <span className="text-red-600"> (including {timerPenalty} time penalty)</span>
                )}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Study the solution below. Click "Next Round" when ready to continue.
              </div>
            </div>
          ) : !userGuess ? (
            <div>
              <p>Round {score.rounds + 1}/{MAX_ROUNDS}: Click to estimate the centroid. Be quick - time penalties start after 3 seconds!</p>
              <p className="text-xs text-gray-500 mt-1">
                Current difficulty: <span className={`font-medium ${getCurrentDifficulty().color}`}>{getCurrentDifficulty().name}</span>
                {getCurrentDifficulty().name !== "Easy" && " (dots may be clustered)"}
              </p>
            </div>
          ) : !showResult ? (
            <div>
              <p>Click 'Validate' to see your score. Timer is running - each second after 3 adds a penalty point!</p>
              {timer > TIMER_PENALTY_THRESHOLD && (
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ Time penalty active: +{timerPenalty} points so far
                </p>
              )}
            </div>
          ) : (
            <div>
              <span className="text-green-600 font-medium">Green square</span> = optimal centroid, 
              <span className="text-red-600 font-medium ml-2">Red square</span> = your guess
              {currentRoundScore === 0 && <span className="text-green-600 font-bold ml-2">Perfect!</span>}
            </div>
          )}
        </div>
      </div>

      {!gameStarted ? (
        <button
          onClick={() => setGameStarted(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Target size={20} />
          Start Game
        </button>
      ) : (
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Timer Display - Left Side */}
          {gameStarted && (
            <div className="flex-shrink-0">
              <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="text-gray-600" size={20} />
                  <span className="text-sm font-medium text-gray-700">Timer</span>
                </div>
                <div className={`text-2xl font-bold ${getTimerColor()}`}>
                  {formatTime(timer)}
                </div>
                {timerPenalty > 0 && (
                  <div className="text-xs text-red-600 mt-1">
                    +{timerPenalty} penalty points
                  </div>
                )}
                {timer <= TIMER_PENALTY_THRESHOLD && (
                  <div className="text-xs text-green-600 mt-1">
                    No penalty yet
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Static Grid - Left Side */}
          <div className="flex-shrink-0">
            <div className="relative bg-white rounded-lg shadow-lg p-4">
              <div
                className="grid gap-0 border-2 border-gray-400"
                style={{
                  gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                  gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                }}
              >
                {renderGrid()}
              </div>
              
              {(showResult || showingAnswer) && (
                <svg
                  className="absolute top-4 left-4 pointer-events-none"
                  width={GRID_SIZE * CELL_SIZE}
                  height={GRID_SIZE * CELL_SIZE}
                >
                  {renderVectors()}
                </svg>
              )}
            </div>
          </div>

          {/* Action Panel - Right Side */}
          <div className="flex flex-col gap-4 min-w-[300px]">
            {/* Primary Action Buttons */}
            {userGuess && !showResult && !showingAnswer && (
              <div className="bg-white rounded-lg shadow-lg p-4">
                <button
                  onClick={validateGuess}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Check size={20} />
                  Validate
                </button>
              </div>
            )}

            {showResult && score.rounds < MAX_ROUNDS && (
              <div className="bg-white rounded-lg shadow-lg p-4">
                <button
                  onClick={proceedToNextRound}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <ArrowRight size={20} />
                  Next Round ({score.rounds}/{MAX_ROUNDS})
                </button>
              </div>
            )}

            {/* Game Complete Button - Show after final round */}
            {showResult && isGameComplete && (
              <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="text-center mb-3">
                  <div className="text-lg font-bold text-blue-600">Game Complete!</div>
                  <div className="text-sm text-gray-600">
                    Final Score: <span className="font-bold text-red-600">{score.totalMoves}</span> moves
                  </div>
                </div>
                <button
                  onClick={resetGame}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  <RotateCcw size={20} />
                  Play Again
                </button>
              </div>
            )}

            {/* Solution Explanation Panel */}
            {showingAnswer && explanation && (
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator className="text-green-600" size={20} />
                  <h3 className="text-lg font-bold text-gray-800">Centroid Calculation</h3>
                </div>
                
                <div className="space-y-4 mb-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Coordinates Summary</h4>
                    <div className="text-sm space-y-1">
                      <div><span className="font-medium">Total dots:</span> {explanation.calculation.count}</div>
                      <div><span className="font-medium">Sum of X coordinates:</span> {explanation.calculation.sumX}</div>
                      <div><span className="font-medium">Sum of Y coordinates:</span> {explanation.calculation.sumY}</div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Centroid Results</h4>
                    <div className="text-sm space-y-1">
                      <div><span className="font-medium">Exact centroid:</span> ({explanation.exactCentroid.x}, {explanation.exactCentroid.y})</div>
                      <div><span className="font-medium">Nearest grid point:</span> ({explanation.nearestGridPoint.x}, {explanation.nearestGridPoint.y})</div>
                      <div><span className="font-medium">Your distance:</span> <span className="text-red-600 font-bold">{currentRoundScore} moves</span></div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Calculation Steps</h4>
                  <div className="text-sm space-y-2">
                    <div>1. <span className="font-medium">Average X:</span> {explanation.calculation.sumX} ÷ {explanation.calculation.count} = {explanation.calculation.avgX}</div>
                    <div>2. <span className="font-medium">Average Y:</span> {explanation.calculation.sumY} ÷ {explanation.calculation.count} = {explanation.calculation.avgY}</div>
                    <div>3. <span className="font-medium">Round to grid:</span> ({explanation.calculation.avgX}, {explanation.calculation.avgY}) → ({explanation.nearestGridPoint.x}, {explanation.nearestGridPoint.y})</div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400">
                  <div className="flex items-start gap-2">
                    <Info className="text-yellow-600 mt-0.5" size={16} />
                    <div className="text-sm text-yellow-800">
                      <strong>Tip:</strong> The centroid is the "balance point" of all dots. 
                      Each green line shows the distance from a dot to the optimal centroid. 
                      Your goal is to minimize the total distance from your guess to the optimal point.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Optional View Detailed Solution Section - Bottom of page */}
      {showResult && !showingAnswer && (
        <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">Want to learn more about the calculation?</p>
            <button
              onClick={showAnswer}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors mx-auto"
            >
              <Target size={18} />
              View Detailed Solution
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Optional - you can continue without viewing details
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 text-xs text-gray-500 max-w-md text-center">
        <p><strong>How to play:</strong> Complete {MAX_ROUNDS} rounds estimating centroids. 
        Your score is the total number of grid moves needed to reach the optimal centroid from your guesses. 
        <strong>Lower scores are better!</strong> The green lines show distances from each dot to the optimal grid point.</p>
      </div>
    </div>
  );
};

export default CentroidGame; 