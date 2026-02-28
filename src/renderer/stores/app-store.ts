import { create } from 'zustand';
import { APP_DEFAULTS } from '../../shared/app-defaults';
import type { AppStatus, AppSettings } from '../../shared/types';

interface AppState {
  status: AppStatus;
  lastTranscription: string;
  error: string | null;
  settings: AppSettings;

  setStatus: (status: AppStatus) => void;
  setLastTranscription: (text: string) => void;
  setError: (error: string | null) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  status: 'idle',
  lastTranscription: '',
  error: null,
  settings: {
    hotkey: APP_DEFAULTS.hotkey,
    language: APP_DEFAULTS.language,
    enablePolish: APP_DEFAULTS.enablePolish,
    polishProvider: APP_DEFAULTS.polishProvider,
    audioInputDeviceId: APP_DEFAULTS.audioInputDeviceId,
    openaiApiKey: APP_DEFAULTS.openaiApiKey,
  },

  setStatus: (status) => set((state) => ({
    status,
    // When transitioning to 'error', preserve the existing error message
    // (it was already set by setError or TRANSCRIPTION_ERROR handler).
    // When transitioning away from error, clear the error.
    error: status === 'error' ? state.error : null,
  })),
  setLastTranscription: (text) => set({ lastTranscription: text }),
  setError: (error) => set({ error, status: 'error' }),
  updateSettings: (settings) =>
    set((state) => ({
      settings: { ...state.settings, ...settings },
    })),
}));
