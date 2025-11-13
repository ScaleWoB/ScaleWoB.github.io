import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnvironmentPreviews } from '../services/environmentService';
import {
  EnvironmentPreview,
  EnvironmentPreviewWithIcon,
} from '../types/environment';

// Function to generate SVG icon from task title
const generateInitialIcon = (title: string): React.ReactNode => {
  // Extract the first uppercase letter
  const initial = title.match(/[A-Z]/)?.[0] || title.charAt(0).toUpperCase();

  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" fill="#F3F4F6" rx="4" />
      <text
        x="12"
        y="14"
        fontSize="14"
        fontWeight="bold"
        fill="#1F2937"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Arial, sans-serif"
      >
        {initial}
      </text>
    </svg>
  );
};

// Loading state component (moved outside to avoid re-creation on render)
const LoadingState: React.FC = () => (
  <div className="py-16 bg-white">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="w-20 h-20 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto mb-6"></div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2 uppercase tracking-wide">
          Loading Gallery
        </h3>
        <p className="text-lg text-gray-700">
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
  <div className="py-16 bg-white">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-lg border-2 border-gray-300 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-gray-600"
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
        <h3 className="text-2xl font-bold text-gray-900 mb-2 uppercase tracking-wide">
          Failed to Load Gallery
        </h3>
        <p className="text-lg text-gray-700 mb-6">
          {error || 'An unexpected error occurred while loading gallery data.'}
        </p>
        <button
          onClick={onRetry}
          className="px-8 py-3 bg-gray-900 text-white text-sm font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
);

const Gallery: React.FC = () => {
  const navigate = useNavigate();
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

  // Map environment data to include React icon components
  const environmentsWithIcons = useMemo((): EnvironmentPreviewWithIcon[] => {
    if (!environmentsData) return [];

    return environmentsData.map(env => {
      return {
        ...env,
        icon: generateInitialIcon(env.taskName),
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

  // Show loading state
  if (loading) {
    return (
      <div className="bg-white">
        {/* Header Section - Newspaper Style - Sticky */}
        <div className="sticky top-0 bg-white z-20 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Newspaper Header */}
            <div className="py-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm font-bold uppercase tracking-wider text-gray-600 mb-2">
                    Environment Collection
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-2 leading-none">
                    GALLERY
                  </h1>
                  <div className="text-lg font-medium text-gray-700">
                    Explore AI-Generated Testing Environments
                  </div>
                </div>
                {/* Gallery Icon */}
                <div className="ml-6 shrink-0">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg border-2 border-gray-300 bg-gray-100 flex items-center justify-center shadow-sm">
                    <svg
                      className="w-8 h-8 md:w-10 md:h-10 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <LoadingState />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-white">
        {/* Header Section - Newspaper Style - Sticky */}
        <div className="sticky top-0 bg-white z-20 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Newspaper Header */}
            <div className="py-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm font-bold uppercase tracking-wider text-gray-600 mb-2">
                    Environment Collection
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-2 leading-none">
                    GALLERY
                  </h1>
                  <div className="text-lg font-medium text-gray-700">
                    Explore AI-Generated Testing Environments
                  </div>
                </div>
                {/* Gallery Icon */}
                <div className="ml-6 shrink-0">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg border-2 border-gray-300 bg-gray-100 flex items-center justify-center shadow-sm">
                    <svg
                      className="w-8 h-8 md:w-10 md:h-10 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ErrorState error={error} onRetry={retry} />
      </div>
    );
  }

  // Normal state
  return (
    <div className="bg-white">
      {/* Header Section - Newspaper Style - Sticky */}
      <div className="sticky top-0 bg-white z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Newspaper Header */}
          <div className="py-8 border-b-2 border-gray-400">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm font-bold uppercase tracking-wider text-gray-600 mb-2">
                  Environment Collection
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-2 leading-none">
                  GALLERY
                </h1>
                <div className="text-lg font-medium text-gray-700">
                  Explore AI-Generated Testing Environments
                </div>
              </div>
              {/* Gallery Icon */}
              <div className="ml-6 shrink-0">
                <div className="w-20 h-20 rounded-lg border-2 border-gray-300 bg-gray-100 flex items-center justify-center shadow-sm">
                  <svg
                    className="w-8 h-8 md:w-10 md:h-10 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section - Newspaper Style - Sticky */}
      <div className="sticky top-32 md:top-36 bg-white z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 md:py-8">
            {/* Mobile Filter Section */}
            <div className="lg:hidden mb-6">
              <div className="bg-gray-50 border-2 border-gray-300 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-bold uppercase text-gray-700">
                    Filters
                  </div>
                  <div className="text-sm font-black text-gray-900">
                    {filteredEnvironmentsWithIcons.length} results
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  <select
                    value={selectedPlatform}
                    onChange={e => setSelectedPlatform(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 bg-white text-gray-700 focus:outline-none focus:border-gray-400"
                  >
                    <option value="all">All Platforms</option>
                    <option value="Web Applications">Web Applications</option>
                    <option value="Desktop Apps">Desktop Apps</option>
                    <option value="Mobile Interfaces">Mobile Interfaces</option>
                  </select>

                  <select
                    value={selectedDifficulty}
                    onChange={e => setSelectedDifficulty(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 bg-white text-gray-700 focus:outline-none focus:border-gray-400"
                  >
                    <option value="all">All Levels</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                {(selectedPlatform !== 'all' ||
                  selectedDifficulty !== 'all') && (
                  <button
                    onClick={() => {
                      setSelectedPlatform('all');
                      setSelectedDifficulty('all');
                    }}
                    className="w-full px-3 py-2 text-sm border-2 border-gray-300 text-gray-700 font-bold uppercase tracking-wide hover:bg-gray-100 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Sidebar Filters - Desktop Only - Sticky */}
              <div className="hidden lg:block lg:w-64 lg:sticky lg:top-40 lg:h-fit">
                <div className="bg-gray-50 border-2 border-gray-300 p-6 shadow-sm">
                  <div className="text-sm font-bold uppercase text-gray-700 mb-4">
                    Filter Options
                  </div>

                  <button
                    onClick={() => {
                      setSelectedPlatform('all');
                      setSelectedDifficulty('all');
                    }}
                    className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 text-sm font-bold uppercase tracking-wide hover:bg-gray-100 transition-colors mb-6"
                  >
                    Clear All Filters
                  </button>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold uppercase text-gray-700 mb-3">
                        Platform
                      </h3>
                      <div className="space-y-2">
                        {[
                          'all',
                          'Web Applications',
                          'Desktop Apps',
                          'Mobile Interfaces',
                        ].map(platform => (
                          <button
                            key={platform}
                            onClick={() => setSelectedPlatform(platform)}
                            className={`w-full text-left px-4 py-2 text-sm font-medium transition-all duration-200 ${
                              selectedPlatform === platform
                                ? 'bg-gray-900 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            {platform === 'all' ? 'All Platforms' : platform}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold uppercase text-gray-700 mb-3">
                        Difficulty Level
                      </h3>
                      <div className="space-y-2">
                        {['all', 'Intermediate', 'Advanced', 'Expert'].map(
                          difficulty => (
                            <button
                              key={difficulty}
                              onClick={() => setSelectedDifficulty(difficulty)}
                              className={`w-full text-left px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                selectedDifficulty === difficulty
                                  ? 'bg-gray-900 text-white'
                                  : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                              }`}
                            >
                              {difficulty === 'all' ? 'All Levels' : difficulty}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t-2 border-gray-300">
                    <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                      Results
                    </div>
                    <div className="text-lg font-black text-gray-900">
                      {filteredEnvironmentsWithIcons.length}
                    </div>
                    <div className="text-xs text-gray-600">
                      {filteredEnvironmentsWithIcons.length !== 1
                        ? 'environments'
                        : 'environment'}
                      {filteredEnvironmentsWithIcons.length !==
                        environmentsWithIcons.length &&
                        ` of ${environmentsWithIcons.length} total`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Content Area */}
              <div className="flex-1">
                {/* Environment List - Newspaper Style */}
                <div className="space-y-4 md:space-y-6">
                  {filteredEnvironmentsWithIcons.map(environment => (
                    <div key={environment.id} className="group">
                      <div className="bg-gray-50 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-100 transition-all duration-200 hover:shadow-sm">
                        {/* Header */}
                        <div className="p-4 md:p-6 border-b border-gray-200">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex items-start space-x-3 md:space-x-4">
                              <div className="w-10 h-10 md:w-12 md:h-12 rounded border-2 border-gray-300 bg-gray-100 flex items-center justify-center shrink-0">
                                <div className="w-5 h-5 md:w-6 md:h-6 text-gray-700">
                                  {environment.icon}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2 gap-2">
                                  <h3 className="text-lg md:text-xl font-bold text-gray-900 truncate">
                                    {environment.taskName}
                                  </h3>
                                  <span
                                    className={`px-2 py-1 md:px-3 text-xs font-bold uppercase tracking-wide border inline-block w-fit ${
                                      environment.difficulty === 'Intermediate'
                                        ? 'bg-gray-100 text-gray-800 border-gray-400'
                                        : environment.difficulty === 'Advanced'
                                          ? 'bg-gray-800 text-white border-gray-600'
                                          : 'bg-red-50 text-red-700 border-red-300'
                                    }`}
                                  >
                                    {environment.difficulty}
                                  </span>
                                </div>
                                <p className="text-sm md:text-base text-gray-700 leading-relaxed wrap-break-words">
                                  {environment.description}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                navigate(`/launcher/${environment.id}`)
                              }
                              className="px-4 py-2 md:px-6 md:py-3 bg-gray-900 text-white text-sm font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors flex items-center justify-center group w-full md:w-auto"
                            >
                              Launch
                              <svg
                                className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-4 md:p-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            <div className="flex items-center space-x-3">
                              <svg
                                className="w-5 h-5 text-gray-600 shrink-0"
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
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                  Platform
                                </div>
                                <div className="text-sm font-bold text-gray-900 truncate">
                                  {environment.platform}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <svg
                                className="w-5 h-5 text-gray-600 shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                />
                              </svg>
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                  Complexity
                                </div>
                                <div className="text-sm font-bold text-gray-900">
                                  {environment.metrics.complexity}/10
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <svg
                                className="w-5 h-5 text-gray-600 shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                                />
                              </svg>
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                  Success Rate
                                </div>
                                <div className="text-sm font-bold text-gray-900">
                                  {environment.metrics.completion}%
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Tags */}
                          <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200">
                            <div className="flex flex-wrap gap-1 md:gap-2">
                              {environment.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 md:px-3 bg-gray-100 text-gray-700 text-xs font-medium uppercase tracking-wide border border-gray-300"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Empty State - Newspaper Style */}
                {filteredEnvironmentsWithIcons.length === 0 && (
                  <div className="text-center py-12 md:py-16">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg border-2 border-gray-300 bg-gray-100 flex items-center justify-center mx-auto mb-4 md:mb-6">
                      <svg
                        className="w-8 h-8 md:w-10 md:h-10 text-gray-600"
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
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 uppercase tracking-wide">
                      No Environments Found
                    </h3>
                    <p className="text-sm md:text-base text-gray-700 mb-4 md:mb-6 max-w-md mx-auto">
                      Try adjusting your filter selections to see more results.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedPlatform('all');
                        setSelectedDifficulty('all');
                      }}
                      className="px-6 py-2 md:px-8 md:py-3 bg-gray-900 text-white text-sm font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gallery;
