// Filter option interface
export interface FilterOption {
  value: string;
  label: string;
}

// Filter control configuration
export interface FilterConfig<T extends string> {
  key: string;
  label: string;
  value: T;
  options: FilterOption[];
  onChange: (value: T) => void;
}

// Action button configuration
export interface ActionButton {
  label: string;
  variant: 'primary' | 'secondary';
  onClick: () => void;
}

// FilterControls component props
export interface FilterControlsProps<T extends string = string> {
  filters: FilterConfig<T>[];
  actions: ActionButton[];
  colorTheme: 'warm' | 'coral';
  className?: string;
}

const FilterControls = <T extends string = string>({
  filters,
  actions,
  colorTheme,
  className = '',
}: FilterControlsProps<T>) => {
  const getThemeColors = (theme: 'warm' | 'coral') => {
    return {
      border: theme === 'warm' ? 'border-warm-200' : 'border-coral-200',
      focusRing:
        theme === 'warm' ? 'focus:ring-warm-500' : 'focus:ring-coral-500',
      focusBorder:
        theme === 'warm' ? 'focus:border-warm-500' : 'focus:border-coral-500',
      hoverBorder:
        theme === 'warm' ? 'hover:border-warm-300' : 'hover:border-coral-300',
      selectIcon: theme === 'warm' ? 'text-warm-500' : 'text-coral-500',
      primaryGradient:
        theme === 'warm'
          ? 'from-warm-500 to-warm-600 hover:from-warm-600 hover:to-warm-700'
          : 'from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700',
      secondaryBorder:
        theme === 'warm'
          ? 'border-warm-500 text-warm-600 hover:bg-warm-50'
          : 'border-coral-500 text-coral-600 hover:bg-coral-50',
    };
  };

  const themeColors = getThemeColors(colorTheme);

  return (
    <div
      className={`bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-12 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-8">
        <div className="flex flex-wrap items-center gap-8">
          {filters.map(filter => (
            <div key={filter.key}>
              <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                {filter.label}
              </label>
              <div className="relative">
                <select
                  value={filter.value}
                  onChange={e => filter.onChange(e.target.value as T)}
                  className={`appearance-none w-full px-6 py-3 pr-12 border ${themeColors.border} rounded-2xl bg-white text-gray-900 ${themeColors.focusRing} ${themeColors.focusBorder} ${themeColors.hoverBorder} transition-all duration-300 cursor-pointer shadow-xs hover:shadow-md font-medium`}
                >
                  {filter.options.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <svg
                    className={`w-6 h-6 ${themeColors.selectIcon}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {actions.map(action => (
            <button
              key={action.label}
              className={`px-8 py-3 ${
                action.variant === 'primary'
                  ? `bg-linear-to-r ${themeColors.primaryGradient} text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105`
                  : `${themeColors.secondaryBorder} font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105`
              }`}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterControls;
