import type { PolishProvider } from './types';

export const APP_DEFAULTS = {
  hotkey: '`',
  language: '',
  enablePolish: true,
  polishProvider: 'openai' as PolishProvider,
  audioInputDeviceId: '',
  openaiApiKey: '',
} as const;
