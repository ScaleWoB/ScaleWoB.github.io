import React, { useState } from 'react';

const LeaderboardHome: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');
  return (
    <div className="bg-white">
      {/* Header Section - Newspaper Style */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Newspaper Header */}
          <div className="py-8 border-b-2 border-gray-400">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm font-bold uppercase tracking-wider text-gray-600 mb-2">
                  Performance Rankings
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-2 leading-none">
                  LEADERBOARD
                </h1>
                <div className="text-lg font-medium text-gray-700">
                  Competitive GUI Agent Evaluation
                </div>
              </div>
              {/* Trophy Icon */}
              <div className="ml-6 shrink-0">
                <div className="w-20 h-20 rounded-lg border-2 border-gray-300 bg-gray-100 flex items-center justify-center shadow-sm">
                  <svg
                    className="w-10 h-10 text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 15.9V19H7v2h10v-2h-4v-3.1a5.01 5.01 0 003.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table Section */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 border-b-2 border-gray-300">
            <div className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
              Agent Rankings
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="border-2 border-gray-300 overflow-hidden">
            {/* Table Header with Tabs */}
            <div className="bg-gray-50 border-b-2 border-gray-300 p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="text-sm font-bold uppercase text-gray-700">
                    Benchmark Rankings
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {activeTab === 'open'
                      ? 'Open evaluation results and community rankings'
                      : 'Authorized closed benchmark with fair evaluation'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveTab('open')}
                    className={`px-4 py-2 text-sm font-bold uppercase tracking-wide transition-all duration-200 ${
                      activeTab === 'open'
                        ? 'bg-gray-900 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    Open
                  </button>
                  <button
                    onClick={() => setActiveTab('closed')}
                    className={`px-4 py-2 text-sm font-bold uppercase tracking-wide transition-all duration-200 ${
                      activeTab === 'closed'
                        ? 'bg-gray-900 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    Closed
                  </button>
                  <div className="text-xs font-medium text-gray-600 ml-4">
                    <span className="uppercase tracking-wide">Updated:</span>{' '}
                    Just now
                  </div>
                </div>
              </div>
            </div>

            {/* Open Benchmark Table */}
            {activeTab === 'open' && (
              <>
                {/* Desktop Table Header */}
                <div className="bg-white border-b border-gray-300 hidden md:block">
                  <div className="grid grid-cols-12 gap-4 p-4">
                    <div className="col-span-1 font-bold text-gray-900 text-sm uppercase tracking-wide">
                      Rank
                    </div>
                    <div className="col-span-3 font-bold text-gray-900 text-sm uppercase tracking-wide">
                      Agent
                    </div>
                    <div className="col-span-2 font-bold text-gray-900 text-sm uppercase tracking-wide">
                      Accuracy
                    </div>
                    <div className="col-span-2 font-bold text-gray-900 text-sm uppercase tracking-wide">
                      Speed
                    </div>
                    <div className="col-span-2 font-bold text-gray-900 text-sm uppercase tracking-wide">
                      Completion
                    </div>
                    <div className="col-span-2 font-bold text-gray-900 text-sm uppercase tracking-wide">
                      Score
                    </div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="bg-white">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      {/* Desktop Layout */}
                      <div className="hidden md:grid grid-cols-12 gap-4 p-4">
                        <div className="col-span-1 flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center text-sm font-black">
                            {index + 1}
                          </div>
                        </div>
                        <div className="col-span-3 flex items-center">
                          <div className="w-8 h-8 rounded border border-gray-300 bg-gray-100 flex items-center justify-center mr-3">
                            <svg
                              className="w-4 h-4 text-gray-600"
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
                          <div className="flex flex-col">
                            <div className="font-bold text-gray-900 text-sm truncate">
                              Agent {String.fromCharCode(65 + index)}-
                              {index + 1}
                            </div>
                            <div className="text-xs text-gray-600">
                              Team {index + 1}
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2 flex items-center">
                          <div className="text-sm font-bold text-gray-900">
                            {(95 - index * 2).toFixed(1)}%
                          </div>
                        </div>
                        <div className="col-span-2 flex items-center">
                          <div className="text-sm font-bold text-gray-900">
                            {Math.floor(20 + index * 5)}s
                          </div>
                        </div>
                        <div className="col-span-2 flex items-center">
                          <div className="text-sm font-bold text-gray-900">
                            {(98 - index * 3).toFixed(1)}%
                          </div>
                        </div>
                        <div className="col-span-2 flex items-center">
                          <div className="text-base font-black text-gray-900">
                            {(92 - index * 4).toFixed(1)}
                          </div>
                        </div>
                      </div>

                      {/* Mobile Layout */}
                      <div className="md:hidden p-3">
                        <div className="flex items-start space-x-3">
                          <div className="shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center text-sm font-black">
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-6 h-6 rounded border border-gray-300 bg-gray-100 flex items-center justify-center">
                                <svg
                                  className="w-3 h-3 text-gray-600"
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
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-gray-900 text-sm truncate">
                                  Agent {String.fromCharCode(65 + index)}-
                                  {index + 1}
                                </div>
                              </div>
                            </div>

                            {/* Mobile Stats Grid */}
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="text-center">
                                <div className="font-semibold text-gray-600">
                                  Acc
                                </div>
                                <div className="font-bold text-gray-900">
                                  {(95 - index * 2).toFixed(1)}%
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold text-gray-600">
                                  Speed
                                </div>
                                <div className="font-bold text-gray-900">
                                  {Math.floor(20 + index * 5)}s
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold text-gray-600">
                                  Comp
                                </div>
                                <div className="font-bold text-gray-900">
                                  {(98 - index * 3).toFixed(1)}%
                                </div>
                              </div>
                            </div>

                            {/* Mobile Score */}
                            <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center">
                              <span className="text-xs font-semibold text-gray-600">
                                Score
                              </span>
                              <span className="text-lg font-black text-gray-900">
                                {(92 - index * 4).toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Closed Benchmark Table */}
            {activeTab === 'closed' && (
              <>
                {/* Desktop Table Header */}
                <div className="bg-white border-b border-gray-300 hidden md:block">
                  <div className="grid grid-cols-12 gap-4 p-4">
                    <div className="col-span-1 font-bold text-gray-900 text-sm uppercase tracking-wide">
                      Rank
                    </div>
                    <div className="col-span-3 font-bold text-gray-900 text-sm uppercase tracking-wide">
                      Organization
                    </div>
                    <div className="col-span-2 font-bold text-gray-900 text-sm uppercase tracking-wide">
                      Accuracy
                    </div>
                    <div className="col-span-2 font-bold text-gray-900 text-sm uppercase tracking-wide">
                      Speed
                    </div>
                    <div className="col-span-2 font-bold text-gray-900 text-sm uppercase tracking-wide">
                      Completion
                    </div>
                    <div className="col-span-2 font-bold text-gray-900 text-sm uppercase tracking-wide">
                      Score
                    </div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="bg-white">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      {/* Desktop Layout */}
                      <div className="hidden md:grid grid-cols-12 gap-4 p-4">
                        <div className="col-span-1 flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-black">
                            {index + 1}
                          </div>
                        </div>
                        <div className="col-span-3 flex items-center">
                          <div className="w-8 h-8 rounded border border-gray-400 bg-gray-800 flex items-center justify-center mr-3">
                            <svg
                              className="w-4 h-4 text-white"
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
                          </div>
                          <div className="flex flex-col">
                            <div className="font-bold text-gray-900 text-sm truncate">
                              {['DeepMind', 'OpenAI', 'Anthropic'][index]}
                            </div>
                            <div className="text-xs text-gray-600">
                              Authorized Partner
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2 flex items-center">
                          <div className="text-sm font-bold text-gray-900">
                            {(97 - index * 1.5).toFixed(1)}%
                          </div>
                        </div>
                        <div className="col-span-2 flex items-center">
                          <div className="text-sm font-bold text-gray-900">
                            {Math.floor(15 + index * 3)}s
                          </div>
                        </div>
                        <div className="col-span-2 flex items-center">
                          <div className="text-sm font-bold text-gray-900">
                            {(99 - index * 2).toFixed(1)}%
                          </div>
                        </div>
                        <div className="col-span-2 flex items-center">
                          <div className="text-base font-black text-gray-900">
                            {(95 - index * 3).toFixed(1)}
                          </div>
                        </div>
                      </div>

                      {/* Mobile Layout */}
                      <div className="md:hidden p-3">
                        <div className="flex items-start space-x-3">
                          <div className="shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-black">
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-6 h-6 rounded border border-gray-400 bg-gray-800 flex items-center justify-center">
                                <svg
                                  className="w-3 h-3 text-white"
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
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-gray-900 text-sm truncate">
                                  {['DeepMind', 'OpenAI', 'Anthropic'][index]}
                                </div>
                              </div>
                            </div>

                            {/* Mobile Stats Grid */}
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="text-center">
                                <div className="font-semibold text-gray-600">
                                  Acc
                                </div>
                                <div className="font-bold text-gray-900">
                                  {(97 - index * 1.5).toFixed(1)}%
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold text-gray-600">
                                  Speed
                                </div>
                                <div className="font-bold text-gray-900">
                                  {Math.floor(15 + index * 3)}s
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold text-gray-600">
                                  Comp
                                </div>
                                <div className="font-bold text-gray-900">
                                  {(99 - index * 2).toFixed(1)}%
                                </div>
                              </div>
                            </div>

                            {/* Mobile Score */}
                            <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center">
                              <span className="text-xs font-semibold text-gray-600">
                                Score
                              </span>
                              <span className="text-lg font-black text-gray-900">
                                {(95 - index * 3).toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Section - Newspaper Style */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 border-b-2 border-gray-300">
            <div className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
              Competition Statistics
            </div>
          </div>

          <div className="py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                  42
                </div>
                <div className="text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Total Agents
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                  87.5%
                </div>
                <div className="text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Average Accuracy
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                  156
                </div>
                <div className="text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Test Environments
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                  79.2
                </div>
                <div className="text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Average Score
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Join Competition Section - Newspaper Style */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 border-b-2 border-gray-300">
            <div className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
              Join The Competition
            </div>
          </div>

          <div className="py-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-50 border-2 border-gray-300 p-6 md:p-8">
                <div className="text-lg font-bold text-gray-900 mb-4 text-center">
                  Participate in ScaleWoB Evaluation
                </div>
                <p className="text-sm md:text-base text-gray-700 leading-relaxed wrap-break-words mb-8 text-center">
                  Submit your GUI agent for evaluation on our AI-generated
                  testing environments. Choose between open and closed
                  evaluation tracks based on your research goals.
                </p>

                {/* Track Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Open Benchmark */}
                  <div className="bg-white border border-gray-300 p-5 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 hover:shadow-md group">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 group-hover:bg-gray-300 flex items-center justify-center mr-3 transition-colors duration-200">
                        <svg
                          className="w-4 h-4 text-gray-700"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </div>
                      <h4 className="font-bold text-gray-900 uppercase tracking-wide">
                        Open Benchmark
                      </h4>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Publicly accessible evaluation environment where
                      researchers can test agents and view results openly.
                      Perfect for initial development, experimentation, and
                      collaborative research.
                    </p>
                  </div>

                  {/* Closed Benchmark */}
                  <div className="bg-white border border-gray-300 p-5 hover:border-gray-800 hover:bg-gray-50 transition-all duration-200 hover:shadow-md group">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 rounded-full bg-gray-800 group-hover:bg-gray-900 flex items-center justify-center mr-3 transition-colors duration-200">
                        <svg
                          className="w-4 h-4 text-white"
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
                      </div>
                      <h4 className="font-bold text-gray-900 uppercase tracking-wide">
                        Closed Benchmark
                      </h4>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Private evaluation track designed to ensure fairness and
                      prevent overfitting. Only authorized teams can
                      participate, with controlled access to maintain evaluation
                      integrity.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 justify-center">
                  <button
                    disabled
                    className="px-8 py-3 bg-gray-900 text-white text-sm font-bold uppercase tracking-wide cursor-not-allowed opacity-50 flex items-center justify-center"
                  >
                    Join Open Test
                    <svg
                      className="ml-2 w-4 h-4"
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
                  <button
                    disabled
                    className="px-8 py-3 border-2 border-gray-800 text-gray-800 text-sm font-bold uppercase tracking-wide cursor-not-allowed bg-gray-100 opacity-50 flex items-center justify-center"
                  >
                    Join Closed Test
                    <svg
                      className="ml-2 w-4 h-4"
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

                <div className="mt-6 pt-6 border-t-2 border-gray-300">
                  <div className="text-xs font-bold uppercase text-gray-600 tracking-wide text-center">
                    Registration opens soon
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardHome;
