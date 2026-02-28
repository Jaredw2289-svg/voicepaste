import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';

function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return `${Math.round(totalSeconds)} sec`;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours} hr ${minutes} min`;
  return `${minutes} min`;
}

function formatWordCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return String(count);
}

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({ totalWords: 0, totalCount: 0, totalDurationSeconds: 0 });

  useEffect(() => {
    const fetchStats = () => {
      window.electronAPI.statsGet().then((s) => {
        console.log('[DEBUG][DashboardPage] Stats received:', JSON.stringify(s));
        setStats(s);
      }).catch(console.error);
    };
    fetchStats();
    // Re-fetch when a new transcription is saved
    const dispose = window.electronAPI.onHistoryUpdated(fetchStats);
    return dispose;
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-[32px] p-[48px]">
      {/* Header */}
      <div className="flex w-full flex-col gap-[8px]">
        <h1 className="font-heading text-[32px] font-normal tracking-[-0.5px] text-[var(--text-primary)]">
          Speak naturally, write perfectly – in any app
        </h1>
        <div className="flex items-center gap-[6px]">
          <span className="text-[14px] font-sans text-[var(--text-tertiary)]">Press</span>
          <span className="inline-flex items-center rounded-[6px] bg-[var(--border-light)] p-[4px]">
            <span className="font-mono text-[13px] text-[var(--text-primary)]">`</span>
          </span>
          <span className="text-[14px] font-sans text-[var(--text-tertiary)]">
            to start and stop dictation. Or hold to say something short.
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="flex w-full gap-[16px]">
        <StatCard
          icon="🎤"
          value={String(stats.totalCount)}
          label="Transcriptions"
          accentColor="var(--accent-orange)"
        />
        <StatCard
          icon="⏱"
          value={formatDuration(stats.totalDurationSeconds)}
          label="Total dictation time"
          accentColor="var(--accent-blue)"
        />
        <StatCard
          icon="✍️"
          value={formatWordCount(stats.totalWords)}
          label="Words dictated"
          accentColor="var(--accent-brown)"
        />
      </div>

      {/* Referral & Affiliate Cards */}
      <div className="flex w-full gap-[16px]">
        {/* Refer Card */}
        <div className="flex flex-1 items-center gap-[20px] rounded-[14px] bg-[var(--bg-refer)] p-[24px]">
          <div className="flex flex-col h-[100px] w-[100px] shrink-0 items-center justify-center rounded-[20px] bg-[rgba(106,155,204,0.12)]">
            <svg width="44" height="44" viewBox="0 0 256 256" fill="var(--accent-blue)">
              <path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z"/>
            </svg>
          </div>
          <div className="flex flex-1 flex-col gap-[12px]">
            <h3 className="font-heading text-[20px] font-normal text-[var(--text-primary)]">
              Refer friends
            </h3>
            <p className="text-[14px] font-sans leading-[1.5] text-[var(--text-primary)]">
              Spread the word and help others discover VoicePaste.
            </p>
            <button className="flex h-[40px] w-[140px] items-center justify-center rounded-[8px] bg-[var(--accent-blue)] text-[13px] font-sans text-white">
              Invite friends
            </button>
          </div>
        </div>

        {/* Affiliate Card */}
        <div className="flex flex-1 items-center gap-[20px] rounded-[14px] bg-[var(--bg-affiliate)] p-[24px]">
          <div className="flex flex-col h-[100px] w-[100px] shrink-0 items-center justify-center rounded-[20px] bg-[rgba(217,119,87,0.12)]">
            <svg width="44" height="44" viewBox="0 0 256 256" fill="var(--accent-orange)">
              <path d="M184,89.57V84c0-25.08-37.83-44-88-44S8,58.92,8,84v40c0,20.89,26.25,37.49,64,42.46V172c0,25.08,37.83,44,88,44s88-18.92,88-44V132C248,111.3,222.58,94.68,184,89.57ZM232,132c0,13.22-30.79,28-72,28-3.73,0-7.43-.13-11.08-.37C170.49,151.77,184,139.19,184,124V103.57C213.87,108.49,232,119.77,232,132ZM96,58c41.21,0,72,14.78,72,28s-30.79,28-72,28S24,99.22,24,86,54.79,58,96,58ZM24,124V109.22c15.76,13,39.89,20.87,66,22.51A37.47,37.47,0,0,0,88,136v12.49C56.59,144.57,24,131.88,24,124Zm80,48v-7.63c0-.74,0-1.47-.06-2.2,1.35,0,2.7.07,4.06.07,3.73,0,7.43-.13,11.08-.37A37.47,37.47,0,0,0,112,172v9.49C105.19,179.2,97.93,175.93,104,172Zm56,28c-41.21,0-72-14.78-72-28v-8.78c15.76,13,39.89,20.87,66,22.51,8.53.54,17.33.54,25.87,0,26.11-1.64,50.24-9.54,66-22.51V172C248,185.22,217.21,200,160,200Z"/>
            </svg>
          </div>
          <div className="flex flex-1 flex-col gap-[12px]">
            <h3 className="font-heading text-[20px] font-normal text-[var(--text-primary)]">
              Affiliate program
            </h3>
            <p className="text-[14px] font-sans leading-[1.5] text-[var(--text-primary)]">
              Earn 25% recurring commission for sharing VoicePaste.
            </p>
            <button className="flex h-[40px] w-[120px] items-center justify-center rounded-[8px] bg-[var(--accent-orange)] text-[13px] font-sans text-white">
              Join now
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="flex w-full flex-col gap-[16px]">
        <h3 className="font-heading text-[20px] font-normal text-[var(--text-primary)]">
          Give feedback
        </h3>
        <div className="flex w-full gap-[12px]">
          <div className="flex flex-1 h-[46px] items-center rounded-[10px] bg-[var(--bg-white)] p-[16px]">
            <span className="text-[14px] font-sans text-[var(--text-tertiary)]">
              How can VoicePaste be improved? Tip: You can speak your feedback to save time.
            </span>
          </div>
          <button className="flex h-[46px] w-[160px] items-center justify-center rounded-[10px] bg-[var(--bg-card)] text-[14px] font-sans text-[var(--text-primary)]">
            Send feedback
          </button>
        </div>
      </div>

      {/* Footer Spacer */}
      <div className="flex-1" />

      {/* Footer */}
      <div className="flex items-center gap-[8px]">
        <span className="text-[12px] font-sans text-[var(--text-tertiary)]">
          Version v1.0.2
        </span>
        <span className="text-[12px] font-sans text-[var(--accent-orange)] cursor-pointer">
          Check for updates
        </span>
      </div>
    </div>
  );
};

export default DashboardPage;
