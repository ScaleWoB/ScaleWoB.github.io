import { ThemeProps } from '@rjsf/core';
import { customizeValidator } from '@rjsf/validator-ajv8';

// Import custom templates
import FieldTemplate from './templates/FieldTemplate';
import ArrayFieldTemplate from './templates/ArrayFieldTemplate';
import ArrayFieldItemTemplate from './templates/ArrayFieldItemTemplate';
import ObjectFieldTemplate from './templates/ObjectFieldTemplate';
import TitleFieldTemplate from './templates/TitleFieldTemplate';
import DescriptionFieldTemplate from './templates/DescriptionFieldTemplate';

// Import custom widgets
import StringWidget from './widgets/StringWidget';
import NumberWidget from './widgets/NumberWidget';
import BooleanWidget from './widgets/BooleanWidget';
import SelectWidget from './widgets/SelectWidget';

/**
 * ScaleWoB custom theme for react-jsonschema-form
 * Uses Tailwind CSS to match exact UI/UX design
 */
const ScaleWoBTheme: ThemeProps = {
  templates: {
    FieldTemplate,
    ArrayFieldTemplate,
    ArrayFieldItemTemplate,
    ObjectFieldTemplate,
    TitleFieldTemplate,
    DescriptionFieldTemplate,
  },
  widgets: {
    StringWidget,
    TextWidget: StringWidget, // Alias for array items
    NumberWidget,
    BooleanWidget,
    CheckboxWidget: BooleanWidget, // Use our custom toggle for boolean fields
    SelectWidget,
  },
};

// Custom validator with AJV
const customValidator = customizeValidator();

export { ScaleWoBTheme, customValidator };
export default { theme: ScaleWoBTheme, validator: customValidator };
