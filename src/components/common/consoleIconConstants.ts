export type ConsoleEntryType =
  | 'action'
  | 'info'
  | 'error'
  | 'success'
  | 'click'
  | 'keypress'
  | 'scroll'
  | 'focus'
  | 'blur'
  | 'submit'
  | 'touch'
  | 'drag'
  | 'navigation'
  | 'init'
  | 'dom-change'
  | 'unknown';

export const CONSOLE_ICON_STYLES: Record<ConsoleEntryType, string> = {
  action: 'bg-blue-500 text-white',
  info: 'bg-gray-500 text-white',
  error: 'bg-red-500 text-white',
  success: 'bg-green-500 text-white',
  click: 'bg-blue-600 text-white',
  keypress: 'bg-green-600 text-white',
  scroll: 'bg-purple-500 text-white',
  focus: 'bg-yellow-500 text-white',
  blur: 'bg-orange-500 text-white',
  submit: 'bg-indigo-500 text-white',
  touch: 'bg-pink-500 text-white',
  drag: 'bg-purple-600 text-white',
  navigation: 'bg-cyan-500 text-white',
  'dom-change': 'bg-teal-500 text-white',
  init: 'bg-gray-500 text-white',
  unknown: 'bg-gray-500 text-white',
};
