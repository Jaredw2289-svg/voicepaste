import { clipboard } from 'electron';
import { execFile } from 'node:child_process';

const MIN_INJECT_INTERVAL_MS = 500;
const DEDUP_WINDOW_MS = 5000;

export class TextInjector {
  private lastInjectTime = 0;
  private isInjecting = false;
  private lastInjectedText = '';
  private lastInjectedAt = 0;

  async inject(text: string): Promise<void> {
    const now = Date.now();

    // Guard 1: concurrent / rapid-fire
    if (this.isInjecting || now - this.lastInjectTime < MIN_INJECT_INTERVAL_MS) {
      console.log(`[TextInjector] Skipping — guard:interval (isInjecting=${this.isInjecting}, interval=${now - this.lastInjectTime}ms)`);
      return;
    }

    // Guard 2: same content within dedup window
    if (text === this.lastInjectedText && now - this.lastInjectedAt < DEDUP_WINDOW_MS) {
      console.log(`[TextInjector] Skipping — guard:dedup (same text ${now - this.lastInjectedAt}ms ago)`);
      return;
    }

    this.isInjecting = true;
    this.lastInjectTime = now;
    console.log(`[TextInjector] Injecting: "${text.slice(0, 40)}…"`);

    // Save previous clipboard content to restore after paste
    const previousClipboard = clipboard.readText();

    clipboard.writeText(text);

    try {
      await this.simulatePaste();
      this.lastInjectedText = text;
      this.lastInjectedAt = Date.now();
      // Restore previous clipboard content after paste completes
      setTimeout(() => {
        clipboard.writeText(previousClipboard);
      }, 500);
    } catch (error) {
      console.error('[TextInjector] Paste failed:', error);
      // Still restore clipboard on failure
      clipboard.writeText(previousClipboard);
    } finally {
      this.isInjecting = false;
    }
  }

  private simulatePaste(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (process.platform === 'darwin') {
        setTimeout(() => {
          execFile(
            'osascript',
            ['-e', 'tell application "System Events" to keystroke "v" using command down'],
            (error) => {
              if (error) {
                console.error('[TextInjector] osascript error:', error.message);
                reject(error);
              } else {
                resolve();
              }
            }
          );
        }, 50);
      } else {
        resolve();
      }
    });
  }
}
