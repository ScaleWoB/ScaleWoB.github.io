import { EnvironmentPreview } from '../types/environment';

export interface EnvironmentUrlConfig {
  id: string;
  cdnUrl: string;
}

// This will now be populated dynamically from loaded environment data
export let environmentUrls: EnvironmentUrlConfig[] = [];

// Function to populate environment URLs from loaded environment data
export const populateEnvironmentUrls = (
  environments: EnvironmentPreview[]
): void => {
  environmentUrls = environments
    .filter(env => env.cdnUrl) // Only include environments with CDN URLs
    .map(env => ({
      id: env.id,
      cdnUrl: env.cdnUrl!,
    }));
};

export const getEnvironmentUrl = (envId: string): string => {
  const config = environmentUrls.find(env => env.id === envId);
  if (!config) {
    throw new Error(
      `Environment ${envId} not found or doesn't have CDN URL configured`
    );
  }
  return config.cdnUrl;
};

export const getCdnUrl = (envId: string): string => {
  const config = environmentUrls.find(env => env.id === envId);
  if (!config) {
    throw new Error(
      `Environment ${envId} not found or doesn't have CDN URL configured`
    );
  }
  return config.cdnUrl;
};

export const hasCdnUrl = (envId?: string): boolean => {
  if (envId) {
    return environmentUrls.some(env => env.id === envId && env.cdnUrl);
  }
  return environmentUrls.length > 0; // Return true if we have any environments with CDN URLs
};
