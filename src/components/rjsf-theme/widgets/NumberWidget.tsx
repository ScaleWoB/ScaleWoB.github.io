import { WidgetProps } from '@rjsf/utils';

const NumberWidget: React.FC<WidgetProps> = props => {
  const { value, onChange, disabled, schema, onBlur, id } = props;
  const hasError = false; // Error handled at FieldTemplate level

  return (
    <div>
      <input
        type="number"
        value={String(value ?? '')}
        onChange={e => {
          const numValue =
            schema.type === 'integer'
              ? parseInt(e.target.value, 10)
              : parseFloat(e.target.value);
          onChange(isNaN(numValue) ? 0 : numValue);
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
      />
    </div>
  );
};

export default NumberWidget;
