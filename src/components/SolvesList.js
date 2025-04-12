import React from 'react';
import './SolvesList.css';

const SolvesList = ({ solves, onDeleteSolve, onToggleDNF, onTogglePenalty }) => {
  // Format time display (mm:ss.ms)
  const formatTime = (timeMs) => {
    const ms = Math.floor((timeMs % 1000) / 10);
    const seconds = Math.floor((timeMs / 1000) % 60);
    const minutes = Math.floor(timeMs / 60000);
    
    return `${minutes > 0 ? `${minutes}:` : ''}${seconds.toString().padStart(minutes > 0 ? 2 : 1, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  // Get the actual time to display (including penalties)
  const getDisplayTime = (solve) => {
    if (solve.isDNF) {
      return 'DNF';
    }
    
    const time = solve.time + (solve.penalty ? 2000 : 0);
    return formatTime(time);
  };

  // Get the CSS class for a solve
  const getSolveClass = (solve) => {
    let className = 'solve-item';
    if (solve.isDNF) {
      className += ' dnf';
    } else if (solve.penalty) {
      className += ' penalty';
    }
    return className;
  };

  return (
    <div className="solves-list-container">
      <h3>Recent Solves</h3>
      
      {solves.length === 0 ? (
        <p className="no-solves">No solves yet. Start solving!</p>
      ) : (
        <div className="solves-list">
          {solves.map((solve, index) => (
            <div key={solve.id} className={getSolveClass(solve)}>
              <div className="solve-number">#{solves.length - index}</div>
              <div className="solve-time">{getDisplayTime(solve)}</div>
              <div className="solve-scramble">{solve.scramble}</div>
              <div className="solve-actions">
                <button 
                  className={`penalty-btn ${solve.penalty ? 'active' : ''}`}
                  onClick={() => onTogglePenalty(solve.id)}
                  disabled={solve.isDNF}
                  title="Add +2 penalty"
                >
                  +2
                </button>
                <button 
                  className={`dnf-btn ${solve.isDNF ? 'active' : ''}`}
                  onClick={() => onToggleDNF(solve.id)}
                  title="Mark as DNF"
                >
                  DNF
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => onDeleteSolve(solve.id)}
                  title="Delete solve"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SolvesList;