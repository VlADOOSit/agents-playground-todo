import React, { useEffect, useState } from 'react';
import './Toast.css';

const Toast = ({ message, onUndo, onDismiss, duration = 5000, showCountdown = true }) => {
  const [countdown, setCountdown] = useState(duration / 1000);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!showCountdown) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsVisible(false);
          setTimeout(() => onDismiss && onDismiss(), 300); // Allow fade out animation
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onDismiss, showCountdown]);

  const handleUndo = () => {
    setIsVisible(false);
    onUndo && onUndo();
    // Also call onDismiss to clear the timeout
    onDismiss && onDismiss();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss && onDismiss();
  };

  return (
    <div className={`toast ${isVisible ? 'toast-visible' : 'toast-hidden'}`}>
      <div className="toast-content">
        <span className="toast-message">{message}</span>
        {showCountdown && (
          <span className="toast-countdown">({countdown}s)</span>
        )}
        <div className="toast-actions">
          <button className="toast-undo-btn" onClick={handleUndo}>
            Undo
          </button>
          <button className="toast-close-btn" onClick={handleDismiss}>
            ✕
          </button>
        </div>
      </div>
      {showCountdown && (
        <div
          className="toast-progress-bar"
          style={{ animationDuration: `${duration}ms` }}
        />
      )}
    </div>
  );
};

export default Toast;
