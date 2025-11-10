import React from 'react';

export interface FeatureItem {
  icon?: React.ReactNode;
  text: string;
  description?: string;
}

export interface FeatureCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'featured' | 'minimal' | 'gradient';
  colorTheme?: 'warm' | 'coral' | 'gold' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  tags?: string[];
  features?: FeatureItem[];
  hover?: boolean;
  borderAccent?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * FeatureCard component for displaying features and capabilities
 *
 * @param title - Card title
 * @param description - Card description
 * @param icon - Optional icon
 * @param variant - Card style variant
 * @param colorTheme - Color theme for the card
 * @param size - Card size
 * @param tags - Optional tags to display
 * @param features - List of feature items
 * @param hover - Whether to apply hover effects
 * @param borderAccent - Whether to show border accent
 * @param className - Additional CSS classes
 * @param children - Additional content
 */
const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  variant = 'default',
  colorTheme = 'warm',
  size = 'md',
  tags,
  features,
  hover = true,
  borderAccent = false,
  className = '',
  children,
}) => {
  const getCardClasses = () => {
    const baseClasses = 'card transition-all duration-300';
    const sizeClasses = size === 'lg' ? 'p-8' : size === 'sm' ? 'p-4' : 'p-6';
    const hoverClasses = hover ? 'hover:shadow-xl hover:-translate-y-1' : '';

    switch (variant) {
      case 'featured':
        return `${baseClasses} ${sizeClasses} shadow-xl bg-gradient-to-br from-white to-warm-50 ${borderAccent ? 'border-l-4 border-warm-500' : ''} ${hoverClasses}`;
      case 'minimal':
        return `${baseClasses} ${sizeClasses} shadow-lg ${hoverClasses}`;
      case 'gradient':
        return `${baseClasses} ${sizeClasses} bg-gradient-to-br from-gray-50 to-white ${hoverClasses}`;
      default:
        return `${baseClasses} ${sizeClasses} bg-white shadow-lg ${hoverClasses}`;
    }
  };

  const getIconClasses = () => {
    const baseClasses =
      'flex items-center justify-center flex-shrink-0 transition-transform duration-300';
    const sizeClasses = variant === 'featured' ? 'w-16 h-16' : 'w-12 h-12';
    const shapeClasses =
      variant === 'featured' ? 'rounded-2xl shadow-lg' : 'rounded-xl';
    const hoverClasses = hover ? 'group-hover:scale-110' : '';
    const colorClasses = getColorClasses();

    return `${baseClasses} ${sizeClasses} ${shapeClasses} ${colorClasses} ${hoverClasses}`;
  };

  const getColorClasses = () => {
    const colorMap = {
      warm: 'bg-gradient-to-br from-warm-400 to-warm-600',
      coral: 'bg-gradient-to-br from-coral-400 to-coral-600',
      gold: 'bg-gradient-to-br from-gold-400 to-gold-600',
      gray: 'bg-gradient-to-br from-gray-400 to-gray-600',
    };

    return colorMap[colorTheme];
  };

  const getTagClasses = (index: number) => {
    const tagColors = [
      'bg-warm-100 text-warm-700',
      'bg-coral-100 text-coral-700',
      'bg-gold-100 text-gold-700',
    ];

    return `inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${tagColors[index % tagColors.length]}`;
  };

  const getTitleClasses = () => {
    const sizeClasses = variant === 'featured' ? 'text-2xl' : 'text-lg';
    const hoverClasses = hover ? 'group-hover:scale-105' : '';
    return `${sizeClasses} font-bold text-gray-900 mb-3 ${hoverClasses} transition-transform duration-300`;
  };

  if (variant === 'featured') {
    return (
      <div className={`${getCardClasses()} ${className}`}>
        <div className="flex items-start space-x-6">
          {icon && <div className={getIconClasses()}>{icon}</div>}
          <div className="flex-1">
            <h3 className={getTitleClasses()}>{title}</h3>
            {description && (
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                {description}
              </p>
            )}
            {tags && (
              <div className="flex flex-wrap gap-3">
                {tags.map((tag, index) => (
                  <span key={index} className={getTagClasses(index)}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${getCardClasses()} ${className}`}>
      <div className="flex items-start space-x-4">
        {icon && <div className={getIconClasses()}>{icon}</div>}
        <div>
          <h4 className={getTitleClasses()}>{title}</h4>
          {description && (
            <p className="text-gray-600 leading-relaxed">{description}</p>
          )}
          {features && (
            <div className="space-y-2 mt-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center text-xs text-gray-600 group-hover:text-gray-700 transition-colors duration-300"
                >
                  {feature.icon || (
                    <svg
                      className={`w-3 h-3 mr-1.5 text-${colorTheme}-500`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {feature.description ? (
                    <div>
                      <span className="font-medium text-gray-900">
                        {feature.text}
                      </span>
                      <p className="text-xs text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  ) : (
                    feature.text
                  )}
                </div>
              ))}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;
