import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEnvironmentData } from '../services/environmentService';
import { EnvironmentPreview } from '../types/environment';
import ParameterInput from '../components/common/ParameterInput';

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
    | 'drag'
    | 'navigation'
    | 'init'
    | 'dom-change'
    | 'unknown';
  message: string;
  details?: Record<string, unknown>;
}

const EnvironmentLauncher = () => {
  const { envId } = useParams<{ envId: string }>();
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const consoleContentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([]);
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(
    new Set()
  );
  // Environment status state - default to loading on mount
  const [environmentStatus, setEnvironmentStatus] = useState('loading'); // loading, online, offline

  // Scale state for responsive iframe - start with a smaller default to avoid flash
  const [scale, setScale] = useState(0.5);

  // Tab state for right panel
  const [activeTab, setActiveTab] = useState<'functions' | 'filters'>(
    'functions'
  );

  // Play mode and evaluation mode state
  const [isPlayMode, setIsPlayMode] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isEvaluationStarted, setIsEvaluationStarted] = useState(false);

  // Parameter state for evaluation
  const [parameters, setParameters] = useState<
    Record<string, string | number | boolean>
  >({});

  // Flag to track when we're doing an evaluation refresh (to avoid duplicate success messages)
  const [isEvaluationRefresh, setIsEvaluationRefresh] = useState(false);

  // Trajectory state for action history during evaluation
  const [trajectory, setTrajectory] = useState<
    Array<{
      timestamp: number;
      type: string;
      data: Record<string, unknown>;
    }>
  >([]);

  // Load environment data from service
  const { data: environmentData } = useEnvironmentData();

  // Get specific environment from loaded data
  const getEnvironment = (id: string): EnvironmentPreview | null => {
    if (!environmentData?.environments) {
      return null;
    }

    const env = environmentData.environments.find(env => env.id === id);
    return env || null;
  };

  const environment = getEnvironment(envId || '');

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
    drag: true,
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
      drag: {
        label: 'Drag',
        description: 'Mouse drag gestures',
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
        return 'relative bg-gray-50 border-l-4 border-blue-500 text-gray-800 hover:border-blue-600 hover:bg-gray-100 transition-all duration-200';
      case 'info':
        return 'relative bg-gray-50 border-l-4 border-gray-400 text-gray-800 hover:border-gray-500 hover:bg-gray-100 transition-all duration-200';
      case 'error':
        return 'relative bg-gray-50 border-l-4 border-red-500 text-gray-800 hover:border-red-600 hover:bg-gray-100 transition-all duration-200';
      case 'success':
        return 'relative bg-gray-50 border-l-4 border-green-500 text-gray-800 hover:border-green-600 hover:bg-gray-100 transition-all duration-200';
      default:
        return 'relative bg-gray-50 border-l-4 border-gray-400 text-gray-800 hover:border-gray-500 hover:bg-gray-100 transition-all duration-200';
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
      case 'drag':
        return 'bg-purple-600 text-white';
      case 'navigation':
        return 'bg-cyan-500 text-white';
      case 'dom-change':
        return 'bg-teal-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Function to start evaluation (refresh + start recording)
  const startEvaluation = useCallback(() => {
    if (!iframeRef.current) return;

    // Switch to Evaluate Mode
    setIsPlayMode(false);
    setIsEvaluationStarted(true);
    setIsEvaluating(false);

    // Clear console entries for fresh start
    setConsoleEntries([]);

    // Clear trajectory for fresh start
    setTrajectory([]);

    // Log evaluation start
    addConsoleEntry(
      'action',
      'Starting evaluation - switching to Evaluate Mode'
    );

    // Set loading state first to ensure overlay shows
    setEnvironmentStatus('loading');

    // Set evaluation refresh flag to avoid duplicate success messages
    setIsEvaluationRefresh(true);

    // Refresh iframe by reloading its src with a slight delay to ensure overlay appears
    const currentSrc = iframeRef.current.src;

    setTimeout(() => {
      if (iframeRef.current) {
        iframeRef.current.src = '';
        // Another small delay before restoring src to ensure proper refresh
        setTimeout(() => {
          if (iframeRef.current) {
            iframeRef.current.src = currentSrc;
          }
        }, 50);
      }
    }, 100);
  }, [iframeRef, addConsoleEntry, setConsoleEntries, setEnvironmentStatus]);

  // Function to finish evaluation (same logic as existing evaluate)
  const finishEvaluation = useCallback(() => {
    if (
      !iframeRef.current ||
      environmentStatus !== 'online' ||
      !isEvaluationStarted
    )
      return;

    // Prevent multiple finish clicks by checking if already evaluating
    if (isEvaluating) return;

    // Check if environment requires parameters and validate them
    if (environment?.params && Object.keys(environment.params).length > 0) {
      const requiredParams = Object.keys(environment.params);
      const providedParams = Object.keys(parameters);

      // Check if all required parameters are provided
      const missingParams = requiredParams.filter(
        param => !providedParams.includes(param)
      );

      if (missingParams.length > 0) {
        addConsoleEntry(
          'error',
          `Missing required parameters: ${missingParams.join(', ')}`,
          { missingParams, requiredParams: environment.params }
        );
        return;
      }
    }

    // Immediately disable the finish button by setting both states
    setIsEvaluating(true);

    const command = {
      type: 'scalewob-command',
      id: `command_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      payload: {
        command: 'evaluate',
        params: parameters,
        trajectory: trajectory,
      },
    };

    // Send command to iframe
    iframeRef.current.contentWindow?.postMessage(command, '*');

    addConsoleEntry('action', 'Evaluation command sent - recording finished', {
      parametersProvided: Object.keys(parameters).length > 0,
      parameterCount: Object.keys(parameters).length,
      parameters: Object.keys(parameters).length > 0 ? parameters : undefined,
    });

    // Set a timeout as a fallback to reset states in case message doesn't arrive
    setTimeout(() => {
      setIsEvaluating(false);
      setIsEvaluationStarted(false);
    }, 10000); // 10 second timeout
  }, [
    iframeRef,
    environmentStatus,
    addConsoleEntry,
    isEvaluating,
    isEvaluationStarted,
    environment,
    parameters,
    trajectory,
  ]);

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
      drag: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3 h-3"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10 3L6 7h3v6H6l4 4 4-4h-3V7h3l-4-4z" />
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
    const currentEnvId = envId || '';

    if (!currentEnvId) {
      throw new Error('No environment ID provided');
    }

    // Construct CDN URL by concatenating base URL with environment ID
    return `https://niumascript.com/scalewob-env/${currentEnvId}/index.html`;
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
            drag: 'drag',
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

        // Capture actionable events in trajectory during evaluation
        if (isEvaluationStarted && !isEvaluating) {
          const actionableEventTypes = [
            'click',
            'keypress',
            'scroll',
            'touch',
            'drag',
            'navigation',
          ];
          if (actionableEventTypes.includes(eventType)) {
            setTrajectory(prev => [
              ...prev,
              {
                timestamp: Date.now(),
                type: eventType,
                data: data,
              },
            ]);
          }
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

      // Handle ScaleWoB bridge command responses
      else if (message.type === 'scalewob-response') {
        const { payload, id } = message;
        const { success, result, error } = payload;

        // Only process responses to evaluate commands from the launcher UI
        // Other command responses (click, get-state, type, etc.) should pass through
        // to allow Python SDK automation to work properly

        // Check if this is an evaluate command response based on:
        // 1. Command ID matches launcher's pattern (command_*)
        // 2. Result structure indicates evaluation response
        // 3. We're currently in evaluation mode

        const isEvaluateResponse =
          (id && id.startsWith('command_') && isEvaluationStarted) ||
          (result &&
            typeof result === 'object' &&
            ('score' in result ||
              'correctness' in result ||
              'evaluation' in result ||
              'success' in result));

        if (isEvaluateResponse) {
          if (success) {
            // Check if result contains a success field for the actual evaluation outcome
            const evaluationSuccess =
              result && typeof result === 'object' && 'success' in result
                ? result.success
                : true;

            if (evaluationSuccess) {
              addConsoleEntry('success', 'Test passed', result);
            } else {
              addConsoleEntry('error', 'Test failed', result);
            }
          } else {
            // Handle command execution failure
            addConsoleEntry('error', 'Evaluation command failed', {
              error,
              result,
            });
          }

          setIsEvaluating(false);
          // Reset evaluation started state to allow new evaluations
          setIsEvaluationStarted(false);
          // Return to Play Mode after evaluation completes
          setIsPlayMode(true);
        }
        // For non-evaluate responses, do nothing to allow Python SDK to receive them
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [
    eventPreferences,
    addConsoleEntry,
    setIsEvaluating,
    isEvaluationStarted,
    isEvaluating,
  ]);

  // Get platform-specific dimensions based on environment platform
  const getPlatformDimensions = () => {
    if (!environment) return { width: 390, height: 844 };

    switch (environment.platform) {
      case 'Mobile Interfaces':
        return { width: 390, height: 844 }; // Mobile phone aspect ratio
      case 'Web Applications':
      case 'Desktop Apps':
        return { width: 1280, height: 800 }; // Desktop/Web aspect ratio (16:10)
      default:
        return { width: 390, height: 844 }; // Default to mobile
    }
  };

  const platformDimensions = getPlatformDimensions();

  // Calculate and update scale based on container size
  useEffect(() => {
    const calculateScale = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Add padding/margin buffer (30px on each side for padding)
      const bufferWidth = 60;
      const bufferHeight = 60;

      const availableWidth = containerWidth - bufferWidth;
      const availableHeight = containerHeight - bufferHeight;

      // Calculate scale ratios for both dimensions
      const scaleX = availableWidth / platformDimensions.width;
      const scaleY = availableHeight / platformDimensions.height;

      // Use the smaller scale to ensure it fits in both dimensions
      const newScale = Math.min(scaleX, scaleY, 1); // Cap at 1 to avoid upscaling

      setScale(newScale);
    };

    // Use requestAnimationFrame to ensure DOM is ready and calculate immediately
    const rafId = requestAnimationFrame(() => {
      calculateScale();
    });

    // Add resize listener
    const resizeObserver = new ResizeObserver(calculateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Also listen to window resize as fallback
    window.addEventListener('resize', calculateScale);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', calculateScale);
    };
  }, [platformDimensions.width, platformDimensions.height]);

  // If environment is not found, show error
  if (!environment) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="max-w-2xl w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Environment Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            Environment &quot;{envId}&quot; is not available.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-sm hover:bg-gray-700 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Environments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header - Newspaper Style */}
      <div className="bg-white border-b border-gray-300 flex-shrink-0">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              {/* Back to Environments Button */}
              <button
                onClick={() => navigate(-1)}
                className="px-3 py-1 bg-gray-900 text-white text-xs font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors flex items-center flex-shrink-0"
              >
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back
              </button>

              <h1 className="text-lg font-bold text-gray-900 truncate">
                {environment.taskName}
              </h1>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* Environment Status - Newspaper Theme */}
              <div
                className={`flex items-center space-x-2 px-3 py-1 border-2 text-xs font-bold uppercase tracking-wide ${
                  environmentStatus === 'loading'
                    ? 'bg-gray-50 border-gray-300 text-gray-700'
                    : environmentStatus === 'online'
                      ? 'bg-gray-100 border-gray-400 text-gray-800'
                      : 'bg-red-50 border-red-300 text-red-700'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    environmentStatus === 'loading'
                      ? 'bg-yellow-500 animate-pulse'
                      : environmentStatus === 'online'
                        ? 'bg-green-500'
                        : 'bg-red-500'
                  }`}
                ></div>
                <span>
                  {environmentStatus === 'loading'
                    ? 'Loading'
                    : environmentStatus === 'online'
                      ? 'Live'
                      : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Functional Panel - Left Side */}
        <div className="flex flex-shrink-0 border-r-2 border-gray-300">
          {/* Vertical Tab Selector */}
          <div className="w-12 bg-gray-800 border-r-2 border-gray-300 flex flex-col">
            <div className="flex-1 flex flex-col py-2 space-y-1">
              <button
                onClick={() => setActiveTab('functions')}
                className={`relative group w-full py-3 px-1 flex items-center justify-center transition-colors duration-200 ${
                  activeTab === 'functions'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                title="Functions"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
                {activeTab === 'functions' && (
                  <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-blue-400"></div>
                )}
              </button>

              <button
                onClick={() => setActiveTab('filters')}
                className={`relative group w-full py-3 px-1 flex items-center justify-center transition-colors duration-200 ${
                  activeTab === 'filters'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                title="Filters"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                {activeTab === 'filters' && (
                  <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-blue-400"></div>
                )}
              </button>
            </div>
          </div>

          {/* Tab Content Panel */}
          <div className="w-80 flex-shrink-0 bg-gray-50 flex flex-col">
            {/* Functions Tab */}
            {activeTab === 'functions' && (
              <>
                <div className="p-4 border-b-2 border-gray-300 bg-gray-100">
                  <h2 className="text-sm font-bold uppercase text-gray-700">
                    Functions
                  </h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {/* Task Description */}
                  <div className="p-4 bg-white border-2 border-gray-300 rounded-lg">
                    <h3 className="text-sm font-bold text-gray-900 mb-2">
                      Task Description
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {environment.description}
                    </p>
                  </div>

                  {/* Evaluation Controls */}
                  <div className="space-y-4">
                    <div className="p-4 bg-white border-2 border-gray-300 rounded-lg">
                      <h3 className="text-sm font-bold text-gray-900 mb-3">
                        Evaluation Controls
                      </h3>
                      <div className="text-xs text-gray-500 space-y-1 mb-4">
                        <p>
                          • Press START to start your task session. The
                          environment will be reset to the initial state.
                        </p>
                        <p>
                          • Press FINISH to end your task session. The
                          environment will output the task score.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <button
                          onClick={startEvaluation}
                          disabled={isEvaluationStarted && !isEvaluating}
                          className={`w-full px-4 py-2 text-sm font-bold uppercase tracking-wide rounded transition-colors duration-200 flex items-center justify-center ${
                            isEvaluationStarted && !isEvaluating
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-2 border-gray-300'
                              : 'bg-green-600 text-white hover:bg-green-700 border-2 border-green-500'
                          }`}
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {isEvaluationStarted && !isEvaluating
                            ? 'Evaluation in Progress'
                            : 'Start Evaluation'}
                        </button>

                        <button
                          onClick={finishEvaluation}
                          disabled={!isEvaluationStarted || isEvaluating}
                          className={`w-full px-4 py-2 text-sm font-bold uppercase tracking-wide rounded transition-colors duration-200 flex items-center justify-center ${
                            !isEvaluationStarted || isEvaluating
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-2 border-gray-300'
                              : 'bg-blue-600 text-white hover:bg-blue-700 border-2 border-blue-500'
                          }`}
                        >
                          <>
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {isEvaluating ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            ) : null}
                            Finish Evaluation
                          </>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Evaluation Parameters - Only show if environment requires parameters */}
                  {environment?.params &&
                    Object.keys(environment.params).length > 0 && (
                      <ParameterInput
                        params={environment.params}
                        onParametersChange={setParameters}
                        disabled={!isEvaluationStarted}
                        disabledReason="not-started"
                      />
                    )}
                </div>
              </>
            )}

            {/* Filters Tab */}
            {activeTab === 'filters' && (
              <>
                <div className="p-4 border-b-2 border-gray-300 bg-gray-100">
                  <h2 className="text-sm font-bold uppercase text-gray-700">
                    Event Filters
                  </h2>
                </div>

                {/* Filter Categories */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {/* System Messages Category */}
                  <div>
                    <h4 className="text-xs font-bold uppercase text-gray-700 mb-3 flex items-center border-b border-gray-300 pb-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      System Messages
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(eventPreferences)
                        .filter(([type]) =>
                          [
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
                              className="flex items-center justify-between p-3 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-100 transition-all duration-200"
                            >
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() =>
                                    toggleEventPreference(
                                      eventType as keyof typeof eventPreferences
                                    )
                                  }
                                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 border-2 ${
                                    isEnabled
                                      ? 'bg-gray-900 border-gray-700'
                                      : 'bg-gray-300 border-gray-400'
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 border ${
                                      isEnabled
                                        ? 'translate-x-5 border-gray-300'
                                        : 'translate-x-1 border-gray-400'
                                    }`}
                                  />
                                </button>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-xs font-bold text-gray-900 uppercase tracking-wide truncate">
                                      {info.label}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 leading-tight">
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
                    <h4 className="text-xs font-bold uppercase text-gray-700 mb-3 flex items-center border-b border-gray-300 pb-2">
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
                              className="flex items-center justify-between p-3 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-100 transition-all duration-200"
                            >
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() =>
                                    toggleEventPreference(
                                      eventType as keyof typeof eventPreferences
                                    )
                                  }
                                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 border-2 ${
                                    isEnabled
                                      ? 'bg-gray-900 border-gray-700'
                                      : 'bg-gray-300 border-gray-400'
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 border ${
                                      isEnabled
                                        ? 'translate-x-5 border-gray-300'
                                        : 'translate-x-1 border-gray-400'
                                    }`}
                                  />
                                </button>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-xs font-bold text-gray-900 uppercase tracking-wide truncate">
                                      {info.label}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 leading-tight">
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
              </>
            )}
          </div>
        </div>

        {/* Iframe Container - Middle */}
        <div className="flex-1 min-w-0 flex flex-col bg-white overflow-hidden">
          {/* Iframe Container with Fixed Size - Newspaper Style */}
          <div
            ref={containerRef}
            className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-gray-50 overflow-hidden"
          >
            <div className="w-full max-w-fit">
              {/* Scaled container wrapper - matches visual size to layout size */}
              <div
                className="mx-auto"
                style={{
                  width: `${platformDimensions.width * scale}px`,
                  height: `${platformDimensions.height * scale}px`,
                  position: 'relative',
                }}
              >
                {/* Device Frame - Platform-specific styling */}
                <div
                  className="absolute top-0 left-0"
                  style={{
                    width: `${platformDimensions.width}px`,
                    height: `${platformDimensions.height}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    transition:
                      scale === 0.5 ? 'none' : 'transform 0.3s ease-out',
                  }}
                >
                  <div
                    className={`absolute inset-0 bg-gray-800 p-2 shadow-lg border-2 border-gray-600 ${
                      environment.platform === 'Mobile Interfaces'
                        ? 'rounded-2xl'
                        : 'rounded-lg'
                    }`}
                  >
                    <div
                      className={`relative w-full h-full bg-white overflow-hidden ${
                        environment.platform === 'Mobile Interfaces'
                          ? 'rounded-xl'
                          : 'rounded-md'
                      }`}
                    >
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
                          pointerEvents:
                            environmentStatus === 'online' &&
                            (isPlayMode || isEvaluationStarted)
                              ? 'auto'
                              : 'none',
                        }}
                        title="Environment"
                        onLoad={() => {
                          setEnvironmentStatus('online');
                          const source = 'CDN';
                          const isTestEnv = envId?.includes('test');
                          const platformType =
                            environment.platform === 'Mobile Interfaces'
                              ? 'Mobile'
                              : 'Desktop';

                          // Only show success message if this is not an evaluation refresh
                          if (
                            !isEvaluationRefresh &&
                            eventPreferences.success
                          ) {
                            addConsoleEntry(
                              'success',
                              `${platformType} environment loaded successfully from ${source}`
                            );
                          }

                          // Reset the evaluation refresh flag
                          if (isEvaluationRefresh) {
                            setIsEvaluationRefresh(false);
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

                      {/* Loading Overlay - Blocks interactions during loading */}
                      {environmentStatus !== 'online' && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
                          <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-gray-300 text-center max-w-xs mx-4">
                            {/* Loading Spinner */}
                            <div className="w-8 h-8 border-3 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>

                            {/* Loading Status Text */}
                            <div className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                              {environmentStatus === 'loading'
                                ? 'Loading'
                                : 'Offline'}
                            </div>

                            <div className="text-xs text-gray-600 leading-tight">
                              {environmentStatus === 'loading'
                                ? 'Environment is loading. Please wait...'
                                : 'Failed to load environment. Please try again.'}
                            </div>

                            {/* Additional loading indicator */}
                            {environmentStatus === 'loading' && (
                              <div className="mt-3 flex items-center justify-center space-x-1">
                                <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
                                <div
                                  className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"
                                  style={{ animationDelay: '0.2s' }}
                                ></div>
                                <div
                                  className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"
                                  style={{ animationDelay: '0.4s' }}
                                ></div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Close scaled container wrapper */}
              </div>
            </div>
          </div>
        </div>

        {/* Event Console - Right Side */}
        <div className="w-80 flex-shrink-0 bg-white border-l-2 border-gray-300 flex flex-col">
          <div className="p-4 border-b-2 border-gray-300 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase text-gray-700">
                Event Console
              </h2>

              {/* Current Mode Indicator */}
              <div
                className={`flex items-center space-x-2 px-3 py-1 border-2 text-xs font-bold uppercase tracking-wide flex-shrink-0 ${
                  isPlayMode
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : 'bg-blue-50 border-blue-300 text-blue-700'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isPlayMode ? 'bg-green-500 animate-pulse' : 'bg-blue-500'
                  }`}
                ></div>
                <span>{isPlayMode ? 'Play Mode' : 'Evaluate Mode'}</span>
              </div>
            </div>
          </div>

          {/* Console entries */}
          <div
            ref={consoleContentRef}
            className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400"
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
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1 uppercase tracking-wide">
                  No Events Yet
                </h3>
                <p className="text-xs text-gray-600">
                  Waiting for environment activity...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentLauncher;
