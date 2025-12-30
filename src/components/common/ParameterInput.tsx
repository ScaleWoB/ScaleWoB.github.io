/**
 * ParameterInput component using react-jsonschema-form (RJSF)
 * Replaces custom 1000-line implementation with industry-standard library
 */
import Form from '@rjsf/core';
import { RJSFSchema } from '@rjsf/utils';
import { ScaleWoBTheme, customValidator } from '../rjsf-theme';
import { JSONSchemaDefinition } from '../../types/environment';

interface ParameterInputProps {
  schema: JSONSchemaDefinition;
  onParametersChange: (parameters: Record<string, unknown>) => void;
  disabled?: boolean;
  disabledReason?: 'play-mode' | 'not-started' | 'both';
  initialValues?: Record<string, unknown>;
}

const ParameterInput: React.FC<ParameterInputProps> = ({
  schema,
  onParametersChange,
  disabled = false,
  disabledReason: _disabledReason = 'both',
  initialValues = {},
}) => {
  // Hide completely if no properties
  if (!schema.properties || Object.keys(schema.properties).length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
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
        <Form
          schema={{ ...schema, title: '' } as RJSFSchema}
          formData={initialValues}
          onChange={e => onParametersChange(e.formData)}
          validator={customValidator}
          templates={ScaleWoBTheme.templates}
          widgets={ScaleWoBTheme.widgets}
          disabled={disabled}
          uiSchema={{
            'ui:submitButtonOptions': {
              norender: true,
            },
          }}
        />
      </div>
    </div>
  );
};

export default ParameterInput;
