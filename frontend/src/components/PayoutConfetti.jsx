/**
 * Payout Confetti Component
 * Celebration animation for successful payouts
 */

import React, { useEffect, useState } from 'react';
import './PayoutConfetti.css';

export const PayoutConfetti = ({ 
  isActive = false,
  amount = 0,
  onComplete = null,
  duration = 4000
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsVisible(true);

      // Auto-hide after duration
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onComplete) {
          onComplete();
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isActive, duration, onComplete]);

  if (!isVisible) return null;

  // Generate random confetti pieces
  const confettiPieces = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    color: ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'][
      Math.floor(Math.random() * 6)
    ],
    rotation: Math.random() * 360,
    size: 10 + Math.random() * 10
  }));

  return (
    <div className="payout-confetti-overlay">
      {/* Confetti pieces */}
      <div className="confetti-container">
        {confettiPieces.map(piece => (
          <div
            key={piece.id}
            className="confetti-piece"
            style={{
              left: `${piece.left}%`,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              backgroundColor: piece.color,
              width: `${piece.size}px`,
              height: `${piece.size}px`,
              transform: `rotate(${piece.rotation}deg)`
            }}
          />
        ))}
      </div>

      {/* Success message */}
      <div className="payout-success-message">
        <div className="success-icon bounce">🎉</div>
        <h1 className="success-title">Payout Successful!</h1>
        <div className="success-amount">
          <span className="currency">₹</span>
          <span className="amount">{amount.toLocaleString('en-IN')}</span>
        </div>
        <p className="success-subtitle">
          Your claim has been processed successfully
        </p>
        <div className="success-checkmark">
          <svg className="checkmark-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
            <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

// Compact success badge for notifications
export const PayoutSuccessBadge = ({ amount }) => (
  <div className="payout-success-badge">
    <span className="badge-icon">✅</span>
    <span className="badge-text">Paid: ₹{amount.toLocaleString('en-IN')}</span>
  </div>
);

// Celebration button (triggers confetti on click)
export const CelebrationButton = ({ children, onClick }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  const handleClick = () => {
    setShowConfetti(true);
    if (onClick) onClick();
  };

  return (
    <>
      <button className="celebration-btn" onClick={handleClick}>
        {children}
      </button>
      {showConfetti && (
        <div className="mini-confetti">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="mini-confetti-piece" />
          ))}
        </div>
      )}
    </>
  );
};

export default PayoutConfetti;
