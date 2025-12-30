import { WidgetProps } from '@rjsf/utils';

const SelectWidget: React.FC<WidgetProps> = props => {
  const { value, onChange, disabled, schema, onBlur, id } = props;
  const hasError = false; // Error handled at FieldTemplate level

  // Get enum options from schema
  const options = schema.enum || [];

  return (
    <select
      value={String(value || '')}
      onChange={e => {
        onChange(e.target.value);
      }}
      onBlur={() => onBlur?.(id, value)}
      disabled={disabled}
      className={`w-full px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        hasError
          ? 'border-red-300 bg-red-50'
          : disabled
            ? 'border-gray-200 bg-gray-50 text-gray-500'
            : 'border-gray-300 bg-white hover:border-gray-400'
      }`}
    >
      <option value="">Select an option...</option>
      {options.map(option => (
        <option key={String(option)} value={String(option)}>
          {String(option)}
        </option>
      ))}
    </select>
  );
};

export default SelectWidget;
