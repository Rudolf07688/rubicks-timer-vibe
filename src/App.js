import React, { useState, useEffect } from 'react';
import './App.css';
import Timer from './components/Timer';
import Scramble from './components/Scramble';
import SolvesList from './components/SolvesList';
import Statistics from './components/Statistics';
import Controls from './components/Controls';
import RubiksCube from './components/RubiksCube';

function App() {
  // State for timer
  const [isRunning, setIsRunning] = useState(false);
  
  // State for current time (for the 3D cube animation)
  const [currentTime, setCurrentTime] = useState(0);
  
  // State for solves
  const [solves, setSolves] = useState([]);
  
  // State for current scramble
  const [currentScramble, setCurrentScramble] = useState('');
  
  // Check if two moves are on the same axis and opposite
  const isOpposite = React.useCallback((move1, move2) => {
    const opposites = {
      'R': 'L',
      'L': 'R',
      'U': 'D',
      'D': 'U',
      'F': 'B',
      'B': 'F'
    };
    
    return opposites[move1] === move2;
  }, []);
  
  // Helper function to generate a random scramble
  const generateRandomScramble = React.useCallback(() => {
    const moves = ["R", "L", "U", "D", "F", "B"];
    const modifiers = ["", "'", "2"];
    const scrambleLength = 20;
    let scramble = [];
    let lastMove = null;
    let secondLastMove = null;

    for (let i = 0; i < scrambleLength; i++) {
      let move;
      
      // Avoid moves that undo the previous move or repeat the same face
      do {
        move = moves[Math.floor(Math.random() * moves.length)];
      } while (
        // Avoid same face moves (e.g., R followed by R', R2, etc.)
        move === lastMove ||
        // Avoid redundant sequences on the same axis (e.g., R L R)
        (move === secondLastMove &&
         isOpposite(move, lastMove))
      );

      // Add a random modifier to the move
      const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
      scramble.push(`${move}${modifier}`);
      
      // Update move history
      secondLastMove = lastMove;
      lastMove = move;
    }

    return scramble.join(' ');
  }, [isOpposite]);

  // Load solves from localStorage on component mount
  useEffect(() => {
    const savedSolves = localStorage.getItem('rubiksSolves');
    if (savedSolves) {
      setSolves(JSON.parse(savedSolves));
    }
  }, []);
  
  // Generate initial scramble if none exists
  useEffect(() => {
    if (!currentScramble) {
      const initialScramble = generateRandomScramble();
      setCurrentScramble(initialScramble);
    }
  }, [currentScramble, generateRandomScramble]);
  
  // Save solves to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('rubiksSolves', JSON.stringify(solves));
  }, [solves]);
  
  // Handle new solve
  const handleNewSolve = (time) => {
    const newSolve = {
      id: Date.now(),
      time,
      date: new Date().toISOString(),
      scramble: currentScramble,
      isDNF: false,
      penalty: false
    };
    
    // Add new solve to the beginning of the array
    setSolves(prevSolves => [newSolve, ...prevSolves]);
  };
  
  // Handle delete solve
  const handleDeleteSolve = (id) => {
    setSolves(prevSolves => prevSolves.filter(solve => solve.id !== id));
  };
  
  // Handle toggle DNF
  const handleToggleDNF = (id) => {
    setSolves(prevSolves => 
      prevSolves.map(solve => 
        solve.id === id 
          ? { ...solve, isDNF: !solve.isDNF, penalty: solve.isDNF ? solve.penalty : false } 
          : solve
      )
    );
  };
  
  // Handle toggle penalty
  const handleTogglePenalty = (id) => {
    setSolves(prevSolves => 
      prevSolves.map(solve => 
        solve.id === id 
          ? { ...solve, penalty: !solve.penalty } 
          : solve
      )
    );
  };
  
  // Handle reset (for the most recent solve)
  const handleReset = () => {
    if (solves.length > 0 && !isRunning) {
      // Remove the most recent solve
      setSolves(prevSolves => prevSolves.slice(1));
    }
  };
  
  // Handle DNF (for the most recent solve)
  const handleDNF = () => {
    if (solves.length > 0 && !isRunning) {
      handleToggleDNF(solves[0].id);
    }
  };
  
  // Handle penalty (for the most recent solve)
  const handlePenalty = () => {
    if (solves.length > 0 && !isRunning) {
      handleTogglePenalty(solves[0].id);
    }
  };
  
  // Handle new scramble generation
  const handleNewScramble = (scramble) => {
    setCurrentScramble(scramble);
  };
  
  // Handle time update (for the 3D cube animation)
  const handleTimeUpdate = (time) => {
    setCurrentTime(time);
  };
  

  return (
    <div className="App">
      <header className="App-header">
        <h1>Rubik's Timer</h1>
      </header>
      
      <main className="App-main">
        <Scramble 
          isRunning={isRunning} 
          generateNewScramble={handleNewScramble} 
        />
        
        <RubiksCube
          isRunning={isRunning}
          time={currentTime}
        />
        
        <Timer
          onNewSolve={handleNewSolve}
          onTimeUpdate={handleTimeUpdate}
          isRunning={isRunning}
          setIsRunning={setIsRunning}
        />
        
        <Controls 
          isRunning={isRunning} 
          onReset={handleReset} 
          onDNF={handleDNF} 
          onPenalty={handlePenalty} 
        />
        
        <div className="stats-and-solves">
          <Statistics solves={solves} />
          <SolvesList 
            solves={solves} 
            onDeleteSolve={handleDeleteSolve} 
            onToggleDNF={handleToggleDNF} 
            onTogglePenalty={handleTogglePenalty} 
          />
        </div>
      </main>
      
      <footer className="App-footer">
        <p>Press spacebar to start/stop the timer</p>
      </footer>
    </div>
  );
}

export default App;
