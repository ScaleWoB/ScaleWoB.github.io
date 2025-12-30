import React from 'react';

interface DotIndicatorProps {
  level: 1 | 2 | 3;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const DotIndicator: React.FC<DotIndicatorProps> = ({
  level,
  size = 'md',
  showLabel = false,
  className = '',
}) => {
  // Color scheme based on difficulty level
  const getColors = () => {
    switch (level) {
      case 1:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-300',
          dot: 'bg-blue-600',
          text: 'text-blue-700',
        };
      case 2:
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-300',
          dot: 'bg-orange-600',
          text: 'text-orange-700',
        };
      case 3:
        return {
          bg: 'bg-red-50',
          border: 'border-red-300',
          dot: 'bg-red-600',
          text: 'text-red-700',
        };
    }
  };

  // Size variations
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-1.5 py-0.5',
          dot: 'w-1 h-1',
          gap: 'gap-0.5',
          label: 'text-xs',
        };
      case 'lg':
        return {
          container: 'px-3 py-1',
          dot: 'w-2 h-2',
          gap: 'gap-1',
          label: 'text-sm',
        };
      default: // md
        return {
          container: 'px-2 py-1',
          dot: 'w-1.5 h-1.5',
          gap: 'gap-1',
          label: 'text-xs',
        };
    }
  };

  const colors = getColors();
  const sizeClasses = getSizeClasses();
  const dots = Array.from({ length: level }, (_, i) => i);

  return (
    <div
      className={`inline-flex items-center ${sizeClasses.container} ${colors.bg} border-2 ${colors.border} rounded ${className}`}
    >
      {/* Dots */}
      <div className={`flex items-center ${sizeClasses.gap}`}>
        {dots.map(i => (
          <div
            key={i}
            className={`rounded-full ${sizeClasses.dot} ${colors.dot}`}
          />
        ))}
      </div>

      {/* Optional label */}
      {showLabel && (
        <span
          className={`ml-1.5 font-bold uppercase tracking-wide ${sizeClasses.label} ${colors.text}`}
        >
          {level === 1 ? 'Basic' : level === 2 ? 'Advanced' : 'Expert'}
        </span>
      )}
    </div>
  );
};

export default DotIndicator;
