import React, { useState, useEffect, useCallback } from 'react';

interface HistoryEntry {
  id: string;
  time: string;
  text: string;
  type: 'dictation' | 'ask';
}

interface HistoryGroup {
  label: string;
  entries: HistoryEntry[];
}

const HistoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'dictations' | 'ask'>('all');
  const [retentionValue] = useState('Forever');
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState<HistoryGroup[]>([]);

  const loadHistory = useCallback(async () => {
    try {
      const result = await window.electronAPI.historyList(0, 100);
      console.log('[DEBUG][HistoryPage] Received', result.data.length, 'records (total:', result.total, ')');
      console.log('[DEBUG][HistoryPage] Raw data:', JSON.stringify(result.data.map(r => ({ id: r.id, created_at: r.created_at, text: (r.optimized_text || r.original_text).substring(0, 60) }))));
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const todayEntries: HistoryEntry[] = [];
      const yesterdayEntries: HistoryEntry[] = [];
      const earlierEntries: HistoryEntry[] = [];

      for (const record of result.data) {
        const date = new Date(record.created_at);
        const entry: HistoryEntry = {
          id: record.id,
          time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          text: record.optimized_text || record.original_text,
          type: 'dictation',
        };

        if (date.toDateString() === today.toDateString()) {
          todayEntries.push(entry);
        } else if (date.toDateString() === yesterday.toDateString()) {
          yesterdayEntries.push(entry);
        } else {
          earlierEntries.push(entry);
        }
      }

      const grouped: HistoryGroup[] = [];
      if (todayEntries.length > 0) grouped.push({ label: 'Today', entries: todayEntries });
      if (yesterdayEntries.length > 0) grouped.push({ label: 'Yesterday', entries: yesterdayEntries });
      if (earlierEntries.length > 0) grouped.push({ label: 'Earlier', entries: earlierEntries });

      setGroups(grouped);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
    // Re-fetch when a new transcription is saved
    const dispose = window.electronAPI.onHistoryUpdated(loadHistory);
    return dispose;
  }, [loadHistory]);

  const filteredGroups = groups.map((group) => ({
    ...group,
    entries: group.entries.filter((entry) => {
      if (activeTab === 'all') return true;
      if (activeTab === 'dictations') return entry.type === 'dictation';
      if (activeTab === 'ask') return entry.type === 'ask';
      return true;
    }),
  })).filter((group) => group.entries.length > 0);

  return (
    <div className="flex flex-1 flex-col gap-[40px] p-[48px]">
      {/* Header */}
      <div className="flex w-full items-center">
        <h1 className="font-heading text-[32px] font-normal text-[var(--text-primary)]">
          History
        </h1>
        <div className="flex-1" />
        <span className="text-[24px] font-sans text-[var(--text-primary)] cursor-pointer">
          &#x22EF;
        </span>
      </div>

      {/* Settings Section */}
      <div className="flex w-full flex-col gap-[12px]">
        {/* Keep History Setting */}
        <div className="flex w-full gap-[12px] rounded-[12px] bg-[var(--bg-settings)] p-[16px]">
          <div className="flex flex-1 flex-col gap-[8px]">
            <div className="flex items-center gap-[8px]">
              <span className="text-[16px]">📦</span>
              <span className="text-[15px] font-sans text-[var(--text-primary)]">
                Keep history
              </span>
            </div>
            <p className="text-[14px] font-sans leading-[1.5] text-[var(--text-tertiary)]">
              How long do you want to keep your dictation history on your device?
            </p>
          </div>
          <div className="flex h-[40px] items-center gap-[8px] rounded-[10px] bg-[var(--bg-white)] p-[12px]">
            <span className="text-[14px] font-sans text-[var(--text-primary)]">
              {retentionValue}
            </span>
            <span className="text-[10px] font-sans text-[var(--text-tertiary)]">
              &#x25BC;
            </span>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="flex w-full flex-col gap-[8px] rounded-[12px] bg-[var(--bg-settings)] p-[16px]">
          <div className="flex items-center gap-[8px]">
            <span className="text-[16px]">🔒</span>
            <span className="text-[15px] font-sans text-[var(--text-primary)]">
              Your data stays private
            </span>
          </div>
          <p className="text-[14px] font-sans leading-[1.5] text-[var(--text-tertiary)]">
            Your voice dictations are private with zero data retention. They are stored only on your device and cannot be accessed from anywhere else.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-[8px]">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center justify-center rounded-full px-[10px] py-[10px] text-[13px] font-sans transition-colors ${
            activeTab === 'all'
              ? 'bg-[var(--text-primary)] text-white'
              : 'bg-[var(--border-light)] text-[var(--text-primary)]'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('dictations')}
          className={`flex items-center justify-center rounded-full px-[10px] py-[10px] text-[13px] font-sans transition-colors ${
            activeTab === 'dictations'
              ? 'bg-[var(--text-primary)] text-white'
              : 'bg-[var(--border-light)] text-[var(--text-primary)]'
          }`}
        >
          Dictations
        </button>
        <button
          onClick={() => setActiveTab('ask')}
          className={`flex items-center justify-center rounded-full px-[10px] py-[10px] text-[13px] font-sans transition-colors ${
            activeTab === 'ask'
              ? 'bg-[var(--text-primary)] text-white'
              : 'bg-[var(--border-light)] text-[var(--text-primary)]'
          }`}
        >
          Ask anything
        </button>
      </div>

      {/* History List */}
      <div className="flex w-full flex-col gap-[20px]">
        {isLoading ? (
          <span className="text-[14px] font-sans text-[var(--text-tertiary)]">Loading...</span>
        ) : filteredGroups.length === 0 ? (
          <span className="text-[14px] font-sans text-[var(--text-tertiary)]">
            No dictation history yet. Press the hotkey to start your first transcription.
          </span>
        ) : (
          filteredGroups.map((group) => (
            <React.Fragment key={group.label}>
              <span className="text-[13px] font-sans text-[var(--text-tertiary)]">
                {group.label}
              </span>
              {group.entries.map((entry) => (
                <div key={entry.id} className="flex w-full gap-[16px]">
                  <span className="font-mono text-[12px] text-[var(--text-tertiary)] shrink-0">
                    {entry.time}
                  </span>
                  <p className="text-[14px] font-sans leading-[1.6] text-[var(--text-primary)]">
                    {entry.text}
                  </p>
                </div>
              ))}
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
