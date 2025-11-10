/**
 * Environment types for ScaleCUA benchmark website
 * Defines interfaces for environment data and related structures
 */

import { ReactNode } from 'react';

export type Platform =
  | 'Web Applications'
  | 'Desktop Apps'
  | 'Mobile Interfaces';
export type Difficulty = 'Intermediate' | 'Advanced' | 'Expert';
export type ColorTheme = 'warm' | 'coral' | 'gold';

export interface EnvironmentMetrics {
  completion: number;
  complexity: number;
}

export interface EnvironmentPreview {
  id: string;
  taskName: string;
  platform: Platform;
  difficulty: Difficulty;
  description: string;
  tags: string[];
  metrics: EnvironmentMetrics;
  icon?: string; // Icon identifier string
  colorTheme: ColorTheme;
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
