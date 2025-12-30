import { WidgetProps } from '@rjsf/utils';

const StringWidget: React.FC<WidgetProps> = props => {
  const { value, onChange, disabled, schema, onBlur, id } = props;

  // Determine input type based on format
  const getInputType = () => {
    switch (schema.format) {
      case 'email':
        return 'email';
      case 'uri':
        return 'url';
      case 'date':
        return 'date';
      case 'time':
        return 'time';
      case 'date-time':
        return 'datetime-local';
      default:
        return 'text';
    }
  };

  // Get placeholder based on format
  const getPlaceholder = () => {
    switch (schema.format) {
      case 'email':
        return 'example@email.com';
      case 'uri':
        return 'https://example.com';
      default:
        return undefined;
    }
  };

  const inputType = getInputType();
  const placeholder = getPlaceholder();
  const hasError = false; // Error handled at FieldTemplate level

  return (
    <input
      type={inputType}
      value={value || ''}
      onChange={e => {
        onChange(e.target.value);
      }}
      onBlur={() => onBlur?.(id, value)}
      disabled={disabled}
      placeholder={placeholder}
      className={`w-full px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        hasError
          ? 'border-red-300 bg-red-50'
          : disabled
            ? 'border-gray-200 bg-gray-50 text-gray-500'
            : 'border-gray-300 bg-white hover:border-gray-400'
      }`}
    />
  );
};

export default StringWidget;
