import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEnvironmentData } from '../services/environmentService';
import { EnvironmentPreview } from '../types/environment';

interface ConsoleEntry {
  id: string;
  timestamp: string;
  type: 'action' | 'info' | 'error' | 'success';
  message: string;
  details?: Record<string, unknown>;
}

const EnvironmentLauncher = () => {
  const { envId } = useParams<{ envId: string }>();
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileDimensions] = useState({
    width: 390,
    height: 844,
  });

  // Load environment data from service
  const { data: environmentData } = useEnvironmentData();

  // Get specific environment or fallback to env-006
  const getEnvironment = (id: string): EnvironmentPreview => {
    if (!environmentData?.environments) {
      // Fallback data
      return {
        id: 'env-006',
        taskName: 'Creating album in Photos',
        description:
          'Photo organization tasks including creating new albums, selecting and moving photos, and managing photo collections.',
        platform: 'Mobile Interfaces',
        difficulty: 'Intermediate',
        tags: ['Photos', 'Organization', 'Media Management'],
        metrics: {
          completion: 88,
          complexity: 6,
        },
        icon: 'photo-album',
        colorTheme: 'warm',
      };
    }
    return (
      environmentData.environments.find(env => env.id === id) ||
      environmentData.environments[0]
    );
  };

  const environment = getEnvironment(envId || 'env-006');

  // Function to add console entries
  const addConsoleEntry = (
    type: ConsoleEntry['type'],
    message: string,
    details?: Record<string, unknown>
  ) => {
    const newEntry: ConsoleEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      details,
    };
    setConsoleEntries(prev => [...prev, newEntry]);
  };

  // Fixed iPhone dimensions for testing consistency - NO AUTO-RESIZE
  useEffect(() => {
    // Add initial console messages after component mount
    setTimeout(() => {
      addConsoleEntry(
        'info',
        'Fixed device dimensions: 390×844px (iPhone 14 Pro)'
      );
      addConsoleEntry('info', 'Auto-resize disabled for test consistency');
    }, 100);
  }, []);

  // Simulate iframe actions and console logging
  useEffect(() => {
    // Initial console messages - delayed to avoid setState in effect
    const timer = setTimeout(() => {
      addConsoleEntry('info', `Loading environment: ${environment.taskName}`);
      addConsoleEntry('info', `Environment ID: ${environment.id}`);
    }, 50);

    // Simulate environment loading
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      addConsoleEntry('success', 'Environment loaded successfully');
      addConsoleEntry('info', 'Ready for user interaction');
      addConsoleEntry(
        'info',
        `Mobile viewport: 382×836px (fixed iPhone 14 Pro)`
      );
      addConsoleEntry(
        'info',
        `Device dimensions: 390×844px (19.5:9 aspect ratio)`
      );
    }, 2000);

    // Simulate some example actions after loading
    const actionTimer = setTimeout(() => {
      if (!isLoading) {
        addConsoleEntry('action', 'User clicked on "Photos" tab');
        setTimeout(() => {
          addConsoleEntry('action', 'User navigated to "Albums" section');
          setTimeout(() => {
            addConsoleEntry('action', 'User clicked "Create New Album" button');
            addConsoleEntry('info', 'Album creation dialog opened');
          }, 3000);
        }, 2000);
      }
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(loadingTimer);
      clearTimeout(actionTimer);
    };
  }, [environment.taskName, environment.id, isLoading, mobileDimensions]);

  const getConsoleEntryStyle = (type: ConsoleEntry['type']) => {
    switch (type) {
      case 'action':
        return 'text-blue-700 border-blue-200 bg-blue-50';
      case 'info':
        return 'text-gray-700 border-gray-200 bg-gray-50';
      case 'error':
        return 'text-red-700 border-red-200 bg-red-50';
      case 'success':
        return 'text-green-700 border-green-200 bg-green-50';
      default:
        return 'text-gray-700 border-gray-200 bg-gray-50';
    }
  };

  const getConsoleIcon = (type: ConsoleEntry['type']) => {
    switch (type) {
      case 'action':
        return '▶';
      case 'info':
        return 'ℹ';
      case 'error':
        return '✕';
      case 'success':
        return '✓';
      default:
        return '•';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 to-coral-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/gallery"
                className="inline-flex items-center space-x-2 text-gray-600 hover:text-warm-600 transition-colors font-medium"
              >
                <span>←</span>
                <span>Back to Gallery</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {environment.taskName}
                </h1>
                <p className="text-sm text-gray-600">
                  {environment.description}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Device Info Badge */}
              <div className="bg-gradient-to-r from-warm-100 to-coral-100 text-warm-700 px-3 py-1 rounded-full text-xs font-semibold border border-warm-200">
                <div className="flex items-center space-x-2">
                  <span>📱</span>
                  <span>iPhone 14 Pro</span>
                  <span>•</span>
                  <span>19.5:9</span>
                </div>
              </div>

              {/* Status Indicator */}
              {isLoading && (
                <div className="flex items-center space-x-2 bg-warm-50 px-3 py-2 rounded-lg border border-warm-200">
                  <div className="h-4 w-4 border-2 border-warm-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium text-warm-700">
                    Loading...
                  </span>
                </div>
              )}
              {!isLoading && (
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-700">
                    Active
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-88px)] overflow-hidden">
        {/* Console - Left Side */}
        <div className="w-1/3 border-r border-gray-200 bg-white flex flex-col shadow-lg min-h-0">
          {/* Console Header */}
          <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-warm-50 to-coral-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-warm-500 rounded-full"></div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Activity Console
                </h2>
              </div>
              <button
                onClick={() => setConsoleEntries([])}
                className="text-xs text-gray-600 hover:text-warm-600 transition-colors font-medium"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Console Content */}
          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm bg-gray-50">
            {consoleEntries.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-500 text-sm">
                  Waiting for environment to load...
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {consoleEntries.map(entry => (
                  <div
                    key={entry.id}
                    className={`p-3 rounded-lg border shadow-sm bg-white ${getConsoleEntryStyle(entry.type)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-sm mt-0.5 font-semibold">
                        {getConsoleIcon(entry.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500 font-medium">
                            {entry.timestamp}
                          </span>
                          <span
                            className={`text-xs font-semibold uppercase ${getConsoleEntryStyle(entry.type).split(' ')[0]}`}
                          >
                            {entry.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 leading-relaxed">
                          {entry.message}
                        </p>
                        {entry.details && (
                          <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-3 rounded-md overflow-x-auto border border-gray-200">
                            {JSON.stringify(entry.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Iframe Container - Right Side */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-white">
          {/* Iframe Container with Fixed Size - Scroll if needed */}
          <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-warm-25 via-coral-25 to-warm-25 overflow-auto min-h-0">
            <div
              className="relative flex-shrink-0"
              style={{
                width: `${mobileDimensions.width}px`,
                height: `${mobileDimensions.height}px`,
              }}
            >
              {/* Mobile Device Frame - Simplified Design */}
              <div className="absolute inset-0 bg-gray-800 rounded-2xl p-2 shadow-xl border border-gray-600">
                <div className="relative w-full h-full bg-white rounded-xl overflow-hidden">
                  {/* Iframe - Perfect fit with no spacing */}
                  <iframe
                    src={'/env/index.html'}
                    className="absolute inset-0 w-full h-full bg-white"
                    style={{
                      width: '100%',
                      height: '100%',
                      margin: '0',
                      padding: '0',
                      display: 'block',
                    }}
                    title="Environment"
                    onLoad={() => {
                      addConsoleEntry(
                        'success',
                        'Mobile environment loaded successfully'
                      );
                      addConsoleEntry(
                        'info',
                        'Viewport: 382×836px (fixed - 8px padding)'
                      );
                      addConsoleEntry(
                        'info',
                        'Device: 390×844px (iPhone 14 Pro - 19.5:9)'
                      );
                    }}
                    onError={() => {
                      addConsoleEntry(
                        'error',
                        'Failed to load environment iframe'
                      );
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentLauncher;
