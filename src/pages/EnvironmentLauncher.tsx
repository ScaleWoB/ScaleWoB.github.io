import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEnvironmentData } from '../services/environmentService';
import { EnvironmentPreview } from '../types/environment';
import {
  getEnvironmentUrl,
  getCdnUrl,
  hasCdnUrl,
} from '../config/environmentUrls';

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
  const [isLoading, setIsLoading] = useState(true);
  const [isScriptInjected, setIsScriptInjected] = useState(false);
  const [useCdn, setUseCdn] = useState(true);
  const [cdnStatus, setCdnStatus] = useState<
    'checking' | 'available' | 'failed' | 'config-error'
  >('checking');
  const [loadingSource, setLoadingSource] = useState<
    'cdn' | 'local' | 'fallback'
  >('cdn');

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
    setConsoleEntries(prev => [...prev.slice(-99), newEntry]); // Keep last 100 entries
  };

  // Enhanced CDN availability checking with header validation and CORS handling
  const checkCdnAvailability = useCallback(
    async (url: string): Promise<boolean> => {
      let hasConfigError = false;

      // First try with CORS to get detailed header information
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout for CORS

        const response = await fetch(url, {
          method: 'HEAD',
          mode: 'cors',
          cache: 'no-cache',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Check for problematic headers that would cause download behavior
        const contentDisposition = response.headers.get('content-disposition');
        const forceDownload = response.headers.get('x-oss-force-download');

        if (
          contentDisposition?.includes('attachment') ||
          forceDownload === 'true'
        ) {
          hasConfigError = true;
          if (eventPreferences.error) {
            addConsoleEntry(
              'error',
              'CDN configuration issue: Content-Disposition forces download instead of iframe display',
              {
                url,
                contentDisposition,
                forceDownload,
                recommendation:
                  'Configure CDN to remove Content-Disposition: attachment header for HTML files',
              }
            );
          }
        }

        return !hasConfigError;
      } catch (error) {
        // If CORS fails, try basic accessibility check with no-cors
        if (
          error instanceof Error &&
          (error.message.includes('CORS') ||
            error.message.includes('Failed to fetch'))
        ) {
          if (eventPreferences.error) {
            addConsoleEntry(
              'error',
              'CDN CORS not enabled - cannot check headers, but will test basic accessibility',
              { url, corsIssue: true }
            );
          }

          // Fallback: Basic accessibility test without CORS
          try {
            const fallbackController = new AbortController();
            const fallbackTimeout = setTimeout(
              () => fallbackController.abort(),
              5000
            );

            await fetch(url, {
              method: 'HEAD',
              mode: 'no-cors',
              cache: 'no-cache',
              signal: fallbackController.signal,
            });

            clearTimeout(fallbackTimeout);

            // Assume config error since we know from testing that Content-Disposition: attachment is set
            if (eventPreferences.error) {
              addConsoleEntry(
                'error',
                'CDN has known configuration issues (Content-Disposition: attachment, CORS disabled) - use local environment',
                {
                  url,
                  contentDisposition: 'attachment',
                  corsEnabled: false,
                  recommendation:
                    'Configure CDN: 1) Enable CORS, 2) Remove Content-Disposition: attachment for HTML files',
                }
              );
            }

            setCdnStatus('config-error');
            return false;
          } catch (fallbackError) {
            if (eventPreferences.error) {
              addConsoleEntry(
                'error',
                'CDN completely inaccessible - both CORS and basic requests failed',
                {
                  url,
                  corsError: error.message,
                  basicAccessError:
                    fallbackError instanceof Error
                      ? fallbackError.message
                      : 'Unknown',
                }
              );
            }
            return false;
          }
        }

        // Handle other types of errors (timeout, network issues)
        if (error instanceof Error && error.name === 'AbortError') {
          console.warn('CDN check timed out');
          if (eventPreferences.error) {
            addConsoleEntry(
              'error',
              'CDN availability check timed out after 3 seconds'
            );
          }
        } else {
          console.warn('CDN not available, falling back to local:', error);
          if (eventPreferences.error) {
            addConsoleEntry(
              'error',
              'CDN not accessible, falling back to local environment',
              {
                error: error instanceof Error ? error.message : 'Unknown error',
              }
            );
          }
        }
        return false;
      }
    },
    [eventPreferences.error]
  );

  // Get the current iframe source URL
  const getIframeSrc = useCallback(() => {
    const currentEnvId = envId || 'env-006';
    if (useCdn && hasCdnUrl(currentEnvId)) {
      return getEnvironmentUrl(currentEnvId, true);
    }
    return getEnvironmentUrl(currentEnvId, false);
  }, [useCdn, envId]);

  // Handle iframe loading errors with CDN fallback
  const handleIframeError = useCallback(() => {
    if (useCdn) {
      if (eventPreferences.error) {
        addConsoleEntry(
          'error',
          'CDN environment failed to load, switching to local'
        );
      }
      setUseCdn(false);
      setCdnStatus('failed');
      setLoadingSource('fallback');
    } else {
      if (eventPreferences.error) {
        addConsoleEntry(
          'error',
          'Both CDN and local environments failed to load'
        );
      }
    }
  }, [useCdn, eventPreferences.error]);

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
        description: 'Touch screen interactions',
        category: 'Interactions',
      },
      navigation: {
        label: 'Navigation',
        description: 'Page navigation events',
        category: 'Interactions',
      },
      'dom-change': {
        label: 'DOM Changes',
        description: 'Dynamic content updates',
        category: 'Interactions',
      },
      unknown: {
        label: 'Unknown',
        description: 'Uncategorized events',
        category: 'Interactions',
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

  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    if (consoleContentRef.current) {
      // Scroll to bottom smoothly
      consoleContentRef.current.scrollTop =
        consoleContentRef.current.scrollHeight;
    }
  }, [consoleEntries]);

  // Initialize CDN availability on component mount
  useEffect(() => {
    const initializeEnvironment = async () => {
      const currentEnvId = envId || 'env-006';
      const cdnUrl = getCdnUrl(currentEnvId);

      if (useCdn && cdnUrl) {
        setCdnStatus('checking');
        setLoadingSource('cdn');

        if (eventPreferences.info) {
          addConsoleEntry(
            'info',
            `Checking CDN availability for ${currentEnvId}...`
          );
        }

        const isCdnAvailable = await checkCdnAvailability(cdnUrl);

        if (isCdnAvailable) {
          setCdnStatus('available');
          if (eventPreferences.success) {
            addConsoleEntry(
              'success',
              'CDN environment is available and loading'
            );
          }
        } else {
          setCdnStatus('failed');
          setUseCdn(false);
          setLoadingSource('local');
          if (eventPreferences.info) {
            addConsoleEntry(
              'info',
              'CDN not available, switching to local environment'
            );
          }
        }
      } else {
        setCdnStatus('failed');
        setLoadingSource('local');
        if (eventPreferences.info) {
          addConsoleEntry(
            'info',
            'Using local environment (CDN not configured or disabled)'
          );
        }
      }
    };

    initializeEnvironment();
  }, [
    envId,
    useCdn,
    checkCdnAvailability,
    eventPreferences.info,
    eventPreferences.success,
  ]);

  // Enhanced event tracking script injection
  const injectEventTrackingScript = () => {
    if (
      !iframeRef.current?.contentWindow ||
      !iframeRef.current.contentDocument ||
      isScriptInjected
    ) {
      return;
    }

    const script = `
      (function() {
        console.log('🚀 ScaleCUA Event Tracker: Starting initialization...');

        // Fixed postMessage function - CRITICAL FIX: Remove duplicate 'type' key
        function sendEvent(type, message, details) {
          try {
            window.parent.postMessage({
              type: 'user-interaction',
              eventType: type,  // Fixed: Use different key name
              message: message,
              details: details
            }, '*');
          } catch (error) {
            console.error('ScaleCUA: Error sending event:', error);
          }
        }

        // Wait for Vue app to be ready
        function waitForVue() {
          return new Promise((resolve) => {
            const checkVue = () => {
              // Check if Vue app is mounted by looking for common Vue patterns
              if (window.Vue ||
                  document.querySelector('#app').children.length > 0 ||
                  document.querySelector('[data-v-]') ||
                  document.querySelector('.vue-')) {
                console.log('✅ ScaleCUA: Vue app detected');
                resolve(true);
              } else {
                setTimeout(checkVue, 100);
              }
            };

            // Start checking immediately, but timeout after 5 seconds
            checkVue();
            setTimeout(() => {
              console.log('⚠️ ScaleCUA: Vue app detection timeout, proceeding anyway');
              resolve(false);
            }, 5000);
          });
        }

        // Enhanced event tracking with Vue compatibility
        function setupEventTracking() {
          console.log('🔧 ScaleCUA: Setting up event listeners...');

          // Track clicks with better detail extraction
          document.addEventListener('click', function(e) {
            const target = e.target;
            const details = {
              tagName: target.tagName,
              id: target.id || '',
              className: target.className || '',
              text: target.textContent?.substring(0, 50) || '',
              x: e.clientX,
              y: e.clientY,
              timestamp: Date.now(),
              // Vue-specific details
              vueId: target.getAttribute('data-v-') || '',
              isVueComponent: !!target.getAttribute('data-v-'),
              // Form-specific details
              inputType: target.type || '',
              inputName: target.name || '',
              inputValue: target.value ? String(target.value).substring(0, 30) : ''
            };

            sendEvent('click', 'Clicked on ' + (target.tagName.toLowerCase() || 'element'), details);
          });

          // Track keypresses with enhanced context
          document.addEventListener('keydown', function(e) {
            const details = {
              key: e.key,
              code: e.code,
              ctrlKey: e.ctrlKey,
              shiftKey: e.shiftKey,
              altKey: e.altKey,
              metaKey: e.metaKey,
              timestamp: Date.now(),
              target: {
                tagName: e.target.tagName,
                id: e.target.id || '',
                className: e.target.className || '',
                inputType: e.target.type || '',
                isInput: ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)
              }
            };

            sendEvent('keypress', 'Pressed key: ' + e.key, details);
          });

          // Enhanced scroll detection with unified debounce timer and delta accumulation
          let scrollTimeout;
          let lastScrollEvent = null;
          let wheelEventData = null;
          let accumulatedDelta = { deltaY: 0, deltaX: 0 };
          let scrollSessionStart = 0;

          // Function to handle any scroll-related event with unified debouncing
          function handleUnifiedScrollEvent(eventData) {
            const now = Date.now();

            // Start new scroll session if this is the first event in a while
            if (now - scrollSessionStart > 1000) {
              accumulatedDelta = { deltaY: 0, deltaX: 0 };
              scrollSessionStart = now;
            }

            // Accumulate wheel delta values
            if (eventData.details.eventType === 'wheel') {
              accumulatedDelta.deltaY += eventData.details.deltaY;
              accumulatedDelta.deltaX += eventData.details.deltaX;
              wheelEventData = eventData;
            }

            // Store the latest event data
            lastScrollEvent = eventData;

            // Clear any existing timer
            clearTimeout(scrollTimeout);

            // Set unified debounce timer
            scrollTimeout = setTimeout(() => {
              if (lastScrollEvent) {
                // Merge accumulated wheel data if available
                const finalEventData = { ...lastScrollEvent };
                if (wheelEventData && (Math.abs(accumulatedDelta.deltaY) > 0 || Math.abs(accumulatedDelta.deltaX) > 0)) {
                  // Use accumulated delta values
                  finalEventData.details = {
                    ...finalEventData.details,
                    deltaY: accumulatedDelta.deltaY,
                    deltaX: accumulatedDelta.deltaX,
                    deltaMode: wheelEventData.details.deltaMode,
                    hadWheelInput: true,
                    scrollSessionDuration: now - scrollSessionStart
                  };

                  // Update message to show scroll direction based on magnitude comparison
                  if (finalEventData.details.eventType === 'wheel') {
                    const absDeltaY = Math.abs(accumulatedDelta.deltaY);
                    const absDeltaX = Math.abs(accumulatedDelta.deltaX);

                    let direction;
                    if (absDeltaX > absDeltaY) {
                      // Horizontal scroll is dominant
                      direction = accumulatedDelta.deltaX > 0 ? 'right' : 'left';
                    } else {
                      // Vertical scroll is dominant
                      direction = accumulatedDelta.deltaY > 0 ? 'down' : 'up';
                    }

                    finalEventData.message = 'Scrolled ' + direction;
                  }
                }

                sendEvent('scroll', finalEventData.message, finalEventData.details);
                lastScrollEvent = null;
                wheelEventData = null;
                accumulatedDelta = { deltaY: 0, deltaX: 0 };
              }
            }, 300);
          }

          // 1. Document-level scroll events
          document.addEventListener('scroll', function(e) {
            const scrollPosition = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
            const eventData = {
              message: 'Document scrolled to ' + scrollPosition + 'px',
              details: {
                target: 'document',
                scrollPosition: scrollPosition,
                windowHeight: window.innerHeight,
                documentHeight: document.documentElement.scrollHeight,
                timestamp: Date.now(),
                isDocumentScroll: true,
                eventType: 'document-scroll'
              }
            };
            handleUnifiedScrollEvent(eventData);
          });

          // 2. Wheel events (captures scroll attempts even on non-scrollable elements)
          document.addEventListener('wheel', function(e) {
            // Only process if there's actual scroll movement
            if (Math.abs(e.deltaY) > 0 || Math.abs(e.deltaX) > 0) {
              const eventData = {
                message: 'Wheel event detected (deltaY: ' + e.deltaY + ')',
                details: {
                  deltaY: e.deltaY,
                  deltaX: e.deltaX,
                  deltaMode: e.deltaMode,
                  target: e.target.tagName.toLowerCase() + (e.target.id ? '#' + e.target.id : ''),
                  timestamp: Date.now(),
                  isDocumentScroll: false,
                  eventType: 'wheel'
                }
              };
              handleUnifiedScrollEvent(eventData);
            }
          }, { passive: true });

          // 3. Find and monitor scrollable elements
          function findAndMonitorScrollableElements() {
            // CSS selectors for potentially scrollable elements
            const scrollableSelectors = [
              '[style*="overflow: scroll"]',
              '[style*="overflow: auto"]',
              '[style*="overflow-y: scroll"]',
              '[style*="overflow-y: auto"]',
              '[style*="overflow-x: scroll"]',
              '[style*="overflow-x: auto"]',
              '.scrollable',
              '[class*="scroll"]'
            ];

            scrollableSelectors.forEach(selector => {
              try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                  // Avoid adding duplicate listeners
                  if (!element.hasAttribute('data-scroll-monitored')) {
                    element.setAttribute('data-scroll-monitored', 'true');

                    element.addEventListener('scroll', function(e) {
                      const scrollPosition = e.target.scrollTop || e.target.scrollY || 0;
                      const eventData = {
                        message: 'Element ' + (e.target.tagName.toLowerCase() + (e.target.id ? '#' + e.target.id : '') + (e.target.className ? '.' + e.target.className.split(' ').join('.') : '')) + ' scrolled to ' + scrollPosition + 'px',
                        details: {
                          target: e.target.tagName.toLowerCase() + (e.target.id ? '#' + e.target.id : '') + (e.target.className ? '.' + e.target.className.split(' ').join('.') : ''),
                          scrollPosition: scrollPosition,
                          windowHeight: window.innerHeight,
                          documentHeight: document.documentElement.scrollHeight,
                          timestamp: Date.now(),
                          isDocumentScroll: false,
                          eventType: 'element-scroll'
                        }
                      };
                      handleUnifiedScrollEvent(eventData);
                    });
                  }
                });
              } catch (error) {
                console.warn('ScaleCUA: Error finding scrollable elements with selector', selector, error);
              }
            });
          }

          // 4. Touch events for mobile scrolling
          document.addEventListener('touchmove', function(e) {
            const eventData = {
              message: 'Touch move detected',
              details: {
                touches: e.touches.length,
                touchY: e.touches[0]?.clientY || 0,
                touchX: e.touches[0]?.clientX || 0,
                target: e.target.tagName.toLowerCase() + (e.target.id ? '#' + e.target.id : ''),
                timestamp: Date.now(),
                isDocumentScroll: false,
                eventType: 'touch'
              }
            };
            handleUnifiedScrollEvent(eventData);
          }, { passive: true });

          // Initial scan for scrollable elements
          findAndMonitorScrollableElements();

          // Monitor for dynamically added scrollable elements
          const scrollableObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
              if (mutation.type === 'childList') {
                // Check if any new elements might be scrollable
                mutation.addedNodes.forEach(function(node) {
                  if (node.nodeType === Node.ELEMENT_NODE) {
                    // Check the node itself
                    if (node.scrollHeight > node.clientHeight || node.scrollWidth > node.clientWidth) {
                      if (!node.hasAttribute('data-scroll-monitored')) {
                        node.setAttribute('data-scroll-monitored', 'true');
                        node.addEventListener('scroll', function(e) {
                          const scrollPosition = e.target.scrollTop || e.target.scrollY || 0;
                          const eventData = {
                            message: 'Element ' + (e.target.tagName.toLowerCase() + (e.target.id ? '#' + e.target.id : '') + (e.target.className ? '.' + e.target.className.split(' ').join('.') : '')) + ' scrolled to ' + scrollPosition + 'px',
                            details: {
                              target: e.target.tagName.toLowerCase() + (e.target.id ? '#' + e.target.id : '') + (e.target.className ? '.' + e.target.className.split(' ').join('.') : ''),
                              scrollPosition: scrollPosition,
                              windowHeight: window.innerHeight,
                              documentHeight: document.documentElement.scrollHeight,
                              timestamp: Date.now(),
                              isDocumentScroll: false,
                              eventType: 'dynamic-element-scroll'
                            }
                          };
                          handleUnifiedScrollEvent(eventData);
                        });
                      }
                    }

                    // Check its children
                    try {
                      const scrollableChildren = node.querySelectorAll('[style*="overflow"]');
                      scrollableChildren.forEach(element => {
                        if (!element.hasAttribute('data-scroll-monitored')) {
                          element.setAttribute('data-scroll-monitored', 'true');
                          element.addEventListener('scroll', function(e) {
                            const scrollPosition = e.target.scrollTop || e.target.scrollY || 0;
                            const eventData = {
                              message: 'Element ' + (e.target.tagName.toLowerCase() + (e.target.id ? '#' + e.target.id : '') + (e.target.className ? '.' + e.target.className.split(' ').join('.') : '')) + ' scrolled to ' + scrollPosition + 'px',
                              details: {
                                target: e.target.tagName.toLowerCase() + (e.target.id ? '#' + e.target.id : '') + (e.target.className ? '.' + e.target.className.split(' ').join('.') : ''),
                                scrollPosition: scrollPosition,
                                windowHeight: window.innerHeight,
                                documentHeight: document.documentElement.scrollHeight,
                                timestamp: Date.now(),
                                isDocumentScroll: false,
                                eventType: 'dynamic-element-scroll'
                              }
                            };
                            handleUnifiedScrollEvent(eventData);
                          });
                        }
                      });
                    } catch (error) {
                      // Ignore selector errors
                    }
                  }
                });
              }
            });
          });

          scrollableObserver.observe(document.body, {
            childList: true,
            subtree: true
          });

          // Rescan periodically for new scrollable elements
          setInterval(findAndMonitorScrollableElements, 2000);

          // Track focus events with better context
          document.addEventListener('focus', function(e) {
            const details = {
              tagName: e.target.tagName,
              type: e.target.type || '',
              id: e.target.id || '',
              className: e.target.className || '',
              placeholder: e.target.placeholder || '',
              timestamp: Date.now()
            };

            sendEvent('focus', 'Focused on ' + (e.target.tagName.toLowerCase() || 'element'), details);
          }, true);

          // Track blur events
          document.addEventListener('blur', function(e) {
            const details = {
              tagName: e.target.tagName,
              type: e.target.type || '',
              id: e.target.id || '',
              className: e.target.className || '',
              timestamp: Date.now()
            };

            sendEvent('blur', 'Blurred from ' + (e.target.tagName.toLowerCase() || 'element'), details);
          }, true);

          // Track form submissions
          document.addEventListener('submit', function(e) {
            const details = {
              action: e.target.action || '',
              method: e.target.method || '',
              id: e.target.id || '',
              className: e.target.className || '',
              timestamp: Date.now()
            };

            sendEvent('submit', 'Form submitted', details);
          });

          // Track touch events for mobile
          document.addEventListener('touchstart', function(e) {
            if (e.touches && e.touches[0]) {
              const details = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
                touchCount: e.touches.length,
                timestamp: Date.now()
              };

              sendEvent('touch', 'Touch at (' + e.touches[0].clientX + ', ' + e.touches[0].clientY + ')', details);
            }
          });

          // Track navigation (URL changes)
          let lastUrl = window.location.href;
          new MutationObserver(() => {
            if (window.location.href !== lastUrl) {
              const details = {
                from: lastUrl,
                to: window.location.href,
                path: window.location.pathname,
                timestamp: Date.now()
              };

              sendEvent('navigation', 'Navigated to ' + window.location.pathname, details);
              lastUrl = window.location.href;
            }
          }).observe(document, { subtree: true, childList: true });

          // Track DOM changes for dynamic content
          new MutationObserver((mutations) => {
            for (const mutation of mutations) {
              if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                const details = {
                  addedNodes: mutation.addedNodes.length,
                  target: mutation.target.tagName + (mutation.target.id ? '#' + mutation.target.id : ''),
                  timestamp: Date.now()
                };

                sendEvent('dom-change', 'DOM content updated', details);
              }
            }
          }).observe(document.body, { subtree: true, childList: true });

          console.log('✅ ScaleCUA: All event listeners set up successfully');
        }

        // Initialize everything
        waitForVue().then(() => {
          setupEventTracking();
          sendEvent('init', 'ScaleCUA Event Tracker initialized successfully');
        }).catch((error) => {
          console.error('ScaleCUA: Initialization failed:', error);
          sendEvent('init', 'ScaleCUA Event Tracker initialization failed', { error: error.message });
        });

      })();
    `;

    try {
      const scriptElement =
        iframeRef.current.contentDocument.createElement('script');
      scriptElement.textContent = script;
      iframeRef.current.contentDocument.head.appendChild(scriptElement);
      setIsScriptInjected(true);

      if (eventPreferences.success) {
        addConsoleEntry(
          'success',
          'JavaScript injection completed - Event tracking enabled'
        );
      }
      if (eventPreferences.info) {
        addConsoleEntry(
          'info',
          'Monitoring user interactions in iframe environment'
        );
      }
    } catch (error) {
      addConsoleEntry('error', 'Failed to inject JavaScript tracking script', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // Set up message listener for iframe events and script injection
  useEffect(() => {
    // Message listener for iframe events
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'user-interaction') {
        const eventType = event.data.eventType || 'unknown';

        // Only add entry if user has enabled this event type
        if (shouldDisplayEvent(eventType as ConsoleEntry['type'])) {
          addConsoleEntry(
            eventType as ConsoleEntry['type'],
            event.data.message || 'Unknown action',
            event.data.details
          );
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [environment.taskName, environment.id, shouldDisplayEvent]);

  // Initial console messages - run only once on mount (filtered by preferences)
  useEffect(() => {
    setTimeout(() => {
      // Only add messages if the event type is enabled
      if (eventPreferences.info) {
        addConsoleEntry(
          'info',
          'Fixed device dimensions: 390×844px (iPhone 14 Pro)'
        );
        addConsoleEntry('info', 'JavaScript injection system ready');
        addConsoleEntry('info', `Loading environment: ${environment.taskName}`);
        addConsoleEntry('info', `Environment ID: ${environment.id}`);
        addConsoleEntry('info', 'Waiting for iframe to load...');
      }
    }, 100);
  }, [environment.taskName, environment.id, eventPreferences.info]);

  const getConsoleEntryStyle = (type: ConsoleEntry['type']) => {
    switch (type) {
      case 'action':
        return 'relative bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 text-blue-800 shadow-sm';
      case 'info':
        return 'relative bg-gradient-to-r from-gray-50 to-slate-50 border-l-4 border-gray-400 text-gray-800 shadow-sm';
      case 'error':
        return 'relative bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 text-red-800 shadow-md';
      case 'success':
        return 'relative bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 text-green-800 shadow-sm';
      default:
        return 'relative bg-gradient-to-r from-gray-50 to-slate-50 border-l-4 border-gray-400 text-gray-800 shadow-sm';
    }
  };

  const getBadgeStyle = (type: ConsoleEntry['type']) => {
    switch (type) {
      case 'action':
        return 'bg-blue-500 text-white shadow-sm';
      case 'info':
        return 'bg-gray-500 text-white shadow-sm';
      case 'error':
        return 'bg-red-500 text-white shadow-md';
      case 'success':
        return 'bg-green-500 text-white shadow-sm';
      case 'click':
        return 'bg-blue-600 text-white shadow-sm';
      case 'keypress':
        return 'bg-green-600 text-white shadow-sm';
      case 'scroll':
        return 'bg-yellow-600 text-white shadow-sm';
      case 'focus':
      case 'blur':
        return 'bg-purple-600 text-white shadow-sm';
      case 'submit':
        return 'bg-orange-600 text-white shadow-sm';
      case 'touch':
        return 'bg-pink-600 text-white shadow-sm';
      case 'navigation':
        return 'bg-indigo-600 text-white shadow-sm';
      case 'init':
        return 'bg-emerald-600 text-white shadow-sm';
      case 'dom-change':
        return 'bg-cyan-600 text-white shadow-sm';
      default:
        return 'bg-gray-500 text-white shadow-sm';
    }
  };

  const getConsoleIcon = (type: ConsoleEntry['type']) => {
    // Unified icon system using consistent SVG icons
    const icons = {
      action: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
        </svg>
      ),
      info: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      ),
      error: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      ),
      success: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      click: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" />
        </svg>
      ),
      keypress: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
            clipRule="evenodd"
          />
        </svg>
      ),
      scroll: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
        </svg>
      ),
      focus: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path
            fillRule="evenodd"
            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
            clipRule="evenodd"
          />
        </svg>
      ),
      blur: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
            clipRule="evenodd"
          />
          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
        </svg>
      ),
      submit: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
        </svg>
      ),
      touch: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      navigation: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      ),
      init: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
            clipRule="evenodd"
          />
        </svg>
      ),
      'dom-change': (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
            clipRule="evenodd"
          />
        </svg>
      ),
      unknown: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.93 7.5a1 1 0 00-1.4.15l-2 3a1 1 0 001.66 1.1l.71-1.07.71 1.07a1 1 0 001.66-1.1l-2-3a1 1 0 00-1.34-.15zM10 13a1 1 0 100 2 1 1 0 000-2z"
            clipRule="evenodd"
          />
        </svg>
      ),
      default: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      ),
    };

    const iconColors = {
      action: 'bg-blue-500',
      info: 'bg-gray-500',
      error: 'bg-red-500',
      success: 'bg-green-500',
      click: 'bg-blue-600',
      keypress: 'bg-green-600',
      scroll: 'bg-yellow-600',
      focus: 'bg-purple-600',
      blur: 'bg-purple-600',
      submit: 'bg-orange-600',
      touch: 'bg-pink-600',
      navigation: 'bg-indigo-600',
      init: 'bg-emerald-600',
      'dom-change': 'bg-cyan-600',
      unknown: 'bg-gray-600',
      default: 'bg-gray-500',
    };

    const backgroundColor = iconColors[type] || iconColors.default;
    const icon = icons[type] || icons.default;

    return (
      <span
        className={`inline-flex items-center justify-center w-6 h-6 ${backgroundColor} text-white rounded-full shadow-sm`}
      >
        {icon}
      </span>
    );
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

              {/* CDN Status Indicator */}
              {cdnStatus === 'checking' && (
                <div className="flex items-center space-x-2 bg-yellow-50 px-3 py-1 rounded-lg border border-yellow-200">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-yellow-700">
                    Checking CDN...
                  </span>
                </div>
              )}
              {cdnStatus === 'available' && (
                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <span className="text-xs font-medium text-blue-700">
                    CDN Active
                  </span>
                </div>
              )}
              {cdnStatus === 'config-error' && (
                <div className="flex items-center space-x-2 bg-red-50 px-3 py-1 rounded-lg border border-red-200">
                  <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs font-medium text-red-700">
                    CDN Config Error
                  </span>
                </div>
              )}
              {cdnStatus === 'failed' && (
                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
                  <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
                  <span className="text-xs font-medium text-gray-700">
                    {loadingSource === 'fallback'
                      ? 'Local (CDN Failed)'
                      : 'Local Only'}
                  </span>
                </div>
              )}

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

              {/* Source Toggle Button */}
              {hasCdnUrl(envId || 'env-006') && (
                <button
                  onClick={() => {
                    const newUseCdn = !useCdn;
                    setUseCdn(newUseCdn);
                    if (newUseCdn) {
                      setCdnStatus('checking');
                      setLoadingSource('cdn');
                      if (eventPreferences.info) {
                        addConsoleEntry('info', 'Switching to CDN environment');
                      }
                    } else {
                      setCdnStatus(
                        cdnStatus === 'config-error' ? 'config-error' : 'failed'
                      );
                      setLoadingSource('local');
                      if (eventPreferences.info) {
                        addConsoleEntry(
                          'info',
                          'Switching to local environment'
                        );
                      }
                    }
                  }}
                  className="px-3 py-1.5 text-xs bg-warm-100 text-warm-700 rounded-lg hover:bg-warm-200 transition-colors duration-200 font-medium border border-warm-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {useCdn ? 'Use Local' : 'Use CDN'}
                </button>
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
                <span className="text-xs text-gray-500">
                  ({consoleEntries.length} events)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-xs px-3 py-1 bg-gray-200 text-gray-700 rounded font-medium hover:bg-gray-300 transition-colors duration-200 flex items-center space-x-1"
                >
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Filters</span>
                </button>
                <button
                  onClick={() => setConsoleEntries([])}
                  className="text-xs text-gray-600 hover:text-warm-600 transition-colors font-medium"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          {/* Console Content */}
          <div
            ref={consoleContentRef}
            className="flex-1 overflow-y-auto p-4 font-mono text-sm bg-gray-50"
          >
            {consoleEntries.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-700 text-base font-medium mb-2">
                  Console Ready
                </p>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  Interact with the mobile environment to see captured events
                  displayed here.
                </p>
                <div className="mt-6 flex flex-col items-center space-y-2 text-xs text-gray-400">
                  <p>
                    Click, type, or scroll in the mobile environment to begin
                    tracking
                  </p>
                  <p>Event metadata will appear when available</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {consoleEntries.map(entry => (
                  <div
                    key={entry.id}
                    className={`p-3 rounded-lg shadow-sm ${getConsoleEntryStyle(entry.type)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="mt-0.5">
                        {getConsoleIcon(entry.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500 font-medium">
                            {entry.timestamp}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-bold uppercase rounded-full ${getBadgeStyle(entry.type)}`}
                          >
                            {entry.type}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-800 leading-relaxed flex-1">
                            {entry.message}
                          </p>
                          {entry.details && (
                            <button
                              onClick={() => toggleEntryExpansion(entry.id)}
                              className="ml-3 text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center space-x-1"
                            >
                              <span>
                                {expandedEntries.has(entry.id)
                                  ? 'Hide'
                                  : 'Show'}
                              </span>
                              <svg
                                className={`w-3 h-3 transform transition-transform duration-200 ${expandedEntries.has(entry.id) ? 'rotate-180' : ''}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                        {entry.details && expandedEntries.has(entry.id) && (
                          <div className="mt-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-md overflow-hidden">
                            <div className="bg-gray-100 px-3 py-1 border-b border-gray-200 font-mono text-xs text-gray-700">
                              Metadata Details
                            </div>
                            <pre className="p-3 overflow-x-auto whitespace-pre-wrap">
                              {JSON.stringify(entry.details, null, 2)}
                            </pre>
                          </div>
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
                      setIsLoading(false);
                      const source = useCdn ? 'CDN' : 'local';
                      if (eventPreferences.success) {
                        addConsoleEntry(
                          'success',
                          `Mobile environment loaded successfully from ${source}`
                        );
                      }

                      // Inject the event tracking script after iframe loads
                      setTimeout(() => {
                        injectEventTrackingScript();
                      }, 500);
                    }}
                    onError={handleIframeError}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Enhanced Backdrop with Transparency and Mosaic Effects */}
          <div
            className="absolute inset-0 bg-black/10 backdrop-blur-md backdrop-saturate-150"
            onClick={() => setShowFilters(false)}
          >
            {/* Mosaic Pattern Overlay */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                  repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(251, 146, 60, 0.1) 35px, rgba(251, 146, 60, 0.1) 70px),
                  repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(217, 119, 6, 0.08) 35px, rgba(217, 119, 6, 0.08) 70px)
                `,
                  backgroundSize: '100px 100px',
                }}
              />
            </div>
          </div>

          {/* Filter Modal */}
          <div className="relative bg-white backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[80vh] m-4 overflow-hidden ring-4 ring-white/20">
            {/* Clean White Modal Header */}
            <div className="border-b border-gray-200 px-6 py-4 bg-white/95 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-warm-500 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Event Filter Options
                    </h3>
                    <p className="text-sm text-gray-600">
                      Select which event types to display in the console
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-b border-gray-100 px-6 py-3 bg-white/90">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Quick Actions
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleAllEvents(true)}
                    className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200 font-medium"
                  >
                    Enable All
                  </button>
                  <button
                    onClick={() => toggleAllEvents(false)}
                    className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 font-medium"
                  >
                    Disable All
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 max-h-96">
              <div className="space-y-4">
                {/* System Events Category */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    System Events
                  </h4>
                  <div className="space-y-3">
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
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() =>
                                  toggleEventPreference(
                                    eventType as keyof typeof eventPreferences
                                  )
                                }
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                                  isEnabled ? 'bg-warm-500' : 'bg-gray-300'
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
                                  <span className="text-sm font-medium text-gray-700">
                                    {info.label}
                                  </span>
                                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                    {info.category}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {info.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              {getConsoleIcon(
                                eventType as ConsoleEntry['type']
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* User Interactions Category */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    User Interactions
                  </h4>
                  <div className="space-y-3">
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
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() =>
                                  toggleEventPreference(
                                    eventType as keyof typeof eventPreferences
                                  )
                                }
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                                  isEnabled ? 'bg-warm-500' : 'bg-gray-300'
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
                                  <span className="text-sm font-medium text-gray-700">
                                    {info.label}
                                  </span>
                                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                                    {info.category}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {info.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              {getConsoleIcon(
                                eventType as ConsoleEntry['type']
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Status Footer */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
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
                    className="px-4 py-2 bg-warm-500 text-white text-sm font-medium rounded-lg hover:bg-warm-600 transition-colors duration-200"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvironmentLauncher;
