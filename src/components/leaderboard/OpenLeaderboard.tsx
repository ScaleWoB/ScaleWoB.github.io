import React, { useState } from 'react'
import { Link } from 'react-router-dom'

interface Agent {
  id: string
  name: string
  organization: string
  score: number
  rank: number
  tasksCompleted: number
  successRate: number
  lastUpdated: string
}

const OpenLeaderboard: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('7d')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'web' | 'desktop' | 'mobile'>('all')

  // Placeholder data
  const agents: Agent[] = [
    {
      id: '1',
      name: 'GPT-4-Vision Agent',
      organization: 'OpenAI',
      score: 92.5,
      rank: 1,
      tasksCompleted: 487,
      successRate: 92.5,
      lastUpdated: '2024-01-15'
    },
    {
      id: '2',
      name: 'Claude-3-Opus GUI',
      organization: 'Anthropic',
      score: 89.2,
      rank: 2,
      tasksCompleted: 456,
      successRate: 89.2,
      lastUpdated: '2024-01-14'
    },
    {
      id: '3',
      name: 'Gemini-UI-Master',
      organization: 'Google',
      score: 87.8,
      rank: 3,
      tasksCompleted: 442,
      successRate: 87.8,
      lastUpdated: '2024-01-15'
    },
    {
      id: '4',
      name: 'AutoGPT-UI',
      organization: 'Open Source',
      score: 76.3,
      rank: 4,
      tasksCompleted: 398,
      successRate: 76.3,
      lastUpdated: '2024-01-13'
    },
    {
      id: '5',
      name: 'AgentGPT-Desktop',
      organization: 'Research Lab',
      score: 71.2,
      rank: 5,
      tasksCompleted: 371,
      successRate: 71.2,
      lastUpdated: '2024-01-12'
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
    if (score >= 80) return 'text-warm-600 font-semibold'
    if (score >= 70) return 'text-yellow-600 font-medium'
    return 'text-gray-600'
  }

  return (
    <div className="min-h-screen bg-warm-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-warm-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-warm-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gradient">
              Open Tests Leaderboard
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Transparent evaluation with publicly available test cases and environments
          </p>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center justify-center mb-8">
          <Link to="/leaderboard" className="text-warm-600 hover:text-warm-700 font-medium">
            Leaderboards
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900 font-semibold">Open Tests</span>
        </div>

        {/* Filters */}
        <div className="card bg-white shadow-lg border border-warm-100 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
                <div className="relative">
                  <select
                    value={selectedTimeRange}
                    onChange={(e) => setSelectedTimeRange(e.target.value as "7d" | "30d" | "90d" | "1y")}
                    className="appearance-none w-full px-4 py-2 pr-10 border border-warm-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-warm-500 focus:border-warm-500 hover:border-warm-300 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                  >
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="all">All Time</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-warm-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    onChange={(e) => setSelectedCategory(e.target.value as "all" | "web" | "desktop" | "mobile")}
                    className="appearance-none w-full px-4 py-2 pr-10 border border-warm-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-warm-500 focus:border-warm-500 hover:border-warm-300 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                  >
                    <option value="all">All Categories</option>
                    <option value="web">Web Applications</option>
                    <option value="desktop">Desktop Apps</option>
                    <option value="mobile">Mobile Interfaces</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-warm-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-warm-500 text-white rounded-lg hover:bg-warm-600 transition-colors">
                Submit Your Agent
              </button>
              <button className="px-4 py-2 border border-warm-500 text-warm-600 rounded-lg hover:bg-warm-50 transition-colors">
                Download Test Cases
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-white shadow-md border border-warm-200 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="text-2xl font-bold text-warm-600">{agents.length}</div>
              <div className="text-sm text-gray-600">Active Agents</div>
            </div>
          </div>
          <div className="card bg-white shadow-md border border-warm-200 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="text-2xl font-bold text-warm-600">527</div>
              <div className="text-sm text-gray-600">Public Test Cases</div>
            </div>
          </div>
          <div className="card bg-white shadow-md border border-warm-200 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="text-2xl font-bold text-warm-600">2,154</div>
              <div className="text-sm text-gray-600">Total Evaluations</div>
            </div>
          </div>
          <div className="card bg-white shadow-md border border-warm-200 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="text-2xl font-bold text-warm-600">79.8%</div>
              <div className="text-sm text-gray-600">Avg Success Rate</div>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="card bg-white shadow-lg border border-warm-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Rank</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Agent</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Organization</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Score</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Success Rate</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Tasks</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Last Updated</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <tr key={agent.id} className="border-b border-gray-100 hover:bg-warm-50 transition-colors">
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
                    <td className="py-4 px-4 text-center">
                      <div className={`text-lg ${getScoreColor(agent.score)}`}>
                        {agent.score.toFixed(1)}%
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="text-gray-600">{agent.successRate.toFixed(1)}%</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="text-gray-600">{agent.tasksCompleted}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="text-sm text-gray-600">{agent.lastUpdated}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button className="text-warm-600 hover:text-warm-700 font-medium text-sm">
                          View Details
                        </button>
                        <span className="text-gray-300">|</span>
                        <button className="text-warm-600 hover:text-warm-700 font-medium text-sm">
                          Test Cases
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
              Showing 1 to {agents.length} of {agents.length} results
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-3 py-1 bg-warm-500 text-white rounded-md text-sm">
                1
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50">
                2
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50">
                3
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Test Cases Preview */}
        <div className="mt-12 card bg-white shadow-lg border border-warm-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Public Test Cases</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-gray-900 mb-2">Web Form Automation</h4>
              <p className="text-sm text-gray-600 mb-3">Complex form filling with validation and dynamic elements</p>
              <div className="flex items-center justify-between">
                <span className="text-xs bg-warm-100 text-warm-700 px-2 py-1 rounded">Web</span>
                <button className="text-warm-600 hover:text-warm-700 text-sm font-medium">View Details</button>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-gray-900 mb-2">Multi-step Navigation</h4>
              <p className="text-sm text-gray-600 mb-3">Navigate through complex application workflows</p>
              <div className="flex items-center justify-between">
                <span className="text-xs bg-warm-100 text-warm-700 px-2 py-1 rounded">Web</span>
                <button className="text-warm-600 hover:text-warm-700 text-sm font-medium">View Details</button>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-gray-900 mb-2">Data Extraction</h4>
              <p className="text-sm text-gray-600 mb-3">Extract and process data from various UI elements</p>
              <div className="flex items-center justify-between">
                <span className="text-xs bg-warm-100 text-warm-700 px-2 py-1 rounded">Web</span>
                <button className="text-warm-600 hover:text-warm-700 text-sm font-medium">View Details</button>
              </div>
            </div>
          </div>
          <div className="text-center mt-6">
            <button className="px-6 py-2 border border-warm-500 text-warm-600 rounded-lg hover:bg-warm-50 transition-colors">
              Browse All Test Cases (527)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OpenLeaderboard