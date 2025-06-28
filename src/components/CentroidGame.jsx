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
  const [gameMode, setGameMode] = useState('GRID'); // 'GRID', 'DOTS', 'FLOW', 'GRID2', 'GRIDFAST'
  const [roundHistory, setRoundHistory] = useState([]);
  const [showRecap, setShowRecap] = useState(false);
  const [flowDots, setFlowDots] = useState([]); // For FLOW mode: {x, y, vx, vy, phase, trail: [{x, y, t}]}
  const [isFlowRunning, setIsFlowRunning] = useState(false);
  const FLOW_TRAIL_LENGTH = 12;
  const FLOW_DOT_RADIUS = 6;
  const FLOW_DOT_SPEED = 0.08; // px/ms
  const FLOW_PULSE_SPEED = 0.0025; // radians/ms
  const [showCalcDetails, setShowCalcDetails] = useState(false);
  const [gridFastRoundDisplay, setGridFastRoundDisplay] = useState('');
  const [gridFastCountdown, setGridFastCountdown] = useState(0);
  const [gridFastPhase, setGridFastPhase] = useState('waiting'); // 'waiting', 'round', 'go', 'playing'
  const [gridFastPointsDisplay, setGridFastPointsDisplay] = useState('');
  const [gridFastPointsColor, setGridFastPointsColor] = useState('');
  const [gridFastPointsVisible, setGridFastPointsVisible] = useState(false);
  const [gridFastDowntimeVisible, setGridFastDowntimeVisible] = useState(false);

  // Congratulatory messages
  const messagesAbove25 = [
    "Nice try, but you've got more in you! Push it!",
    "Not bad, champ—now show us your best!",
    "Solid effort, but you're just warming up! Go harder!",
    "That's a start, now crank it up a notch!",
    "Pretty good, but you're capable of greatness! Dig in!",
    "Decent move, but you've got bigger plays to make!",
    "Not too shabby, but let's see your A-game!",
    "You're getting there—now unleash the beast!",
    "Good hustle, but you're not at your peak yet!",
    "That's the spirit, now take it to the next level!",
    "Alright, but you're holding back! Let it rip!",
    "Nice one, but I know you've got more fire!",
    "You're on the board, now aim for the stars!",
    "Not bad at all, but you're destined for better!",
    "Solid, but you've got untapped potential—use it!",
    "That's a good base, now build it bigger!",
    "You're in the game, now dominate it!",
    "Fair shot, but your best is still coming!",
    "Getting there, but you're not done shining!",
    "Okay, but you're made for epic—show it!"
  ];
  const messages8to9 = [
    "Single Digit! Amazing!",
    "Getting close to beating the Creator...",
    "Jelaludo is proud, but you got to go sub 7",
    "Just a few more perfect rounds... so close...",
    "Impressive intuition.",
    "Sub 10!"
  ];
  const messages7andBelow = [
    "Unreal! You're so good, you outplayed the creator!",
    "Epic! You just crushed it beyond the creator's dreams!",
    "Wow, you're a legend—beat Gerald at his own game!",
    "Insane skills! You've surpassed the creator's best!",
    "Holy smokes, you're unstoppable—creator who?",
    "Phenomenal! You just schooled the game's creator!",
    "Mind-blowing! You've outdone the creator's wildest expectations!",
    "You're a beast! Even the creator can't match that!",
    "Incredible! You've topped the creator's masterpiece!",
    "Absolute fire! You beat the creator with style!"
  ];
  const messages10to25 = [
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

  // Pick a message bucket based on final score
  function getRecapMessage(finalScore) {
    if (finalScore > 25) {
      return messagesAbove25[Math.floor(Math.random() * messagesAbove25.length)];
    } else if (finalScore >= 10) {
      return messages10to25[Math.floor(Math.random() * messages10to25.length)];
    } else if (finalScore >= 8) {
      return messages8to9[Math.floor(Math.random() * messages8to9.length)];
    } else {
      return messages7andBelow[Math.floor(Math.random() * messages7andBelow.length)];
    }
  }

  // Mobile-optimized grid size
  const GRID_SIZE = 17; // 340px / 20px = 17
  const CELL_SIZE = 20; // 340px / 17 = 20
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
    if (gameMode === 'GRID2') {
      if (round <= 3) {
        // Hard
        return {
          minDots: 10,
          maxDots: 16,
          clusterBias: 0.7,
          clusterRadius: 4
        };
      } else if (round <= 7) {
        // Very Hard
        return {
          minDots: 14,
          maxDots: 22,
          clusterBias: 0.85,
          clusterRadius: 5
        };
      } else {
        // Insane
        return {
          minDots: 18,
          maxDots: 28,
          clusterBias: 0.95,
          clusterRadius: 6
        };
      }
    } else if (gameMode === 'GRIDFAST') {
      // Same as regular GRID mode for now
      const baseConfig = {
        minDots: 3,
        maxDots: 12, // Reduced for mobile
        clusterBias: 0, // 0 = no clustering, 1 = strong clustering
        clusterRadius: 3
      };
      
      if (round <= 3) {
        return { ...baseConfig, minDots: 3, maxDots: 8 };
      } else if (round <= 7) {
        return { ...baseConfig, minDots: 5, maxDots: 10 };
      } else {
        return { ...baseConfig, minDots: 7, maxDots: 12 };
      }
    } else {
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

  const calculateChebyshevDistance = (point1, point2) => {
    return Math.max(Math.abs(point1.x - point2.x), Math.abs(point1.y - point2.y));
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
    setGridFastRoundDisplay('');
    setGridFastCountdown(0);
    setGridFastPhase('waiting');
    setGridFastPointsDisplay('');
    setGridFastPointsColor('');
    setGridFastPointsVisible(false);
    setGridFastDowntimeVisible(false);
  };

  const proceedToNextRound = () => {
    if (gameMode === 'GRIDFAST') {
      // GRID FAST: Auto-advance to next round
      setGridFastDowntimeVisible(false); // Hide grey overlay
      const upcomingRound = score.rounds + 1; // This is the round we're about to start
      if (upcomingRound <= MAX_ROUNDS) {
        startGridFastRound(upcomingRound);
      } else {
        setTimeout(() => setShowRecap(true), 1000);
      }
    } else {
      // Regular modes: Manual advance
      setShowResult(false);
      setShowingAnswer(false);
      setUserGuess(null);
      setTimer(0);
      setTimerPenalty(0);
      setCurrentRoundScore(null);
      startNewRound();
    }
  };

  const showAnswer = () => {
    setShowingAnswer(true);
    setShowExplanation(true);
  };

  // GRID and DOTS: handle cell click (snap to integer grid)
  const handleCellClick = (x, y) => {
    if (showResult || showingAnswer) return;
    const newGuess = { x: Math.round(x), y: Math.round(y) }; // always integer
    
    // GRID FAST: If we already have a guess at this position, validate it
    if (gameMode === 'GRIDFAST' && userGuess && userGuess.x === newGuess.x && userGuess.y === newGuess.y) {
      validateGuess();
    } else {
      // Place the guess
      setUserGuess(newGuess);
    }
  };

  // validateGuess: use correct logic for each mode
  const validateGuess = () => {
    if (!userGuess || (!actualCentroid && gameMode !== 'FLOW')) return;
    let distance, totalScore;
    if (gameMode === 'GRID' || gameMode === 'GRID2' || gameMode === 'GRIDFAST') {
      // GRID/GRID2/GRIDFAST: integer guess, integer centroid, Chebyshev distance
      const nearestGridPoint = findNearestGridPoint(actualCentroid);
      const intGuess = { x: Math.round(userGuess.x), y: Math.round(userGuess.y) };
      distance = calculateChebyshevDistance(intGuess, nearestGridPoint);
      totalScore = distance + timerPenalty;
    } else if (gameMode === 'DOTS') {
      // DOTS: integer guess, float centroid
      const intGuess = { x: Math.round(userGuess.x), y: Math.round(userGuess.y) };
      distance = calculateEuclideanDistance(intGuess, actualCentroid);
      const baseScore = distance < 0.5 ? 0 : Math.round(distance * 2);
      totalScore = baseScore + timerPenalty;
    } else if (gameMode === 'FLOW') {
      // FLOW: float guess, float centroid
      const centroid = getFlowCentroid();
      distance = calculateEuclideanDistance(userGuess, centroid);
      const baseScore = distance < 0.5 ? 0 : Math.round(distance * 2);
      totalScore = baseScore + timerPenalty;
    }
    
    const currentRound = score.rounds + 1;
    const roundData = {
      round: currentRound,
      score: totalScore,
      distance: distance,
      timerPenalty: timerPenalty,
      timer: timer,
      difficulty: getCurrentDifficulty().name,
      perfect: (gameMode === 'GRID' || gameMode === 'GRID2' || gameMode === 'GRIDFAST') ? distance === 0 : distance < 0.5
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
    const isPerfect = (gameMode === 'GRID' || gameMode === 'GRID2' || gameMode === 'GRIDFAST') ? distance === 0 : distance < 0.5;
    if (isPerfect) {
      setPerfectGuess(true);
      // Clear the effect after 2 seconds
      setTimeout(() => setPerfectGuess(false), 2000);
    }
    
    // Show solution vectors automatically for GRID, GRID2, and DOTS
    if (gameMode === 'GRID' || gameMode === 'GRID2' || gameMode === 'GRIDFAST' || gameMode === 'DOTS') {
      setShowingAnswer(true);
    }
    
    // GRID FAST: Show points display and solution simultaneously
    if (gameMode === 'GRIDFAST') {
      setGridFastDowntimeVisible(true); // Show grey overlay
      showGridFastPoints(totalScore);
      // Show solution vectors immediately as well
      setShowingAnswer(true);
    }
    
    // GRID FAST: Auto-advance after showing solution and score together
    if (gameMode === 'GRIDFAST') {
      setTimeout(() => {
        // Use the currentRound that was just completed to calculate the next round
        const nextRound = currentRound + 1;
        if (nextRound <= MAX_ROUNDS) {
          startGridFastRound(nextRound);
        } else {
          // Final round completed - show recap after points display finishes
          setTimeout(() => setShowRecap(true), 2000); // Wait for points display to finish
        }
      }, 1000); // Show solution and score together for 1 second then auto-advance
    }
    
    // Show recap if this was the final round (for non-GRID FAST modes)
    if (currentRound >= MAX_ROUNDS && gameMode !== 'GRIDFAST') {
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
    setGridFastRoundDisplay('');
    setGridFastCountdown(0);
    setGridFastPhase('waiting');
    setGridFastPointsDisplay('');
    setGridFastPointsColor('');
    setGridFastPointsVisible(false);
    setGridFastDowntimeVisible(false);
  };

  const getCurrentDifficulty = () => {
    if (!gameStarted) return { name: 'MODE', color: 'text-gray-600' };
    
    const round = score.rounds + 1;
    if (gameMode === 'GRID2') {
      if (round <= 3) return { name: 'HARD', color: 'text-orange-600' };
      if (round <= 7) return { name: 'VERY HARD', color: 'text-red-600' };
      return { name: 'INSANE', color: 'text-purple-600' };
    } else if (gameMode === 'GRIDFAST') {
      if (round <= 3) return { name: 'EASY', color: 'text-green-600' };
      if (round <= 7) return { name: 'MEDIUM', color: 'text-yellow-600' };
      return { name: 'HARD', color: 'text-orange-600' };
    } else {
      if (round <= 3) return { name: 'EASY', color: 'text-green-600' };
      if (round <= 7) return { name: 'MEDIUM', color: 'text-yellow-600' };
      return { name: 'HARD', color: 'text-orange-600' };
    }
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
        // User guess color takes precedence
        if (isUserGuess && showResult) {
          cellClass += " bg-red-500 border-red-600";
          cellContent = <div className="w-full h-full bg-red-500 rounded-sm"></div>;
        } else if (isUserGuess && !showResult) {
          cellClass += " bg-orange-400 border-orange-500";
          cellContent = <div className="w-full h-full bg-orange-400 rounded-sm"></div>;
        } else if (isActualCentroid && showResult) {
          cellClass += " bg-green-500 border-green-600";
          cellContent = <div className="w-full h-full bg-green-500 rounded-sm"></div>;
        } else if (isDot) {
          cellClass += " bg-blue-500 border-blue-600";
          cellContent = <div className="w-full h-full bg-blue-500 rounded-sm"></div>;
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

  // FLOW mode: unique roundId for animation effect
  const flowRoundId = `${gameMode}-r${score.rounds}`;

  // FLOW mode: initialize moving dots (gentle, arcing motion, even slower, supports 10 rounds)
  useEffect(() => {
    if (gameMode !== 'FLOW' || !gameStarted) return;
    const config = getDifficultyConfig(score.rounds + 1);
    const actualNumDots = Math.floor(Math.random() * (config.maxDots - config.minDots + 1)) + config.minDots;
    const newDots = [];
    for (let i = 0; i < actualNumDots; i++) {
      const x = Math.random() * (GRID_SIZE - 1);
      const y = Math.random() * (GRID_SIZE - 1);
      const angle = Math.random() * 2 * Math.PI;
      const speed = (0.006 + Math.random() * 0.004) / 3; // even slower
      const angularVelocity = ((Math.random() - 0.5) * 0.002) / 3; // even slower arc
      newDots.push({
        x,
        y,
        angle,
        speed,
        angularVelocity,
        phase: Math.random() * Math.PI * 2,
        trail: []
      });
    }
    setFlowDots(newDots);
    setUserGuess(null);
    setShowResult(false);
    setShowingAnswer(false);
    setIsFlowRunning(true);
  }, [flowRoundId, gameStarted]);

  // FLOW mode: animation loop, keyed by roundId
  useEffect(() => {
    if (gameMode !== 'FLOW' || !isFlowRunning) return;
    let running = true;
    let lastTime = performance.now();
    function animate(now) {
      if (!running) return;
      const dt = Math.min(now - lastTime, 32); // cap delta for safety
      lastTime = now;
      setFlowDots(prevDots => prevDots.map(dot => {
        let { x, y, angle, speed, angularVelocity, phase, trail } = dot;
        // Update angle for arc
        angle += angularVelocity * dt;
        // Move
        x += Math.cos(angle) * speed * dt;
        y += Math.sin(angle) * speed * dt;
        // Bounce (billiard)
        if (x < 0) { x = 0; angle = Math.PI - angle; }
        if (x > GRID_SIZE - 1) { x = GRID_SIZE - 1; angle = Math.PI - angle; }
        if (y < 0) { y = 0; angle = -angle; }
        if (y > GRID_SIZE - 1) { y = GRID_SIZE - 1; angle = -angle; }
        // Pulsate
        phase += FLOW_PULSE_SPEED * dt;
        // Trail
        const newTrail = [...trail, { x, y, t: now }].slice(-FLOW_TRAIL_LENGTH);
        return { x, y, angle, speed, angularVelocity, phase, trail: newTrail };
      }));
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
    return () => { running = false; };
  }, [flowRoundId, isFlowRunning]);

  // FLOW: Only stop animation after validation (showResult), not on guess
  useEffect(() => {
    if (gameMode === 'FLOW' && (showResult || showRecap || isGameComplete)) {
      setIsFlowRunning(false);
    } else if (gameMode === 'FLOW' && gameStarted && !showResult && !showRecap && !isGameComplete) {
      setIsFlowRunning(true); // restart animation for new round
    }
  }, [gameMode, showResult, showRecap, isGameComplete, gameStarted, flowRoundId]);

  // FLOW mode: calculate centroid
  const getFlowCentroid = () => {
    if (!flowDots.length) return { x: 0, y: 0 };
    const sumX = flowDots.reduce((sum, d) => sum + d.x, 0);
    const sumY = flowDots.reduce((sum, d) => sum + d.y, 0);
    return { x: sumX / flowDots.length, y: sumY / flowDots.length };
  };

  // FLOW: handle click to place guess (use float coordinates)
  const handleFlowClick = (e) => {
    if (showResult || showingAnswer || !isFlowRunning) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / CELL_SIZE;
    const y = (e.clientY - rect.top) / CELL_SIZE;
    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
      setUserGuess({ x, y }); // keep as float
    }
  };

  // FLOW mode: render
  const renderFlow = () => (
    <div className={`relative bg-black rounded-lg shadow p-2 transition-all duration-300 ${
      perfectGuess ? 'animate-pulse shadow-lg shadow-yellow-200' : ''
    }`}
      style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}
      onClick={handleFlowClick}
    >
      {/* Trails */}
      {flowDots.map((dot, i) => dot.trail.map((pt, j) => (
        <div
          key={i + '-' + j}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 4,
            height: 4,
            left: pt.x * CELL_SIZE + CELL_SIZE / 2 - 2,
            top: pt.y * CELL_SIZE + CELL_SIZE / 2 - 2,
            background: `rgba(96, 165, 250, ${0.15 * (j + 1) / FLOW_TRAIL_LENGTH})`,
            zIndex: 1
          }}
        />
      )))}
      {/* Dots */}
      {flowDots.map((dot, i) => {
        const pulse = 0.7 + 0.3 * Math.sin(dot.phase);
        return (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: FLOW_DOT_RADIUS * 2 * pulse,
              height: FLOW_DOT_RADIUS * 2 * pulse,
              left: dot.x * CELL_SIZE + CELL_SIZE / 2 - FLOW_DOT_RADIUS * pulse,
              top: dot.y * CELL_SIZE + CELL_SIZE / 2 - FLOW_DOT_RADIUS * pulse,
              background: `rgba(96, 165, 250, ${0.7 * pulse})`,
              boxShadow: `0 0 8px 2px rgba(96, 165, 250, ${0.3 * pulse})`,
              zIndex: 2
            }}
          />
        );
      })}
      {/* User guess */}
      {userGuess && (
        <div
          className={`absolute rounded-full ${showResult ? 'bg-red-500' : 'bg-orange-400'}`}
          style={{
            width: 12,
            height: 12,
            left: userGuess.x * CELL_SIZE + CELL_SIZE / 2 - 6,
            top: userGuess.y * CELL_SIZE + CELL_SIZE / 2 - 6,
            zIndex: 3
          }}
        />
      )}
      {/* Actual centroid */}
      {showResult && flowDots.length > 0 && (
        <div
          className="absolute bg-green-500 rounded-full"
          style={{
            width: 12,
            height: 12,
            left: Math.round(getFlowCentroid().x) * CELL_SIZE + CELL_SIZE / 2 - 6,
            top: Math.round(getFlowCentroid().y) * CELL_SIZE + CELL_SIZE / 2 - 6,
            zIndex: 4
          }}
        />
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
  );

  // Only show one congratulatory message
  const [recapMessage, setRecapMessage] = useState(null);
  useEffect(() => {
    if (showRecap && recapMessage === null) {
      setRecapMessage(getRecapMessage(score.totalMoves));
    }
    if (!showRecap) setRecapMessage(null);
  }, [showRecap]);

  // Reset calculation details visibility on new round or reset
  useEffect(() => {
    setShowCalcDetails(false);
  }, [showResult, gameStarted]);

  // GRID FAST: Display points with color coding
  const showGridFastPoints = (points) => {
    let displayText, color;
    
    // Convert to circled numerals
    const circledNumerals = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩', '⑪', '⑫', '⑬', '⑭', '⑮', '⑯', '⑰', '⑱', '⑲', '⑳'];
    
    if (points === 0) {
      displayText = '0';
      color = 'text-green-500';
    } else if (points === 1) {
      displayText = '①';
      color = 'text-blue-500';
    } else if (points === 2) {
      displayText = '②';
      color = 'text-orange-500';
    } else if (points >= 9) {
      displayText = `${circledNumerals[points - 1] || points}?!?!`;
      color = 'text-red-500';
    } else {
      displayText = circledNumerals[points - 1] || points.toString();
      color = 'text-red-500';
    }
    
    setGridFastPointsDisplay(displayText);
    setGridFastPointsColor(color);
    setGridFastPointsVisible(true);
    
    // Hide after 1 second (same as solution display)
    setTimeout(() => {
      setGridFastPointsVisible(false);
      // Also hide solution display since they show together
      if (gameMode === 'GRIDFAST') {
        setShowingAnswer(false);
        setGridFastDowntimeVisible(false);
      }
    }, 1000);
  };

  // GRID FAST: Handle round transitions with countdown
  const startGridFastRound = (roundNumber) => {
    setGridFastPhase('round');
    setGridFastRoundDisplay(`Round ${roundNumber}`);
    setGridFastCountdown(1);
    
    // After 0.5 seconds, show "GO!"
    setTimeout(() => {
      setGridFastRoundDisplay('GO!');
      setGridFastCountdown(1);
      
      // After 0.5 more seconds, start the round
      setTimeout(() => {
        setGridFastPhase('playing');
        setGridFastRoundDisplay('');
        setGridFastCountdown(0);
        startNewRound();
      }, 500);
    }, 500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-2">
      {/* Main container: fixed large width */}
      <div className="w-full max-w-[340px] mx-auto flex flex-col items-center">
        {/* Top Bar: Mode Selector (full width) */}
        <div className="w-full mb-3">
          <div className="bg-white rounded-lg shadow p-2 w-full">
            <div className="flex gap-1 w-full">
              <button
                onClick={() => {
                  setGameMode('GRID');
                  setTimeout(() => resetGame(), 0);
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
                  setTimeout(() => resetGame(), 0);
                }}
                className={`flex-1 py-1 px-2 text-xs font-medium rounded transition-colors ${
                  gameMode === 'DOTS'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                DOTS
                <div className="text-[10px] opacity-70">experimental</div>
              </button>
              <button
                onClick={() => {
                  setGameMode('FLOW');
                  setTimeout(() => resetGame(), 0);
                }}
                className={`flex-1 py-1 px-2 text-xs font-medium rounded transition-colors ${
                  gameMode === 'FLOW'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                FLOW
                <div className="text-[10px] opacity-70">experimental</div>
              </button>
              <button
                onClick={() => {
                  setGameMode('GRID2');
                  setTimeout(() => resetGame(), 0);
                }}
                className={`flex-1 py-1 px-2 text-xs font-medium rounded transition-colors ${
                  gameMode === 'GRID2'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                GRID HARD
              </button>
              <button
                onClick={() => {
                  setGameMode('GRIDFAST');
                  setTimeout(() => resetGame(), 0);
                }}
                className={`flex-1 py-1 px-2 text-xs font-medium rounded transition-colors ${
                  gameMode === 'GRIDFAST'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                GRID FAST
              </button>
            </div>
          </div>
        </div>
        {/* Header: Title, subtitle, round/difficulty/timer */}
        <div className="w-full text-center mb-2">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Centroid Matrix Game</h1>
          <div className="flex items-center justify-center mb-1">
            {/* Timer (large, 3 lines, left) */}
            {gameStarted && (
              <div className="flex flex-col items-center justify-center mr-4" style={{ minWidth: 60 }}>
                <Clock className="text-gray-500 mb-0.5" size={22} />
                <span className={`font-bold ${getTimerColor()} text-2xl leading-tight`} style={{ fontVariantNumeric: 'tabular-nums' }}>{formatTime(timer)}</span>
                <span className="text-xs text-red-600 mt-0.5" style={{ minHeight: 16 }}>{timerPenalty > 0 ? `+${timerPenalty}` : ''}</span>
              </div>
            )}
            <span className="text-base text-gray-500">10 rounds - Lowest Score Wins</span>
          </div>
          <div className="text-xs text-gray-400 mb-1">
            {gameMode === 'GRIDFAST' ? 'Be fast! under 3 seconds' : 'Be fast! under 3 seconds'}
          </div>
          <div className="text-xs text-gray-400 mb-2">
            {gameMode === 'GRIDFAST' ? 'single click to place & validate' : 'Breathe in between rounds'}
          </div>
          <div className="flex justify-between items-center text-xs text-gray-600 w-full mb-1">
            <span>R{gameStarted ? Math.min(score.rounds + 1, MAX_ROUNDS) : 0}/{MAX_ROUNDS}</span>
            <span className={`font-medium ${getCurrentDifficulty().color}`}>{gameStarted ? getCurrentDifficulty().name : 'MODE'}</span>
            {gameStarted && (
              <span className="text-red-600">T:{score.totalMoves}</span>
            )}
          </div>
        </div>
        {/* Large, fixed play area (always same size/position) */}
        <div className="flex flex-col items-center w-full" style={{ width: 340 }}>
          <div className="mb-2" style={{ position: 'relative', width: 340, height: 340 }}>
            {/* GRID FAST Countdown Overlay */}
            {gameMode === 'GRIDFAST' && (gridFastPhase === 'round' || gridFastPhase === 'go') && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 bg-black bg-opacity-50 rounded-lg">
                <div className="text-4xl font-bold text-white animate-pulse">
                  {gridFastRoundDisplay}
                </div>
              </div>
            )}
            
            {/* GRID FAST Downtime Overlay */}
            {gameMode === 'GRIDFAST' && gridFastDowntimeVisible && (
              <div className="absolute inset-0 pointer-events-none z-20 bg-black bg-opacity-50 rounded-lg">
              </div>
            )}
            
            {/* GRID FAST Points Display Overlay */}
            {gameMode === 'GRIDFAST' && gridFastPointsVisible && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-none z-20">
                <div className={`text-5xl font-bold animate-pulse ${gridFastPointsColor}`}>
                  {gridFastPointsDisplay}
                </div>
              </div>
            )}
            
            {/* Perfect Guess Celebration Animation for GRID and DOTS */}
            {(gameMode === 'GRID' || gameMode === 'DOTS') && perfectGuess && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="text-3xl font-bold text-yellow-500 animate-bounce drop-shadow-lg select-none">
                  ✨
                </div>
              </div>
            )}
            {gameMode === 'FLOW' ? (
              <div style={{ width: 340, height: 340 }}>{renderFlow()}</div>
            ) : gameMode === 'DOTS' ? (
              <div
                className="relative bg-black rounded-lg shadow"
                style={{ width: 340, height: 340 }}
              >
                {/* Render pale blue dots */}
                {dots.map((dot, index) => (
                  <div
                    key={index}
                    className="absolute bg-blue-300 rounded-full"
                    style={{
                      width: 10,
                      height: 10,
                      left: dot.x * CELL_SIZE + CELL_SIZE / 2 - 5,
                      top: dot.y * CELL_SIZE + CELL_SIZE / 2 - 5,
                    }}
                  />
                ))}
                {/* User's guess */}
                {userGuess && (
                  <div
                    className={`absolute rounded-full ${showResult ? 'bg-red-500' : 'bg-orange-400'}`}
                    style={{
                      width: 12,
                      height: 12,
                      left: userGuess.x * CELL_SIZE + CELL_SIZE / 2 - 6,
                      top: userGuess.y * CELL_SIZE + CELL_SIZE / 2 - 6,
                    }}
                  />
                )}
                {/* Actual centroid */}
                {showResult && actualCentroid && (
                  <div
                    className="absolute bg-green-500 rounded-full"
                    style={{
                      width: 12,
                      height: 12,
                      left: actualCentroid.x * CELL_SIZE + CELL_SIZE / 2 - 6,
                      top: actualCentroid.y * CELL_SIZE + CELL_SIZE / 2 - 6,
                    }}
                  />
                )}
                {/* Vectors overlay when showingAnswer for GRID and GRID2 */}
                {showingAnswer && ((gameMode === 'GRID' || gameMode === 'GRID2' || gameMode === 'GRIDFAST' || gameMode === 'DOTS') && explanation) && (
                  <svg
                    className="absolute top-0 left-0 pointer-events-none"
                    width={GRID_SIZE * CELL_SIZE}
                    height={GRID_SIZE * CELL_SIZE}
                  >
                    {dots.map((dot, index) => {
                      const startX = dot.x * CELL_SIZE + CELL_SIZE / 2;
                      const startY = dot.y * CELL_SIZE + CELL_SIZE / 2;
                      const nearestGridPoint = findNearestGridPoint(actualCentroid);
                      const endX = nearestGridPoint.x * CELL_SIZE + CELL_SIZE / 2;
                      const endY = nearestGridPoint.y * CELL_SIZE + CELL_SIZE / 2;
                      return (
                        <line
                          key={index}
                          x1={startX}
                          y1={startY}
                          x2={endX}
                          y2={endY}
                          stroke="green"
                          strokeWidth="2"
                          opacity="0.6"
                        />
                      );
                    })}
                  </svg>
                )}
                {/* Clickable area for placing guess */}
                <div
                  className="absolute inset-0 cursor-crosshair"
                  onClick={e => {
                    if (showResult || showingAnswer) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
                    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
                    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
                      const newGuess = { x, y };
                      
                      // GRID FAST: If we already have a guess at this position, validate it
                      if (gameMode === 'GRIDFAST' && userGuess && userGuess.x === newGuess.x && userGuess.y === newGuess.y) {
                        validateGuess();
                      } else {
                        // Place the guess
                        setUserGuess(newGuess);
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div
                className="relative grid gap-0 border border-gray-400 bg-white rounded-lg shadow"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                  gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                  width: 340,
                  height: 340,
                }}
              >
                {gameStarted ? renderGrid() : Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
                  <div key={i} className="border border-gray-200 bg-white" />
                ))}
                {/* Vectors overlay when showingAnswer for GRID and GRID2 */}
                {showingAnswer && ((gameMode === 'GRID' || gameMode === 'GRID2' || gameMode === 'GRIDFAST' || gameMode === 'DOTS') && explanation) && (
                  <svg
                    className="absolute top-0 left-0 pointer-events-none"
                    width={GRID_SIZE * CELL_SIZE}
                    height={GRID_SIZE * CELL_SIZE}
                  >
                    {dots.map((dot, index) => {
                      const startX = dot.x * CELL_SIZE + CELL_SIZE / 2;
                      const startY = dot.y * CELL_SIZE + CELL_SIZE / 2;
                      const nearestGridPoint = findNearestGridPoint(actualCentroid);
                      const endX = nearestGridPoint.x * CELL_SIZE + CELL_SIZE / 2;
                      const endY = nearestGridPoint.y * CELL_SIZE + CELL_SIZE / 2;
                      return (
                        <line
                          key={index}
                          x1={startX}
                          y1={startY}
                          x2={endX}
                          y2={endY}
                          stroke="green"
                          strokeWidth="2"
                          opacity="0.6"
                        />
                      );
                    })}
                  </svg>
                )}
              </div>
            )}
          </div>
          {/* Large, fixed button below play area */}
          <div className="w-full mb-2">
            <button
              onClick={
                !gameStarted ? () => { 
                  setGameStarted(true); 
                  if (gameMode === 'GRIDFAST') {
                    startGridFastRound(1);
                  } else {
                    startNewRound(); 
                  }
                } :
                gameMode === 'GRIDFAST' ? undefined : // GRID FAST: no button actions after start
                userGuess && !showResult && !showingAnswer ? validateGuess :
                showResult && score.rounds < MAX_ROUNDS ? proceedToNextRound :
                undefined
              }
              disabled={
                gameStarted && !userGuess && !showResult ||
                gameStarted && userGuess && (showResult || showingAnswer) && score.rounds >= MAX_ROUNDS ||
                (gameMode === 'GRIDFAST' && gameStarted)
              }
              className={`w-full flex items-center justify-center gap-2 px-0 py-0 rounded-xl font-bold transition-colors text-xl h-16 min-h-[64px] min-w-[64px] shadow-lg
                ${!gameStarted ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                  gameMode === 'GRIDFAST' && gameStarted ? 'bg-gray-400 text-gray-600 cursor-not-allowed' :
                  userGuess && !showResult && !showingAnswer ? 'bg-green-600 hover:bg-green-700 text-white' :
                  showResult && score.rounds < MAX_ROUNDS ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                  'bg-orange-500 hover:bg-orange-600 text-white'}`}
            >
              {!gameStarted ? (
                <>
                  <Target size={28} />
                  START Game
                </>
              ) : gameMode === 'GRIDFAST' && gameStarted ? (
                <>
                  <Target size={28} />
                  PLACE
                </>
              ) : userGuess && !showResult && !showingAnswer ? (
                <>
                  <Check size={28} />
                  VALIDATE
                </>
              ) : showResult && score.rounds < MAX_ROUNDS ? (
                <>
                  <ArrowRight size={28} />
                  Next Round
                </>
              ) : (
                <>
                  <Target size={28} />
                  PLACE
                </>
              )}
            </button>
          </div>
          {/* Fixed-height info area below button */}
          <div style={{ minHeight: 110, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>
            {/* Show correct info based on state, but always reserve space */}
            {gameStarted && !showResult && !showingAnswer && (
              <div className="text-center mt-2 text-xs text-gray-500" style={{ minHeight: 22 }}>
                {gameMode === 'GRIDFAST' ? 'Click to place your guess!' : 'Find the Centroid! Trust your intuition'}
              </div>
            )}
            {showingAnswer && ((gameMode === 'GRID' || gameMode === 'GRID2' || gameMode === 'GRIDFAST' || gameMode === 'DOTS') && explanation) && (
              <>
                <div className="text-center mt-2" style={{ minHeight: 22 }}>
                  <span className="text-green-600 font-bold">Green</span>
                  <span className="text-gray-600"> = optimal, </span>
                  <span className="text-red-600 font-bold">Red</span>
                  <span className="text-gray-600"> = guess</span>
                  <div className={`font-medium mt-1 text-orange-600 text-lg flex items-center justify-center gap-2 ${perfectGuess ? 'text-yellow-600 scale-110 animate-pulse' : ''}`}
                    style={{ minHeight: 28 }}>
                    Round: {currentRoundScore} pts
                    {perfectGuess && <span className="text-yellow-500 font-bold text-lg animate-bounce ml-2">Perfect!</span>}
                  </div>
                </div>
                <div className="text-center mt-2" style={{ minHeight: 22 }}>
                  {!showCalcDetails ? (
                    <button
                      className="text-xs text-gray-500 underline hover:text-gray-700"
                      onClick={() => setShowCalcDetails(true)}
                    >
                      Show Calculation Details
                    </button>
                  ) : (
                    <>
                      <div className="bg-white rounded shadow p-2 text-xs w-full mt-2 inline-block">
                        <div className="font-bold text-gray-800 mb-1">Calculation</div>
                        <div className="space-y-0.5 text-gray-600">
                          <div>Dots: {explanation.calculation.count}</div>
                          <div>Sum: ({explanation.calculation.sumX}, {explanation.calculation.sumY})</div>
                          <div>Avg: ({explanation.calculation.avgX}, {explanation.calculation.avgY})</div>
                          <div>Grid: ({explanation.nearestGridPoint.x}, {explanation.nearestGridPoint.y})</div>
                          <div className="text-red-600 font-medium">Distance: {currentRoundScore}</div>
                        </div>
                      </div>
                      <div>
                        <button
                          className="text-xs text-gray-500 underline hover:text-gray-700 mt-1"
                          onClick={() => setShowCalcDetails(false)}
                        >
                          Hide Calculation Details
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
            {/* If nothing to show, render an empty div to reserve space */}
            {!showingAnswer && (!gameStarted || showResult) && (
              <div style={{ minHeight: 22, visibility: 'hidden' }}>placeholder</div>
            )}
          </div>
        </div>
      </div>
      
      {/* Recap Screen */}
      {showRecap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-[300px] w-full max-h-[80vh] overflow-y-auto">
            {/* Action Buttons at the top */}
            <div className="flex gap-2 mb-4">
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
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-3">
                {recapMessage || ''}
              </p>
              <div className="text-lg font-bold text-blue-600">
                Final Score: {score.totalMoves} points
              </div>
            </div>
            {/* Round History (no title) */}
            <div className="mb-4">
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
            {/* Stats: Perfect rounds and Average score above histogram */}
            <div className="mb-2 text-xs text-gray-600 flex justify-between">
              <span>Perfect rounds: <span className="font-medium">{roundHistory.filter(r => r.perfect).length}</span></span>
              <span>Average score: <span className="font-medium">{(roundHistory.reduce((sum, r) => sum + r.score, 0) / roundHistory.length).toFixed(1)}</span></span>
            </div>
            {/* Emoji Histogram: stack ◽️ for each instance (no title) */}
            <div className="mb-4">
              <div className="flex items-end gap-1 h-24">
                {Array.from({ length: 10 }, (_, i) => {
                  const count = roundHistory.filter(r => (i < 9 ? r.score === i : r.score >= 9)).length;
                  return (
                    <div key={i} className="flex-1 flex flex-col-reverse items-center h-24 justify-end">
                      {/* Stack ◽️ for each instance, smaller font */}
                      {count > 0 ? (
                        Array.from({ length: count }).map((_, idx) => (
                          <span key={idx} className="text-base leading-none">◽️</span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-base leading-none">-</span>
                      )}
                      <span className="text-xs text-gray-500 mt-0.5">{i === 9 ? '9+' : i}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Avg time per round metric */}
            <div className="mb-4 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Avg time per round:</span>
                <span className="font-medium">
                  {roundHistory.length > 0 ?
                    (roundHistory.reduce((sum, r) => sum + (r.timer || 0), 0) / roundHistory.length).toFixed(1)
                    : '0.0'}
                  s
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CentroidGame; 