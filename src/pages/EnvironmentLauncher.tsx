import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getEnvironmentUrl } from '../config/environmentUrls';
import { useEnvironmentData } from '../services/environmentService';
import { EnvironmentPreview } from '../types/environment';

interface ConsoleEntry {
  id: string;
  timestamp: string;
  type:
    | 'action'
    | 'info'
    | 'error'
    | 'success'
    | 'click'
    | 'keypress'
    | 'scroll'
    | 'focus'
    | 'blur'
    | 'submit'
    | 'touch'
    | 'navigation'
    | 'init'
    | 'dom-change'
    | 'unknown';
  message: string;
  details?: Record<string, unknown>;
}

const EnvironmentLauncher = () => {
  const { envId } = useParams<{ envId: string }>();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const consoleContentRef = useRef<HTMLDivElement>(null);
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([]);
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(
    new Set()
  );
  const [showFilters, setShowFilters] = useState(false);
  // Environment status state - default to loading on mount
  const [environmentStatus, setEnvironmentStatus] = useState('loading'); // loading, online, offline

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

  // Event type preferences
  const [eventPreferences, setEventPreferences] = useState({
    // System messages (selectively enabled by default)
    info: false,
    error: true,
    success: true,
    action: true,
    init: true,

    // User interactions (user can toggle these)
    click: true,
    keypress: true,
    scroll: true,
    focus: false,
    blur: false,
    submit: true,
    touch: true,
    navigation: false,
    'dom-change': false,
    unknown: false,
  });

  // Toggle expand/collapse for entry metadata
  const toggleEntryExpansion = (entryId: string) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  // Toggle event preference
  const toggleEventPreference = (eventType: keyof typeof eventPreferences) => {
    setEventPreferences(prev => ({
      ...prev,
      [eventType]: !prev[eventType],
    }));
  };

  // Toggle all events
  const toggleAllEvents = (enabled: boolean) => {
    setEventPreferences(prev => {
      const newPrefs = { ...prev };
      Object.keys(newPrefs).forEach(key => {
        newPrefs[key as keyof typeof eventPreferences] = enabled;
      });
      return newPrefs;
    });
  };

  // Get event info for UI display
  const getEventInfo = (eventType: string) => {
    const eventInfo: Record<
      string,
      { label: string; description: string; category: string }
    > = {
      // System messages
      info: {
        label: 'System Info',
        description: 'System information messages',
        category: 'System',
      },
      error: {
        label: 'Errors',
        description: 'Error and exception messages',
        category: 'System',
      },
      success: {
        label: 'Success',
        description: 'Success confirmation messages',
        category: 'System',
      },
      action: {
        label: 'Actions',
        description: 'General action messages',
        category: 'System',
      },
      init: {
        label: 'Initialization',
        description: 'System initialization events',
        category: 'System',
      },

      // User interactions
      click: {
        label: 'Click Events',
        description: 'Mouse clicks on elements',
        category: 'Interactions',
      },
      keypress: {
        label: 'Keyboard',
        description: 'Key presses and typing',
        category: 'Interactions',
      },
      scroll: {
        label: 'Scrolling',
        description: 'Page scroll events',
        category: 'Interactions',
      },
      focus: {
        label: 'Focus',
        description: 'Element focus events',
        category: 'Interactions',
      },
      blur: {
        label: 'Blur',
        description: 'Element blur events',
        category: 'Interactions',
      },
      submit: {
        label: 'Form Submit',
        description: 'Form submission events',
        category: 'Interactions',
      },
      touch: {
        label: 'Touch',
        description: 'Touch and gesture events',
        category: 'Interactions',
      },
      navigation: {
        label: 'Navigation',
        description: 'Page navigation events',
        category: 'Interactions',
      },
      'dom-change': {
        label: 'DOM Changes',
        description: 'DOM mutation events',
        category: 'Interactions',
      },
      unknown: {
        label: 'Unknown',
        description: 'Uncategorized events',
        category: 'Other',
      },
    };

    return (
      eventInfo[eventType] || {
        label: eventType,
        description: 'Unknown event type',
        category: 'Other',
      }
    );
  };

  // Check if event type should be displayed
  const shouldDisplayEvent = useCallback(
    (eventType: ConsoleEntry['type']) => {
      return eventPreferences[eventType] || false;
    },
    [eventPreferences]
  );

  // Add console entry
  const addConsoleEntry = useCallback(
    (
      type: ConsoleEntry['type'],
      message: string,
      details?: Record<string, unknown>
    ) => {
      const newEntry: ConsoleEntry = {
        id: `entry_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        timestamp: new Date().toISOString(),
        type,
        message,
        details,
      };
      setConsoleEntries(prev => [...prev.slice(-99), newEntry]);
    },
    []
  );

  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    if (consoleContentRef.current) {
      consoleContentRef.current.scrollTop =
        consoleContentRef.current.scrollHeight;
    }
  }, [consoleEntries]);

  // Enhanced styling functions
  const getConsoleEntryStyle = (type: ConsoleEntry['type']) => {
    switch (type) {
      case 'action':
        return 'relative bg-gray-50 border-l-4 border-blue-500 text-gray-800';
      case 'info':
        return 'relative bg-gray-50 border-l-4 border-gray-400 text-gray-800';
      case 'error':
        return 'relative bg-gray-50 border-l-4 border-red-500 text-gray-800';
      case 'success':
        return 'relative bg-gray-50 border-l-4 border-green-500 text-gray-800';
      default:
        return 'relative bg-gray-50 border-l-4 border-gray-400 text-gray-800';
    }
  };

  const getBadgeStyle = (type: ConsoleEntry['type']) => {
    switch (type) {
      case 'action':
        return 'bg-blue-500 text-white';
      case 'info':
        return 'bg-gray-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'success':
        return 'bg-green-500 text-white';
      case 'click':
        return 'bg-blue-600 text-white';
      case 'keypress':
        return 'bg-green-600 text-white';
      case 'scroll':
        return 'bg-purple-500 text-white';
      case 'focus':
        return 'bg-yellow-500 text-white';
      case 'blur':
        return 'bg-orange-500 text-white';
      case 'submit':
        return 'bg-indigo-500 text-white';
      case 'touch':
        return 'bg-pink-500 text-white';
      case 'navigation':
        return 'bg-cyan-500 text-white';
      case 'dom-change':
        return 'bg-teal-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getConsoleIcon = (type: ConsoleEntry['type']) => {
    const backgroundColor = getBadgeStyle(type).split(' ')[0];

    // SVG icons for each event type
    const svgIcons: Record<string, React.ReactNode> = {
      action: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3 h-3"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
            clipRule="evenodd"
          />
        </svg>
      ),
      info: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3 h-3"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      ),
      error: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3 h-3"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
      success: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3 h-3"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      ),
      click: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3 h-3"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      ),
      keypress: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3 h-3"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
            clipRule="evenodd"
          />
        </svg>
      ),
      scroll: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3 h-3"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
        </svg>
      ),
      focus: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3 h-3"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      ),
      blur: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3 h-3"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path
            fillRule="evenodd"
            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
            clipRule="evenodd"
          />
        </svg>
      ),
      submit: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3 h-3"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
            clipRule="evenodd"
          />
        </svg>
      ),
      touch: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3 h-3"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      ),
      navigation: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3 h-3"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      'dom-change': (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3 h-3"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
            clipRule="evenodd"
          />
        </svg>
      ),
      init: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3 h-3"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
            clipRule="evenodd"
          />
        </svg>
      ),
      unknown: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3 h-3"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      ),
    };

    const icon = svgIcons[type] || svgIcons.unknown;

    return (
      <span
        className={`inline-flex items-center justify-center w-6 h-6 ${backgroundColor} text-white rounded-full shadow-sm`}
      >
        {icon}
      </span>
    );
  };

  // Get the current iframe source URL - CDN only
  const getIframeSrc = useCallback(() => {
    const currentEnvId = envId || 'env-006';
    return getEnvironmentUrl(currentEnvId);
  }, [envId]);

  // Set up message listener for ScaleWoB bridge communication
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    // Message listener for bridge events and responses
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;

      // Handle ScaleWoB bridge events
      if (message.type === 'scalewob-event') {
        const { eventType, data } = message.payload;

        // Map bridge event types to console entry types
        const mapBridgeEventToConsoleType = (
          eventType: string
        ): ConsoleEntry['type'] => {
          const typeMap: Record<string, ConsoleEntry['type']> = {
            ready: 'init',
            'user-action': 'action',
            navigation: 'navigation',
            'dom-change': 'dom-change',
            click: 'click',
            keypress: 'keypress',
            scroll: 'scroll',
            focus: 'focus',
            blur: 'blur',
            submit: 'submit',
            touchstart: 'touch',
          };

          if (eventType === 'user-action') {
            return 'action';
          }

          return typeMap[eventType] || 'unknown';
        };

        // Get human-readable message for events
        const getEventMessage = (
          eventType: string,
          data: Record<string, unknown>
        ): string => {
          if ('message' in data && typeof data.message === 'string') {
            return data.message;
          }

          switch (eventType) {
            case 'ready':
              return `ScaleWoB Bridge ready: ${data.environment}`;
            case 'init':
              return 'ScaleWoB Event Tracker initialized successfully';
            case 'user-action': {
              const action = (data as { action?: string }).action || 'unknown';
              const target =
                (data as { target?: { tagName?: string } }).target?.tagName ||
                'element';
              return `User action: ${action} on ${target}`;
            }
            case 'navigation':
              return `Navigation: ${data.path}`;
            case 'dom-change':
              return `DOM changed: ${data.type} (${data.count} items)`;
            default:
              return `Event: ${eventType}`;
          }
        };

        const mappedType = mapBridgeEventToConsoleType(eventType);
        const consoleMessage = getEventMessage(eventType, data);

        if (eventPreferences[mappedType as keyof typeof eventPreferences]) {
          addConsoleEntry(mappedType, consoleMessage, data);
        }
      }

      // Handle legacy user-interaction messages (for backward compatibility)
      else if (message.type === 'user-interaction') {
        const eventType = message.eventType || 'unknown';

        if (eventPreferences[eventType as keyof typeof eventPreferences]) {
          addConsoleEntry(
            eventType as ConsoleEntry['type'],
            message.message || 'Unknown action',
            message.details
          );
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [eventPreferences, addConsoleEntry]);

  // Mobile dimensions for preview
  const mobileDimensions = { width: 390, height: 844 };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
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
              {/* Back to Gallery Button */}
              <Link
                to="/gallery"
                className="inline-flex items-center space-x-1 px-3 py-2 bg-gray-800 text-white text-sm font-medium rounded-sm hover:bg-gray-700 transition-colors duration-200"
              >
                <span>←</span>
                <span>Back to Gallery</span>
              </Link>

              {/* Environment Status */}
              <div
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                  environmentStatus === 'loading'
                    ? 'bg-yellow-50 border-yellow-200'
                    : environmentStatus === 'online'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    environmentStatus === 'loading'
                      ? 'bg-yellow-500 animate-pulse'
                      : environmentStatus === 'online'
                        ? 'bg-green-500'
                        : 'bg-red-500'
                  }`}
                ></div>
                <span className="text-sm font-medium">
                  {environmentStatus === 'loading'
                    ? 'Environment Status: Loading...'
                    : environmentStatus === 'online'
                      ? 'Environment Status: Online'
                      : 'Environment Status: Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Event Console - Left Side */}
        <div className="w-80 bg-white border-r border-gray-300 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-300 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">
                Event Console
              </h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200 font-medium border border-gray-200"
              >
                <span>⚙️</span>
                <span>Filters</span>
                <span className="ml-1 px-1.5 py-0.5 bg-gray-200 text-gray-800 rounded-full text-xs font-bold">
                  {Object.values(eventPreferences).filter(Boolean).length}
                </span>
              </button>
            </div>
          </div>

          {/* Console entries */}
          <div
            ref={consoleContentRef}
            className="flex-1 overflow-y-auto p-4 space-y-2"
          >
            {consoleEntries
              .filter(entry => shouldDisplayEvent(entry.type))
              .map(entry => (
                <div
                  key={entry.id}
                  className={`${getConsoleEntryStyle(entry.type)} p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100`}
                  onClick={() => toggleEntryExpansion(entry.id)}
                >
                  <div className="flex flex-col">
                    {/* Icon + message row */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getConsoleIcon(entry.type)}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">
                            {entry.message}
                          </div>
                          <div className="text-xs opacity-75 mt-1">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      {/* Expand button */}
                      <div className="flex items-center space-x-2 ml-3">
                        {entry.details && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              toggleEntryExpansion(entry.id);
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 text-sm"
                          >
                            {expandedEntries.has(entry.id) ? '▼' : '▶'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded metadata - spans full width below */}
                    {expandedEntries.has(entry.id) && entry.details && (
                      <div className="mt-3 p-4 bg-white bg-opacity-90 rounded-lg border border-gray-200 w-full max-w-none">
                        <div className="text-xs font-mono">
                          {Object.entries(entry.details).map(([key, value]) => (
                            <div key={key} className="mb-2 wrap-break-words">
                              <span className="font-semibold text-gray-600">
                                {key}:
                              </span>{' '}
                              <span className="text-gray-800 whitespace-pre-wrap">
                                {typeof value === 'object'
                                  ? JSON.stringify(value, null, 2)
                                  : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

            {consoleEntries.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <p>Waiting for events...</p>
              </div>
            )}
          </div>
        </div>

        {/* Iframe Container - Right Side */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Iframe Container with Fixed Size */}
          <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 overflow-auto min-h-0">
            <div
              className="relative shrink-0"
              style={{
                width: `${mobileDimensions.width}px`,
                height: `${mobileDimensions.height}px`,
              }}
            >
              {/* Mobile Device Frame */}
              <div className="absolute inset-0 bg-gray-800 rounded-2xl p-2 shadow-xl border border-gray-600">
                <div className="relative w-full h-full bg-white rounded-xl overflow-hidden">
                  {/* Iframe */}
                  <iframe
                    ref={iframeRef}
                    src={getIframeSrc()}
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
                      setEnvironmentStatus('online');
                      const source = 'CDN';
                      const isTestEnv = envId?.includes('test');

                      if (eventPreferences.success) {
                        addConsoleEntry(
                          'success',
                          `Mobile environment loaded successfully from ${source}`
                        );
                      }

                      // Check if this is a bridge-enabled environment
                      if (isTestEnv) {
                        if (eventPreferences.info) {
                          addConsoleEntry(
                            'info',
                            'Bridge-enabled environment loaded - Waiting for ScaleWoB Bridge initialization...',
                            {
                              bridgeExpected: true,
                              environmentType: 'test',
                              source: 'test-cdn',
                            }
                          );
                        }
                      } else if (eventPreferences.info) {
                        addConsoleEntry(
                          'info',
                          'CDN environment loaded - Full event tracking enabled via ScaleWoB Bridge',
                          {
                            source: 'cdn',
                          }
                        );
                      }
                    }}
                    onError={() => {
                      setEnvironmentStatus('offline');
                      if (eventPreferences.error) {
                        addConsoleEntry(
                          'error',
                          'Failed to load environment from CDN'
                        );
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Filter Panel */}
      {showFilters && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Background */}
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 z-0"
            onClick={() => setShowFilters(false)}
          ></div>

          {/* Modal Content */}
          <div className="relative z-10 bg-white rounded-sm shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Event Filters
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Choose which events to display in the console
                  </p>
                </div>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors duration-200"
                >
                  <span className="text-gray-400 hover:text-gray-600">✕</span>
                </button>
              </div>
            </div>

            {/* Filter Content */}
            <div className="p-4 overflow-y-auto max-h-[50vh]">
              {/* Quick Actions */}
              <div className="mb-4 flex items-center space-x-3">
                <button
                  onClick={() => toggleAllEvents(true)}
                  className="px-3 py-1.5 bg-green-100 text-green-700 rounded-sm hover:bg-green-200 transition-colors duration-200 text-xs font-medium"
                >
                  Enable All
                </button>
                <button
                  onClick={() => toggleAllEvents(false)}
                  className="px-3 py-1.5 bg-red-100 text-red-700 rounded-sm hover:bg-red-200 transition-colors duration-200 text-xs font-medium"
                >
                  Disable All
                </button>
                <div className="h-6 w-px bg-gray-300"></div>
                <span className="text-xs text-gray-500">
                  <span className="font-medium">
                    {Object.values(eventPreferences).filter(Boolean).length}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">
                    {Object.keys(eventPreferences).length}
                  </span>{' '}
                  enabled
                </span>
              </div>

              {/* Filter Categories */}
              <div className="space-y-4">
                {/* System Messages Category */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    System Messages
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(eventPreferences)
                      .filter(([type]) =>
                        ['info', 'error', 'success', 'action', 'init'].includes(
                          type
                        )
                      )
                      .map(([eventType, isEnabled]) => {
                        const info = getEventInfo(eventType);
                        return (
                          <div
                            key={eventType}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-sm border border-gray-200"
                          >
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() =>
                                  toggleEventPreference(
                                    eventType as keyof typeof eventPreferences
                                  )
                                }
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                                  isEnabled ? 'bg-gray-800' : 'bg-gray-300'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                                    isEnabled
                                      ? 'translate-x-4'
                                      : 'translate-x-0.5'
                                  }`}
                                />
                              </button>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs font-medium text-gray-700">
                                    {info.label}
                                  </span>
                                  <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-sm">
                                    {info.category}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {info.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* User Interactions Category */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    User Interactions
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(eventPreferences)
                      .filter(
                        ([type]) =>
                          ![
                            'info',
                            'error',
                            'success',
                            'action',
                            'init',
                          ].includes(type)
                      )
                      .map(([eventType, isEnabled]) => {
                        const info = getEventInfo(eventType);
                        return (
                          <div
                            key={eventType}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-sm border border-gray-200"
                          >
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() =>
                                  toggleEventPreference(
                                    eventType as keyof typeof eventPreferences
                                  )
                                }
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                                  isEnabled ? 'bg-gray-800' : 'bg-gray-300'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                                    isEnabled
                                      ? 'translate-x-4'
                                      : 'translate-x-0.5'
                                  }`}
                                />
                              </button>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs font-medium text-gray-700">
                                    {info.label}
                                  </span>
                                  <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded-sm">
                                    {info.category}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {info.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-300 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-600">
                  <span className="font-medium">
                    {Object.values(eventPreferences).filter(Boolean).length}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">
                    {Object.keys(eventPreferences).length}
                  </span>{' '}
                  event types enabled
                </p>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 bg-gray-800 text-white text-xs font-medium rounded-sm hover:bg-gray-700 transition-colors duration-200"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvironmentLauncher;
