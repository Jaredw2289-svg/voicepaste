import { spawn } from 'node:child_process';
import type { CursorContext } from '../shared/types';

const TIMEOUT_MS = 500;
const MAX_SELECTED_TEXT = 1000;

const JXA_SCRIPT = `
const se = Application("System Events");
const frontApp = se.processes.whose({frontmost: true})[0];
const appName = frontApp.name();
let winTitle = "";
let selText = "";
let elemRole = "";
try { winTitle = frontApp.windows[0].name(); } catch(e) {}
try {
  const focused = frontApp.attributes["AXFocusedUIElement"].value();
  try { selText = focused.attributes["AXSelectedText"].value(); } catch(e) {}
  try { elemRole = focused.attributes["AXRole"].value(); } catch(e) {}
} catch(e) {}
appName + "|||" + winTitle + "|||" + selText + "|||" + elemRole;
`;

export function captureCursorContext(): Promise<CursorContext | null> {
  if (process.platform !== 'darwin') {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let settled = false;

    const done = (result: CursorContext | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(result);
    };

    const timer = setTimeout(() => {
      console.warn('[ContextCapture] Timed out');
      child.kill();
      done(null);
    }, TIMEOUT_MS);

    const child = spawn('osascript', ['-l', 'JavaScript', '-']);

    child.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
    child.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });

    child.on('error', (err) => {
      console.warn('[ContextCapture] spawn error:', err.message);
      done(null);
    });

    child.on('close', (code) => {
      if (code !== 0) {
        console.warn('[ContextCapture] JXA error (exit', code + '):', stderr.trim());
        done(null);
        return;
      }

      const parts = stdout.trim().split('|||');
      const context: CursorContext = {
        appName: parts[0] ?? '',
        windowTitle: parts[1] ?? '',
        selectedText: (parts[2] ?? '').slice(0, MAX_SELECTED_TEXT),
        elementRole: parts[3] ?? '',
      };
      console.log(`[ContextCapture] app=${context.appName}, window="${context.windowTitle.slice(0, 80)}", selectedText=${context.selectedText.length} chars, role=${context.elementRole}`);
      done(context);
    });

    child.stdin.write(JXA_SCRIPT);
    child.stdin.end();
  });
}
