import { FieldTemplateProps } from '@rjsf/utils';
import Tooltip from '../../common/Tooltip';

const FieldTemplate: React.FC<FieldTemplateProps> = props => {
  const { id, label, children, errors, help, required, schema, disabled } =
    props;

  // Skip rendering for root object - let properties render directly
  if (id === 'root' || (label === '' && schema.type === 'object')) {
    return <>{children}</>;
  }

  // Get error message - errors is a ReactElement
  const hasError = errors !== null && errors !== undefined;

  // Check if this is an array item (has pattern like "root_field_0", "root_field_1", etc.)
  const isArrayItem = /^\w+_\w+_\d+$/.test(id);

  // Get type label for tooltip
  const getTypeLabel = (type: string | string[] | undefined): string => {
    if (!type) return 'unknown';
    const typeStr = Array.isArray(type) ? type[0] : type;
    switch (typeStr) {
      case 'string':
        return 'text';
      case 'number':
      case 'integer':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'object':
        return 'object';
      case 'array':
        return 'array';
      default:
        return typeStr;
    }
  };

  const typeLabel =
    isArrayItem && schema.items
      ? getTypeLabel((schema.items as any).type)
      : getTypeLabel(schema.type);

  // For array items, render compact version (no card)
  if (isArrayItem) {
    return (
      <div className="flex-1 flex items-center gap-2">
        {children}
        <Tooltip
          content={`${
            schema.items ? getTypeLabel((schema.items as any).type) : typeLabel
          }${
            (schema.items as any)?.description || schema.description
              ? ': ' +
                ((schema.items as any)?.description || schema.description)
              : ''
          }`}
          position="top"
        >
          <svg
            className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 1024 1024"
          >
            <path d="M512 1024c282.771 0 512-229.23 512-512s-229.23-512-512-512-512 229.23-512 512 229.23 512 512 512zM432 256c0-44.183 35.817-80 80-80s80 35.817 80 80v31.999c0 44.183-35.817 80-80 80s-80-35.817-80-80v-31.999zM431.999 512c0-44.183 35.817-80 80-80s80 35.817 80 80v256c0 44.183-35.817 80-80 80s-80-35.817-80-80v-256z" />
          </svg>
        </Tooltip>
      </div>
    );
  }

  return (
    <div
      className={`p-3 mb-3 bg-white border-2 rounded-lg transition-all duration-200 ${
        disabled
          ? 'border-gray-200 opacity-60'
          : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <label
              htmlFor={id}
              className="text-sm font-bold text-gray-900 uppercase tracking-wide"
            >
              {label}
              {required && <span className="text-red-600 ml-1">*</span>}
            </label>
            {schema.description && (
              <Tooltip
                content={`${typeLabel}: ${schema.description}`}
                position="top"
              >
                <svg
                  className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 1024 1024"
                >
                  <path d="M512 1024c282.771 0 512-229.23 512-512s-229.23-512-512-512-512 229.23-512 512 229.23 512 512 512zM432 256c0-44.183 35.817-80 80-80s80 35.817 80 80v31.999c0 44.183-35.817 80-80 80s-80-35.817-80-80v-31.999zM431.999 512c0-44.183 35.817-80 80-80s80 35.817 80 80v256c0 44.183-35.817 80-80 80s-80-35.817-80-80v-256z" />
                </svg>
              </Tooltip>
            )}
          </div>
        </div>
      </div>

      <div className="mt-2">
        {children}

        {hasError && (
          <p className="mt-2 text-xs text-red-600 font-medium">{errors}</p>
        )}

        {help && <p className="mt-2 text-xs text-gray-600">{help}</p>}
      </div>
    </div>
  );
};

export default FieldTemplate;
