import React from 'react';
import './SpinLoader.css';

interface SpinLoaderProps {
  className?: string;
  'aria-label'?: string;
}

const SpinLoader: React.FC<SpinLoaderProps> = ({
  className = '',
  'aria-label': ariaLabel = 'Loading',
}) => {
  const classes = `spinner ${className}`.trim();

  return (
    <div
      className={classes}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
    >
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
};

export default SpinLoader;

