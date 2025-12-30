/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useMemo } from 'react';
import {
  JSONSchemaDefinition,
  JSONSchemaProperty,
} from '../../types/environment';
import { validateParameterValues } from '../../services/environmentService';

interface ParameterInputProps {
  schema: JSONSchemaDefinition;
  onParametersChange: (parameters: Record<string, any>) => void;
  disabled?: boolean;
  disabledReason?: 'play-mode' | 'not-started' | 'both';
  initialValues?: Record<string, any>;
}

interface PropertyRendererProps {
  propertyName: string;
  propertySchema: JSONSchemaProperty;
  value: any;
  onChange: (name: string, value: any) => void;
  disabled?: boolean;
  required: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  setTouched: (name: string) => void;
  path?: string;
}

const ParameterInput: React.FC<ParameterInputProps> = ({
  schema,
  onParametersChange,
  disabled = false,
  disabledReason = 'both',
  initialValues = {},
}) => {
  // Track all values and validation state
  const [values, setValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    const properties = schema.properties || {};

    for (const [name, propSchema] of Object.entries(properties)) {
      if (initialValues[name] !== undefined) {
        initial[name] = initialValues[name];
      } else if (propSchema.default !== undefined) {
        initial[name] = propSchema.default;
      } else if (propSchema.type === 'boolean') {
        initial[name] = false;
      } else if (
        propSchema.type === 'number' ||
        propSchema.type === 'integer'
      ) {
        initial[name] = 0;
      } else if (propSchema.type === 'array') {
        initial[name] = [];
      } else if (propSchema.type === 'object') {
        initial[name] = {};
      } else {
        initial[name] = '';
      }
    }
    return initial;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouchedState] = useState<Record<string, boolean>>({});

  const handleChange = useCallback(
    (name: string, value: any) => {
      const newValues = { ...values, [name]: value };
      setValues(newValues);
      onParametersChange(newValues);

      // Validate on change if field has been touched
      if (touched[name]) {
        const result = validateParameterValues(schema, newValues);
        if (!result.valid && result.errors) {
          const newErrors: Record<string, string> = {};
          result.errors.forEach(err => {
            const path = err.instancePath.substring(1) || name;
            newErrors[path] = err.message || 'Invalid value';
          });
          setErrors(newErrors);
        } else {
          setErrors({});
        }
      }
    },
    [values, touched, schema, onParametersChange]
  );

  const setTouched = useCallback((name: string) => {
    setTouchedState(prev => ({ ...prev, [name]: true }));
  }, []);

  const requiredFields = useMemo(
    () => new Set(schema.required || []),
    [schema.required]
  );

  // Hide completely if no properties
  if (!schema.properties || Object.keys(schema.properties).length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">
          Evaluation Parameters
        </h3>
        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
          Required Input
        </div>
      </div>

      <div className="text-xs text-gray-600 mb-4">
        Provide the required parameters for task evaluation. These will be
        passed to the environment when you click Finish.
      </div>

      <div className="space-y-3">
        {Object.entries(schema.properties).map(([name, propSchema]) => (
          <PropertyRenderer
            key={name}
            propertyName={name}
            propertySchema={propSchema}
            value={values[name]}
            onChange={handleChange}
            disabled={disabled}
            required={requiredFields.has(name)}
            errors={errors}
            touched={touched}
            setTouched={setTouched}
            path={name}
          />
        ))}
      </div>

      {disabled && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg
              className="w-4 h-4 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <span className="text-xs text-amber-800 font-medium">
              {disabledReason === 'play-mode' &&
                'Parameters are locked. Switch to Evaluate Mode to enable input.'}
              {disabledReason === 'not-started' &&
                'Parameters are locked. Click Start to begin evaluation and enable input.'}
              {disabledReason === 'both' &&
                'Parameters are locked. Switch to Evaluate Mode and click Start to enable input.'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * PrimitiveInput - Renders basic input types (string, number, boolean)
 */
const PrimitiveInput: React.FC<{
  schema: JSONSchemaProperty;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  onBlur: () => void;
}> = ({ schema, value, onChange, disabled, onBlur }) => {
  const hasError = false; // Error handled at parent level

  if (schema.type === 'boolean') {
    return (
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={e => {
            onChange(e.target.checked);
            onBlur();
          }}
          disabled={disabled}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
        />
        <label className="text-sm text-gray-700">
          {value ? 'True' : 'False'}
        </label>
      </div>
    );
  }

  if (schema.type === 'number' || schema.type === 'integer') {
    return (
      <div>
        <input
          type="number"
          value={String(value)}
          onChange={e => {
            const numValue =
              schema.type === 'integer'
                ? parseInt(e.target.value, 10)
                : parseFloat(e.target.value);
            onChange(isNaN(numValue) ? 0 : numValue);
          }}
          onBlur={onBlur}
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
  }

  if (schema.format === 'date') {
    return (
      <input
        type="date"
        value={value || ''}
        onChange={e => {
          onChange(e.target.value);
          onBlur();
        }}
        disabled={disabled}
        className={`w-full px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          hasError
            ? 'border-red-300 bg-red-50'
            : disabled
              ? 'border-gray-200 bg-gray-50 text-gray-500'
              : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
      />
    );
  }

  if (schema.format === 'time') {
    return (
      <input
        type="time"
        value={value || ''}
        onChange={e => {
          onChange(e.target.value);
          onBlur();
        }}
        disabled={disabled}
        className={`w-full px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          hasError
            ? 'border-red-300 bg-red-50'
            : disabled
              ? 'border-gray-200 bg-gray-50 text-gray-500'
              : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
      />
    );
  }

  if (schema.format === 'date-time') {
    return (
      <input
        type="datetime-local"
        value={value || ''}
        onChange={e => {
          onChange(e.target.value);
          onBlur();
        }}
        disabled={disabled}
        className={`w-full px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          hasError
            ? 'border-red-300 bg-red-50'
            : disabled
              ? 'border-gray-200 bg-gray-50 text-gray-500'
              : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
      />
    );
  }

  if (schema.format === 'email') {
    return (
      <input
        type="email"
        value={value || ''}
        onChange={e => {
          onChange(e.target.value);
        }}
        onBlur={onBlur}
        disabled={disabled}
        placeholder="example@email.com"
        className={`w-full px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          hasError
            ? 'border-red-300 bg-red-50'
            : disabled
              ? 'border-gray-200 bg-gray-50 text-gray-500'
              : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
      />
    );
  }

  if (schema.format === 'uri') {
    return (
      <input
        type="url"
        value={value || ''}
        onChange={e => {
          onChange(e.target.value);
        }}
        onBlur={onBlur}
        disabled={disabled}
        placeholder="https://example.com"
        className={`w-full px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          hasError
            ? 'border-red-300 bg-red-50'
            : disabled
              ? 'border-gray-200 bg-gray-50 text-gray-500'
              : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
      />
    );
  }

  if (schema.enum && schema.enum.length > 0) {
    return (
      <select
        value={value || ''}
        onChange={e => {
          onChange(e.target.value);
          onBlur();
        }}
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
        {schema.enum.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      type="text"
      value={String(value)}
      onChange={e => {
        onChange(e.target.value);
      }}
      onBlur={onBlur}
      disabled={disabled}
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

/**
 * ArrayInput - Renders array inputs with add/remove functionality
 */
const ArrayInput: React.FC<{
  schema: JSONSchemaProperty;
  value: any[];
  onChange: (value: any[]) => void;
  disabled?: boolean;
  onBlur: () => void;
}> = ({ schema, value = [], onChange, disabled, onBlur }) => {
  const itemSchema = schema.items || { type: 'string' };
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleAddItem = () => {
    let newItem: any;
    switch (itemSchema.type) {
      case 'boolean':
        newItem = false;
        break;
      case 'number':
      case 'integer':
        newItem = 0;
        break;
      case 'object':
        newItem = {};
        break;
      case 'array':
        newItem = [];
        break;
      default:
        newItem = '';
    }
    onChange([...value, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const newArray = value.filter((_, i) => i !== index);
    onChange(newArray);
  };

  const handleItemChange = (index: number, newValue: any) => {
    const newArray = [...value];
    newArray[index] = newValue;
    onChange(newArray);
  };

  const renderItemInput = (itemValue: any, index: number) => {
    if (itemSchema.type === 'object') {
      return renderObjectItemInput(itemValue, index);
    }

    if (itemSchema.type === 'boolean') {
      return (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={Boolean(itemValue)}
            onChange={e => {
              handleItemChange(index, e.target.checked);
              onBlur();
            }}
            disabled={disabled}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <span className="text-sm text-gray-700">
            {itemValue ? 'True' : 'False'}
          </span>
        </div>
      );
    }

    if (itemSchema.type === 'number' || itemSchema.type === 'integer') {
      return (
        <input
          type="number"
          value={String(itemValue)}
          onChange={e => {
            const numValue =
              itemSchema.type === 'integer'
                ? parseInt(e.target.value, 10)
                : parseFloat(e.target.value);
            handleItemChange(index, isNaN(numValue) ? 0 : numValue);
          }}
          onBlur={onBlur}
          disabled={disabled}
          className="flex-1 px-3 py-2 text-sm border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500"
        />
      );
    }

    if (itemSchema.format === 'date') {
      return (
        <input
          type="date"
          value={itemValue || ''}
          onChange={e => {
            handleItemChange(index, e.target.value);
            onBlur();
          }}
          disabled={disabled}
          className="flex-1 px-3 py-2 text-sm border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500"
        />
      );
    }

    if (itemSchema.format === 'time') {
      return (
        <input
          type="time"
          value={itemValue || ''}
          onChange={e => {
            handleItemChange(index, e.target.value);
            onBlur();
          }}
          disabled={disabled}
          className="flex-1 px-3 py-2 text-sm border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500"
        />
      );
    }

    if (itemSchema.format === 'date-time') {
      return (
        <input
          type="datetime-local"
          value={itemValue || ''}
          onChange={e => {
            handleItemChange(index, e.target.value);
            onBlur();
          }}
          disabled={disabled}
          className="flex-1 px-3 py-2 text-sm border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500"
        />
      );
    }

    if (itemSchema.format === 'email') {
      return (
        <input
          type="email"
          value={itemValue || ''}
          onChange={e => {
            handleItemChange(index, e.target.value);
          }}
          onBlur={onBlur}
          disabled={disabled}
          placeholder="example@email.com"
          className="flex-1 px-3 py-2 text-sm border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500"
        />
      );
    }

    if (itemSchema.format === 'uri') {
      return (
        <input
          type="url"
          value={itemValue || ''}
          onChange={e => {
            handleItemChange(index, e.target.value);
          }}
          onBlur={onBlur}
          disabled={disabled}
          placeholder="https://example.com"
          className="flex-1 px-3 py-2 text-sm border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500"
        />
      );
    }

    if (itemSchema.enum && itemSchema.enum.length > 0) {
      return (
        <select
          value={itemValue || ''}
          onChange={e => {
            handleItemChange(index, e.target.value);
            onBlur();
          }}
          disabled={disabled}
          className="flex-1 px-3 py-2 text-sm border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500"
        >
          <option value="">Select an option...</option>
          {itemSchema.enum.map((option: string) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    // Default: text input
    return (
      <input
        type="text"
        value={String(itemValue)}
        onChange={e => {
          handleItemChange(index, e.target.value);
        }}
        onBlur={onBlur}
        disabled={disabled}
        className="flex-1 px-3 py-2 text-sm border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500"
        placeholder={`Enter ${itemSchema.type} value`}
      />
    );
  };

  const renderObjectItemInput = (
    itemValue: Record<string, any>,
    index: number
  ) => {
    const isExpanded = expandedItems.has(index);
    const properties = itemSchema.properties || {};
    const requiredFields = new Set(itemSchema.required || []);

    const handlePropertyChange = (propertyName: string, newValue: any) => {
      handleItemChange(index, {
        ...itemValue,
        [propertyName]: newValue,
      });
    };

    return (
      <div className="w-full">
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => toggleExpanded(index)}
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
                Item {index + 1}
              </span>
              <span className="text-xs text-gray-600 font-medium">OBJECT</span>
            </div>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                handleRemoveItem(index);
              }}
              disabled={disabled}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Remove item"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </button>

          {isExpanded && (
            <div className="p-4 space-y-3">
              {Object.entries(properties).map(([name, propSchema]) => (
                <PropertyRenderer
                  key={name}
                  propertyName={name}
                  propertySchema={propSchema}
                  value={itemValue?.[name]}
                  onChange={handlePropertyChange}
                  disabled={disabled}
                  required={requiredFields.has(name)}
                  errors={{}}
                  touched={{}}
                  setTouched={() => {}}
                  path={`${index}.${name}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const itemCount = value?.length || 0;
  const hasMaxItems =
    schema.maxItems !== undefined && itemCount >= schema.maxItems;

  return (
    <div className="space-y-2">
      {value?.map((item, index) => {
        if (itemSchema.type === 'object') {
          return <div key={index}>{renderItemInput(item, index)}</div>;
        }

        return (
          <div key={index} className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 flex-1">
              <span className="text-xs text-gray-500 font-medium w-6">
                {index + 1}.
              </span>
              {renderItemInput(item, index)}
            </div>
            <button
              type="button"
              onClick={() => handleRemoveItem(index)}
              disabled={disabled}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Remove item"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        );
      }) || <div className="text-xs text-gray-500 italic">No items yet</div>}

      <button
        type="button"
        onClick={handleAddItem}
        disabled={disabled || hasMaxItems}
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

/**
 * NestedObjectProperty - Renders nested object properties recursively
 */
const NestedObjectProperty: React.FC<{
  schema: JSONSchemaProperty;
  value: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
  disabled?: boolean;
  required: boolean;
  propertyName: string;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  setTouched: (name: string) => void;
  path: string;
}> = ({
  schema,
  value,
  onChange,
  disabled,
  required,
  propertyName,
  errors,
  touched,
  setTouched,
  path,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const properties = schema.properties || {};
  const requiredFields = new Set(schema.required || []);

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
            {propertyName}
            {required && <span className="text-red-600 ml-1">*</span>}
          </span>
        </div>
        <span className="text-xs text-gray-600 font-medium">OBJECT</span>
      </button>

      {isExpanded && (
        <div className="p-4 space-y-3">
          {Object.entries(properties).map(([name, propSchema]) => (
            <PropertyRenderer
              key={name}
              propertyName={name}
              propertySchema={propSchema}
              value={value?.[name]}
              onChange={(nestedName, nestedValue) => {
                onChange({ ...value, [nestedName]: nestedValue });
              }}
              disabled={disabled}
              required={requiredFields.has(name)}
              errors={errors}
              touched={touched}
              setTouched={nestedName => setTouched(`${path}.${nestedName}`)}
              path={`${path}.${name}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * PropertyRenderer - Routes to appropriate input component based on schema type
 */
const PropertyRenderer: React.FC<PropertyRendererProps> = ({
  propertyName,
  propertySchema,
  value,
  onChange,
  disabled,
  required,
  errors,
  touched,
  setTouched,
  path = '',
}) => {
  const handleBlur = () => {
    setTouched(path);
  };

  const error = touched[path] ? errors[path] : '';

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'string':
        return { label: 'String', color: 'green' };
      case 'number':
      case 'integer':
        return { label: 'Number', color: 'blue' };
      case 'boolean':
        return { label: 'Boolean', color: 'purple' };
      case 'object':
        return { label: 'Object', color: 'orange' };
      case 'array':
        return { label: 'Array', color: 'indigo' };
      default:
        return { label: type, color: 'gray' };
    }
  };

  const typeInfo = getTypeLabel(propertySchema.type);

  return (
    <div
      className={`p-4 bg-white border-2 rounded-lg transition-all duration-200 ${
        disabled
          ? 'border-gray-200 opacity-60'
          : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              {propertyName}
              {required && <span className="text-red-600 ml-1">*</span>}
            </label>
            <span
              className={`px-2 py-1 text-xs font-bold uppercase rounded ${
                typeInfo.color === 'purple'
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : typeInfo.color === 'blue'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : typeInfo.color === 'green'
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : typeInfo.color === 'orange'
                        ? 'bg-orange-100 text-orange-700 border border-orange-300'
                        : typeInfo.color === 'indigo'
                          ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
              }`}
            >
              {typeInfo.label}
            </span>
          </div>
          {propertySchema.description && (
            <p className="text-xs text-gray-600 mt-1">
              {propertySchema.description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3">
        {propertySchema.type === 'object' ? (
          <NestedObjectProperty
            schema={propertySchema}
            value={value || {}}
            onChange={newValue => onChange(propertyName, newValue)}
            disabled={disabled}
            required={required}
            propertyName={propertyName}
            errors={errors}
            touched={touched}
            setTouched={setTouched}
            path={path}
          />
        ) : propertySchema.type === 'array' ? (
          <ArrayInput
            schema={propertySchema}
            value={value || []}
            onChange={newValue => onChange(propertyName, newValue)}
            disabled={disabled}
            onBlur={handleBlur}
          />
        ) : (
          <PrimitiveInput
            schema={propertySchema}
            value={value}
            onChange={newValue => onChange(propertyName, newValue)}
            disabled={disabled}
            onBlur={handleBlur}
          />
        )}

        {error && (
          <p className="mt-2 text-xs text-red-600 font-medium flex items-center">
            <svg
              className="w-3 h-3 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default ParameterInput;
