import { ArrayFieldTemplateProps } from '@rjsf/utils';

const ArrayFieldTemplate: React.FC<ArrayFieldTemplateProps> = props => {
  const { items, canAdd, onAddClick, disabled, readonly, schema } = props;

  const handleAddItem = () => {
    onAddClick();
  };

  const itemCount = items.length;
  const hasMaxItems =
    schema.maxItems !== undefined && itemCount >= schema.maxItems;

  return (
    <div className="space-y-2">
      {items}

      {items.length === 0 && (
        <div className="text-xs text-gray-500 italic">No items yet</div>
      )}

      {canAdd && (
        <button
          type="button"
          onClick={handleAddItem}
          disabled={disabled || readonly || hasMaxItems}
          className="w-full px-3 py-2 text-sm font-medium text-blue-600 border-2 border-dashed border-blue-300 rounded-md hover:bg-blue-50 hover:border-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Add Item</span>
          {schema.maxItems && ` (max ${schema.maxItems})`}
        </button>
      )}

      {schema.minItems !== undefined && itemCount < schema.minItems && (
        <p className="text-xs text-amber-600 flex items-center">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          Minimum {schema.minItems} item{schema.minItems > 1 ? 's' : ''}{' '}
          required ({itemCount} / {schema.minItems})
        </p>
      )}
    </div>
  );
};

export default ArrayFieldTemplate;
