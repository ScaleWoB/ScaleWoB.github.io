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

// JSON Schema types for advanced parameter definitions
export type JSONSchemaType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'object'
  | 'array';

export interface JSONSchemaProperty {
  type: JSONSchemaType;
  description?: string;
  enum?: string[];
  format?: 'date' | 'time' | 'date-time' | 'email' | 'uri';
  properties?: Record<string, JSONSchemaProperty>;
  items?: JSONSchemaProperty; // For array types
  required?: string[];
  additionalProperties?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default?: string | number | boolean | any[];
  title?: string;
  minItems?: number; // For arrays
  maxItems?: number; // For arrays
  const?: string | number | boolean; // Const value for readonly fields
}

export interface JSONSchemaDefinition {
  type: 'object';
  properties: Record<string, JSONSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

// Legacy parameter format for backward compatibility
export interface LegacyParameterDefinition {
  [key: string]: 'str' | 'number' | 'boolean';
}

// Union type to support both formats
export type ParameterDefinition =
  | JSONSchemaDefinition
  | LegacyParameterDefinition;

// Result type for extractConstFields function
export interface ExtractedConstFields {
  schemaForUI: JSONSchemaDefinition;
  constFields: Record<string, string | number | boolean>;
}

// Type guards to detect parameter format
export function isJSONSchemaDefinition(
  params: ParameterDefinition | undefined
): params is JSONSchemaDefinition {
  if (!params || typeof params !== 'object' || Array.isArray(params)) {
    return false;
  }
  return 'type' in params && params.type === 'object' && 'properties' in params;
}

export function isLegacyParameterDefinition(
  params: ParameterDefinition | undefined
): params is LegacyParameterDefinition {
  return !isJSONSchemaDefinition(params);
}

export interface EnvironmentMetrics {
  completion: number;
  complexity: number;
}

// Task definition for multi-task environments
export interface Task {
  name?: string;
  description: string;
  taskId?: number;
  params?: ParameterDefinition;
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
  task_num?: number; // Number of tasks in this environment
  tasks: Task[]; // Array of tasks (deprecated, always present after processing for backward compatibility)
}

// Extended interface for environment with React icon component
export interface EnvironmentPreviewWithIcon extends Omit<
  EnvironmentPreview,
  'icon'
> {
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
  task_num?: number; // Number of tasks in this environment
  tasks?: Array<{
    // New format: tasks array (deprecated, use task_num)
    name?: string;
    description?: string;
    taskId?: number;
    params?: ParameterDefinition;
  }>;
}

export interface RawEnvironmentData {
  environments: RawEnvironmentPreview[];
  lastUpdated: string;
  version: string;
}
