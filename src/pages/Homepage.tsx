import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import NewsCard from '../components/common/NewsCard';

const DEMO_MAX_HEIGHT = 750;
const ANDROID_RATIO = 1440 / 3120;
const MAC_RATIO = 3024 / 1964;
const TOTAL_RATIO = ANDROID_RATIO + MAC_RATIO;

const Homepage: React.FC = () => {
  const [showLanguageOptions, setShowLanguageOptions] = useState(false);
  const demoContainerRef = useRef<HTMLDivElement>(null);
  const [demoHeight, setDemoHeight] = useState(DEMO_MAX_HEIGHT);

  useEffect(() => {
    const container = demoContainerRef.current;
    if (!container) return;

    const updateDemoSize = () => {
      const containerWidth = container.clientWidth;
      const styles = window.getComputedStyle(container);
      const gapValue = styles.columnGap || styles.gap || '0px';
      const gapPx = Number.parseFloat(gapValue) || 0;
      const availableWidth = Math.max(containerWidth - gapPx, 0);
      const height = Math.min(DEMO_MAX_HEIGHT, availableWidth / TOTAL_RATIO);

      setDemoHeight(Math.max(height, 0));
    };

    updateDemoSize();
    const observer = new ResizeObserver(updateDemoSize);
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  const androidWidth = demoHeight * ANDROID_RATIO;
  const macWidth = demoHeight * MAC_RATIO;

  return (
    <div className="bg-white">
      {/* Header Section - Newspaper Style */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Newspaper Header */}
          <div className="py-8 border-b-2 border-gray-400">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-2 leading-none">
                  ScaleWoB
                </h1>
                <div className="text-lg font-medium text-gray-700">
                  Scalable World of Bits - Synthetic Computer-Use Environments
                  for GUI Agents
                </div>
              </div>
              {/* GitHub-style Avatar */}
              <div className="ml-6 shrink-0">
                <div className="w-20 h-20 rounded-lg border-2 border-gray-300 bg-gray-100 flex items-center justify-center shadow-sm">
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
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Environments Section */}
          <div className="py-8 border-b-2 border-gray-300">
            <div className="mx-auto px-0">
              <div className="text-2xl font-bold text-gray-800 mb-3 uppercase tracking-wide text-center">
                🔥 Explore In Simulated World-of-Bits! 🔥
              </div>
              <p className="text-sm text-gray-600 mb-6 text-center px-6 max-w-3xl mx-auto">
                In order to gain better experience, you are recommended to open
                the virtual environments in an individual browser tab. You may
                need toggling mobile simulation for android env to behave
                correctly.
              </p>
              <div
                ref={demoContainerRef}
                className="flex flex-col md:flex-row gap-2 justify-center items-start"
              >
                {/* Mobile Hints - Only visible on small screens */}
                <div className="flex md:hidden w-full flex-col gap-4 items-center justify-center py-12 px-6 text-center">
                  <svg
                    className="w-16 h-16 text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <div className="text-lg font-semibold text-gray-800 mb-2">
                    Interactive Demos Available
                  </div>
                  <p className="text-sm text-gray-600 mb-6 max-w-xs">
                    View on a larger screen for the best experience.
                  </p>
                  <div className="flex flex-col gap-3 w-full max-w-xs">
                    <a
                      href="https://niumascript.com/os/android/index.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-gray-900 text-white text-sm font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      Open Virtual Android Env
                    </a>
                    <a
                      href="https://niumascript.com/os/mac/index.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 border-2 border-gray-800 text-gray-800 text-sm font-bold uppercase tracking-wide hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      Open Virtual Mac Env
                    </a>
                  </div>
                </div>
                {/* Android Demo - Vertical */}
                <div className="hidden md:flex flex-col items-center">
                  <iframe
                    src="https://niumascript.com/os/android/index.html"
                    className="border-2 border-gray-300 shadow-lg mb-3"
                    style={{
                      height: `${demoHeight}px`,
                      width: `${androidWidth}px`,
                    }}
                    title="Android Environment Demo"
                    loading="lazy"
                  />
                  <a
                    href="https://niumascript.com/os/android/index.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-gray-900 hover:text-gray-700 underline flex items-center gap-1 transition-colors"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    Virtual Android Env
                  </a>
                </div>
                {/* Mac Demo - Horizontal */}
                <div className="hidden md:flex flex-col items-center">
                  <iframe
                    src="https://niumascript.com/os/mac/index.html"
                    className="border-2 border-gray-300 shadow-lg mb-3"
                    style={{
                      height: `${demoHeight}px`,
                      width: `${macWidth}px`,
                    }}
                    title="Mac Environment Demo"
                    loading="lazy"
                  />
                  <a
                    href="https://niumascript.com/os/mac/index.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-gray-900 hover:text-gray-700 underline flex items-center gap-1 transition-colors"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    Virtual Mac Env
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Main Article Area */}
          <div className="py-8">
            <div className="max-w-5xl mx-auto">
              <div className="text-lg font-semibold text-gray-800 mb-4 uppercase tracking-wide">
                About
              </div>
              <p className="text-base text-gray-700 leading-relaxed mb-8 wrap-break-words">
                GUI agents require training and evaluation in diverse
                interactive computer-use environments, yet high-quality such
                environments remain scarce. ScaleWoB addresses this gap through
                semi-automated environment synthesis. Each environment in
                ScaleWoB is proposed by domain experts & crowd workers and
                developed with AI, featuring realistic interfaces and content,
                and capable of executing complex tasks with verifiable,
                rule-based rewards. ScaleWoB now offers a large and varied
                collection of 1000+ tasks and environments spanning three major
                platforms including mobile, web and desktop.
              </p>
            </div>

            {/* Divider */}
            <div className="border-b-2 border-gray-300 mb-8"></div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
              <Link
                to="/environments"
                className="px-8 py-3 bg-gray-900 text-white text-sm font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors flex items-center justify-center group"
              >
                View Environments
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
              </Link>
              <div className="relative w-full sm:w-auto">
                <button
                  onClick={() => setShowLanguageOptions(!showLanguageOptions)}
                  className={`w-full px-8 py-3 border-2 border-gray-800 text-gray-800 text-sm font-bold uppercase tracking-wide hover:bg-gray-100 transition-colors flex items-center justify-center group ${showLanguageOptions ? 'bg-gray-100' : ''}`}
                >
                  Create Environment
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
                {showLanguageOptions && (
                  <div className="absolute top-full mt-2 left-0 right-0 border-2 border-gray-800 bg-white shadow-lg z-10">
                    <a
                      href="https://lw572lx3ee.feishu.cn/share/base/form/shrcnjzeeqdcf4d6yDPKHw5xbOd"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-6 py-3 text-sm font-bold uppercase tracking-wide text-gray-800 hover:bg-gray-100 transition-colors border-b border-gray-300"
                    >
                      中文版本
                    </a>
                    <a
                      href="https://lw572lx3ee.feishu.cn/share/base/form/shrcnoK335CJpC0tKwORe5Gfwme"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-6 py-3 text-sm font-bold uppercase tracking-wide text-gray-800 hover:bg-gray-100 transition-colors"
                    >
                      ENGLISH
                    </a>
                  </div>
                )}
              </div>
              <Link
                to="/leaderboard"
                className="px-8 py-3 border-2 border-gray-800 text-gray-800 text-sm font-bold uppercase tracking-wide hover:bg-gray-100 transition-colors flex items-center justify-center group"
              >
                View Leaderboard
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
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* News Section - Newspaper Style */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Section Header */}
          <div className="py-6 border-b-2 border-gray-300">
            <div className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
              Latest News
            </div>
          </div>

          {/* News Items */}
          <div className="py-8">
            <div className="space-y-3">
              {/* News Item 1 - SDK Release (Released) */}
              <NewsCard
                category="SDK"
                categoryColor="green"
                date="2025.11.26"
                title="Python SDK for Agent Development"
                description="Official Python SDK to streamline agent development and evaluation on ScaleWoB environments. Includes utilities for environment interaction and result analysis."
                actions={[
                  {
                    label: 'GitHub',
                    url: 'https://github.com/ScaleWoB/ScaleWoB',
                    variant: 'primary',
                    icon: 'github',
                  },
                  {
                    label: 'PyPI',
                    url: 'https://pypi.org/project/scalewob/',
                    variant: 'secondary',
                    icon: 'pypi',
                  },
                ]}
                icon="code"
              />

              {/* News Item 2 - Dataset Release (Coming Soon - Disabled) */}
              <NewsCard
                category="Dataset"
                categoryColor="blue"
                status="Coming Soon"
                title="ScaleWoB Dataset v1.0"
                description="Initial release of the ScaleWoB dataset featuring 1000+ diverse GUI agent tasks across web, mobile, and desktop platforms. Available for download and research use."
                isDisabled={true}
                icon="database"
              />

              {/* News Item 3 - Paper Release (Coming Soon - Disabled) */}
              <NewsCard
                category="Paper"
                categoryColor="purple"
                status="Coming Soon"
                title="Research Paper Publication"
                description="Comprehensive research paper detailing the ScaleWoB methodology, benchmark design, and evaluation results. Includes baseline performance analysis."
                isDisabled={true}
                icon="document"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Newspaper Columns */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Section Header */}
          <div className="py-6 border-b-2 border-gray-300">
            <div className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
              Key Features
            </div>
          </div>

          {/* Three Column Newspaper Layout */}
          <div className="py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {/* Column 1 */}
              <div className="md:border-r md:border-gray-200 md:pr-6 md:px-4 px-2">
                <div className="space-y-4 md:space-y-6">
                  <div>
                    <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">
                      AI-Generated Environments
                    </h4>
                    <p className="text-sm md:text-base text-gray-700 leading-relaxed wrap-break-words">
                      Unique testing environment generated dynamically for each
                      task, enabling large-scale and diverse agent environment
                      simulation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Column 2 */}
              <div className="md:border-r md:border-gray-200 md:px-6 px-2 md:py-0 py-4">
                <div className="space-y-4 md:space-y-6">
                  <div>
                    <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">
                      Stable and Fast Execution
                    </h4>
                    <p className="text-sm md:text-base text-gray-700 leading-relaxed wrap-break-words">
                      Lightweight frontend and backend with synthetic in-app
                      data, making the tests fast and reproducible.
                    </p>
                  </div>
                </div>
              </div>

              {/* Column 3 */}
              <div className="md:pl-6 md:px-4 px-2">
                <div className="space-y-4 md:space-y-6">
                  <div>
                    <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">
                      Cross-Platform Testing
                    </h4>
                    <p className="text-sm md:text-base text-gray-700 leading-relaxed wrap-break-words">
                      Comprehensive evaluation framework supporting web, desktop
                      and mobile platforms within unified testing interface.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section - Newspaper Style */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="py-6 border-b-2 border-gray-300">
            <div className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
              Platform Statistics
            </div>
          </div>

          <div className="py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-black text-gray-900 mb-2">3+</div>
                <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Platforms
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-gray-900 mb-2">
                  50K+
                </div>
                <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Tasks
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-gray-900 mb-2">∞</div>
                <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Environments
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-gray-900 mb-2">
                  100%
                </div>
                <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  AI Generated
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
