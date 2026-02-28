import React, { useEffect, useState } from 'react';

interface AudioDevice {
  deviceId: string;
  label: string;
}

const SettingsPage: React.FC = () => {
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [enablePolish, setEnablePolish] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  const refreshDevices = async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = allDevices
        .filter((d) => d.kind === 'audioinput')
        .map((d) => ({
          deviceId: d.deviceId,
          label: d.label || `Microphone (${d.deviceId.slice(0, 8)}...)`,
        }));
      setDevices(audioInputs);
    } catch (err) {
      console.error('[Settings] Failed to enumerate devices:', err);
    }
  };

  // Load saved settings + device list on mount
  useEffect(() => {
    window.electronAPI.getSettings().then((settings) => {
      setSelectedDeviceId(settings.audioInputDeviceId);
      setEnablePolish(settings.enablePolish);
      setApiKey(settings.openaiApiKey || '');
    });
    refreshDevices();
  }, []);

  // Refresh device list on hot-plug
  useEffect(() => {
    navigator.mediaDevices.addEventListener('devicechange', refreshDevices);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', refreshDevices);
    };
  }, []);

  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedDeviceId(value);
    window.electronAPI.setSettings({ audioInputDeviceId: value });
  };

  const handlePolishToggle = () => {
    const newValue = !enablePolish;
    setEnablePolish(newValue);
    window.electronAPI.setSettings({ enablePolish: newValue });
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setApiKey(value);
    window.electronAPI.setSettings({ openaiApiKey: value });
  };

  return (
    <div className="flex flex-1 flex-col p-[48px]">
      <h1 className="font-heading text-[28px] font-normal tracking-[-0.5px] text-[var(--text-primary)] mb-[32px]">
        Settings
      </h1>

      {/* API Key row */}
      <div className="flex items-center justify-between py-[24px]">
        <div className="flex flex-col gap-[4px]">
          <span className="text-[14px] font-semibold font-sans text-[var(--text-primary)]">
            OpenAI API Key
          </span>
          <span className="text-[12px] font-sans text-[var(--text-tertiary)]">
            Required for transcription and polish. Get one at platform.openai.com
          </span>
        </div>
        <div className="flex items-center gap-[8px]">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="sk-..."
            className="h-[40px] w-[300px] rounded-[8px] border border-[#d4d2cc] bg-white px-[12px] text-[14px] font-sans text-[var(--text-primary)] outline-none focus:border-[#3b5bfe] font-mono"
          />
          <button
            onClick={() => setShowApiKey(!showApiKey)}
            className="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] border border-[#d4d2cc] bg-white text-[14px]"
          >
            {showApiKey ? '🙈' : '👁'}
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="h-[1px] w-full bg-[var(--border-light)]" />

      {/* Microphone row */}
      <div className="flex items-center justify-between py-[24px]">
        <span className="text-[14px] font-semibold font-sans text-[var(--text-primary)]">
          Microphone
        </span>
        <select
          value={selectedDeviceId}
          onChange={handleDeviceChange}
          className="h-[40px] min-w-[200px] max-w-[320px] rounded-[8px] border border-[#d4d2cc] bg-white px-[12px] text-[14px] font-sans text-[var(--text-primary)] outline-none focus:border-[#3b5bfe]"
        >
          <option value="">System Default</option>
          {devices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      {/* Divider */}
      <div className="h-[1px] w-full bg-[var(--border-light)]" />

      {/* Output mode row */}
      <div className="flex items-center justify-between py-[24px]">
        <div className="flex flex-col gap-[4px]">
          <span className="text-[14px] font-semibold font-sans text-[var(--text-primary)]">
            Output Mode
          </span>
          <span className="text-[12px] font-sans text-[var(--text-tertiary)]">
            {enablePolish ? 'Polish mode: AI cleans up transcription before output' : 'Fast mode: raw transcription output, no AI processing'}
          </span>
        </div>
        <button
          onClick={handlePolishToggle}
          className={`relative h-[28px] w-[52px] shrink-0 rounded-full transition-colors ${
            enablePolish ? 'bg-[var(--accent-orange)]' : 'bg-[#d4d2cc]'
          }`}
        >
          <span
            className={`absolute top-[2px] h-[24px] w-[24px] rounded-full bg-white shadow transition-transform ${
              enablePolish ? 'left-[26px]' : 'left-[2px]'
            }`}
          />
        </button>
      </div>

      {/* Divider */}
      <div className="h-[1px] w-full bg-[var(--border-light)]" />
    </div>
  );
};

export default SettingsPage;
