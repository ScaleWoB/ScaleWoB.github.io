import React, { useState, useMemo } from 'react';
import HeroSection from '../components/common/HeroSection';
import FeatureCard from '../components/common/FeatureCard';
import FilterControls, {
  FilterConfig,
} from '../components/leaderboard/FilterControls';
import { useEnvironmentPreviews } from '../services/environmentService';
import {
  EnvironmentPreview,
  EnvironmentPreviewWithIcon,
} from '../types/environment';
import { getIcon, getDefaultIcon } from '../utils/iconMapping';

// Loading state component (moved outside to avoid re-creation on render)
const LoadingState: React.FC = () => (
  <div className="py-16 bg-linear-to-br from-warm-50 to-coral-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-warm-200 border-t-warm-600 rounded-full animate-spin mx-auto mb-4"></div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Loading Gallery
        </h3>
        <p className="text-gray-600">
          Please wait while we fetch the latest gallery data...
        </p>
      </div>
    </div>
  </div>
);

// Error state component (moved outside to avoid re-creation on render)
interface ErrorStateProps {
  error: string | null;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => (
  <div className="py-16 bg-linear-to-br from-warm-50 to-coral-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Failed to Load Gallery
        </h3>
        <p className="text-gray-600 mb-6">
          {error || 'An unexpected error occurred while loading gallery data.'}
        </p>
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-warm-600 text-white rounded-lg hover:bg-warm-700 transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
);

const Gallery: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Load environment data using the new service
  const hookResult = useEnvironmentPreviews() as {
    data: EnvironmentPreview[] | null;
    loading: boolean;
    error: string | null;
    retry: () => void;
  };

  const { data: environmentsData, loading, error, retry } = hookResult;

  // Enhanced filter configurations using data from the service
  const filterConfigs: FilterConfig<string>[] = useMemo(
    () => [
      {
        key: 'platform',
        label: 'Platform',
        value: selectedPlatform,
        options: [
          { value: 'all', label: 'All Platforms' },
          { value: 'Web Applications', label: 'Web Applications' },
          { value: 'Desktop Apps', label: 'Desktop Apps' },
          { value: 'Mobile Interfaces', label: 'Mobile Interfaces' },
        ],
        onChange: setSelectedPlatform,
      },
      {
        key: 'difficulty',
        label: 'Difficulty Level',
        value: selectedDifficulty,
        options: [
          { value: 'all', label: 'All Levels' },
          { value: 'Intermediate', label: 'Intermediate' },
          { value: 'Advanced', label: 'Advanced' },
          { value: 'Expert', label: 'Expert' },
        ],
        onChange: setSelectedDifficulty,
      },
    ],
    [selectedPlatform, selectedDifficulty]
  );

  // Action buttons for filter controls
  const filterActions = useMemo(
    () => [
      {
        label: 'Reset Filters',
        variant: 'secondary' as const,
        onClick: () => {
          setSelectedPlatform('all');
          setSelectedDifficulty('all');
        },
      },
    ],
    []
  );

  // Map environment data to include React icon components
  const environmentsWithIcons = useMemo((): EnvironmentPreviewWithIcon[] => {
    if (!environmentsData) return [];

    return environmentsData.map(env => {
      const IconComponent = getIcon(env.icon) || getDefaultIcon();
      return {
        ...env,
        icon: <IconComponent />,
      };
    });
  }, [environmentsData]);

  // Get filtered environments with icons
  const filteredEnvironmentsWithIcons = useMemo(() => {
    if (!environmentsWithIcons) return [];

    // Apply platform filter
    let filtered = environmentsWithIcons.filter(
      env => selectedPlatform === 'all' || env.platform === selectedPlatform
    );

    // Apply difficulty filter
    filtered = filtered.filter(
      env =>
        selectedDifficulty === 'all' || env.difficulty === selectedDifficulty
    );

    return filtered;
  }, [environmentsWithIcons, selectedPlatform, selectedDifficulty]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Intermediate':
        return 'bg-warm-100 text-warm-700';
      case 'Advanced':
        return 'bg-coral-100 text-coral-700';
      case 'Expert':
        return 'bg-gold-100 text-gold-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Web Applications':
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
            />
          </svg>
        );
      case 'Desktop Apps':
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        );
      case 'Mobile Interfaces':
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen">
        <HeroSection
          badge={{
            text: '🖼️ Environment Gallery',
            variant: 'default',
          }}
          title={['Interactive Environment', 'Gallery']}
          description="Explore our comprehensive collection of AI-generated testing environments. Each environment is uniquely generated to ensure fair evaluation of GUI agent capabilities."
          buttons={[
            {
              text: '← Back to Overview',
              to: '/environment',
              variant: 'secondary-on-warm',
            },
          ]}
          backgroundVariant="warm-gradient"
          showPulseDots={true}
        />
        <LoadingState />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen">
        <HeroSection
          badge={{
            text: '🖼️ Environment Gallery',
            variant: 'default',
          }}
          title={['Interactive Environment', 'Gallery']}
          description="Explore our comprehensive collection of AI-generated testing environments. Each environment is uniquely generated to ensure fair evaluation of GUI agent capabilities."
          buttons={[
            {
              text: '← Back to Overview',
              to: '/environment',
              variant: 'secondary-on-warm',
            },
          ]}
          backgroundVariant="warm-gradient"
          showPulseDots={true}
        />
        <ErrorState error={error} onRetry={retry} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        badge={{
          text: '🔍 Environment Explorer',
          variant: 'default',
        }}
        title={['Interactive Environment', 'Preview Gallery']}
        description="Explore our comprehensive collection of AI-generated testing environments. Each environment is uniquely generated to ensure fair evaluation of GUI agent capabilities."
        buttons={[
          {
            text: '← Back to Overview',
            to: '/environment',
            variant: 'secondary-on-warm',
          },
        ]}
        backgroundVariant="warm-gradient"
        showPulseDots={true}
      />

      {/* Filter Section */}
      <div className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Environment Gallery
            </h2>
            <p className="text-gray-600">
              Showing {filteredEnvironmentsWithIcons.length} of{' '}
              {environmentsWithIcons.length} environments
            </p>
          </div>

          <FilterControls
            filters={filterConfigs}
            actions={filterActions}
            colorTheme="warm"
          />
        </div>
      </div>

      {/* Environment Grid */}
      <div className="py-12 bg-linear-to-br from-warm-50 to-coral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEnvironmentsWithIcons.map(environment => (
              <div key={environment.id} className="group">
                <div className="card p-6 bg-linear-to-br from-gray-50 to-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-12 h-12 bg-linear-to-br ${environment.colorTheme === 'warm' ? 'from-warm-400 to-warm-600' : environment.colorTheme === 'coral' ? 'from-coral-400 to-coral-600' : 'from-gold-400 to-gold-600'} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        {environment.icon}
                      </div>
                      <div>
                        <span
                          className={`inline-flex items-center px-2 py-1 ${getDifficultyColor(environment.difficulty)} rounded-full text-xs font-medium mb-2`}
                        >
                          {environment.difficulty}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:scale-105 transition-transform duration-300">
                          {environment.taskName}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    {environment.description}
                  </p>

                  {/* Platform and Tags */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      {getPlatformIcon(environment.platform)}
                      <span>{environment.platform}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {environment.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-lg font-bold text-warm-600">
                        {environment.metrics.completion}%
                      </div>
                      <div className="text-xs text-gray-600">Success Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-coral-600">
                        {environment.metrics.complexity}/10
                      </div>
                      <div className="text-xs text-gray-600">Complexity</div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button className="w-full px-4 py-2 bg-linear-to-r from-warm-500 to-coral-500 text-white rounded-lg font-medium hover:from-warm-600 hover:to-coral-600 transition-all duration-300 transform hover:scale-105">
                      Launch Environment
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredEnvironmentsWithIcons.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No environments found
              </h3>
              <p className="text-gray-600">
                Try adjusting your filters to see more environments.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="py-16 bg-linear-to-br from-coral-50 via-warm-50 to-gold-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Environment Statistics
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our diverse collection of environments covers various platforms
              and difficulty levels to ensure comprehensive agent evaluation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              title="Web Applications"
              description="Dynamic web interfaces with modern frameworks and responsive design patterns."
              colorTheme="warm"
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
              }
              features={[
                { text: 'React/Vue/Angular apps' },
                { text: 'Form handling & validation' },
                { text: 'Responsive design testing' },
              ]}
            />

            <FeatureCard
              title="Desktop Apps"
              description="Native application interfaces with complex workflows and state management."
              colorTheme="coral"
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              }
              features={[
                { text: 'Electron/Qt/WPF apps' },
                { text: 'File system operations' },
                { text: 'Menu navigation systems' },
              ]}
            />

            <FeatureCard
              title="Mobile Interfaces"
              description="Touch-optimized interfaces with gesture recognition and mobile-specific patterns."
              colorTheme="gold"
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              }
              features={[
                { text: 'iOS/Android apps' },
                { text: 'Gesture recognition' },
                { text: 'Responsive testing' },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gallery;
