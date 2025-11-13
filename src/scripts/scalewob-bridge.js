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
      this.sendEvent(
        'init',
        'ScaleWoB Event Tracker initialized successfully',
        {
          timestamp: Date.now(),
          environment: window.location.href,
          title: document.title,
        }
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
      case 'click':
        return this.clickElement(params.selector, params.options);
      case 'type':
        return this.typeText(params.selector, params.text, params.options);
      case 'navigate':
        return this.navigateTo(params.url);
      case 'get-state':
        return this.getEnvironmentState();
      case 'load-script':
        return this.loadScript(params.url);
      case 'scroll':
        return this.scrollTo(params.x, params.y);
      case 'wait':
        return this.wait(params.ms);
      case 'get-element-info':
        return this.getElementInfo(params.selector);
      case 'screenshot':
        return this.takeScreenshot();
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  }

  /**
   * Setup comprehensive event tracking
   */
  setupEventTracking() {
    this.log('Setting up event tracking...');

    // Click tracking (legacy format)
    const clickHandler = e => {
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
   * Command implementations
   */

  clickElement(selector, options = {}) {
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    // Ensure element is visible and clickable
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    return new Promise(resolve => {
      setTimeout(() => {
        element.click();
        resolve(this.getElementInfoFromNode(element));
      }, options.delay || 100);
    });
  }

  typeText(selector, text, options = {}) {
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName)) {
      throw new Error(`Element is not an input: ${selector}`);
    }

    element.focus();
    element.value = '';

    // Type character by character for realism
    return new Promise(resolve => {
      let index = 0;
      const typeChar = () => {
        if (index < text.length) {
          element.value += text[index];
          element.dispatchEvent(new Event('input', { bubbles: true }));
          index++;
          setTimeout(typeChar, options.typingDelay || 50);
        } else {
          element.dispatchEvent(new Event('change', { bubbles: true }));
          resolve(this.getElementInfoFromNode(element));
        }
      };
      typeChar();
    });
  }

  navigateTo(url) {
    if (url.startsWith('/')) {
      url = window.location.origin + url;
    }
    window.location.href = url;
    return { navigatedTo: url };
  }

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

  loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => resolve({ loaded: url });
      script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
      document.head.appendChild(script);
    });
  }

  scrollTo(x, y) {
    window.scrollTo(x, y);
    return { scrolledTo: { x, y } };
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getElementInfo(selector) {
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }
    return this.getElementInfoFromNode(element);
  }

  takeScreenshot() {
    // This would require additional setup in a real implementation
    return {
      note: 'Screenshot functionality requires additional setup',
      timestamp: Date.now(),
    };
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
