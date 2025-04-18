import React, { useState, useEffect, useRef } from 'react';
import './Timer.css';

const Timer = ({ onNewSolve, onTimeUpdate, isRunning, setIsRunning }) => {
  const [time, setTime] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);

  // Create a ref to track running state to avoid closure issues
  const isRunningRef = useRef(false);
  
  // Update the ref whenever isRunning changes
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  // Start the timer
  const startTimer = React.useCallback(() => {
    // Reset time to 0
    setTime(0);
    startTimeRef.current = Date.now();
    
    // Start the timer
    setIsRunning(true);
    isRunningRef.current = true; // Update ref immediately
    
    // Use requestAnimationFrame for smoother updates
    const updateTimer = () => {
      if (startTimeRef.current) {
        const elapsedTime = Date.now() - startTimeRef.current;
        setTime(elapsedTime);
        
        // Pass the current time to the parent component for the 3D cube animation
        if (onTimeUpdate) {
          onTimeUpdate(elapsedTime);
        }
      }
      
      // Only continue updating if the timer is still running
      // Use the ref instead of the state to avoid closure issues
      if (isRunningRef.current) {
        timerRef.current = requestAnimationFrame(updateTimer);
      }
    };
    
    timerRef.current = requestAnimationFrame(updateTimer);
  }, [setIsRunning]);

  // Stop the timer
  const stopTimer = React.useCallback(() => {
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
    }
    
    setIsRunning(false);
    isRunningRef.current = false; // Update ref immediately
    
    // Only record solves that are at least 0.5 seconds
    // (to avoid accidental triggers)
    if (time >= 500) {
      onNewSolve(time);
    }
  }, [onNewSolve, setIsRunning, time]);

  // Handle spacebar press to start/stop timer
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only respond to spacebar
      if (e.code !== 'Space') return;
      
      // Prevent default spacebar action (page scroll)
      e.preventDefault();
      
      if (!isRunning) {
        // Show ready state on press
        setIsReady(true);
      } else {
        // Stop the timer immediately on press when running
        stopTimer();
      }
    };

    const handleKeyUp = (e) => {
      if (e.code !== 'Space') return;
      
      // Start the timer on spacebar release if we're in ready state
      if (isReady && !isRunning) {
        startTimer();
        setIsReady(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isRunning, isReady, setIsRunning, startTimer, stopTimer]);


  // Format time display (mm:ss.ms)
  const formatTime = (timeMs) => {
    const ms = Math.floor((timeMs % 1000) / 10);
    const seconds = Math.floor((timeMs / 1000) % 60);
    const minutes = Math.floor(timeMs / 60000);
    
    return `${minutes > 0 ? `${minutes}:` : ''}${seconds.toString().padStart(minutes > 0 ? 2 : 1, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  // Determine the timer's CSS class based on its state
  const timerClass = isReady ? 'timer ready' : isRunning ? 'timer running' : 'timer';

  return (
    <div className={timerClass}>
      <div className="time-display">{formatTime(time)}</div>
      <div className="timer-instructions">
        {!isRunning ? 'Press and hold spacebar, then release to start' : 'Press spacebar to stop'}
      </div>
    </div>
  );
};

export default Timer;