import React, { useState } from 'react';
import HeroSection from '../components/common/HeroSection';
import FeatureCard from '../components/common/FeatureCard';
import FilterControls, {
  FilterConfig,
} from '../components/leaderboard/FilterControls';

interface EnvironmentPreview {
  id: string;
  taskName: string;
  platform: 'Web Applications' | 'Desktop Apps' | 'Mobile Interfaces';
  difficulty: 'Intermediate' | 'Advanced' | 'Expert';
  description: string;
  tags: string[];
  metrics: {
    completion: number;
    complexity: number;
  };
  icon: React.ReactNode;
  colorTheme: 'warm' | 'coral' | 'gold';
}

const EnvironmentViewer: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Mock environment data with diverse task examples
  const environmentPreviews: EnvironmentPreview[] = [
    {
      id: 'env-001',
      taskName: 'Multi-Step Form Automation',
      platform: 'Web Applications',
      difficulty: 'Expert',
      description:
        'Complex multi-step form validation with dynamic field generation, conditional logic, and real-time error handling.',
      tags: ['Forms', 'Validation', 'Dynamic UI'],
      metrics: { completion: 95, complexity: 8 },
      icon: (
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      colorTheme: 'warm',
    },
    {
      id: 'env-002',
      taskName: 'Data Table Navigation',
      platform: 'Web Applications',
      difficulty: 'Advanced',
      description:
        'Navigate complex data tables with sorting, filtering, and pagination while maintaining context across operations.',
      tags: ['Data', 'Tables', 'Navigation'],
      metrics: { completion: 87, complexity: 7 },
      icon: (
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
            d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      ),
      colorTheme: 'coral',
    },
    {
      id: 'env-003',
      taskName: 'E-commerce Checkout Flow',
      platform: 'Web Applications',
      difficulty: 'Advanced',
      description:
        'Complete purchase workflows with cart management, payment processing, and order confirmation.',
      tags: ['E-commerce', 'Checkout', 'Payment'],
      metrics: { completion: 92, complexity: 7 },
      icon: (
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
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      colorTheme: 'gold',
    },
    {
      id: 'env-004',
      taskName: 'File Management System',
      platform: 'Desktop Apps',
      difficulty: 'Intermediate',
      description:
        'File operations including upload, download, folder navigation, and bulk operations.',
      tags: ['File System', 'Operations', 'Management'],
      metrics: { completion: 88, complexity: 6 },
      icon: (
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
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
      ),
      colorTheme: 'warm',
    },
    {
      id: 'env-005',
      taskName: 'Menu Navigation Systems',
      platform: 'Desktop Apps',
      difficulty: 'Intermediate',
      description:
        'Complex menu navigation with submenus, keyboard shortcuts, and context menus.',
      tags: ['Navigation', 'Menus', 'Shortcuts'],
      metrics: { completion: 91, complexity: 5 },
      icon: (
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
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      ),
      colorTheme: 'coral',
    },
    {
      id: 'env-006',
      taskName: 'Mobile Gesture Controls',
      platform: 'Mobile Interfaces',
      difficulty: 'Advanced',
      description:
        'Touch-optimized interfaces with swipe gestures, pinch-to-zoom, and mobile-specific interactions.',
      tags: ['Gestures', 'Touch', 'Mobile'],
      metrics: { completion: 85, complexity: 8 },
      icon: (
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
      ),
      colorTheme: 'gold',
    },
    {
      id: 'env-007',
      taskName: 'App Authentication Flow',
      platform: 'Mobile Interfaces',
      difficulty: 'Expert',
      description:
        'Multi-factor authentication with biometric login, social integration, and secure session management.',
      tags: ['Authentication', 'Security', 'MFA'],
      metrics: { completion: 93, complexity: 9 },
      icon: (
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
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
      colorTheme: 'warm',
    },
    {
      id: 'env-008',
      taskName: 'Data Visualization Dashboard',
      platform: 'Web Applications',
      difficulty: 'Expert',
      description:
        'Interactive charts and graphs requiring data interpretation, filtering, and insight extraction.',
      tags: ['Visualization', 'Charts', 'Analytics'],
      metrics: { completion: 89, complexity: 9 },
      icon: (
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      colorTheme: 'coral',
    },
    {
      id: 'env-009',
      taskName: 'Email Client Interface',
      platform: 'Desktop Apps',
      difficulty: 'Advanced',
      description:
        'Email management with inbox organization, search functionality, and composition tools.',
      tags: ['Email', 'Communication', 'Organization'],
      metrics: { completion: 90, complexity: 7 },
      icon: (
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
            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      colorTheme: 'gold',
    },
  ];

  // Filter configurations
  const filterConfigs: FilterConfig<string>[] = [
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
  ];

  // Action buttons for filter controls
  const filterActions = [
    {
      label: 'Reset Filters',
      variant: 'secondary' as const,
      onClick: () => {
        setSelectedPlatform('all');
        setSelectedDifficulty('all');
      },
    },
  ];

  // Filter environments based on selected filters
  const filteredEnvironments = environmentPreviews.filter(env => {
    const platformMatch =
      selectedPlatform === 'all' || env.platform === selectedPlatform;
    const difficultyMatch =
      selectedDifficulty === 'all' || env.difficulty === selectedDifficulty;
    return platformMatch && difficultyMatch;
  });

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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        badge={{
          text: '🔍 Environment Explorer',
          variant: 'default',
        }}
        title={['Interactive Environment', 'Preview Gallery']}
        description="Explore our comprehensive collection of AI-generated testing environments. Each environment is uniquely generated to ensure fair evaluation of GUI agent capabilities across different platforms and complexity levels."
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
              Showing {filteredEnvironments.length} of{' '}
              {environmentPreviews.length} environments
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
      <div className="py-12 bg-linear-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEnvironments.map(environment => (
              <div key={environment.id} className="group relative">
                <div className="absolute -inset-1 bg-linear-to-r from-warm-400 to-coral-400 rounded-2xl opacity-0 group-hover:opacity-25 transition-all duration-500 ease-out blur-xl"></div>
                <div className="relative card p-6 bg-white shadow-lg group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300 ease-out">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-12 h-12 bg-linear-to-br ${environment.colorTheme === 'warm' ? 'from-warm-400 to-warm-600' : environment.colorTheme === 'coral' ? 'from-coral-400 to-coral-600' : 'from-gold-400 to-gold-600'} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 ease-out`}
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
                  <p className="text-sm text-gray-600 leading-relaxed mb-4 group-hover:text-gray-700 transition-colors duration-300">
                    {environment.description}
                  </p>

                  {/* Platform and Tags */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                      {getPlatformIcon(environment.platform)}
                      <span>{environment.platform}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {environment.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium group-hover:bg-gray-200 transition-colors duration-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-lg font-bold text-warm-600 group-hover:scale-105 transition-transform duration-300">
                        {environment.metrics.completion}%
                      </div>
                      <div className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                        Success Rate
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-coral-600 group-hover:scale-105 transition-transform duration-300">
                        {environment.metrics.complexity}/10
                      </div>
                      <div className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                        Complexity
                      </div>
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
          {filteredEnvironments.length === 0 && (
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
      <div className="py-16 bg-white">
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

export default EnvironmentViewer;
