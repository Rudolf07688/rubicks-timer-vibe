import React, { useEffect, useState, useCallback } from 'react';
import './Scramble.css';

const Scramble = ({ isRunning, generateNewScramble }) => {
  const [scramble, setScramble] = useState('');

  // Check if two moves are on the same axis and opposite
  const isOpposite = useCallback((move1, move2) => {
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

  // Generate a random scramble sequence for 3x3 cube
  const generateScrambleSequence = useCallback(() => {
    const moves = ["R", "L", "U", "D", "F", "B"];
    const modifiers = ["", "'", "2"];
    const scrambleLength = 20; // Standard 3x3 scramble length
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

  // Generate a new scramble only when the timer stops (after a solve) or on initial mount
  useEffect(() => {
    // On initial mount, if no scramble exists, generate one
    if (scramble === '') {
      const newScramble = generateScrambleSequence();
      setScramble(newScramble);
      
      if (generateNewScramble) {
        generateNewScramble(newScramble);
      }
    }
  }, [scramble, generateNewScramble, generateScrambleSequence]);
  
  // Generate a new scramble when the timer transitions from running to stopped
  useEffect(() => {
    // Only generate a new scramble when the timer transitions from running to stopped
    if (isRunning === false && scramble !== '') {
      const newScramble = generateScrambleSequence();
      setScramble(newScramble);
      
      if (generateNewScramble) {
        generateNewScramble(newScramble);
      }
    }
  }, [isRunning, generateNewScramble, scramble, generateScrambleSequence]);

  return (
    <div className="scramble-container">
      <h3>Scramble:</h3>
      <div className="scramble-text">{scramble}</div>
    </div>
  );
};

export default Scramble;