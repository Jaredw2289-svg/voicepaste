import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAppStore } from '../stores/app-store';
import { PcmAudioRecorder } from '../services/pcm-audio-recorder';
import { soundEffects } from '../services/sound-effects';
import { WaveformAnimation } from './WaveformAnimation';
import { OVERLAY_WIDTH } from '../../shared/constants';

const pcmRecorder = new PcmAudioRecorder();

// Forward renderer logs to main process (visible in terminal)
function rlog(msg: string) {
  console.log(msg);
  try { window.electronAPI.rendererLog(msg); } catch { /* preload not ready */ }
}

const MAX_RECORDING_MS = 10 * 60 * 1000;
const HARD_KILL_MS = 15 * 60 * 1000;

// Pill height (fixed)
const PILL_HEIGHT = 34;
// Transcript card padding + max text area
const TRANSCRIPT_PADDING = 24; // 12px top + 12px bottom
const TRANSCRIPT_MAX_TEXT_HEIGHT = 200;

export const Overlay: React.FC = () => {
  const { status, setStatus, error, setError } = useAppStore();
  const [volumeWarning, setVolumeWarning] = useState<'none' | 'silence'>('none');
  const [transcriptLines, setTranscriptLines] = useState<string[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const autoStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hardKillTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCancellingRef = useRef<boolean>(false);
  const isStoppingRef = useRef<boolean>(false);
  const isStartingRef = useRef<boolean>(false);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const transcriptCardRef = useRef<HTMLDivElement | null>(null);

  // Store handlers in refs so we can access latest version without re-registering listeners.
  const handleStartRecordingRef = useRef<typeof handleStartRecording | undefined>(undefined);
  const handleStopRecordingRef = useRef<typeof handleStopRecording | undefined>(undefined);
  const handleCancelRecordingRef = useRef<typeof handleCancelRecording | undefined>(undefined);
  const setStatusRef = useRef<typeof setStatus | undefined>(undefined);
  const setErrorRef = useRef<typeof setError | undefined>(undefined);

  const clearRecordingTimers = useCallback(() => {
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
    if (hardKillTimerRef.current) {
      clearTimeout(hardKillTimerRef.current);
      hardKillTimerRef.current = null;
    }
  }, []);

  // Request overlay resize when transcript content changes
  const requestOverlayResize = useCallback((lines: string[]) => {
    if (lines.length === 0) {
      // No transcript, just pill
      window.electronAPI.realtimeResize(OVERLAY_WIDTH, PILL_HEIGHT + 24);
      return;
    }
    // Measure the actual transcript card height after next render
    requestAnimationFrame(() => {
      const cardEl = transcriptCardRef.current;
      if (cardEl) {
        const cardHeight = cardEl.scrollHeight;
        const totalHeight = Math.min(
          cardHeight + PILL_HEIGHT + 8, // 8px gap between card and pill
          TRANSCRIPT_MAX_TEXT_HEIGHT + TRANSCRIPT_PADDING + PILL_HEIGHT + 8
        );
        window.electronAPI.realtimeResize(OVERLAY_WIDTH, totalHeight + 24);
      }
    });
  }, []);

  const handleCancelRecording = useCallback(async () => {
    rlog(`[Cancel] Cancelling recording...`);
    isCancellingRef.current = true;
    clearRecordingTimers();

    try {
      pcmRecorder.stop();
      analyserRef.current = null;
      setTranscriptLines([]);
      soundEffects.error();
      setStatus('idle');

      window.electronAPI.cancelRecording();
      console.log('[Cancel] Recording cancelled successfully');
    } catch (err) {
      console.error('[Cancel] Failed to cancel recording:', err);
      setStatus('idle');
      window.electronAPI.cancelRecording();
    } finally {
      setTimeout(() => {
        isCancellingRef.current = false;
      }, 100);
    }
  }, [setStatus, clearRecordingTimers]);

  const handleStopRecording = useCallback(async () => {
    if (isCancellingRef.current) {
      console.log('[Stop] Skipping normal stop - recording was cancelled');
      return;
    }

    if (isStoppingRef.current) {
      console.log('[Stop] Already stopping - ignoring duplicate call');
      return;
    }
    isStoppingRef.current = true;

    rlog(`[Stop] Stopping realtime recording`);

    clearRecordingTimers();

    try {
      pcmRecorder.stop();
      analyserRef.current = null;
      soundEffects.recordingStop();
      setStatus('transcribing');

      rlog('[Stop] Sending realtimeStop to main process');
      window.electronAPI.realtimeStop();
    } catch (err) {
      console.error('Failed to stop realtime recording:', err);
      setError('Recording failed');
    } finally {
      // Delay clearing so main process can finish stop before a new start fires
      setTimeout(() => { isStoppingRef.current = false; }, 300);
    }
  }, [setStatus, setError, clearRecordingTimers]);

  const handleStartRecording = useCallback(async () => {
    if (isStartingRef.current || isStoppingRef.current) {
      console.log(`[Start] Blocked — isStarting=${isStartingRef.current}, isStopping=${isStoppingRef.current}`);
      return;
    }
    isStartingRef.current = true;
    isCancellingRef.current = false;
    setTranscriptLines([]);
    setStatus('recording'); // Show "Listening..." immediately, prevent stale state flash

    try {
      const settings = await window.electronAPI.getSettings();
      const deviceId = settings.audioInputDeviceId || undefined;

      rlog(`[Start] deviceId="${settings.audioInputDeviceId || '(default)'}"`);

      // Start PCM recorder + connect WebSocket in parallel
      rlog('[Start] Launching realtimeStart + mic init in parallel');
      const realtimePromise = window.electronAPI.realtimeStart();

      // Pre-warm microphone while token is being fetched
      let micReady = false;
      try {
        await pcmRecorder.start(deviceId);
        micReady = true;
        rlog('[Start] pcmRecorder.start() succeeded');
      } catch (err) {
        if (deviceId && err instanceof DOMException &&
            (err.name === 'OverconstrainedError' || err.name === 'NotFoundError')) {
          rlog(`[Start] Device "${deviceId}" unavailable, trying default mic`);
          try {
            await pcmRecorder.start();
            micReady = true;
            rlog('[Start] Default mic fallback succeeded');
          } catch (fallbackErr) {
            rlog(`[Start] Default mic also failed: ${fallbackErr}`);
          }
        } else {
          rlog(`[Start] pcmRecorder.start() FAILED: ${err}`);
        }
      }

      const result = await realtimePromise;
      rlog(`[Start] realtimeStart result: success=${result.success}, micReady=${micReady}${result.error ? ', error=' + result.error : ''}`);

      // Check if user stopped/cancelled while we were connecting
      if (isStoppingRef.current || isCancellingRef.current) {
        rlog('[Start] Stop/cancel requested during connect — aborting');
        if (micReady) pcmRecorder.stop();
        if (result.success) {
          window.electronAPI.realtimeStop();
        }
        return;
      }

      if (!result.success || !micReady) {
        if (micReady) pcmRecorder.stop();
        setError(result.error || 'Failed to connect');
        setStatus('error');
        return;
      }

      // Wire PCM chunks to main process
      let chunkCount = 0;
      pcmRecorder.onChunk((pcm16) => {
        chunkCount++;
        if (chunkCount <= 3 || chunkCount % 50 === 0) {
          rlog(`[Realtime] Audio chunk #${chunkCount} (${pcm16.byteLength} bytes)`);
        }
        window.electronAPI.realtimeSendAudio(pcm16);
      });

      rlog('[Start] REALTIME READY — pcm chunks wired, recording active');
      analyserRef.current = pcmRecorder.getAnalyser();
      soundEffects.recordingStart();
      setStatus('recording');

      // Timers
      autoStopTimerRef.current = setTimeout(() => {
        console.log('[Timer] Auto-stopping recording after 10 minutes');
        handleStopRecording();
      }, MAX_RECORDING_MS);

      hardKillTimerRef.current = setTimeout(() => {
        console.log('[Timer] Hard kill recording after 15 minutes');
        pcmRecorder.stop();
        analyserRef.current = null;
        soundEffects.error();
        setError('Recording killed: exceeded 15 min limit');
      }, HARD_KILL_MS);
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to access microphone');
    } finally {
      isStartingRef.current = false;
    }
  }, [setStatus, setError, handleStopRecording, clearRecordingTimers]);

  // Update refs when handlers change
  useEffect(() => {
    handleStartRecordingRef.current = handleStartRecording;
    handleStopRecordingRef.current = handleStopRecording;
    handleCancelRecordingRef.current = handleCancelRecording;
    setStatusRef.current = setStatus;
    setErrorRef.current = setError;
  }, [handleStartRecording, handleStopRecording, handleCancelRecording, setStatus, setError]);

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && status === 'recording') {
        e.preventDefault();
        e.stopPropagation();
        handleCancelRecording();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, handleCancelRecording]);

  // Silence detection: poll RMS level while recording
  useEffect(() => {
    if (status !== 'recording') {
      setVolumeWarning('none');
      return;
    }

    let silenceSince: number | null = null;
    const RMS_THRESHOLD = 0.02;
    const SILENCE_DELAY_MS = 3000;

    const interval = setInterval(() => {
      const rms = pcmRecorder.getRmsLevel();
      if (rms < RMS_THRESHOLD) {
        if (silenceSince === null) silenceSince = Date.now();
        if (Date.now() - silenceSince >= SILENCE_DELAY_MS) {
          setVolumeWarning('silence');
        }
      } else {
        silenceSince = null;
        setVolumeWarning('none');
      }
    }, 150);

    return () => clearInterval(interval);
  }, [status]);

  // Auto-scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    requestOverlayResize(transcriptLines);
  }, [transcriptLines, requestOverlayResize]);

  // Register IPC listeners ONCE on mount
  useEffect(() => {
    const disposers = [
      window.electronAPI.onRecordingStart(() => {
        handleStartRecordingRef.current?.();
      }),
      window.electronAPI.onRecordingStop(() => {
        handleStopRecordingRef.current?.();
      }),
      window.electronAPI.onRecordingCancel(() => {
        console.log('[Overlay] Cancel signal received from main (ESC)');
        handleCancelRecordingRef.current?.();
      }),
      window.electronAPI.onStatusUpdate((newStatus) => {
        setStatusRef.current?.(newStatus);
        if (newStatus === 'idle') {
          setTranscriptLines([]);
        }
      }),
      window.electronAPI.onTranscriptionResult((text) => {
        console.log('Transcription result:', text);
      }),
      window.electronAPI.onTranscriptionError((errorMsg) => {
        soundEffects.error();
        setErrorRef.current?.(errorMsg);
      }),
      // Realtime utterance: append to transcript lines
      window.electronAPI.onRealtimeUtterance((text) => {
        rlog(`[Utterance] "${text}"`);
        setTranscriptLines((prev) => [...prev, text]);
      }),
      window.electronAPI.onRealtimeError((errorMsg) => {
        console.error('[Overlay] Realtime error:', errorMsg);
        soundEffects.error();
        setErrorRef.current?.(errorMsg);
      }),
    ];

    return () => disposers.forEach((dispose) => dispose());
  }, []);

  // Don't render anything when idle
  if (status === 'idle') {
    return <div className="overlay-container" />;
  }

  const fullTranscript = transcriptLines.join(' ');
  const hasTranscript = fullTranscript.length > 0;

  return (
    <div className="overlay-container">
      <div className="overlay-wrapper">
        {/* Transcript card (above pill, only when recording with text) */}
        {hasTranscript && status === 'recording' && (
          <div className="transcript-card" ref={transcriptCardRef}>
            <div className="transcript-text">
              {fullTranscript}
              <span className="typing-cursor" />
            </div>
            <div ref={transcriptEndRef} />
          </div>
        )}

        {/* The floating pill */}
        <div className="overlay-pill">
          <div className={`pill-layer ${status === 'recording' ? 'pill-layer--active' : ''}`}>
            <WaveformAnimation
              analyser={status === 'recording' ? analyserRef.current : null}
              isActive={status === 'recording'}
            />
            <span className={`overlay-text${volumeWarning === 'silence' ? ' overlay-warning' : ''}`}>
              {volumeWarning === 'silence' ? 'No voice detected' : 'Listening...'}
            </span>
            <button
              className="cancel-button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCancelRecording();
              }}
              title="Cancel (ESC)"
            >
              ✕
            </button>
          </div>

          <div className={`pill-layer ${status === 'transcribing' ? 'pill-layer--active' : ''}`}>
            <span className="overlay-text">Polishing...</span>
          </div>

          <div className={`pill-layer ${status === 'done' ? 'pill-layer--active' : ''}`}>
            <span className="overlay-text overlay-done">Done ✓</span>
          </div>

          <div className={`pill-layer ${status === 'error' ? 'pill-layer--active' : ''}`}>
            <span className="overlay-text overlay-error">{error || 'Error'}</span>
          </div>

          {status === 'transcribing' && <div className="transcribe-sweep" />}
        </div>
      </div>
    </div>
  );
};
