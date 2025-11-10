import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import BackgroundDecorations from '../components/common/BackgroundDecorations';
import StatCard from '../components/common/StatCard';
import LeaderboardTable, {
  ColumnConfig,
} from '../components/leaderboard/LeaderboardTable';
import FilterControls, {
  FilterConfig,
  ActionButton,
} from '../components/leaderboard/FilterControls';

const ClosedLeaderboard: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<
    'current' | 'previous'
  >('current');
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'enterprise' | 'research' | 'opensource'
  >('all');

  // Placeholder data with more realistic closed test results
  const agents = [
    {
      id: '1',
      name: 'Enterprise-GUI-Pro',
      organization: 'TechCorp Inc.',
      score: 94.2,
      rank: 1,
      category: 'enterprise',
      submissionDate: '2024-01-15',
      verified: true,
    },
    {
      id: '2',
      name: 'Claude-3-Advanced',
      organization: 'Anthropic',
      score: 91.8,
      rank: 2,
      category: 'enterprise',
      submissionDate: '2024-01-14',
      verified: true,
    },
    {
      id: '3',
      name: 'GPT-4-Vision-Enterprise',
      organization: 'OpenAI',
      score: 90.5,
      rank: 3,
      category: 'enterprise',
      submissionDate: '2024-01-13',
      verified: true,
    },
    {
      id: '4',
      name: 'ResearchAgent-X',
      organization: 'MIT AI Lab',
      score: 83.7,
      rank: 4,
      category: 'research',
      submissionDate: '2024-01-12',
      verified: true,
    },
    {
      id: '5',
      name: 'AutoUI-Professional',
      organization: 'StartupXYZ',
      score: 78.9,
      rank: 5,
      category: 'enterprise',
      submissionDate: '2024-01-11',
      verified: false,
    },
  ];

  // Define filter configurations
  const filterConfigs: FilterConfig<string>[] = [
    {
      key: 'timeRange',
      label: 'Evaluation Period',
      value: selectedTimeRange,
      options: [
        { value: 'current', label: 'Current Period' },
        { value: 'previous', label: 'Previous Period' },
      ],
      onChange: (value: string) =>
        setSelectedTimeRange(value as 'current' | 'previous'),
    },
    {
      key: 'category',
      label: 'Category',
      value: selectedCategory,
      options: [
        { value: 'all', label: 'All Categories' },
        { value: 'enterprise', label: 'Enterprise' },
        { value: 'research', label: 'Research' },
        { value: 'opensource', label: 'Open Source' },
      ],
      onChange: (value: string) =>
        setSelectedCategory(
          value as 'all' | 'enterprise' | 'research' | 'opensource'
        ),
    },
  ];

  // Define action buttons
  const actionButtons: ActionButton[] = [
    {
      label: 'Request Evaluation Access',
      variant: 'primary',
      onClick: () => console.log('Request evaluation clicked'),
    },
    {
      label: 'Evaluation Guidelines',
      variant: 'secondary',
      onClick: () => console.log('Guidelines clicked'),
    },
  ];

  // Define table columns
  const tableColumns: ColumnConfig[] = [
    { key: 'rank', label: 'Rank', align: 'left' },
    { key: 'name', label: 'Agent', align: 'left' },
    { key: 'organization', label: 'Organization', align: 'left' },
    { key: 'category', label: 'Category', align: 'left' },
    { key: 'score', label: 'Score', align: 'center' },
    { key: 'verified', label: 'Verified', align: 'center' },
    {
      key: 'submissionDate',
      label: 'Submitted',
      align: 'center',
      render: value => (
        <div className="text-gray-600 font-medium text-sm">{value}</div>
      ),
    },
  ];

  // Define table actions
  const tableActions = [
    {
      label: 'View Report',
      onClick: (agent: ClosedAgent) => console.log('View report:', agent.id),
    },
    {
      label: 'Method',
      onClick: (agent: ClosedAgent) => console.log('View method:', agent.id),
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-coral-50 via-white to-warm-50 pt-20 pb-16">
        <BackgroundDecorations variant="leaderboard" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-coral-200 to-coral-400 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gradient leading-tight">
                Closed Tests Leaderboard
              </h1>
            </div>
            <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Private, secure evaluation with confidential test cases preventing
              over-fitting
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
                className="text-coral-600 hover:text-coral-700 font-medium text-base transition-colors duration-200"
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
                Closed Tests
              </span>
            </nav>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="relative bg-gradient-to-br from-coral-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Controls */}
          <FilterControls
            filters={filterConfigs}
            actions={actionButtons}
            colorTheme="coral"
          />

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <StatCard
              value={agents.length}
              label="Verified Agents"
              variant="coral"
              hover={true}
            />
            <StatCard
              value="Private"
              label="Test Cases"
              variant="coral"
              hover={true}
            />
            <StatCard
              value="Monthly"
              label="Evaluation Cycles"
              variant="coral"
              hover={true}
            />
            <StatCard
              value="87.7%"
              label="Avg Success Rate"
              variant="coral"
              hover={true}
            />
          </div>

          {/* Leaderboard Table */}
          <LeaderboardTable
            agents={agents}
            columns={tableColumns}
            colorTheme="coral"
            actions={tableActions}
            pagination={{
              currentPage: 1,
              totalPages: 3,
              totalItems: agents.length,
              onPageChange: page => console.log('Page changed to:', page),
            }}
          />

          {/* Enhanced Evaluation Process */}
          <div className="mt-16 bg-white rounded-3xl shadow-xl border border-coral-100 p-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-10 text-center">
              Secure Evaluation Process
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-coral-200 to-coral-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-3 text-lg">
                  Apply for Access
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Submit your agent and organization details for verification
                </p>
              </div>
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-coral-200 to-coral-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-3 text-lg">
                  Secure Submission
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Upload your agent through our secure evaluation portal
                </p>
              </div>
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-coral-200 to-coral-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110">
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-3 text-lg">
                  Private Testing
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Your agent is tested on confidential environments
                </p>
              </div>
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-coral-200 to-coral-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110">
                  <span className="text-3xl font-bold text-white">4</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-3 text-lg">
                  Detailed Report
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Receive comprehensive performance analysis and insights
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Call to Action */}
          <div className="mt-16 bg-gradient-to-r from-coral-500 via-coral-600 to-warm-500 rounded-3xl shadow-2xl overflow-hidden group">
            <div className="relative p-12 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <h3 className="text-2xl md:text-3xl font-bold mb-6 text-white">
                  Ready for Fair Competition?
                </h3>
                <p className="text-coral-100 mb-10 max-w-4xl mx-auto text-lg leading-relaxed">
                  Join the most prestigious GUI agent benchmark with closed,
                  private evaluations that ensure true performance measurement
                  without over-fitting.
                </p>
                <div className="flex items-center justify-center space-x-6">
                  <button className="px-10 py-4 bg-white text-coral-600 font-bold rounded-2xl hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105">
                    Request Evaluation Access
                  </button>
                  <button className="px-10 py-4 border-2 border-white text-white font-bold rounded-2xl hover:bg-white hover:text-coral-600 transition-all duration-300 transform hover:scale-105">
                    Download Whitepaper
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ClosedLeaderboard;
