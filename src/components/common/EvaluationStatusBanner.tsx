import React, { useState, useEffect } from 'react';

interface EvaluationStatusBannerProps {
  status: 'idle' | 'evaluating' | 'success' | 'failed';
  message: string;
  eventsCount: number;
  startTime: number | null;
  onDismiss: () => void;
}

const EvaluationStatusBanner: React.FC<EvaluationStatusBannerProps> = ({
  status,
  message,
  eventsCount,
  startTime,
  onDismiss,
}) => {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    let interval: number | undefined;
    if (status === 'evaluating' && startTime) {
      interval = window.setInterval(() => {
        setCurrentTime(Date.now() - startTime);
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, startTime]);

  useEffect(() => {
    let timeout: number | undefined;
    if (status === 'success') {
      timeout = window.setTimeout(() => {
        onDismiss();
      }, 5000);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [status, onDismiss]);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(1)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getBannerConfig = () => {
    switch (status) {
      case 'idle':
        return {
          bgClass: 'bg-gray-50 border-gray-200',
          textClass: 'text-gray-700',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
          ),
          label: 'Ready to start evaluation',
        };
      case 'evaluating':
        return {
          bgClass: 'bg-yellow-50 border-yellow-200',
          textClass: 'text-yellow-800',
          icon: (
            <svg
              className="w-5 h-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ),
          label: 'Evaluating...',
        };
      case 'success':
        return {
          bgClass: 'bg-green-50 border-green-200',
          textClass: 'text-green-800',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ),
          label: 'Evaluation completed successfully',
        };
      case 'failed':
        return {
          bgClass: 'bg-red-50 border-red-200',
          textClass: 'text-red-800',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          ),
          label: 'Evaluation failed',
        };
    }
  };

  const config = getBannerConfig();
  const duration = startTime ? currentTime : 0;

  return (
    <div
      className={`w-full px-4 py-3 rounded-lg border-2 ${config.bgClass} ${config.textClass} flex items-start justify-between transition-all duration-200`}
    >
      <div className="flex items-start space-x-3 flex-1">
        <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold uppercase tracking-wide">
            {config.label}
          </div>
          {(status === 'evaluating' || status === 'success') && (
            <div className="flex items-center space-x-3 mt-1 text-xs opacity-80">
              <span>
                {eventsCount} event{eventsCount !== 1 ? 's' : ''} captured
              </span>
              <span className="text-gray-400">•</span>
              <span>{formatDuration(duration)}</span>
            </div>
          )}
          {message && status === 'failed' && (
            <p className="text-xs mt-1 opacity-90">{message}</p>
          )}
        </div>
      </div>
      {(status === 'failed' || status === 'success') && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 ml-3 mt-0.5 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default EvaluationStatusBanner;
