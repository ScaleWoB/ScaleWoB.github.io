import React from 'react';

// Base agent interface
export interface BaseAgent {
  id: string;
  name: string;
  organization: string;
  score: number;
  rank: number;
}

// Open leaderboard agent interface
export interface OpenAgent extends BaseAgent {
  tasksCompleted: number;
  successRate: number;
  lastUpdated: string;
}

// Closed leaderboard agent interface
export interface ClosedAgent extends BaseAgent {
  category: 'enterprise' | 'research' | 'opensource';
  submissionDate: string;
  verified: boolean;
}

// Column configuration interface
export interface ColumnConfig<T extends BaseAgent = BaseAgent> {
  key: keyof T;
  label: string;
  align: 'left' | 'center' | 'right';
  render?: (value: T[keyof T], agent: T) => React.ReactNode;
}

// Table component props
export interface LeaderboardTableProps<T extends BaseAgent = BaseAgent> {
  agents: T[];
  columns: ColumnConfig<T>[];
  colorTheme: 'warm' | 'coral';
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
  actions?: {
    label: string;
    onClick: (agent: T) => void;
  }[];
  emptyMessage?: string;
}

const LeaderboardTable = <T extends BaseAgent = BaseAgent>({
  agents,
  columns,
  colorTheme,
  pagination,
  actions = [],
  emptyMessage = 'No agents found',
}: LeaderboardTableProps<T>) => {
  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400 text-white';
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getScoreColor = (score: number, theme: 'warm' | 'coral') => {
    if (score >= 90) return 'text-green-600 font-bold';
    if (score >= 80) return `text-${theme}-600 font-semibold`;
    if (score >= 70) return 'text-yellow-600 font-medium';
    return 'text-gray-600';
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'enterprise':
        return 'bg-blue-100 text-blue-700';
      case 'research':
        return 'bg-purple-100 text-purple-700';
      case 'opensource':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getThemeColors = (theme: 'warm' | 'coral') => {
    return {
      gradient:
        theme === 'warm'
          ? 'from-warm-50 to-coral-50'
          : 'from-coral-50 to-warm-50',
      border: theme === 'warm' ? 'border-warm-200' : 'border-coral-200',
      hover:
        theme === 'warm'
          ? 'hover:from-warm-50 hover:to-coral-50'
          : 'hover:from-coral-50 hover:to-warm-50',
      rowBorder: theme === 'warm' ? 'border-warm-100' : 'border-coral-100',
      paginationGradient:
        theme === 'warm'
          ? 'from-warm-50 to-coral-50'
          : 'from-coral-50 to-warm-50',
      paginationBorder:
        theme === 'warm' ? 'border-warm-200' : 'border-coral-300',
      buttonGradient:
        theme === 'warm'
          ? 'from-warm-500 to-warm-600'
          : 'from-coral-500 to-coral-600',
      textHover:
        theme === 'warm' ? 'hover:text-warm-600' : 'hover:text-coral-600',
    };
  };

  const themeColors = getThemeColors(colorTheme);

  const renderCellValue = (column: ColumnConfig<T>, agent: T) => {
    const value = agent[column.key];

    if (column.render) {
      return column.render(value, agent);
    }

    // Special handling for common columns
    switch (column.key) {
      case 'rank':
        return (
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 ${getRankBadgeColor(agent.rank)}`}
          >
            {agent.rank}
          </div>
        );

      case 'name':
        return (
          <div
            className={`font-bold text-gray-900 text-base group-hover:${themeColors.textHover} transition-colors duration-300`}
          >
            {agent.name}
          </div>
        );

      case 'organization':
        return (
          <div className="text-gray-600 font-medium text-sm">
            {agent.organization}
          </div>
        );

      case 'score':
        return (
          <div
            className={`text-xl font-bold ${getScoreColor(agent.score, colorTheme)} group-hover:scale-110 transition-transform duration-300`}
          >
            {agent.score.toFixed(1)}%
          </div>
        );

      case 'category':
        if ('category' in agent) {
          return (
            <span
              className={`text-xs px-3 py-2 rounded-xl font-semibold ${getCategoryBadge(agent.category)} group-hover:scale-105 transition-transform duration-300`}
            >
              {agent.category.charAt(0).toUpperCase() + agent.category.slice(1)}
            </span>
          );
        }
        return null;

      case 'verified':
        if ('verified' in agent) {
          return (
            <div className="flex justify-center">
              {agent.verified ? (
                <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              ) : (
                <div className="w-8 h-8 bg-yellow-100 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <svg
                    className="w-5 h-5 text-yellow-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          );
        }
        return null;

      default:
        return (
          <div className="text-gray-600 font-medium text-sm">
            {String(value)}
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {agents.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-500 text-lg font-medium">
            {emptyMessage}
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className={`bg-gradient-to-r ${themeColors.gradient} border-b ${themeColors.border}`}
                >
                  {columns.map(column => (
                    <th
                      key={String(column.key)}
                      className={`py-6 px-6 font-bold text-gray-900 text-base ${
                        column.align === 'center'
                          ? 'text-center'
                          : column.align === 'right'
                            ? 'text-right'
                            : 'text-left'
                      }`}
                    >
                      {column.label}
                    </th>
                  ))}
                  {actions.length > 0 && (
                    <th className="text-center py-6 px-6 font-bold text-gray-900 text-base">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {agents.map(agent => (
                  <tr
                    key={agent.id}
                    className={`border-b ${themeColors.rowBorder} ${themeColors.hover} transition-all duration-300 group`}
                  >
                    {columns.map(column => (
                      <td key={String(column.key)} className="py-6 px-6">
                        {renderCellValue(column, agent)}
                      </td>
                    ))}
                    {actions.length > 0 && (
                      <td className="py-6 px-6 text-center">
                        <div className="flex items-center justify-center space-x-3">
                          {actions.map((action, index) => (
                            <React.Fragment key={action.label}>
                              {index > 0 && (
                                <span className="text-gray-300 font-bold">
                                  |
                                </span>
                              )}
                              <button
                                className={`text-${colorTheme}-600 hover:text-${colorTheme}-700 font-semibold text-sm hover:underline transition-colors duration-300`}
                                onClick={() => action.onClick(agent)}
                              >
                                {action.label}
                              </button>
                            </React.Fragment>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && (
            <div
              className={`flex items-center justify-between p-8 bg-gradient-to-r ${themeColors.paginationGradient} border-t ${themeColors.paginationBorder}`}
            >
              <div className="text-base text-gray-600 font-medium">
                Showing {(pagination.currentPage - 1) * 10 + 1} to{' '}
                {Math.min(pagination.currentPage * 10, pagination.totalItems)}{' '}
                of {pagination.totalItems} results
              </div>
              <div className="flex items-center space-x-3">
                <button
                  className={`px-6 py-3 border ${themeColors.paginationBorder} rounded-xl text-sm font-medium text-gray-600 hover:bg-${colorTheme}-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300`}
                  onClick={() =>
                    pagination.onPageChange(pagination.currentPage - 1)
                  }
                  disabled={pagination.currentPage === 1}
                >
                  Previous
                </button>

                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map(page => (
                  <button
                    key={page}
                    className={`px-6 py-3 ${
                      page === pagination.currentPage
                        ? `bg-gradient-to-r ${themeColors.buttonGradient} text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl`
                        : `border ${themeColors.paginationBorder} rounded-xl text-sm font-medium text-gray-600 hover:bg-${colorTheme}-100`
                    } transition-all duration-300`}
                    onClick={() => pagination.onPageChange(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  className={`px-6 py-3 border ${themeColors.paginationBorder} rounded-xl text-sm font-medium text-gray-600 hover:bg-${colorTheme}-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300`}
                  onClick={() =>
                    pagination.onPageChange(pagination.currentPage + 1)
                  }
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LeaderboardTable;
