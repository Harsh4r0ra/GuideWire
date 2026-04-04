/**
 * Storm Mode Component
 * Activates during weather triggers with dramatic animations
 */

import React, { useEffect, useState } from 'react';
import './StormMode.css';

export const StormMode = ({ 
  isActive = false,
  triggerData = null,
  onDismiss = null
}) => {
  const [showIntensity, setShowIntensity] = useState(0);

  useEffect(() => {
    if (isActive) {
      // Gradually increase intensity
      const timer = setInterval(() => {
        setShowIntensity(prev => Math.min(prev + 1, 10));
      }, 200);

      return () => clearInterval(timer);
    } else {
      setShowIntensity(0);
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="storm-mode-overlay">
      {/* Animated background */}
      <div className="storm-background">
        {/* Lightning flashes */}
        <div className="lightning" />
        
        {/* Rain drops */}
        <div className="rain-container">
          {Array.from({ length: 50 }).map((_, i) => (
            <div 
              key={i}
              className="rain-drop"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${0.5 + Math.random() * 0.5}s`
              }}
            />
          ))}
        </div>

        {/* Pulsing waves */}
        <div className="storm-waves">
          <div className="wave wave-1" />
          <div className="wave wave-2" />
          <div className="wave wave-3" />
        </div>
      </div>

      {/* Content */}
      <div className="storm-content">
        <div className="storm-icon-wrapper">
          <div className="storm-icon throbbing">⛈️</div>
        </div>

        <h1 className="storm-title">Storm Mode Activated</h1>
        
        {triggerData && (
          <div className="storm-details">
            <p className="storm-event">{triggerData.event_type}</p>
            <p className="storm-location">📍 {triggerData.location}</p>
            <p className="storm-severity">
              Severity: <span className="severity-high">{triggerData.dsi_score}/100</span>
            </p>
          </div>
        )}

        <div className="storm-message">
          <p>🛡️ Your claim is being processed automatically</p>
          <p>💸 Payout will be initiated shortly</p>
        </div>

        <div className="storm-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${showIntensity * 10}%` }}
            />
          </div>
          <p className="progress-text">Processing claim...</p>
        </div>

        {onDismiss && showIntensity >= 10 && (
          <button className="storm-dismiss-btn" onClick={onDismiss}>
            View Claim Details
          </button>
        )}
      </div>
    </div>
  );
};

// Compact Storm Mode for dashboard
export const StormBadge = ({ severity = 'HIGH' }) => {
  const severityColors = {
    LOW: '#4caf50',
    MEDIUM: '#ff9800',
    HIGH: '#f44336',
    SEVERE: '#9c27b0'
  };

  return (
    <div className="storm-badge throbbing">
      <span className="storm-badge-icon">⛈️</span>
      <span className="storm-badge-text">Storm Alert</span>
      <span 
        className="storm-badge-severity"
        style={{ background: severityColors[severity] }}
      >
        {severity}
      </span>
    </div>
  );
};

// Storm notification toast
export const StormNotification = ({ message, onClose }) => (
  <div className="storm-notification slide-in">
    <div className="storm-notif-icon throbbing">⛈️</div>
    <div className="storm-notif-content">
      <h4>Weather Alert</h4>
      <p>{message}</p>
    </div>
    <button className="storm-notif-close" onClick={onClose}>✕</button>
  </div>
);

export default StormMode;
