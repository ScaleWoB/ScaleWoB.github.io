export interface EnvironmentUrlConfig {
  id: string;
  localPath: string;
  cdnUrl?: string;
  fallbackLocalPath: string;
}

export const environmentUrls: EnvironmentUrlConfig[] = [
  {
    id: 'env-006',
    localPath: '/env/index.html',
    cdnUrl: 'http://oss.wisewk.com/scale-cua-env/env-006/index.html',
    fallbackLocalPath: '/env/index.html',
  },
];

export const getEnvironmentUrl = (
  envId: string,
  useCdn: boolean = true
): string => {
  const config = environmentUrls.find(env => env.id === envId);
  if (!config) {
    throw new Error(`Environment ${envId} not found`);
  }

  if (useCdn && config.cdnUrl) {
    return config.cdnUrl;
  }

  return config.localPath;
};

export const getCdnUrl = (envId: string): string | undefined => {
  const config = environmentUrls.find(env => env.id === envId);
  return config?.cdnUrl;
};

export const getLocalUrl = (envId: string): string => {
  const config = environmentUrls.find(env => env.id === envId);
  if (!config) {
    throw new Error(`Environment ${envId} not found`);
  }
  return config.localPath;
};

export const hasCdnUrl = (envId: string): boolean => {
  const config = environmentUrls.find(env => env.id === envId);
  return !!config?.cdnUrl;
};
