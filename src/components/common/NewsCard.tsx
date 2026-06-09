import React from 'react';

export interface NewsActionLink {
  label: string;
  url: string;
  variant: 'primary' | 'secondary';
  icon?: 'github' | 'pypi' | 'download' | 'document';
}

export interface NewsCardProps {
  category: string;
  categoryColor: 'green' | 'blue' | 'purple' | 'gray';
  date?: string;
  status?: string;
  title: string;
  description: string;
  actions?: NewsActionLink[];
  isDisabled?: boolean;
  icon?: 'code' | 'database' | 'document' | 'download';
}

const NewsCard: React.FC<NewsCardProps> = ({
  category,
  categoryColor,
  date,
  status,
  title,
  description,
  actions = [],
  isDisabled = false,
  icon = 'document',
}) => {
  const getCategoryColorClasses = (color: string, disabled: boolean) => {
    if (disabled) {
      return 'bg-gray-400 text-white';
    }

    switch (color) {
      case 'green':
        return 'bg-green-600 text-white';
      case 'blue':
        return 'bg-blue-600 text-white';
      case 'purple':
        return 'bg-purple-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getCardColorClasses = (disabled: boolean) => {
    if (disabled) {
      return 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed';
    }
    return 'border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors duration-200';
  };

  const getIconColors = (disabled: boolean, color: string) => {
    if (disabled) {
      return {
        bg: 'bg-gray-200',
        border: 'border-gray-300',
        icon: 'text-gray-400',
      };
    }

    switch (color) {
      case 'green':
        return {
          bg: 'bg-green-100',
          border: 'border-green-300',
          icon: 'text-green-600',
        };
      case 'blue':
        return {
          bg: 'bg-blue-100',
          border: 'border-blue-300',
          icon: 'text-blue-600',
        };
      case 'purple':
        return {
          bg: 'bg-purple-100',
          border: 'border-purple-300',
          icon: 'text-purple-600',
        };
      default:
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-300',
          icon: 'text-gray-600',
        };
    }
  };

  const getIconSvg = (iconType: string) => {
    switch (iconType) {
      case 'code':
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        );
      case 'database':
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
          />
        );
      case 'download':
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        );
      case 'document':
      default:
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        );
    }
  };

  const getActionIconSvg = (iconType?: string) => {
    switch (iconType) {
      case 'github':
        return (
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        );
      case 'pypi':
        return (
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-2 17.21l-4.5-4.5 1.41-1.41L10 14.38l6.59-6.59L18 9.21l-8 8z" />
        );
      case 'download':
        return (
          <path d="M12 16.5 6.75 11.25l1.4-1.4L11 12.69V3h2v9.69l2.85-2.84 1.4 1.4L12 16.5ZM5 21a2 2 0 0 1-2-2v-3h2v3h14v-3h2v3a2 2 0 0 1-2 2H5Z" />
        );
      case 'document':
        return (
          <path d="M6 2h8l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm7 1.5V7h3.5L13 3.5ZM8 11v2h8v-2H8Zm0 4v2h8v-2H8Z" />
        );
      default:
        return null;
    }
  };

  const iconColors = getIconColors(isDisabled, categoryColor);
  const textColorClass = isDisabled ? 'text-gray-600' : 'text-gray-900';
  const descriptionColorClass = isDisabled ? 'text-gray-500' : 'text-gray-700';
  const dateColorClass = isDisabled ? 'text-gray-500' : 'text-gray-600';

  return (
    <div className={`border-2 ${getCardColorClasses(isDisabled)}`}>
      <div className="px-6 py-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`px-3 py-1 ${getCategoryColorClasses(categoryColor, isDisabled)} text-xs font-bold uppercase tracking-wide`}
              >
                {category}
              </span>
              {date && (
                <span className={`text-sm ${dateColorClass} font-medium`}>
                  {date}
                </span>
              )}
              {status && (
                <span className="text-sm text-gray-500 font-medium">
                  {status}
                </span>
              )}
            </div>
            <h3 className={`text-lg font-bold ${textColorClass} mb-2`}>
              {title}
            </h3>
            <p
              className={`text-sm ${descriptionColorClass} leading-relaxed ${isDisabled ? '' : 'mb-2'}`}
            >
              {description}
            </p>
            {actions.length > 0 && !isDisabled && (
              <div className="flex flex-wrap gap-2">
                {actions.map((action, index) => (
                  <a
                    key={index}
                    href={action.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
                      action.variant === 'primary'
                        ? 'bg-gray-900 text-white hover:bg-gray-800'
                        : 'border-2 border-gray-800 text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    {action.icon && (
                      <svg
                        className="w-4 h-4 mr-1.5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {getActionIconSvg(action.icon)}
                      </svg>
                    )}
                    {action.label}
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="shrink-0">
            <div
              className={`w-10 h-10 ${iconColors.bg} border-2 ${iconColors.border} flex items-center justify-center`}
            >
              <svg
                className={`w-5 h-5 ${iconColors.icon}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {getIconSvg(icon)}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
