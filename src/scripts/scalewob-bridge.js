/**
 * ScaleWoB Bridge - Communication layer for CDN environments
 * Provides standardized communication between environment and parent window
 *
 * Features:
 * - Event tracking (click, keypress, scroll, focus, blur, submit, touch, navigation, DOM changes)
 * - Command execution (click, type, navigate, get-state, load-script)
 * - Two-way communication via postMessage
 * - Minimal footprint and non-intrusive integration
 */

class ScaleWoBBridge {
  constructor(config = {}) {
    this.config = {
      debug: false,
      autoTrack: true,
      targetOrigin: '*',
      scrollDebounceMs: 150,
      maxConsoleEntries: 100,
      ...config,
    };

    this.messageId = 0;
    this.pendingCommands = new Map();
    this.isReady = false;
    this.eventListeners = new Map();
    this.scrollTimeout = null;
    this.lastUrl = window.location.href;

    this.init();
  }

  /**
   * Initialize the bridge and setup communication
   */
  init() {
    this.log('Initializing ScaleWoB Bridge...');

    // Setup message listener for commands from parent
    window.addEventListener('message', this.handleMessage.bind(this));

    // Setup event tracking if autoTrack is enabled
    if (this.config.autoTrack) {
      this.setupEventTracking();
    }

    // Setup navigation tracking
    this.setupNavigationTracking();

    // Notify parent that environment is ready (legacy format)
    setTimeout(() => {
      this.isReady = true;

      // Prepare init payload with basic environment info
      const initPayload = {
        timestamp: Date.now(),
        environment: window.location.href,
        title: document.title,
      };

      // Try to get tasks from environment if available
      if (typeof window.getTasks === 'function') {
        try {
          const tasks = window.getTasks();
          initPayload.tasks = tasks;
          this.log('Tasks loaded from environment:', tasks.length);
        } catch (error) {
          this.log('Error loading tasks:', error.message);
          // Continue without tasks - not a fatal error
        }
      } else {
        this.log('getTasks function not available in environment');
      }

      this.sendEvent(
        'init',
        'ScaleWoB Event Tracker initialized successfully',
        initPayload
      );
      this.log('ScaleWoB Bridge ready');
    }, 100);
  }

  /**
   * Generate unique message ID
   */
  generateId() {
    return `scalewob_${Date.now()}_${++this.messageId}`;
  }

  /**
   * Debug logging
   */
  log(...args) {
    if (this.config.debug) {
      console.log('[ScaleWoB Bridge]', ...args);
    }
  }

  /**
   * Send event to parent window (legacy format compatible)
   */
  sendEvent(eventType, message, details = null) {
    // Handle both legacy (eventType, message, details) and new (eventType, data) formats
    let eventData;
    if (details !== null) {
      // Legacy format: sendEvent(eventType, message, details)
      eventData = details;
      // Add message to details for compatibility
      eventData.message = message;
    } else {
      // New format: sendEvent(eventType, data)
      eventData = message;
    }

    const postMessage = {
      type: 'scalewob-event',
      id: this.generateId(),
      timestamp: Date.now(),
      payload: {
        eventType,
        data: eventData,
      },
    };

    this.log('Sending event:', eventType, eventData);
    window.parent.postMessage(postMessage, this.config.targetOrigin);
  }

  /**
   * Send response to parent command
   */
  sendResponse(commandId, success, result, error = null) {
    const message = {
      type: 'scalewob-response',
      id: commandId,
      timestamp: Date.now(),
      payload: {
        success,
        result,
        error,
      },
    };

    this.log('Sending response:', commandId, success);
    window.parent.postMessage(message, this.config.targetOrigin);
  }

  /**
   * Handle messages from parent window
   */
  handleMessage(event) {
    // Ignore messages from same origin (security)
    if (event.source === window) return;

    const message = event.data;

    if (message.type === 'scalewob-command') {
      const { id, payload } = message;
      const { command, params } = payload;

      this.log('Received command:', command, params);

      try {
        const result = this.executeCommand(command, params);

        // Handle async commands
        if (result instanceof Promise) {
          result
            .then(asyncResult => this.sendResponse(id, true, asyncResult))
            .catch(error => this.sendResponse(id, false, null, error.message));
        } else {
          this.sendResponse(id, true, result);
        }
      } catch (error) {
        this.sendResponse(id, false, null, error.message);
      }
    }
  }

  /**
   * Execute commands from parent
   */
  executeCommand(command, params) {
    switch (command) {
      // Coordinate-based actions
      case 'click':
        return this.clickCoordinate(params.x, params.y, params.options);
      case 'long_press':
        return this.longPress(params.x, params.y, params.options);
      case 'type':
        return this.typeText(params.text, params.options);
      case 'scroll':
        return this.scrollDirection(
          params.x,
          params.y,
          params.direction,
          params.options
        );
      case 'drag':
        return this.dragDirection(
          params.x,
          params.y,
          params.direction,
          params.options
        );
      case 'back':
        return this.goBack();

      // Environment management commands
      case 'reset':
        return this.resetEnvironment();
      case 'get-tasks':
        return this.getEnvironmentTasks();

      // System commands
      case 'get-state':
        return this.getEnvironmentState();
      case 'evaluate':
        return this.evaluate(params);
      case 'execute-script':
        return this.executeScript(params.script);

      default:
        throw new Error(`Unknown command: ${command}`);
    }
  }

  /**
   * Reset environment to initial state
   */
  resetEnvironment() {
    if (typeof window.reset !== 'function') {
      throw new Error('Environment does not have reset() function available');
    }

    try {
      window.reset();
      return {
        success: true,
        timestamp: Date.now(),
        message: 'Environment reset successfully',
      };
    } catch (error) {
      throw new Error(`Reset failed: ${error.message}`);
    }
  }

  /**
   * Get task list from environment
   */
  getEnvironmentTasks() {
    if (typeof window.getTasks !== 'function') {
      throw new Error(
        'Environment does not have getTasks() function available'
      );
    }

    try {
      const tasks = window.getTasks();
      return {
        tasks: tasks,
        count: tasks.length,
        timestamp: Date.now(),
      };
    } catch (error) {
      throw new Error(`getTasks failed: ${error.message}`);
    }
  }

  /**
   * Setup comprehensive event tracking
   */
  setupEventTracking() {
    this.log('Setting up event tracking...');

    // Drag tracking state (shared with click handler)
    let dragState = {
      isDragging: false,
      startX: 0,
      startY: 0,
      startTime: 0,
      target: null,
    };

    // Click tracking (legacy format)
    const clickHandler = e => {
      // Skip click if a drag just occurred
      if (dragState.isDragging) {
        return;
      }

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
        inputValue: target.value ? String(target.value).substring(0, 30) : '',
      };

      this.sendEvent(
        'click',
        'Clicked on ' + (target.tagName.toLowerCase() || 'element'),
        details
      );
    };
    document.addEventListener('click', clickHandler, true);
    this.eventListeners.set('click', clickHandler);

    // Keyboard tracking (legacy format)
    const keydownHandler = e => {
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
          isInput: ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName),
        },
      };

      this.sendEvent('keypress', 'Pressed key: ' + e.key, details);
    };
    document.addEventListener('keydown', keydownHandler, true);
    this.eventListeners.set('keydown', keydownHandler);

    // Enhanced scroll detection with unified debounce timer and delta accumulation (legacy format)
    let scrollTimeout;
    let lastScrollEvent = null;
    let wheelEventData = null;
    let accumulatedDelta = { deltaY: 0, deltaX: 0 };
    let scrollSessionStart = 0;

    // Function to handle any scroll-related event with unified debouncing
    const handleUnifiedScrollEvent = eventData => {
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
          if (
            wheelEventData &&
            (Math.abs(accumulatedDelta.deltaY) > 0 ||
              Math.abs(accumulatedDelta.deltaX) > 0)
          ) {
            // Use accumulated delta values
            finalEventData.details = {
              ...finalEventData.details,
              deltaY: accumulatedDelta.deltaY,
              deltaX: accumulatedDelta.deltaX,
              deltaMode: wheelEventData.details.deltaMode,
              hadWheelInput: true,
              scrollSessionDuration: now - scrollSessionStart,
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

          this.sendEvent(
            'scroll',
            finalEventData.message,
            finalEventData.details
          );
          lastScrollEvent = null;
          wheelEventData = null;
          accumulatedDelta = { deltaY: 0, deltaX: 0 };
        }
      }, 300);
    };

    // Document-level scroll events
    const scrollHandler = () => {
      const scrollPosition =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      const eventData = {
        message: 'Document scrolled to ' + scrollPosition + 'px',
        details: {
          target: 'document',
          scrollPosition: scrollPosition,
          windowHeight: window.innerHeight,
          documentHeight: document.documentElement.scrollHeight,
          timestamp: Date.now(),
          isDocumentScroll: true,
          eventType: 'document-scroll',
        },
      };
      handleUnifiedScrollEvent(eventData);
    };

    // Wheel events (captures scroll attempts even on non-scrollable elements)
    const wheelHandler = e => {
      // Only process if there's actual scroll movement
      if (Math.abs(e.deltaY) > 0 || Math.abs(e.deltaX) > 0) {
        const eventData = {
          message: 'Wheel event detected (deltaY: ' + e.deltaY + ')',
          details: {
            deltaY: e.deltaY,
            deltaX: e.deltaX,
            deltaMode: e.deltaMode,
            target:
              e.target.tagName.toLowerCase() +
              (e.target.id ? '#' + e.target.id : ''),
            timestamp: Date.now(),
            isDocumentScroll: false,
            eventType: 'wheel',
          },
        };
        handleUnifiedScrollEvent(eventData);
      }
    };

    window.addEventListener('scroll', scrollHandler, { passive: true });
    document.addEventListener('wheel', wheelHandler, { passive: true });
    this.eventListeners.set('scroll', scrollHandler);
    this.eventListeners.set('wheel', wheelHandler);

    // Focus tracking (legacy format)
    const focusHandler = e => {
      const details = {
        tagName: e.target.tagName,
        type: e.target.type || '',
        id: e.target.id || '',
        className: e.target.className || '',
        placeholder: e.target.placeholder || '',
        timestamp: Date.now(),
      };

      this.sendEvent(
        'focus',
        'Focused on ' + (e.target.tagName.toLowerCase() || 'element'),
        details
      );
    };
    document.addEventListener('focus', focusHandler, true);
    this.eventListeners.set('focus', focusHandler);

    // Blur tracking (legacy format)
    const blurHandler = e => {
      const details = {
        tagName: e.target.tagName,
        type: e.target.type || '',
        id: e.target.id || '',
        className: e.target.className || '',
        timestamp: Date.now(),
      };

      this.sendEvent(
        'blur',
        'Blurred from ' + (e.target.tagName.toLowerCase() || 'element'),
        details
      );
    };
    document.addEventListener('blur', blurHandler, true);
    this.eventListeners.set('blur', blurHandler);

    // Form submission tracking (legacy format)
    const submitHandler = e => {
      const details = {
        action: e.target.action || '',
        method: e.target.method || '',
        id: e.target.id || '',
        className: e.target.className || '',
        timestamp: Date.now(),
      };

      this.sendEvent('submit', 'Form submitted', details);
    };
    document.addEventListener('submit', submitHandler, true);
    this.eventListeners.set('submit', submitHandler);

    // Touch tracking for mobile (legacy format)
    const touchstartHandler = e => {
      if (e.touches && e.touches[0]) {
        const details = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          touchCount: e.touches.length,
          timestamp: Date.now(),
        };

        this.sendEvent(
          'touch',
          'Touch at (' +
            e.touches[0].clientX +
            ', ' +
            e.touches[0].clientY +
            ')',
          details
        );
      }
    };
    document.addEventListener('touchstart', touchstartHandler, true);
    this.eventListeners.set('touchstart', touchstartHandler);

    // Drag tracking
    const mousedownHandler = e => {
      dragState = {
        isDragging: false,
        startX: e.clientX,
        startY: e.clientY,
        startTime: Date.now(),
        target: e.target,
      };
    };

    const mousemoveHandler = e => {
      if (dragState.startTime === 0) return;

      const deltaX = e.clientX - dragState.startX;
      const deltaY = e.clientY - dragState.startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (!dragState.isDragging && distance > 5) {
        dragState.isDragging = true;
      }
    };

    const mouseupHandler = e => {
      const wasDragging = dragState.isDragging;

      if (wasDragging) {
        const deltaX = e.clientX - dragState.startX;
        const deltaY = e.clientY - dragState.startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const duration = Date.now() - dragState.startTime;

        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);
        let direction;
        if (absDeltaX > absDeltaY) {
          direction = deltaX > 0 ? 'right' : 'left';
        } else {
          direction = deltaY > 0 ? 'down' : 'up';
        }

        const details = {
          startX: dragState.startX,
          startY: dragState.startY,
          endX: e.clientX,
          endY: e.clientY,
          deltaX: deltaX,
          deltaY: deltaY,
          distance: Math.round(distance),
          direction: direction,
          duration: duration,
          target: {
            tagName: dragState.target?.tagName || 'unknown',
            id: dragState.target?.id || '',
            className: dragState.target?.className || '',
          },
          timestamp: Date.now(),
        };

        this.sendEvent(
          'drag',
          `Dragged ${direction} (${Math.round(distance)}px)`,
          details
        );
      }

      // Reset drag state after a small delay to let click handler check it first
      setTimeout(() => {
        dragState = {
          isDragging: false,
          startX: 0,
          startY: 0,
          startTime: 0,
          target: null,
        };
      }, 0);
    };

    document.addEventListener('mousedown', mousedownHandler, true);
    document.addEventListener('mousemove', mousemoveHandler, true);
    document.addEventListener('mouseup', mouseupHandler, true);
    this.eventListeners.set('mousedown', mousedownHandler);
    this.eventListeners.set('mousemove', mousemoveHandler);
    this.eventListeners.set('mouseup', mouseupHandler);

    // DOM change tracking (legacy format)
    const mutationObserver = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          const details = {
            addedNodes: mutation.addedNodes.length,
            target:
              mutation.target.tagName +
              (mutation.target.id ? '#' + mutation.target.id : ''),
            timestamp: Date.now(),
          };

          this.sendEvent('dom-change', 'DOM content updated', details);
        }
      }
    });

    mutationObserver.observe(document.body, {
      subtree: true,
      childList: true,
    });
    this.eventListeners.set('mutation', mutationObserver);

    this.log('Event tracking setup complete');
  }

  /**
   * Setup navigation tracking (legacy format)
   */
  setupNavigationTracking() {
    // Track URL changes
    const observer = new MutationObserver(() => {
      if (window.location.href !== this.lastUrl) {
        const details = {
          from: this.lastUrl,
          to: window.location.href,
          path: window.location.pathname,
          timestamp: Date.now(),
        };

        this.sendEvent(
          'navigation',
          'Navigated to ' + window.location.pathname,
          details
        );
        this.lastUrl = window.location.href;
      }
    });

    observer.observe(document, { subtree: true, childList: true });
    this.eventListeners.set('navigation', observer);
  }

  /**
   * Get element information from DOM node
   */
  getElementInfoFromNode(node) {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) {
      return { tagName: 'unknown' };
    }

    const rect = node.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(node);

    return {
      tagName: node.tagName.toLowerCase(),
      id: node.id || '',
      className: node.className || '',
      text: node.textContent ? node.textContent.substring(0, 100) : '',
      value: node.value ? String(node.value).substring(0, 100) : '',
      type: node.type || '',
      name: node.name || '',
      placeholder: node.placeholder || '',
      href: node.href || '',
      src: node.src || '',
      position: {
        x: Math.round(rect.left),
        y: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      },
      visible:
        computedStyle.display !== 'none' &&
        computedStyle.visibility !== 'hidden',
      attributes: this.getImportantAttributes(node),
    };
  }

  /**
   * Get important attributes from element
   */
  getImportantAttributes(element) {
    const importantAttrs = [
      'data-testid',
      'data-cy',
      'aria-label',
      'role',
      'title',
    ];
    const attrs = {};

    importantAttrs.forEach(attr => {
      if (element.hasAttribute(attr)) {
        attrs[attr] = element.getAttribute(attr);
      }
    });

    return attrs;
  }

  /**
   * Click at specific coordinates
   */
  clickCoordinate(x, y, options = {}) {
    const element = document.elementFromPoint(x, y);
    if (!element) {
      throw new Error(`No element found at coordinates (${x}, ${y})`);
    }

    // Create and dispatch mouse events at the specified coordinates
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: x,
      clientY: y,
      button: 0,
    });

    return new Promise(resolve => {
      setTimeout(() => {
        element.dispatchEvent(clickEvent);
        // Focus the element if it's focusable
        if (element.focus) {
          element.focus();
        }
        resolve({
          x: x,
          y: y,
          element: this.getElementInfoFromNode(element),
          timestamp: Date.now(),
        });
      }, options.delay || 0);
    });
  }

  /**
   * Long press at specific coordinates
   */
  longPress(x, y, options = {}) {
    const element = document.elementFromPoint(x, y);
    if (!element) {
      throw new Error(`No element found at coordinates (${x}, ${y})`);
    }

    const duration = options.duration || 1000; // Default 1 second

    return new Promise(resolve => {
      // Dispatch mousedown event
      const mousedownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: x,
        clientY: y,
        button: 0,
      });
      element.dispatchEvent(mousedownEvent);

      // Wait for duration, then dispatch mouseup
      setTimeout(() => {
        const mouseupEvent = new MouseEvent('mouseup', {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: x,
          clientY: y,
          button: 0,
        });
        element.dispatchEvent(mouseupEvent);

        resolve({
          x: x,
          y: y,
          duration: duration,
          element: this.getElementInfoFromNode(element),
          timestamp: Date.now(),
        });
      }, duration);
    });
  }

  /**
   * Type text into the currently focused element
   */
  typeText(text, options = {}) {
    const element = document.activeElement;

    if (!element || !['INPUT', 'TEXTAREA'].includes(element.tagName)) {
      throw new Error('No input element is currently focused');
    }

    // Type character by character for realism
    return new Promise(resolve => {
      let index = 0;
      const typeChar = () => {
        if (index < text.length) {
          const char = text[index];

          // Dispatch keyboard events
          const keydownEvent = new KeyboardEvent('keydown', {
            key: char,
            bubbles: true,
            cancelable: true,
          });
          element.dispatchEvent(keydownEvent);

          // Update value
          element.value += char;
          element.dispatchEvent(new Event('input', { bubbles: true }));

          const keyupEvent = new KeyboardEvent('keyup', {
            key: char,
            bubbles: true,
            cancelable: true,
          });
          element.dispatchEvent(keyupEvent);

          index++;
          setTimeout(typeChar, options.typingDelay || 50);
        } else {
          element.dispatchEvent(new Event('change', { bubbles: true }));
          resolve({
            text: text,
            element: this.getElementInfoFromNode(element),
            timestamp: Date.now(),
          });
        }
      };
      typeChar();
    });
  }

  /**
   * Scroll from a starting point in a direction
   */
  scrollDirection(x, y, direction, options = {}) {
    const distance = options.distance || 100;
    let deltaX = 0;
    let deltaY = 0;

    // Map direction to delta values
    switch (direction.toLowerCase()) {
      case 'up':
        deltaY = -distance;
        break;
      case 'down':
        deltaY = distance;
        break;
      case 'left':
        deltaX = -distance;
        break;
      case 'right':
        deltaX = distance;
        break;
      default:
        throw new Error(`Invalid scroll direction: ${direction}`);
    }

    // Find first scrollable ancestor from the point
    let element = document.elementFromPoint(x, y);
    while (element && element !== document.documentElement) {
      const hasVerticalScroll = element.scrollHeight > element.clientHeight;
      const hasHorizontalScroll = element.scrollWidth > element.clientWidth;
      const overflowY = window.getComputedStyle(element).overflowY;
      const overflowX = window.getComputedStyle(element).overflowX;

      const isScrollable =
        (hasVerticalScroll &&
          (overflowY === 'auto' || overflowY === 'scroll')) ||
        (hasHorizontalScroll &&
          (overflowX === 'auto' || overflowX === 'scroll'));

      if (isScrollable) break;
      element = element.parentElement;
    }

    if (!element) element = document.documentElement;

    return new Promise(resolve => {
      // Dispatch wheel event with small delay to ensure non-zero scrollSessionDuration
      setTimeout(() => {
        const wheelEvent = new WheelEvent('wheel', {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: x,
          clientY: y,
          deltaX: deltaX,
          deltaY: deltaY,
          deltaMode: WheelEvent.DOM_DELTA_PIXEL,
        });

        element.dispatchEvent(wheelEvent);

        // Also perform actual scroll if it's the document
        if (element === document.documentElement || element === document.body) {
          window.scrollBy(deltaX, deltaY);
        } else if (
          element.scrollHeight > element.clientHeight ||
          element.scrollWidth > element.clientWidth
        ) {
          element.scrollBy(deltaX, deltaY);
        }

        resolve({
          x: x,
          y: y,
          direction: direction,
          distance: distance,
          deltaX: deltaX,
          deltaY: deltaY,
          timestamp: Date.now(),
        });
      }, 50);
    });
  }

  /**
   * Drag from a starting point in a direction
   */
  dragDirection(x, y, direction, options = {}) {
    const distance = options.distance || 100;
    let endX = x;
    let endY = y;

    // Calculate end coordinates based on direction
    switch (direction.toLowerCase()) {
      case 'up':
        endY = y - distance;
        break;
      case 'down':
        endY = y + distance;
        break;
      case 'left':
        endX = x - distance;
        break;
      case 'right':
        endX = x + distance;
        break;
      default:
        throw new Error(`Invalid drag direction: ${direction}`);
    }

    const element = document.elementFromPoint(x, y);
    if (!element) {
      throw new Error(`No element found at coordinates (${x}, ${y})`);
    }

    return new Promise(resolve => {
      // Dispatch mousedown at start position
      const mousedownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: x,
        clientY: y,
        button: 0,
      });
      element.dispatchEvent(mousedownEvent);

      // Simulate drag with intermediate mousemove events
      const steps = 10;
      const stepX = (endX - x) / steps;
      const stepY = (endY - y) / steps;
      let currentStep = 0;

      const dragStep = () => {
        if (currentStep < steps) {
          const currentX = x + stepX * currentStep;
          const currentY = y + stepY * currentStep;

          const mousemoveEvent = new MouseEvent('mousemove', {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: currentX,
            clientY: currentY,
            button: 0,
          });
          document.dispatchEvent(mousemoveEvent);

          currentStep++;
          setTimeout(dragStep, 10);
        } else {
          // Dispatch mouseup at end position
          const mouseupEvent = new MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: endX,
            clientY: endY,
            button: 0,
          });
          const endElement = document.elementFromPoint(endX, endY);
          if (endElement) {
            endElement.dispatchEvent(mouseupEvent);
          }

          resolve({
            startX: x,
            startY: y,
            endX: endX,
            endY: endY,
            direction: direction,
            distance: distance,
            element: this.getElementInfoFromNode(element),
            timestamp: Date.now(),
          });
        }
      };

      dragStep();
    });
  }

  /**
   * Navigate back in browser history
   */
  goBack() {
    const previousUrl = window.location.href;
    window.history.back();

    return new Promise(resolve => {
      // Wait a bit for navigation to complete
      setTimeout(() => {
        resolve({
          from: previousUrl,
          to: window.location.href,
          timestamp: Date.now(),
        });
      }, 500);
    });
  }

  /**
   * System command implementations (kept for compatibility)
   */

  getEnvironmentState() {
    return {
      url: window.location.href,
      title: document.title,
      readyState: document.readyState,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      document: {
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
      },
      timestamp: Date.now(),
    };
  }

  /**
   * Evaluate the current task status in the environment
   */
  evaluate(params = {}) {
    // Check if environment has the evaluate method available
    if (typeof window.evaluateTask === 'function') {
      // Extract trajectory from params if available
      const { trajectory, ...evaluationParams } = params;

      // Call the environment's own evaluation method with parameters and trajectory
      const result = window.evaluateTask(evaluationParams, trajectory);
      return result;
    }
    throw new Error('Environment does not have evaluateTask method available');
  }

  executeScript(script) {
    try {
      // Use Function constructor for safer evaluation
      const func = new Function(script);
      const result = func();
      return {
        success: true,
        result: result,
        timestamp: Date.now(),
      };
    } catch (error) {
      throw new Error(`Script execution failed: ${error.message}`);
    }
  }

  /**
   * Cleanup method
   */
  destroy() {
    this.log('Destroying ScaleWoB Bridge...');

    // Remove event listeners
    this.eventListeners.forEach((handler, event) => {
      if (event === 'mutation' || event === 'navigation') {
        handler.disconnect();
      } else if (event === 'wheel') {
        document.removeEventListener(event, handler);
      } else if (event === 'scroll') {
        window.removeEventListener(event, handler);
      } else if (['mousedown', 'mousemove', 'mouseup'].includes(event)) {
        document.removeEventListener(event, handler, true);
      } else {
        // Most events are on document with capture: true
        document.removeEventListener(event, handler, true);
      }
    });

    // Clear pending commands
    this.pendingCommands.clear();

    this.isReady = false;
  }
}

// Auto-initialize if script is loaded directly
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.ScaleWoBBridge = ScaleWoBBridge;
    });
  } else {
    window.ScaleWoBBridge = ScaleWoBBridge;
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScaleWoBBridge;
}
