import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  lazy,
  Suspense,
} from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  useEnvironmentData,
  normalizeParameters,
  validateParameterValues,
} from '../services/environmentService';
import {
  ParameterDefinition,
  EnvironmentParameters,
  isJSONSchemaDefinition,
} from '../types/environment';
import { EnvironmentPreview } from '../types/environment';
import { ToastMessage, ToastContainer } from '../components/common/Toast';
import EvaluationStatusBanner from '../components/common/EvaluationStatusBanner';
import ConsoleIcon from '../components/common/ConsoleIcon';
import { ConsoleEntryType } from '../components/common/consoleIconConstants';

// Lazy load ParameterInput to avoid loading rjsf/lodash when not needed
const ParameterInput = lazy(
  () => import('../components/common/ParameterInput')
);

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

// Task definition from bridge
interface BridgeTask {
  taskId: number;
  task: string;
  params?: {
    type: string;
    properties?: Record<string, unknown>;
    required?: string[];
  };
}

// Common selected task type that includes both task and description
interface SelectedTask {
  taskId: number;
  task: string;
  description: string;
  params?: ParameterDefinition | EnvironmentParameters;
}

// Static console entry styles - defined outside component to avoid recreation
const CONSOLE_ENTRY_STYLES: Record<string, string> = {
  action:
    'relative bg-white border-l-4 border-blue-500 text-gray-900 hover:border-blue-600 hover:bg-blue-50 transition-all duration-200',
  info: 'relative bg-white border-l-4 border-gray-400 text-gray-900 hover:border-gray-500 hover:bg-gray-50 transition-all duration-200',
  error:
    'relative bg-white border-l-4 border-red-500 text-gray-900 hover:border-red-600 hover:bg-red-50 transition-all duration-200',
  success:
    'relative bg-white border-l-4 border-green-500 text-gray-900 hover:border-green-600 hover:bg-green-50 transition-all duration-200',
  default:
    'relative bg-white border-l-4 border-gray-400 text-gray-900 hover:border-gray-500 hover:bg-gray-50 transition-all duration-200',
};

const EnvironmentLauncher = () => {
  const { envId } = useParams<{ envId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const consoleContentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const evaluationTimeoutRef = useRef<number | null>(null);
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([]);
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(
    new Set()
  );
  // Environment status state - default to loading on mount
  const [environmentStatus, setEnvironmentStatus] = useState('loading'); // loading, online, offline

  // Scale state for responsive iframe - start with a smaller default to avoid flash
  const [scale, setScale] = useState(0.5);

  // Tab state for right panel
  const [activeTab, setActiveTab] = useState<
    'functions' | 'filters' | 'console'
  >('functions');

  // Play mode and evaluation mode state
  const [isPlayMode, setIsPlayMode] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isEvaluationStarted, setIsEvaluationStarted] = useState(false);

  // Task selection state
  const taskIdParam = searchParams.get('taskId');
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number>(
    taskIdParam ? parseInt(taskIdParam, 10) : 0
  );

  // Tasks fetched from bridge (priority over JSON)
  const [bridgeTasks, setBridgeTasks] = useState<BridgeTask[]>([]);
  const [tasksFromBridge, setTasksFromBridge] = useState(false);

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

  // Evaluation status tracking for banner display
  const [evaluationStatus, setEvaluationStatus] = useState<
    'idle' | 'evaluating' | 'success' | 'failed'
  >('idle');
  const [evaluationMessage, setEvaluationMessage] = useState('');
  const [evaluationStartTime, setEvaluationStartTime] = useState<number | null>(
    null
  );
  const [currentEvaluationCommandId, setCurrentEvaluationCommandId] = useState<
    string | null
  >(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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

  // Helper to convert task params to ParameterDefinition type
  const normalizeTaskParams = (
    params: ParameterDefinition | Record<string, unknown> | undefined
  ): ParameterDefinition | undefined => {
    if (!params) return undefined;
    if (isJSONSchemaDefinition(params as ParameterDefinition | undefined))
      return params as ParameterDefinition;
    // Convert EnvironmentParameters to LegacyParameterDefinition
    return params as ParameterDefinition;
  };

  // Get the currently selected task
  const selectedTask = useMemo((): SelectedTask => {
    // Priority 1: Use bridge tasks if available
    if (tasksFromBridge && bridgeTasks.length > 0) {
      // Find task by taskId (not array index)
      const foundTask = bridgeTasks.find(t => t.taskId === selectedTaskIndex);
      if (foundTask) {
        return {
          taskId: foundTask.taskId,
          task: foundTask.task,
          description: foundTask.task, // Bridge tasks use task as description
          params: foundTask.params as ParameterDefinition | undefined,
        };
      }
      // If taskId not found, default to first task
      const firstTask = bridgeTasks[0];
      return {
        taskId: firstTask.taskId,
        task: firstTask.task,
        description: firstTask.task,
        params: firstTask.params as ParameterDefinition | undefined,
      };
    }

    // Priority 2: Fallback to environments.json tasks
    if (!environment?.tasks || environment.tasks.length === 0) {
      // Fallback for environments without tasks array
      return {
        taskId: 0,
        task: environment?.name || environment?.taskName || 'Unknown Task',
        description: environment?.description || '',
        params: environment?.params,
      };
    }
    const index = Math.min(selectedTaskIndex, environment.tasks.length - 1);
    const envTask = environment.tasks[index];
    // Normalize environment task to have both task and description
    return {
      taskId: envTask.taskId ?? index,
      task: envTask.name || environment?.name || 'Unknown Task',
      description: envTask.description || environment?.description || '',
      params: envTask.params,
    };
  }, [environment, selectedTaskIndex, bridgeTasks, tasksFromBridge]);

  // Get the current logical index (1-based for display)
  const currentLogicalIndex = useMemo(() => {
    if (tasksFromBridge && bridgeTasks.length > 0) {
      const currentIndex = bridgeTasks.findIndex(
        t => t.taskId === selectedTaskIndex
      );
      return currentIndex === -1 ? 1 : currentIndex + 1;
    }
    // For JSON tasks, use 1-based index
    return selectedTaskIndex + 1;
  }, [selectedTaskIndex, bridgeTasks, tasksFromBridge]);

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

  // Static event info - defined outside component to avoid recreation on every render
  const EVENT_INFO_MAP: Record<
    string,
    { label: string; description: string; category: string }
  > = {
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

  /**
   * Send reset command to iframe
   */
  const sendResetCommand = useCallback(() => {
    if (!iframeRef.current || environmentStatus !== 'online') {
      addConsoleEntry('error', 'Cannot reset - iframe not ready', {
        status: environmentStatus,
      });
      return;
    }

    const command = {
      type: 'scalewob-command',
      id: `reset_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      payload: {
        command: 'reset',
        params: {},
      },
    };

    iframeRef.current.contentWindow?.postMessage(command, '*');
    addConsoleEntry('action', 'Reset command sent to environment');
  }, [iframeRef, environmentStatus, addConsoleEntry]);

  // Handle task selection change
  const handleTaskChange = useCallback(
    (newIndex: number) => {
      setSelectedTaskIndex(newIndex);
      setSearchParams({ taskId: String(newIndex) });

      // Reset evaluation state when task changes
      setIsPlayMode(true);
      setIsEvaluationStarted(false);
      setIsEvaluating(false);
      setParameters({});
      setTrajectory([]);
      setCurrentEvaluationCommandId(null);

      // Reset evaluation status banner
      setEvaluationStatus('idle');
      setEvaluationMessage('');
      setEvaluationStartTime(null);

      // Note: Iframe will reload with new taskId - CDN environment handles initialization

      // Log task change
      addConsoleEntry(
        'info',
        `Switched to task: ${selectedTask?.task || 'Unknown'}`,
        {
          taskId: newIndex,
          taskName: selectedTask?.task,
        }
      );
    },
    [setSearchParams, addConsoleEntry, selectedTask]
  );

  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    if (consoleContentRef.current) {
      consoleContentRef.current.scrollTop =
        consoleContentRef.current.scrollHeight;
    }
  }, [consoleEntries]);

  // Function to start evaluation (refresh + start recording)
  const startEvaluation = useCallback(() => {
    if (!iframeRef.current) return;

    // Send reset command before refreshing
    sendResetCommand();

    // Switch to Evaluate Mode
    setIsPlayMode(false);
    setIsEvaluationStarted(true);
    setIsEvaluating(false);

    // Clear console entries for fresh start
    setConsoleEntries([]);

    // Clear trajectory for fresh start
    setTrajectory([]);

    // Clear any previous evaluation request
    setCurrentEvaluationCommandId(null);

    // Set evaluation status to evaluating with start time
    setEvaluationStatus('evaluating');
    setEvaluationStartTime(Date.now());
    setEvaluationMessage('');

    // Log evaluation start
    addConsoleEntry(
      'action',
      'Starting evaluation - switching to Evaluate Mode'
    );

    // Set loading state first to ensure overlay shows
    setEnvironmentStatus('loading');

    // Set evaluation refresh flag to avoid duplicate success messages
    setIsEvaluationRefresh(true);

    // Refresh iframe with cache-busting timestamp
    const currentSrc = iframeRef.current.src;
    const separator = currentSrc.includes('?') ? '&' : '?';
    const cacheBustedSrc = `${currentSrc}${separator}_t=${Date.now()}`;

    setTimeout(() => {
      if (iframeRef.current) {
        iframeRef.current.src = cacheBustedSrc;
      }
    }, 100);
  }, [
    iframeRef,
    addConsoleEntry,
    setConsoleEntries,
    setEnvironmentStatus,
    sendResetCommand,
  ]);

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

    // Check if selected task requires parameters and validate them
    const taskParams = normalizeTaskParams(selectedTask?.params);
    if (taskParams && Object.keys(taskParams).length > 0) {
      // Normalize parameters to JSON Schema format and validate
      const normalizedSchema = normalizeParameters(taskParams);
      if (normalizedSchema) {
        const { valid, errors } = validateParameterValues(
          normalizedSchema,
          parameters
        );

        if (!valid) {
          const errorMessages =
            errors
              ?.map(
                err =>
                  `${err.instancePath.substring(1) || 'field'}: ${err.message}`
              )
              .join(', ') || 'Validation failed';

          addConsoleEntry(
            'error',
            `Parameter validation failed: ${errorMessages}`,
            { errors, parameters }
          );
          return;
        }
      }
    }

    // Clear any existing timeout before setting a new one
    if (evaluationTimeoutRef.current) {
      clearTimeout(evaluationTimeoutRef.current);
      evaluationTimeoutRef.current = null;
    }

    // Immediately disable the finish button by setting both states
    setIsEvaluating(true);

    const command = {
      type: 'scalewob-command',
      id: `command_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      payload: {
        command: 'evaluate',
        params: {
          ...parameters,
          taskId: selectedTaskIndex,
        },
        trajectory: trajectory,
      },
    };

    // Store the command ID so we only process responses to this explicit request
    setCurrentEvaluationCommandId(command.id);

    // Send command to iframe
    iframeRef.current.contentWindow?.postMessage(command, '*');

    addConsoleEntry('action', 'Evaluation command sent - recording finished', {
      parametersProvided: Object.keys(parameters).length > 0,
      parameterCount: Object.keys(parameters).length,
      parameters: Object.keys(parameters).length > 0 ? parameters : undefined,
    });

    // Set a timeout as a fallback to reset states in case message doesn't arrive
    // Store the timeout ID so we can clear it if response arrives
    evaluationTimeoutRef.current = setTimeout(() => {
      setIsEvaluating(false);
      setIsEvaluationStarted(false);
      setIsPlayMode(true);
      setCurrentEvaluationCommandId(null);
      evaluationTimeoutRef.current = null;

      addConsoleEntry('info', 'Evaluation timeout - states reset', {
        timeout: 10000,
      });
    }, 10000); // 10 second timeout
  }, [
    iframeRef,
    environmentStatus,
    addConsoleEntry,
    isEvaluating,
    isEvaluationStarted,
    selectedTask,
    selectedTaskIndex,
    parameters,
    trajectory,
    evaluationTimeoutRef,
  ]);

  // Get the current iframe source URL - CDN only
  const getIframeSrc = useCallback(() => {
    const currentEnvId = envId || '';

    if (!currentEnvId) {
      throw new Error('No environment ID provided');
    }

    // Construct CDN URL with taskId parameter
    const baseUrl = `https://niumascript.com/scalewob-env/${currentEnvId}/index.html`;
    return `${baseUrl}?taskId=${selectedTaskIndex}`;
  }, [envId, selectedTaskIndex]);

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

        // Extract tasks from init event
        if (eventType === 'init' && data.tasks && Array.isArray(data.tasks)) {
          setBridgeTasks(data.tasks);
          setTasksFromBridge(true);
          addConsoleEntry(
            'success',
            `Loaded ${data.tasks.length} tasks from environment`,
            { taskCount: data.tasks.length, source: 'bridge' }
          );

          // Auto-select first task if current selection is invalid
          const validTaskIds = data.tasks.map((t: BridgeTask) => t.taskId);
          if (!validTaskIds.includes(selectedTaskIndex)) {
            const firstTaskId = data.tasks[0]?.taskId ?? 0;
            setSelectedTaskIndex(firstTaskId);
            setSearchParams({ taskId: String(firstTaskId) });
            addConsoleEntry('info', `Auto-selected task ${firstTaskId}`, {
              reason: 'Previous selection invalid',
              previousTaskId: selectedTaskIndex,
              newTaskId: firstTaskId,
            });
          }
        }

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
        // 1. Command ID matches the explicit evaluation request we sent
        // 2. Result structure indicates evaluation response
        // 3. We have an active evaluation request (command ID is set)

        const isEvaluateResponse =
          id === currentEvaluationCommandId ||
          (result &&
            typeof result === 'object' &&
            currentEvaluationCommandId !== null &&
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
              // Set status to success
              setEvaluationStatus('success');
              setEvaluationMessage('');
              // Add success toast
              const toastId = `toast-${Date.now()}`;
              setToasts(prev => [
                ...prev,
                {
                  id: toastId,
                  message: `✓ Evaluation successful - ${trajectory.length} events captured`,
                  type: 'success',
                  duration: 5000,
                },
              ]);
              setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== toastId));
              }, 5000);
            } else {
              addConsoleEntry('error', 'Test failed', result);
              // Set status to failed
              setEvaluationStatus('failed');
              const errorMessage =
                typeof result === 'object' && result?.error
                  ? String(result.error)
                  : 'Evaluation failed';
              setEvaluationMessage(errorMessage);
              // Add error toast
              const toastId = `toast-${Date.now()}`;
              setToasts(prev => [
                ...prev,
                {
                  id: toastId,
                  message: `✗ Evaluation failed - View console for details`,
                  type: 'error',
                  duration: 7000,
                },
              ]);
              setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== toastId));
              }, 7000);
            }
          } else {
            // Handle command execution failure
            addConsoleEntry('error', 'Evaluation command failed', {
              error,
              result,
            });
            // Set status to failed
            setEvaluationStatus('failed');
            setEvaluationMessage(
              error ? String(error) : 'Evaluation command failed'
            );
            // Add error toast
            const toastId = `toast-${Date.now()}`;
            setToasts(prev => [
              ...prev,
              {
                id: toastId,
                message: `✗ Evaluation failed - ${error || 'Unknown error'}`,
                type: 'error',
                duration: 7000,
              },
            ]);
            setTimeout(() => {
              setToasts(prev => prev.filter(t => t.id !== toastId));
            }, 7000);
          }

          // Clear the timeout since we received the response
          if (evaluationTimeoutRef.current) {
            clearTimeout(evaluationTimeoutRef.current);
            evaluationTimeoutRef.current = null;
          }

          setIsEvaluating(false);
          // Reset evaluation started state to allow new evaluations
          setIsEvaluationStarted(false);
          // Return to Play Mode after evaluation completes
          setIsPlayMode(true);
          // Clear the command ID to allow new evaluations
          setCurrentEvaluationCommandId(null);
        }
        // For non-evaluate responses, do nothing to allow Python SDK to receive them
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    eventPreferences,
    addConsoleEntry,
    setIsEvaluating,
    isEvaluationStarted,
    isEvaluating,
  ]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (evaluationTimeoutRef.current) {
        clearTimeout(evaluationTimeoutRef.current);
      }
    };
  }, []);

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
    let debounceTimer: number | undefined;

    const calculateScale = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      const bufferWidth = 60;
      const bufferHeight = 60;

      const availableWidth = containerWidth - bufferWidth;
      const availableHeight = containerHeight - bufferHeight;

      const scaleX = availableWidth / platformDimensions.width;
      const scaleY = availableHeight / platformDimensions.height;

      const newScale = Math.min(scaleX, scaleY, 1);

      setScale(newScale);
    };

    const debouncedCalculate = () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = window.setTimeout(calculateScale, 16);
    };

    const rafId = requestAnimationFrame(() => {
      calculateScale();
    });

    const resizeObserver = new ResizeObserver(debouncedCalculate);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', debouncedCalculate);

    return () => {
      cancelAnimationFrame(rafId);
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      resizeObserver.disconnect();
      window.removeEventListener('resize', debouncedCalculate);
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
            onClick={() => navigate('/environments')}
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
    <>
      <div className="h-screen bg-white flex flex-col">
        {/* Header - Newspaper Style */}
        <div className="bg-white border-b border-gray-300 flex-shrink-0">
          <div className="px-4 py-2">
            <div className="flex items-center justify-between">
              {/* Left Section: Back button + Task name */}
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                {/* Back to Environments Button */}
                <button
                  onClick={() => navigate('/environments')}
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

              {/* Center Section: Mode Indicator */}
              <div className="flex items-center space-x-3 flex-shrink-0">
                {/* Mode Indicator */}
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
                  <span>{isPlayMode ? 'Play' : 'Evaluate'}</span>
                </div>
              </div>

              {/* Right Section: Status Indicator */}
              <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
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

                <button
                  onClick={() => setActiveTab('console')}
                  className={`relative group w-full py-3 px-1 flex items-center justify-center transition-colors duration-200 ${
                    activeTab === 'console'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                  title="Event Console"
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
                      d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {activeTab === 'console' && (
                    <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-blue-400"></div>
                  )}
                </button>
              </div>
            </div>

            {/* Tab Content Panel */}
            <div className="w-96 flex-shrink-0 bg-gray-50 flex flex-col">
              {/* Functions Tab */}
              {activeTab === 'functions' && (
                <>
                  <div className="p-4 border-b-2 border-gray-300 bg-gray-100">
                    <h2 className="text-sm font-bold uppercase text-gray-700">
                      Functions
                    </h2>
                  </div>
                  <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
                    {/* Fixed content area - Task Selector + Task Description + Parameters */}
                    <div className="p-4 space-y-4 flex-shrink-0">
                      {/* Task Panel - Combined Selection and Description */}
                      <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b-2 border-gray-300">
                          <h3 className="text-sm font-bold text-gray-900">
                            Task Description
                          </h3>
                          {(tasksFromBridge
                            ? bridgeTasks.length > 1
                            : environment?.tasks &&
                              environment.tasks.length > 1) && (
                            <span className="text-xs text-gray-600 font-semibold">
                              {tasksFromBridge
                                ? `${bridgeTasks.length} tasks`
                                : `${environment?.tasks.length} tasks`}
                            </span>
                          )}
                        </div>

                        {/* Task Description - Centered */}
                        <div className="flex items-center justify-center px-4 py-8 min-h-[120px]">
                          <p className="text-sm text-gray-700 leading-relaxed text-center max-w-md">
                            {selectedTask?.task ||
                              selectedTask?.description ||
                              environment?.description}
                          </p>
                        </div>

                        {/* Navigation Controls - only show if multiple tasks */}
                        {(tasksFromBridge
                          ? bridgeTasks.length > 1
                          : environment?.tasks &&
                            environment.tasks.length > 1) && (
                          <div className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 border-t-2 border-gray-300">
                            {/* Previous Button */}
                            <button
                              onClick={() => {
                                if (tasksFromBridge) {
                                  // Get current task index in bridge tasks array
                                  const currentIndex = bridgeTasks.findIndex(
                                    t => t.taskId === selectedTaskIndex
                                  );
                                  if (currentIndex === -1) return;

                                  const prevIndex =
                                    currentIndex === 0
                                      ? bridgeTasks.length - 1
                                      : currentIndex - 1;
                                  const newTaskId =
                                    bridgeTasks[prevIndex].taskId;
                                  handleTaskChange(newTaskId);
                                } else {
                                  const newIndex =
                                    selectedTaskIndex === 0
                                      ? environment!.tasks.length - 1
                                      : selectedTaskIndex - 1;
                                  handleTaskChange(newIndex);
                                }
                              }}
                              className="px-2 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 rounded transition-colors flex items-center justify-center"
                              title="Previous task"
                            >
                              <svg
                                className="w-3.5 h-3.5 text-gray-700"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M15 19l-7-7 7-7"
                                />
                              </svg>
                            </button>

                            {/* Task Number Input */}
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={1}
                                max={
                                  tasksFromBridge
                                    ? bridgeTasks.length
                                    : environment?.tasks.length
                                }
                                value={currentLogicalIndex}
                                onChange={e => {
                                  const value = parseInt(e.target.value, 10);
                                  if (tasksFromBridge) {
                                    // Convert logical index (1-based) to actual taskId
                                    const actualIndex = value - 1;
                                    if (
                                      !isNaN(value) &&
                                      actualIndex >= 0 &&
                                      actualIndex < bridgeTasks.length
                                    ) {
                                      const newTaskId =
                                        bridgeTasks[actualIndex].taskId;
                                      handleTaskChange(newTaskId);
                                    }
                                  } else {
                                    // For JSON tasks, convert to 0-based index
                                    if (
                                      !isNaN(value) &&
                                      value >= 1 &&
                                      value <= environment!.tasks.length
                                    ) {
                                      handleTaskChange(value - 1);
                                    }
                                  }
                                }}
                                className="w-14 px-2 py-1.5 text-center text-xs font-semibold border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
                              />
                              <span className="text-xs text-gray-600 font-medium">
                                of{' '}
                                {tasksFromBridge
                                  ? bridgeTasks.length
                                  : environment?.tasks.length}
                              </span>
                            </div>

                            {/* Next Button */}
                            <button
                              onClick={() => {
                                if (tasksFromBridge) {
                                  // Get current task index in bridge tasks array
                                  const currentIndex = bridgeTasks.findIndex(
                                    t => t.taskId === selectedTaskIndex
                                  );
                                  if (currentIndex === -1) return;

                                  const nextIndex =
                                    currentIndex === bridgeTasks.length - 1
                                      ? 0
                                      : currentIndex + 1;
                                  const newTaskId =
                                    bridgeTasks[nextIndex].taskId;
                                  handleTaskChange(newTaskId);
                                } else {
                                  const newIndex =
                                    selectedTaskIndex ===
                                    environment!.tasks.length - 1
                                      ? 0
                                      : selectedTaskIndex + 1;
                                  handleTaskChange(newIndex);
                                }
                              }}
                              className="px-2 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 rounded transition-colors flex items-center justify-center"
                              title="Next task"
                            >
                              <svg
                                className="w-3.5 h-3.5 text-gray-700"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Evaluation Controls - In a row */}
                      <div className="flex items-center space-x-3">
                        {/* Start Evaluation Button */}
                        <button
                          onClick={startEvaluation}
                          disabled={isEvaluationStarted && !isEvaluating}
                          className={`flex-1 px-4 py-2 text-sm font-bold uppercase tracking-wide rounded transition-colors duration-200 flex items-center justify-center ${
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
                            ? 'In Progress'
                            : 'Start'}
                        </button>

                        {/* Finish Evaluation Button */}
                        <button
                          onClick={finishEvaluation}
                          disabled={!isEvaluationStarted || isEvaluating}
                          className={`flex-1 px-4 py-2 text-sm font-bold uppercase tracking-wide rounded transition-colors duration-200 flex items-center justify-center ${
                            !isEvaluationStarted || isEvaluating
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-2 border-gray-300'
                              : 'bg-blue-600 text-white hover:bg-blue-700 border-2 border-blue-500'
                          }`}
                        >
                          {isEvaluating && (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          )}
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
                          Finish
                        </button>
                      </div>

                      {/* Evaluation Status Banner */}
                      <EvaluationStatusBanner
                        status={evaluationStatus}
                        message={evaluationMessage}
                        eventsCount={trajectory.length}
                        startTime={evaluationStartTime}
                        onDismiss={() => {
                          setEvaluationStatus('idle');
                          setEvaluationMessage('');
                        }}
                      />

                      {/* Evaluation Parameters - Only show if selected task requires parameters */}
                      {selectedTask?.params &&
                        (() => {
                          const normalizedSchema = normalizeParameters(
                            normalizeTaskParams(selectedTask.params)
                          );
                          return (
                            normalizedSchema &&
                            Object.keys(normalizedSchema.properties || {})
                              .length > 0
                          );
                        })() && (
                          <Suspense
                            fallback={
                              <div className="animate-pulse bg-gray-100 h-32 rounded border-2 border-gray-300" />
                            }
                          >
                            <ParameterInput
                              schema={
                                normalizeParameters(
                                  normalizeTaskParams(selectedTask.params)
                                )!
                              }
                              onParametersChange={params =>
                                setParameters(
                                  params as Record<
                                    string,
                                    string | number | boolean
                                  >
                                )
                              }
                              disabled={!isEvaluationStarted}
                              disabledReason="not-started"
                              initialValues={parameters}
                            />
                          </Suspense>
                        )}
                    </div>
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
                            const info =
                              EVENT_INFO_MAP[eventType] ||
                              EVENT_INFO_MAP.unknown;
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
                            const info =
                              EVENT_INFO_MAP[eventType] ||
                              EVENT_INFO_MAP.unknown;
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

              {/* Console Tab */}
              {activeTab === 'console' && (
                <>
                  <div className="p-4 border-b-2 border-gray-300 bg-gray-100">
                    <h2 className="text-sm font-bold uppercase text-gray-700">
                      Event Console
                    </h2>
                  </div>

                  {/* Console entries - scrollable */}
                  <div
                    ref={consoleContentRef}
                    className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-3 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400"
                  >
                    {consoleEntries
                      .filter(entry => shouldDisplayEvent(entry.type))
                      .map(entry => (
                        <div
                          key={entry.id}
                          className={`${CONSOLE_ENTRY_STYLES[entry.type] || CONSOLE_ENTRY_STYLES.default} p-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100`}
                          onClick={() => toggleEntryExpansion(entry.id)}
                        >
                          <div className="flex flex-col">
                            {/* Icon + message row */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-2 flex-1">
                                <ConsoleIcon
                                  type={entry.type as ConsoleEntryType}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium">
                                    {entry.message}
                                  </div>
                                  <div className="text-xs opacity-75 mt-0.5">
                                    {new Date(
                                      entry.timestamp
                                    ).toLocaleTimeString()}
                                  </div>
                                </div>
                              </div>
                              {/* Expand button */}
                              <div className="flex items-center space-x-1 ml-2">
                                {entry.details && (
                                  <button
                                    onClick={e => {
                                      e.stopPropagation();
                                      toggleEntryExpansion(entry.id);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 text-xs"
                                  >
                                    {expandedEntries.has(entry.id) ? '▼' : '▶'}
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Expanded metadata */}
                            {expandedEntries.has(entry.id) && entry.details && (
                              <div className="mt-2 p-2 bg-white bg-opacity-90 rounded border border-gray-200 w-full">
                                <div className="text-xs font-mono">
                                  {Object.entries(entry.details).map(
                                    ([key, value]) => (
                                      <div
                                        key={key}
                                        className="mb-1 wrap-break-words"
                                      >
                                        <span className="font-semibold text-gray-600">
                                          {key}:
                                        </span>{' '}
                                        <span className="text-gray-800 whitespace-pre-wrap">
                                          {typeof value === 'object'
                                            ? JSON.stringify(value, null, 2)
                                            : String(value)}
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                    {consoleEntries.length === 0 && (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <svg
                            className="w-6 h-6 text-gray-600"
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
                        <h3 className="text-xs font-bold text-gray-900 mb-1 uppercase tracking-wide">
                          No Events Yet
                        </h3>
                        <p className="text-xs text-gray-600">
                          Waiting for activity...
                        </p>
                      </div>
                    )}
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
                          loading="lazy"
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

                            // Don't send reset on load - CDN environment handles its own initialization
                            // Reset is only sent explicitly when switching tasks or starting evaluation

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
        </div>
      </div>

      {/* Toast notifications */}
      <ToastContainer
        toasts={toasts}
        onRemove={id => setToasts(prev => prev.filter(t => t.id !== id))}
      />
    </>
  );
};

export default EnvironmentLauncher;
