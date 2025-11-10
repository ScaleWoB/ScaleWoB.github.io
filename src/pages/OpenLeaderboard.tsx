import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import BackgroundDecorations from '../components/common/BackgroundDecorations';
import StatCard from '../components/common/StatCard';
import LeaderboardTable, {
  ColumnConfig,
  OpenAgent,
} from '../components/leaderboard/LeaderboardTable';
import FilterControls, {
  FilterConfig,
  ActionButton,
} from '../components/leaderboard/FilterControls';

const OpenLeaderboard: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<
    '7d' | '30d' | '90d' | '1y'
  >('7d');
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'web' | 'desktop' | 'mobile'
  >('all');

  // Placeholder data
  const agents = [
    {
      id: '1',
      name: 'GPT-4-Vision Agent',
      organization: 'OpenAI',
      score: 92.5,
      rank: 1,
      tasksCompleted: 487,
      successRate: 92.5,
      lastUpdated: '2024-01-15',
    },
    {
      id: '2',
      name: 'Claude-3-Opus GUI',
      organization: 'Anthropic',
      score: 89.2,
      rank: 2,
      tasksCompleted: 456,
      successRate: 89.2,
      lastUpdated: '2024-01-14',
    },
    {
      id: '3',
      name: 'Gemini-UI-Master',
      organization: 'Google',
      score: 87.8,
      rank: 3,
      tasksCompleted: 442,
      successRate: 87.8,
      lastUpdated: '2024-01-15',
    },
    {
      id: '4',
      name: 'AutoGPT-UI',
      organization: 'Open Source',
      score: 76.3,
      rank: 4,
      tasksCompleted: 398,
      successRate: 76.3,
      lastUpdated: '2024-01-13',
    },
    {
      id: '5',
      name: 'AgentGPT-Desktop',
      organization: 'Research Lab',
      score: 71.2,
      rank: 5,
      tasksCompleted: 371,
      successRate: 71.2,
      lastUpdated: '2024-01-12',
    },
  ];

  // Define filter configurations
  const filterConfigs: FilterConfig<string>[] = [
    {
      key: 'timeRange',
      label: 'Time Range',
      value: selectedTimeRange,
      options: [
        { value: '7d', label: 'Last 7 Days' },
        { value: '30d', label: 'Last 30 Days' },
        { value: '90d', label: 'Last 90 Days' },
        { value: '1y', label: 'Last Year' },
      ],
      onChange: (value: string) =>
        setSelectedTimeRange(value as '7d' | '30d' | '90d' | '1y'),
    },
    {
      key: 'category',
      label: 'Category',
      value: selectedCategory,
      options: [
        { value: 'all', label: 'All Categories' },
        { value: 'web', label: 'Web Applications' },
        { value: 'desktop', label: 'Desktop Apps' },
        { value: 'mobile', label: 'Mobile Interfaces' },
      ],
      onChange: (value: string) =>
        setSelectedCategory(value as 'all' | 'web' | 'desktop' | 'mobile'),
    },
  ];

  // Define action buttons
  const actionButtons: ActionButton[] = [
    {
      label: 'Submit Your Agent',
      variant: 'primary',
      onClick: () => console.log('Submit agent clicked'),
    },
    {
      label: 'Download Test Cases',
      variant: 'secondary',
      onClick: () => console.log('Download test cases clicked'),
    },
  ];

  // Define table columns
  const tableColumns: ColumnConfig<OpenAgent>[] = [
    { key: 'rank', label: 'Rank', align: 'left' },
    { key: 'name', label: 'Agent', align: 'left' },
    { key: 'organization', label: 'Organization', align: 'left' },
    { key: 'score', label: 'Score', align: 'center' },
    {
      key: 'successRate',
      label: 'Success Rate',
      align: 'center',
      render: value => (
        <div className="text-gray-600 font-medium text-sm">
          {typeof value === 'number' ? value.toFixed(1) : value}%
        </div>
      ),
    },
    {
      key: 'tasksCompleted',
      label: 'Tasks',
      align: 'center',
      render: value => (
        <div className="text-gray-600 font-medium text-sm">{value}</div>
      ),
    },
    {
      key: 'lastUpdated',
      label: 'Last Updated',
      align: 'center',
      render: value => (
        <div className="text-gray-600 font-medium text-sm">{value}</div>
      ),
    },
  ];

  // Define table actions
  const tableActions = [
    {
      label: 'View Details',
      onClick: (agent: OpenAgent) => console.log('View details:', agent.id),
    },
    {
      label: 'Test Cases',
      onClick: (agent: OpenAgent) => console.log('View test cases:', agent.id),
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-warm-50 via-white to-coral-50 pt-20 pb-16">
        <BackgroundDecorations variant="hero-light" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-linear-to-br from-warm-200 to-warm-400 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                <svg
                  className="w-10 h-10 text-white"
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
              <h1 className="text-4xl md:text-6xl font-bold text-gradient leading-tight">
                Open Tests Leaderboard
              </h1>
            </div>
            <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Transparent evaluation with publicly available test cases and
              environments
            </p>
          </div>
        </div>
      </section>

      {/* Enhanced Breadcrumb */}
      <section className="relative bg-white py-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <nav className="flex items-center space-x-3">
              <Link
                to="/leaderboard"
                className="text-warm-600 hover:text-warm-700 font-medium text-base transition-colors duration-200"
              >
                Leaderboards
              </Link>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-900 font-semibold text-base">
                Open Tests
              </span>
            </nav>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="relative bg-linear-to-br from-warm-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Controls */}
          <FilterControls
            filters={filterConfigs}
            actions={actionButtons}
            colorTheme="warm"
          />

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <StatCard
              value={agents.length}
              label="Active Agents"
              variant="warm"
              hover={true}
            />
            <StatCard
              value="527"
              label="Public Test Cases"
              variant="warm"
              hover={true}
            />
            <StatCard
              value="2,154"
              label="Total Evaluations"
              variant="warm"
              hover={true}
            />
            <StatCard
              value="79.8%"
              label="Avg Success Rate"
              variant="warm"
              hover={true}
            />
          </div>

          {/* Leaderboard Table */}
          <LeaderboardTable
            agents={agents}
            columns={tableColumns}
            colorTheme="warm"
            actions={tableActions}
            pagination={{
              currentPage: 1,
              totalPages: 3,
              totalItems: agents.length,
              onPageChange: page => console.log('Page changed to:', page),
            }}
          />

          {/* Enhanced Test Cases Preview */}
          <div className="mt-16 bg-white rounded-3xl shadow-xl border border-warm-100 p-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-10 text-center">
              Public Test Cases
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group bg-linear-to-br from-warm-50 to-white rounded-2xl p-8 border border-warm-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="absolute inset-0 bg-linear-to-br from-warm-100/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <h4 className="font-bold text-gray-900 mb-4 text-lg">
                    Web Form Automation
                  </h4>
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    Complex form filling with validation and dynamic elements
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-linear-to-r from-warm-200 to-warm-300 text-warm-800 px-3 py-2 rounded-xl font-semibold">
                      Web
                    </span>
                    <Link
                      to="/environment"
                      className="text-warm-600 hover:text-warm-700 font-semibold text-sm hover:underline transition-colors duration-300"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
              <div className="group bg-linear-to-br from-warm-50 to-white rounded-2xl p-8 border border-warm-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="absolute inset-0 bg-linear-to-br from-warm-100/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <h4 className="font-bold text-gray-900 mb-4 text-lg">
                    Multi-step Navigation
                  </h4>
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    Navigate through complex application workflows
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-linear-to-r from-warm-200 to-warm-300 text-warm-800 px-3 py-2 rounded-xl font-semibold">
                      Web
                    </span>
                    <Link
                      to="/environment"
                      className="text-warm-600 hover:text-warm-700 font-semibold text-sm hover:underline transition-colors duration-300"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
              <div className="group bg-linear-to-br from-warm-50 to-white rounded-2xl p-8 border border-warm-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="absolute inset-0 bg-linear-to-br from-warm-100/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <h4 className="font-bold text-gray-900 mb-4 text-lg">
                    Data Extraction
                  </h4>
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    Extract and process data from various UI elements
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-linear-to-r from-warm-200 to-warm-300 text-warm-800 px-3 py-2 rounded-xl font-semibold">
                      Web
                    </span>
                    <Link
                      to="/environment"
                      className="text-warm-600 hover:text-warm-700 font-semibold text-sm hover:underline transition-colors duration-300"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center mt-12">
              <Link
                to="/environment"
                className="inline-flex items-center px-10 py-4 bg-linear-to-r from-warm-500 to-warm-600 text-white font-bold rounded-2xl hover:from-warm-600 hover:to-warm-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 group"
              >
                View All Test Cases in Environments (527)
                <svg
                  className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OpenLeaderboard;
