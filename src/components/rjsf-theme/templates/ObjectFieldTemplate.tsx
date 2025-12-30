import { ObjectFieldTemplateProps } from '@rjsf/utils';
import { useState } from 'react';

const ObjectFieldTemplate: React.FC<ObjectFieldTemplateProps> = props => {
  const { title, properties } = props;

  const [isExpanded, setIsExpanded] = useState(true);
  // Access idSchema through props with type assertion
  const { $id } = (props as any).idSchema || { $id: '' };

  // Check if this is a nested object (not the root)
  // Root object typically has $id of "root", nested objects have paths like "root_property"
  const isNested = $id && $id !== 'root';

  if (!isNested) {
    // Root object - render properties directly, FieldTemplate provides the styling
    return <>{properties.map(prop => prop.content)}</>;
  }

  // Nested object - render with collapsible header
  return (
    <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-gray-50 border-b-2 border-gray-300 flex items-center justify-between hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <svg
            className={`w-4 h-4 text-gray-600 transition-transform ${
              isExpanded ? 'rotate-90' : ''
            }`}
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
          <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            {title}
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 space-y-3">
          {properties.map(prop => (
            <div key={prop.name}>{prop.content}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ObjectFieldTemplate;
