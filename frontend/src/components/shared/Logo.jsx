import React from 'react';

/**
 * MESOB Logo Component
 * Reusable logo with consistent sizing and aspect ratio
 */
function Logo({ 
  size = 'default',
  className = '',
  showText = true 
}) {
  const sizes = {
    small: { width: 28, height: 28 },
    default: { width: 40, height: 40 },
    large: { width: 60, height: 60 }
  };

  const dimensions = sizes[size] || sizes.default;

  return (
    <div className={`mesob-logo ${className}`}>
      <div 
        className="logo-emblem"
        style={{
          width: dimensions.width,
          height: dimensions.height,
          borderRadius: '50%',
          background: 'rgba(214, 232, 251, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <img
          src="/Mesob-short-png.png"
          alt="MESOB"
          style={{
            width: dimensions.width * 0.7,
            height: dimensions.height * 0.7,
            objectFit: 'contain'
          }}
        />
      </div>
      {showText && (
        <div className="logo-text">
          <span className="logo-title">FDRE MESOB</span>
          <span className="logo-subtitle">Health Service</span>
        </div>
      )}
    </div>
  );
}

export default Logo;
