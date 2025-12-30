import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface Position {
  top: number;
  left: number;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<Position>({
    top: 0,
    left: 0,
  });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLSpanElement>(null);

  const calculatePosition = useCallback(() => {
    if (!containerRef.current || !tooltipRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const gap = 8; // gap between tooltip and trigger element

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = containerRect.top - tooltipRect.height - gap;
        left =
          containerRect.left + (containerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = containerRect.bottom + gap;
        left =
          containerRect.left + (containerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top =
          containerRect.top + (containerRect.height - tooltipRect.height) / 2;
        left = containerRect.left - tooltipRect.width - gap;
        break;
      case 'right':
        top =
          containerRect.top + (containerRect.height - tooltipRect.height) / 2;
        left = containerRect.right + gap;
        break;
    }

    // Ensure tooltip doesn't overflow viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 8;

    // Adjust horizontal position if overflowing
    if (left < padding) {
      left = padding;
    } else if (left + tooltipRect.width > viewportWidth - padding) {
      left = viewportWidth - tooltipRect.width - padding;
    }

    // Adjust vertical position if overflowing
    if (top < padding) {
      top = padding;
    } else if (top + tooltipRect.height > viewportHeight - padding) {
      top = viewportHeight - tooltipRect.height - padding;
    }

    setTooltipPosition({ top, left });
  }, [position]);

  // Update position when tooltip becomes visible
  useEffect(() => {
    if (isVisible) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        calculatePosition();
      });
    }
  }, [isVisible, calculatePosition]);

  // Recalculate position on scroll and resize
  useEffect(() => {
    if (!isVisible) return;

    const handleScroll = () => calculatePosition();
    const handleResize = () => calculatePosition();

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isVisible, calculatePosition]);

  const arrowPositions: Record<string, string> = {
    top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full',
    bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-full',
    left: 'right-0 top-1/2 -translate-y-1/2 translate-x-full',
    right: 'left-0 top-1/2 -translate-y-1/2 -translate-x-full',
  };

  const arrowBorders: Record<string, string> = {
    top: 'border-t-gray-900 border-r-transparent border-b-transparent border-l-transparent',
    bottom:
      'border-b-gray-900 border-r-transparent border-t-transparent border-l-transparent',
    left: 'border-l-gray-900 border-t-transparent border-r-transparent border-b-transparent',
    right:
      'border-r-gray-900 border-t-transparent border-l-transparent border-b-transparent',
  };

  return (
    <span
      ref={containerRef}
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible &&
        createPortal(
          <div
            ref={tooltipRef}
            className="fixed z-[9999] pointer-events-none"
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
            }}
          >
            <div className="relative px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg max-w-xs">
              <div className="whitespace-normal break-words">{content}</div>
              {/* Arrow */}
              <div
                className={`absolute w-0 h-0 border-4 ${arrowPositions[position]} ${arrowBorders[position]}`}
              />
            </div>
          </div>,
          document.body
        )}
    </span>
  );
};

export default Tooltip;
