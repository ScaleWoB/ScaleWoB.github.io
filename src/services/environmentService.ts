/**
 * Environment Service for ScaleWoB benchmark website
 * Handles loading environment data with proper error handling and state management
 * Designed to be easily replaceable with HTTP requests in the future
 */

import { useState, useEffect, useCallback } from 'react';
import {
  EnvironmentData,
  EnvironmentPreview,
  EnvironmentServiceResponse,
  RawEnvironmentData,
  RawEnvironmentPreview,
} from '../types/environment';
import { populateEnvironmentUrls } from '../config/environmentUrls';

/**
 * Configuration for environment data loading
 */
interface EnvironmentServiceConfig {
  enableCache?: boolean;
  cacheTimeout?: number; // in milliseconds
  retryAttempts?: number;
  retryDelay?: number; // in milliseconds
}

/**
 * Cache entry for environment data
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class EnvironmentDataService {
  private cache = new Map<
    string,
    CacheEntry<EnvironmentData | EnvironmentPreview[]>
  >();
  private config: EnvironmentServiceConfig;

  constructor(config: EnvironmentServiceConfig = {}) {
    this.config = {
      enableCache: true,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes default
      retryAttempts: 3,
      retryDelay: 1000,
      ...config,
    };
  }

  /**
   * Load environment data from JSON file
   * In the future, this can be easily replaced with an HTTP request
   */
  private async loadDataFromSource<T>(filePath: string): Promise<T> {
    try {
      // Load from CDN if it's environments data, otherwise load from local file
      const url = filePath.includes('environments')
        ? 'https://niumascript.com/scalewob-env/environments.json'
        : filePath;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Failed to load data from ${url}: ${response.status} ${response.statusText}`
        );
      }
      return await response.json();
    } catch (error) {
      throw new Error(
        `Data loading failed from ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generic method to load data with caching and retry logic
   */
  private async loadDataWithCache<T>(
    key: string,
    dataSource: string,
    parser?: (raw: unknown) => T
  ): Promise<T> {
    // Check cache first
    if (this.config.enableCache) {
      const cached = this.cache.get(key);
      if (
        cached &&
        Date.now() - cached.timestamp < (this.config.cacheTimeout || 0)
      ) {
        return cached.data as T;
      }
    }

    // Load fresh data
    const rawData = await this.loadDataFromSource(dataSource);
    const processedData = parser ? parser(rawData) : (rawData as T);

    // Update cache
    if (this.config.enableCache) {
      this.cache.set(key, {
        data: processedData as EnvironmentData | EnvironmentPreview[],
        timestamp: Date.now(),
      });
    }

    return processedData;
  }

  /**
   * Load environment data with retry logic
   */
  async loadEnvironmentData(): Promise<EnvironmentData> {
    let lastError: Error | null = null;

    for (
      let attempt = 1;
      attempt <= (this.config.retryAttempts || 1);
      attempt++
    ) {
      try {
        const result = await this.loadDataWithCache<EnvironmentData>(
          'environments',
          '/data/environments.json',
          (raw: unknown): EnvironmentData => {
            // Handle both new format (direct array) and old format (object with environments property)
            let environments: RawEnvironmentPreview[];
            let lastUpdated = new Date().toISOString();
            let version = '1.0.0';

            if (Array.isArray(raw)) {
              // New format: direct array of environments
              environments = raw;
            } else if (
              raw &&
              typeof raw === 'object' &&
              'environments' in raw
            ) {
              // Old format: object with environments property
              const rawData = raw as RawEnvironmentData;
              environments = rawData.environments;
              lastUpdated = rawData.lastUpdated || lastUpdated;
              version = rawData.version || version;
            } else {
              throw new Error('Invalid environment data format');
            }

            if (!Array.isArray(environments)) {
              throw new Error('Invalid environment data format');
            }

            const processedEnvironments = environments.map(
              (env: RawEnvironmentPreview): EnvironmentPreview => ({
                ...env,
                // Ensure all required fields are present
                id: env.id || `env-${Date.now()}`,
                taskName: env.taskName || 'Untitled Environment',
                platform: env.platform || 'Web Applications',
                difficulty: env.difficulty || 'Intermediate',
                description: env.description || '',
                tags: Array.isArray(env.tags) ? env.tags : [],
                metrics: {
                  completion:
                    typeof env.metrics?.completion === 'number'
                      ? env.metrics.completion
                      : 0,
                  complexity:
                    typeof env.metrics?.complexity === 'number'
                      ? env.metrics.complexity
                      : 1,
                },
                colorTheme: env.colorTheme || 'warm',
                cdnUrl: env.cdnUrl, // Pass through CDN URL if present
              })
            );

            // Populate the environment URLs for the config module
            populateEnvironmentUrls(processedEnvironments);

            return {
              environments: processedEnvironments,
              lastUpdated,
              version,
            };
          }
        );

        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        if (attempt < (this.config.retryAttempts || 1)) {
          // Wait before retry
          await new Promise(resolve =>
            setTimeout(resolve, this.config.retryDelay || 1000)
          );
        }
      }
    }

    throw (
      lastError || new Error('Failed to load environment data after retries')
    );
  }

  /**
   * Load environment previews (simplified version for common use cases)
   */
  async loadEnvironmentPreviews(): Promise<EnvironmentPreview[]> {
    const data = await this.loadEnvironmentData();
    return data.environments;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache status
   */
  getCacheStatus(): {
    size: number;
    entries: Array<{ key: string; age: number }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: now - entry.timestamp,
    }));

    return {
      size: this.cache.size,
      entries,
    };
  }
}

// Create singleton instance
const environmentDataService = new EnvironmentDataService();

/**
 * React hook for loading environment data
 * Provides loading state, error handling, and data management
 */
export function useEnvironmentData(): EnvironmentServiceResponse<EnvironmentData> {
  const [state, setState] = useState<
    EnvironmentServiceResponse<EnvironmentData>
  >({
    data: null,
    loading: false,
    error: null,
  });

  const loadData = useCallback(async () => {
    // Start loading
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await environmentDataService.loadEnvironmentData();
      setState({
        data,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load environment data',
      });
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadDataAsync = async () => {
      if (!isMounted) return;

      // Start loading
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const data = await environmentDataService.loadEnvironmentData();
        if (isMounted) {
          setState({
            data,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            data: null,
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to load environment data',
          });
        }
      }
    };

    loadDataAsync();

    return () => {
      isMounted = false;
    };
  }, []);

  // Provide retry functionality
  const retry = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    ...state,
    retry,
  } as EnvironmentServiceResponse<EnvironmentData> & { retry: () => void };
}

/**
 * React hook for loading environment previews
 * Simplified version for components that only need the preview data
 */
export function useEnvironmentPreviews(): EnvironmentServiceResponse<
  EnvironmentPreview[]
> {
  const [state, setState] = useState<
    EnvironmentServiceResponse<EnvironmentPreview[]>
  >({
    data: null,
    loading: false,
    error: null,
  });

  const loadData = useCallback(async () => {
    // Start loading
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const previews = await environmentDataService.loadEnvironmentPreviews();
      setState({
        data: previews,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load environment previews',
      });
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadDataAsync = async () => {
      if (!isMounted) return;

      // Start loading
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const previews = await environmentDataService.loadEnvironmentPreviews();
        if (isMounted) {
          setState({
            data: previews,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            data: null,
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to load environment previews',
          });
        }
      }
    };

    loadDataAsync();

    return () => {
      isMounted = false;
    };
  }, []);

  // Provide retry functionality
  const retry = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    ...state,
    retry,
  } as EnvironmentServiceResponse<EnvironmentPreview[]> & { retry: () => void };
}

/**
 * Utility functions for working with environment data
 */
export const EnvironmentUtils = {
  /**
   * Filter environments by platform
   */
  filterByPlatform: (
    environments: EnvironmentPreview[],
    platform: string
  ): EnvironmentPreview[] => {
    if (platform === 'all') return environments;
    return environments.filter(env => env.platform === platform);
  },

  /**
   * Filter environments by difficulty
   */
  filterByDifficulty: (
    environments: EnvironmentPreview[],
    difficulty: string
  ): EnvironmentPreview[] => {
    if (difficulty === 'all') return environments;
    return environments.filter(env => env.difficulty === difficulty);
  },

  /**
   * Get unique platforms from environments
   */
  getPlatforms: (environments: EnvironmentPreview[]): string[] => {
    return Array.from(new Set(environments.map(env => env.platform)));
  },

  /**
   * Get unique difficulties from environments
   */
  getDifficulties: (environments: EnvironmentPreview[]): string[] => {
    return Array.from(new Set(environments.map(env => env.difficulty)));
  },

  /**
   * Get environments by tags
   */
  filterByTags: (
    environments: EnvironmentPreview[],
    tags: string[]
  ): EnvironmentPreview[] => {
    if (tags.length === 0) return environments;
    return environments.filter(env => tags.some(tag => env.tags.includes(tag)));
  },
};

// Export the service instance for direct use if needed
export { environmentDataService };
export default EnvironmentDataService;
