/**
 * Environment types for ScaleWoB benchmark website
 * Defines interfaces for environment data and related structures
 */

import { ReactNode } from 'react';

export type Platform =
  | 'Web Applications'
  | 'Desktop Apps'
  | 'Mobile Interfaces';
export type Difficulty = 'Basic' | 'Advanced' | 'Expert';
export type ColorTheme = 'warm' | 'coral' | 'gold';

// Parameter types for evaluation input
export type ParameterType = 'string' | 'number' | 'boolean';
export interface EnvironmentParameters {
  [key: string]: ParameterType;
}

export interface EnvironmentMetrics {
  completion: number;
  complexity: number;
}

// Task definition for multi-task environments
export interface Task {
  name: string;
  description: string;
  params?: EnvironmentParameters;
}

export interface EnvironmentPreview {
  id: string;
  name: string; // Environment name (renamed from taskName)
  taskName?: string; // Deprecated: kept for backward compatibility
  platform: Platform;
  difficulty: Difficulty;
  description?: string; // Optional: fallback for single-task environments
  tags: string[];
  metrics: EnvironmentMetrics;
  icon?: string; // Icon identifier string
  colorTheme: ColorTheme;
  cdnUrl?: string; // CDN URL for the environment
  params?: EnvironmentParameters; // Optional: fallback for single-task environments
  tasks: Task[]; // Array of tasks (always present after processing)
}

// Extended interface for environment with React icon component
export interface EnvironmentPreviewWithIcon
  extends Omit<EnvironmentPreview, 'icon'> {
  icon: ReactNode; // React icon component (IconType or any ReactNode)
}

export interface EnvironmentData {
  environments: EnvironmentPreview[];
  lastUpdated: string;
  version: string;
}

export interface EnvironmentServiceResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Environment filter configuration types
 */
export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig<T> {
  key: string;
  label: string;
  value: T;
  options: FilterOption[];
  onChange: (value: T) => void;
}

/**
 * Raw environment data interface (from JSON)
 */
export interface RawEnvironmentPreview {
  id?: string;
  name?: string; // New format: environment name
  taskName?: string; // Old format: task name (backward compatibility)
  platform?: Platform;
  difficulty?: Difficulty;
  description?: string; // Old format or fallback
  tags?: string[];
  metrics?: {
    completion?: number;
    complexity?: number;
  };
  icon?: string;
  colorTheme?: ColorTheme;
  cdnUrl?: string; // CDN URL for the environment
  params?: EnvironmentParameters; // Old format or fallback
  tasks?: Array<{
    // New format: tasks array
    name?: string;
    description?: string;
    params?: EnvironmentParameters;
  }>;
}

export interface RawEnvironmentData {
  environments: RawEnvironmentPreview[];
  lastUpdated: string;
  version: string;
}
