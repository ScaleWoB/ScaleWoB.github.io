import { useParams, Link } from 'react-router-dom';
import { useEnvironmentData } from '../services/environmentService';
import { EnvironmentPreview } from '../types/environment';

const EnvironmentPlaceholder = () => {
  const { envId } = useParams<{ envId: string }>();

  // Load environment data from service
  const { data: environmentData, loading, error } = useEnvironmentData();

  // Get specific environment or provide fallback
  const getEnvironment = (id: string): EnvironmentPreview => {
    if (!environmentData?.environments) {
      // Fallback data
      return {
        id: 'unknown',
        taskName: 'Unknown Environment',
        description: 'Environment not found',
        platform: 'Web Applications',
        difficulty: 'Intermediate',
        tags: [],
        metrics: { completion: 0, complexity: 1 },
        icon: 'help',
        colorTheme: 'warm',
      };
    }
    return (
      environmentData.environments.find(env => env.id === id) ||
      environmentData.environments[0]
    );
  };

  const environment = getEnvironment(envId || '');

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'expert':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'advanced':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Web Applications':
        return '🌐';
      case 'Desktop Apps':
        return '🖥️';
      case 'Mobile Interfaces':
        return '📱';
      default:
        return '💻';
    }
  };

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full text-center">
          <div className="w-8 h-8 border-2 border-warm-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading environment data...</p>
        </div>
      </div>
    );
  }

  // Show error state if data loading fails
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-warm-600 text-white rounded-lg hover:bg-warm-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            to="/gallery"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span>←</span>
            <span>Back to Gallery</span>
          </Link>
        </div>

        {/* Placeholder Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-warm-100 to-coral-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🚧</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {environment.taskName}
          </h1>

          {/* Environment Meta */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{getPlatformIcon(environment.platform)}</span>
              <span>{environment.platform}</span>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(environment.difficulty)}`}
            >
              {environment.difficulty}
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            {environment.description}
          </p>

          {/* Coming Soon Message */}
          <div className="bg-gradient-to-r from-warm-50 to-coral-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Environment Coming Soon
            </h2>
            <p className="text-gray-600 mb-4">
              This environment is currently under development. We&apos;re
              working hard to bring you an interactive demo experience for this
              task.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-warm-600">
              <div className="w-4 h-4 border-2 border-warm-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Environment in progress...</span>
            </div>
          </div>

          {/* Environment ID */}
          <div className="text-xs text-gray-400">Environment ID: {envId}</div>

          {/* Available Demo Hint */}
          {envId !== 'env-006' && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡{' '}
                <strong>
                  Try the &quot;Creating album in Photos&quot; environment
                </strong>{' '}
                for a fully interactive demo experience.
              </p>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Want to see this environment sooner?
            <a href="#" className="text-warm-600 hover:text-warm-700 ml-1">
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentPlaceholder;
