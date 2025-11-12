export interface EnvironmentUrlConfig {
  id: string;
  cdnUrl: string;
}

export const environmentUrls: EnvironmentUrlConfig[] = [
  {
    id: 'env-006',
    cdnUrl: 'https://niumascript.com/scalewob-env/env-006/index.html',
  },
];

export const getEnvironmentUrl = (envId: string): string => {
  const config = environmentUrls.find(env => env.id === envId);
  if (!config) {
    throw new Error(`Environment ${envId} not found`);
  }
  return config.cdnUrl;
};

export const getCdnUrl = (envId: string): string => {
  const config = environmentUrls.find(env => env.id === envId);
  if (!config) {
    throw new Error(`Environment ${envId} not found`);
  }
  return config.cdnUrl;
};

export const hasCdnUrl = (): boolean => {
  return true; // All environments now use CDN exclusively
};
