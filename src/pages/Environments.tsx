import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  useEnvironmentPreviews,
  EnvironmentUtils,
} from '../services/environmentService';
import {
  EnvironmentPreview,
  EnvironmentPreviewWithIcon,
} from '../types/environment';

// Function to generate platform-specific icon
const generatePlatformIcon = (platform: string): React.ReactNode => {
  switch (platform) {
    case 'Web Applications':
      return (
        <svg
          className="w-full h-full"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
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
          className="w-full h-full"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
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
          className="w-full h-full"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
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
      return (
        <svg
          className="w-full h-full"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      );
  }
};

// Loading state component (moved outside to avoid re-creation on render)
const LoadingState: React.FC = () => (
  <div className="py-16 bg-white">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="w-20 h-20 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto mb-6"></div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2 uppercase tracking-wide">
          Loading Environments
        </h3>
        <p className="text-lg text-gray-700">
          Please wait while we fetch the latest environment data...
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
          Failed to Load Environments
        </h3>
        <p className="text-lg text-gray-700 mb-6">
          {error ||
            'An unexpected error occurred while loading environment data.'}
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

const PAGE_SIZE = 20;

const Environments: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize state from URL params
  const [selectedPlatform, setSelectedPlatform] = useState<string>(
    searchParams.get('platform') || 'all'
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(
    searchParams.get('difficulty') || 'all'
  );
  const [searchInput, setSearchInput] = useState<string>(
    searchParams.get('search') || ''
  );
  const [debouncedSearch, setDebouncedSearch] = useState<string>(
    searchParams.get('search') || ''
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get('tags')?.split(',').filter(Boolean) || []
  );
  const [currentPage, setCurrentPage] = useState<number>(
    Number(searchParams.get('page')) || 1
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pageInput, setPageInput] = useState<string>(
    String(searchParams.get('page') || 1)
  );

  // Track whether we're restoring state from sessionStorage
  const isRestoringState = useRef(false);

  // Restore state from sessionStorage if returning from launcher
  useEffect(() => {
    const savedState = sessionStorage.getItem('environments-state');
    if (savedState) {
      try {
        isRestoringState.current = true; // Set flag before restoration
        const state = JSON.parse(savedState);
        if (state.platform) setSelectedPlatform(state.platform);
        if (state.difficulty) setSelectedDifficulty(state.difficulty);
        if (state.search) setSearchInput(state.search);
        if (state.tags?.length) setSelectedTags(state.tags);
        if (state.page) setCurrentPage(state.page);
      } catch {
        // Ignore parse errors
      }
      sessionStorage.removeItem('environments-state');
      // Reset flag after a microtask to allow state updates to settle
      setTimeout(() => {
        isRestoringState.current = false;
      }, 0);
    }
  }, []);

  // Load environment data using the new service
  const hookResult = useEnvironmentPreviews() as {
    data: EnvironmentPreview[] | null;
    loading: boolean;
    error: string | null;
    retry: () => void;
  };

  const { data: environmentsData, loading, error, retry } = hookResult;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset to page 1 when filters change
  useEffect(() => {
    // Skip reset if we're restoring state from sessionStorage
    if (isRestoringState.current) {
      return;
    }
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedPlatform, selectedDifficulty, selectedTags]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Sync pageInput with currentPage
  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  // Sync state to URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (selectedPlatform !== 'all') params.set('platform', selectedPlatform);
    if (selectedDifficulty !== 'all')
      params.set('difficulty', selectedDifficulty);
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
    if (currentPage > 1) params.set('page', String(currentPage));
    setSearchParams(params, { replace: true });
  }, [
    debouncedSearch,
    selectedPlatform,
    selectedDifficulty,
    selectedTags,
    currentPage,
    setSearchParams,
  ]);

  // Tag toggle function
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Handle page input change
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  // Handle page input submit
  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(pageInput, 10);
    if (
      !isNaN(pageNum) &&
      pageNum >= 1 &&
      pageNum <= filteredAndPaginatedEnvironments.totalPages
    ) {
      setCurrentPage(pageNum);
    } else {
      // Reset to current page if invalid
      setPageInput(String(currentPage));
    }
  };

  // Derive all unique tags from environment data
  const allTags = useMemo(() => {
    if (!environmentsData) return [];
    const tagSet = new Set<string>();
    environmentsData.forEach(env => env.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [environmentsData]);

  // Map environment data to include React icon components
  const environmentsWithIcons = useMemo((): EnvironmentPreviewWithIcon[] => {
    if (!environmentsData) return [];

    return environmentsData.map(env => {
      return {
        ...env,
        icon: generatePlatformIcon(env.platform),
      };
    });
  }, [environmentsData]);

  // Get filtered and paginated environments
  const filteredAndPaginatedEnvironments = useMemo(() => {
    if (!environmentsWithIcons)
      return { items: [], totalCount: 0, totalPages: 0 };

    let filtered = environmentsWithIcons;

    // 1. Search filter
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        env =>
          env.taskName.toLowerCase().includes(query) ||
          env.description.toLowerCase().includes(query)
      );
    }

    // 2. Platform filter
    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(env => env.platform === selectedPlatform);
    }

    // 3. Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(env => env.difficulty === selectedDifficulty);
    }

    // 4. Tag filter
    if (selectedTags.length > 0) {
      filtered = EnvironmentUtils.filterByTags(
        filtered as EnvironmentPreview[],
        selectedTags
      ) as EnvironmentPreviewWithIcon[];
    }

    // Store total count before pagination
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    // 5. Pagination
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const paginated = filtered.slice(startIndex, startIndex + PAGE_SIZE);

    return { items: paginated, totalCount, totalPages };
  }, [
    environmentsWithIcons,
    debouncedSearch,
    selectedPlatform,
    selectedDifficulty,
    selectedTags,
    currentPage,
  ]);

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
                {/* Environment Icon */}
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
                {/* Environment Icon */}
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
                <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-2 leading-none">
                  Environments
                </h1>
                <div className="text-lg font-medium text-gray-700">
                  View Environments Available in ScaleWoB
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
                    {filteredAndPaginatedEnvironments.totalCount} results
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Search environments..."
                  className="w-full px-4 py-2 mb-4 border-2 border-gray-300 text-sm focus:outline-none focus:border-gray-400"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                />

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
                    <option value="Basic">Basic</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                {allTags.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs font-bold uppercase text-gray-700 mb-2">
                      Tags
                    </div>
                    <div className="space-y-2">
                      {allTags.map(tag => (
                        <label
                          key={tag}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTags.includes(tag)}
                            onChange={() => toggleTag(tag)}
                            className="w-4 h-4 border-2 border-gray-300"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            {tag}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {(selectedPlatform !== 'all' ||
                  selectedDifficulty !== 'all' ||
                  searchInput ||
                  selectedTags.length > 0) && (
                  <button
                    onClick={() => {
                      setSelectedPlatform('all');
                      setSelectedDifficulty('all');
                      setSearchInput('');
                      setSelectedTags([]);
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

                  <input
                    type="text"
                    placeholder="Search environments..."
                    className="w-full px-4 py-2 mb-6 border-2 border-gray-300 text-sm focus:outline-none focus:border-gray-400"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                  />

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
                        {['all', 'Basic', 'Advanced', 'Expert'].map(
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

                    {allTags.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold uppercase text-gray-700 mb-3">
                          Tags
                        </h3>
                        <div className="space-y-2">
                          {allTags.map(tag => (
                            <label
                              key={tag}
                              className="flex items-center space-x-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedTags.includes(tag)}
                                onChange={() => toggleTag(tag)}
                                className="w-4 h-4 border-2 border-gray-300"
                              />
                              <span className="text-sm font-medium text-gray-700">
                                {tag}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-6 border-t-2 border-gray-300">
                    <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                      Results
                    </div>
                    <div className="text-lg font-black text-gray-900">
                      {filteredAndPaginatedEnvironments.totalCount}
                    </div>
                    <div className="text-xs text-gray-600">
                      {filteredAndPaginatedEnvironments.totalCount !== 1
                        ? 'environments'
                        : 'environment'}
                      {filteredAndPaginatedEnvironments.totalCount !==
                        environmentsWithIcons.length &&
                        ` of ${environmentsWithIcons.length} total`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Content Area */}
              <div className="flex-1">
                {/* Active Filter Chips */}
                {(selectedPlatform !== 'all' ||
                  selectedDifficulty !== 'all' ||
                  debouncedSearch ||
                  selectedTags.length > 0) && (
                  <div className="mb-6 bg-gray-50 border-2 border-gray-300 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase text-gray-700 tracking-wide">
                        Active Filters:
                      </span>

                      {/* Search chip */}
                      {debouncedSearch && (
                        <button
                          onClick={() => setSearchInput('')}
                          className="inline-flex items-center px-3 py-1 bg-gray-900 text-white text-xs font-medium uppercase tracking-wide hover:bg-gray-800 transition-colors group"
                        >
                          <span className="mr-2">
                            Search: &quot;{debouncedSearch}&quot;
                          </span>
                          <svg
                            className="w-3 h-3 group-hover:scale-110 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}

                      {/* Platform chip */}
                      {selectedPlatform !== 'all' && (
                        <button
                          onClick={() => setSelectedPlatform('all')}
                          className="inline-flex items-center px-3 py-1 bg-gray-900 text-white text-xs font-medium uppercase tracking-wide hover:bg-gray-800 transition-colors group"
                        >
                          <span className="mr-2">
                            Platform: {selectedPlatform}
                          </span>
                          <svg
                            className="w-3 h-3 group-hover:scale-110 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}

                      {/* Difficulty chip */}
                      {selectedDifficulty !== 'all' && (
                        <button
                          onClick={() => setSelectedDifficulty('all')}
                          className="inline-flex items-center px-3 py-1 bg-gray-900 text-white text-xs font-medium uppercase tracking-wide hover:bg-gray-800 transition-colors group"
                        >
                          <span className="mr-2">
                            Difficulty: {selectedDifficulty}
                          </span>
                          <svg
                            className="w-3 h-3 group-hover:scale-110 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}

                      {/* Tag chips */}
                      {selectedTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className="inline-flex items-center px-3 py-1 bg-gray-900 text-white text-xs font-medium uppercase tracking-wide hover:bg-gray-800 transition-colors group"
                        >
                          <span className="mr-2">Tag: {tag}</span>
                          <svg
                            className="w-3 h-3 group-hover:scale-110 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      ))}

                      {/* Clear all button */}
                      <button
                        onClick={() => {
                          setSelectedPlatform('all');
                          setSelectedDifficulty('all');
                          setSearchInput('');
                          setSelectedTags([]);
                        }}
                        className="inline-flex items-center px-3 py-1 border-2 border-gray-800 text-gray-800 text-xs font-bold uppercase tracking-wide hover:bg-gray-100 transition-colors ml-auto"
                      >
                        Clear All
                      </button>
                    </div>

                    {/* Results count */}
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <span className="text-sm font-semibold text-gray-700">
                        Showing {filteredAndPaginatedEnvironments.totalCount} of{' '}
                        {environmentsWithIcons.length} environments
                      </span>
                    </div>
                  </div>
                )}

                {/* Environment List - Newspaper Style */}
                <div className="space-y-3 md:space-y-4">
                  {filteredAndPaginatedEnvironments.items.map(
                    (environment: EnvironmentPreviewWithIcon) => (
                      <div key={environment.id} className="group">
                        <div className="bg-gray-50 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-100 transition-all duration-200 hover:shadow-sm">
                          {/* Compact Header */}
                          <div className="p-3 md:p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center space-x-4 flex-1 min-w-0">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded border-2 border-gray-300 bg-gray-100 flex items-center justify-center shrink-0">
                                  <div className="w-4 h-4 md:w-5 md:h-5 text-gray-700">
                                    {environment.icon}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h3 className="text-base md:text-lg font-bold text-gray-900">
                                      {environment.taskName}
                                    </h3>
                                    <span
                                      className={`px-2 py-1 text-xs font-bold uppercase tracking-wide border inline-block ${
                                        environment.difficulty === 'Basic'
                                          ? 'bg-blue-50 text-blue-700 border-blue-300'
                                          : environment.difficulty ===
                                              'Advanced'
                                            ? 'bg-orange-50 text-orange-700 border-orange-300'
                                            : 'bg-red-50 text-red-700 border-red-300'
                                      }`}
                                    >
                                      {environment.difficulty}
                                    </span>
                                  </div>
                                  <p className="text-xs md:text-sm text-gray-700 leading-relaxed line-clamp-2">
                                    {environment.description}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2 shrink-0 items-center">
                                <div className="relative">
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        environment.id
                                      );
                                      setCopiedId(environment.id);
                                      setTimeout(() => setCopiedId(null), 2000);
                                    }}
                                    className="p-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200 flex items-center justify-center border border-gray-300 group relative"
                                    title="Copy environment ID"
                                  >
                                    <svg
                                      className="w-4 h-4 group-hover:scale-110 transition-transform duration-200"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                      />
                                    </svg>
                                  </button>
                                  {copiedId === environment.id && (
                                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs font-medium rounded whitespace-nowrap animate-fade-in">
                                      Copied!
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={() => {
                                    sessionStorage.setItem(
                                      'environments-state',
                                      JSON.stringify({
                                        platform: selectedPlatform,
                                        difficulty: selectedDifficulty,
                                        search: searchInput,
                                        tags: selectedTags,
                                        page: currentPage,
                                      })
                                    );
                                    navigate(`/launcher/${environment.id}`);
                                  }}
                                  className="px-3 py-1.5 md:px-4 md:py-2 bg-gray-900 text-white text-sm font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors flex items-center justify-center group"
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
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* Pagination Controls */}
                {filteredAndPaginatedEnvironments.totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
                    <button
                      onClick={() =>
                        setCurrentPage(prev => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-4 py-2 border-2 border-gray-300 text-gray-700 text-sm font-bold uppercase tracking-wide hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">
                        Page
                      </span>
                      <form
                        onSubmit={handlePageInputSubmit}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="number"
                          min="1"
                          max={filteredAndPaginatedEnvironments.totalPages}
                          value={pageInput}
                          onChange={handlePageInputChange}
                          onBlur={handlePageInputSubmit}
                          className="w-16 px-2 py-1 border-2 border-gray-300 text-center text-sm font-bold text-gray-900 focus:outline-none focus:border-gray-400"
                        />
                        <span className="text-sm font-bold text-gray-900">
                          of {filteredAndPaginatedEnvironments.totalPages}
                        </span>
                      </form>
                    </div>
                    <button
                      onClick={() =>
                        setCurrentPage(prev =>
                          Math.min(
                            filteredAndPaginatedEnvironments.totalPages,
                            prev + 1
                          )
                        )
                      }
                      disabled={
                        currentPage ===
                        filteredAndPaginatedEnvironments.totalPages
                      }
                      className="px-4 py-2 border-2 border-gray-300 text-gray-700 text-sm font-bold uppercase tracking-wide hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                      Next
                    </button>
                  </div>
                )}

                {/* Empty State - Newspaper Style */}
                {filteredAndPaginatedEnvironments.totalCount === 0 && (
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
                        setSearchInput('');
                        setSelectedTags([]);
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

export default Environments;
