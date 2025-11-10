import React, { useState } from 'react'
import { Link } from 'react-router-dom'

interface Agent {
  id: string
  name: string
  organization: string
  score: number
  rank: number
  category: 'enterprise' | 'research' | 'opensource'
  submissionDate: string
  verified: boolean
}

const ClosedLeaderboard: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'current' | 'previous'>('current')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'enterprise' | 'research' | 'opensource'>('all')

  // Placeholder data with more realistic closed test results
  const agents: Agent[] = [
    {
      id: '1',
      name: 'Enterprise-GUI-Pro',
      organization: 'TechCorp Inc.',
      score: 94.2,
      rank: 1,
      category: 'enterprise',
      submissionDate: '2024-01-15',
      verified: true
    },
    {
      id: '2',
      name: 'Claude-3-Advanced',
      organization: 'Anthropic',
      score: 91.8,
      rank: 2,
      category: 'enterprise',
      submissionDate: '2024-01-14',
      verified: true
    },
    {
      id: '3',
      name: 'GPT-4-Vision-Enterprise',
      organization: 'OpenAI',
      score: 90.5,
      rank: 3,
      category: 'enterprise',
      submissionDate: '2024-01-13',
      verified: true
    },
    {
      id: '4',
      name: 'ResearchAgent-X',
      organization: 'MIT AI Lab',
      score: 83.7,
      rank: 4,
      category: 'research',
      submissionDate: '2024-01-12',
      verified: true
    },
    {
      id: '5',
      name: 'AutoUI-Professional',
      organization: 'StartupXYZ',
      score: 78.9,
      rank: 5,
      category: 'enterprise',
      submissionDate: '2024-01-11',
      verified: false
    }
  ]

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400 text-white'
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 font-bold'
    if (score >= 80) return 'text-coral-600 font-semibold'
    if (score >= 70) return 'text-yellow-600 font-medium'
    return 'text-gray-600'
  }

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'enterprise':
        return 'bg-blue-100 text-blue-700'
      case 'research':
        return 'bg-purple-100 text-purple-700'
      case 'opensource':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-warm-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-coral-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-coral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gradient">
              Closed Tests Leaderboard
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Private, secure evaluation with confidential test cases preventing over-fitting
          </p>
        </div>

        {/* Security Notice */}
        <div className="card bg-white shadow-lg border border-coral-200 mb-8">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-coral-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-coral-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-coral-800">Secure Evaluation Environment</h3>
              <p className="text-sm text-coral-700">All test cases and evaluation environments are kept confidential to ensure fair competition and prevent over-fitting.</p>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center justify-center mb-8">
          <Link to="/leaderboard" className="text-warm-600 hover:text-warm-700 font-medium">
            Leaderboards
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900 font-semibold">Closed Tests</span>
        </div>

        {/* Filters */}
        <div className="card bg-white shadow-lg border border-coral-100 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Evaluation Period</label>
                <div className="relative">
                  <select
                    value={selectedTimeRange}
                    onChange={(e) => setSelectedTimeRange(e.target.value as "current" | "previous")}
                    className="appearance-none w-full px-4 py-2 pr-10 border border-coral-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-coral-500 focus:border-coral-500 hover:border-coral-300 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                  >
                    <option value="current">Current Period</option>
                    <option value="previous">Previous Period</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-coral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as "all" | "enterprise" | "research" | "opensource")}
                    className="appearance-none w-full px-4 py-2 pr-10 border border-coral-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-coral-500 focus:border-coral-500 hover:border-coral-300 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                  >
                    <option value="all">All Categories</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="research">Research</option>
                    <option value="opensource">Open Source</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-coral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-coral-500 text-white rounded-lg hover:bg-coral-600 transition-colors">
                Request Evaluation Access
              </button>
              <button className="px-4 py-2 border border-coral-500 text-coral-600 rounded-lg hover:bg-coral-50 transition-colors">
                Evaluation Guidelines
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-white shadow-md border border-coral-200 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="text-2xl font-bold text-coral-600">{agents.length}</div>
              <div className="text-sm text-gray-600">Verified Agents</div>
            </div>
          </div>
          <div className="card bg-white shadow-md border border-coral-200 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="text-2xl font-bold text-coral-600">Private</div>
              <div className="text-sm text-gray-600">Test Cases</div>
            </div>
          </div>
          <div className="card bg-white shadow-md border border-coral-200 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="text-2xl font-bold text-coral-600">Monthly</div>
              <div className="text-sm text-gray-600">Evaluation Cycles</div>
            </div>
          </div>
          <div className="card bg-white shadow-md border border-coral-200 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="text-2xl font-bold text-coral-600">87.7%</div>
              <div className="text-sm text-gray-600">Avg Success Rate</div>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="card bg-white shadow-lg border border-coral-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Rank</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Agent</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Organization</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Category</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Score</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Verified</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Submitted</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <tr key={agent.id} className="border-b border-gray-100 hover:bg-coral-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankBadgeColor(agent.rank)}`}>
                        {agent.rank}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{agent.name}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-gray-600">{agent.organization}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryBadge(agent.category)}`}>
                        {agent.category.charAt(0).toUpperCase() + agent.category.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className={`text-lg ${getScoreColor(agent.score)}`}>
                        {agent.score.toFixed(1)}%
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {agent.verified ? (
                        <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-yellow-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="text-sm text-gray-600">{agent.submissionDate}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button className="text-coral-600 hover:text-coral-700 font-medium text-sm">
                          View Report
                        </button>
                        <span className="text-gray-300">|</span>
                        <button className="text-coral-600 hover:text-coral-700 font-medium text-sm">
                          Methodology
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing 1 to {agents.length} of {agents.length} verified results
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-3 py-1 bg-coral-500 text-white rounded-md text-sm">
                1
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50">
                2
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Evaluation Process */}
        <div className="mt-12 card bg-white shadow-lg border border-coral-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Secure Evaluation Process</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-coral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-coral-600 font-bold">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Apply for Access</h4>
              <p className="text-sm text-gray-600">Submit your agent and organization details for verification</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-coral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-coral-600 font-bold">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Secure Submission</h4>
              <p className="text-sm text-gray-600">Upload your agent through our secure evaluation portal</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-coral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-coral-600 font-bold">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Private Testing</h4>
              <p className="text-sm text-gray-600">Your agent is tested on confidential environments</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-coral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-coral-600 font-bold">4</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Detailed Report</h4>
              <p className="text-sm text-gray-600">Receive comprehensive performance analysis and insights</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 card bg-gradient-to-r from-coral-500 to-warm-500 text-white">
          <div className="text-center py-8">
            <h3 className="text-2xl font-bold mb-4">Ready for Fair Competition?</h3>
            <p className="text-coral-100 mb-6 max-w-2xl mx-auto">
              Join the most prestigious GUI agent benchmark with closed, private evaluations that ensure true performance measurement without over-fitting.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <button className="px-8 py-3 bg-white text-coral-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg">
                Request Evaluation Access
              </button>
              <button className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-coral-600 transition-colors">
                Download Whitepaper
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClosedLeaderboard