import React from 'react';
import './Controls.css';

const Controls = ({ isRunning, onReset, onDNF, onPenalty }) => {
  return (
    <div className="controls-container">
      <button 
        className="control-btn reset-btn" 
        onClick={onReset}
        disabled={isRunning}
        title="Reset timer"
      >
        Reset
      </button>
      
      <button 
        className="control-btn dnf-btn" 
        onClick={onDNF}
        disabled={isRunning}
        title="Mark as DNF (Did Not Finish)"
      >
        DNF
      </button>
      
      <button 
        className="control-btn penalty-btn" 
        onClick={onPenalty}
        disabled={isRunning}
        title="Add +2 seconds penalty"
      >
        +2
      </button>
    </div>
  );
};

export default Controls;