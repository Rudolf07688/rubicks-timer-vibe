import React from 'react';
import './Statistics.css';

const Statistics = ({ solves }) => {
  // Filter out DNF solves for calculations
  const validSolves = solves.filter(solve => !solve.isDNF);
  
  // Apply +2 penalties to times
  const adjustedTimes = validSolves.map(solve => ({
    ...solve,
    adjustedTime: solve.time + (solve.penalty ? 2000 : 0)
  }));

  // Calculate best time
  const getBestTime = () => {
    if (adjustedTimes.length === 0) return null;
    
    const bestTime = Math.min(...adjustedTimes.map(solve => solve.adjustedTime));
    return bestTime;
  };

  // Calculate worst time
  const getWorstTime = () => {
    if (adjustedTimes.length === 0) return null;
    
    const worstTime = Math.max(...adjustedTimes.map(solve => solve.adjustedTime));
    return worstTime;
  };

  // Calculate average of all solves
  const getAverage = () => {
    if (adjustedTimes.length === 0) return null;
    
    const sum = adjustedTimes.reduce((acc, solve) => acc + solve.adjustedTime, 0);
    return sum / adjustedTimes.length;
  };

  // Calculate average of 5
  const getAverageOf5 = () => {
    if (adjustedTimes.length < 5) return null;
    
    // Get the 5 most recent solves
    const recent5 = adjustedTimes.slice(0, 5);
    
    // Remove best and worst times
    const sortedTimes = [...recent5].sort((a, b) => a.adjustedTime - b.adjustedTime);
    const middleTimes = sortedTimes.slice(1, 4);
    
    // Calculate average of the middle 3 times
    const sum = middleTimes.reduce((acc, solve) => acc + solve.adjustedTime, 0);
    return sum / 3;
  };

  // Calculate average of 12
  const getAverageOf12 = () => {
    if (adjustedTimes.length < 12) return null;
    
    // Get the 12 most recent solves
    const recent12 = adjustedTimes.slice(0, 12);
    
    // Remove best and worst times
    const sortedTimes = [...recent12].sort((a, b) => a.adjustedTime - b.adjustedTime);
    const middleTimes = sortedTimes.slice(1, 11);
    
    // Calculate average of the middle 10 times
    const sum = middleTimes.reduce((acc, solve) => acc + solve.adjustedTime, 0);
    return sum / 10;
  };

  // Format time display (mm:ss.ms)
  const formatTime = (timeMs) => {
    if (timeMs === null) return '-';
    
    const ms = Math.floor((timeMs % 1000) / 10);
    const seconds = Math.floor((timeMs / 1000) % 60);
    const minutes = Math.floor(timeMs / 60000);
    
    return `${minutes > 0 ? `${minutes}:` : ''}${seconds.toString().padStart(minutes > 0 ? 2 : 1, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  // Calculate session stats
  const bestTime = getBestTime();
  const worstTime = getWorstTime();
  const average = getAverage();
  const ao5 = getAverageOf5();
  const ao12 = getAverageOf12();

  return (
    <div className="statistics-container">
      <h3>Statistics</h3>
      
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-label">Solves</div>
          <div className="stat-value">{solves.length}</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-label">Best</div>
          <div className="stat-value">{formatTime(bestTime)}</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-label">Worst</div>
          <div className="stat-value">{formatTime(worstTime)}</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-label">Average</div>
          <div className="stat-value">{formatTime(average)}</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-label">Ao5</div>
          <div className="stat-value">{formatTime(ao5)}</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-label">Ao12</div>
          <div className="stat-value">{formatTime(ao12)}</div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;