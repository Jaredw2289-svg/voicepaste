import type { RendererLogLevel } from '../../shared/types';

const LEVELS: RendererLogLevel[] = ['log', 'info', 'warn', 'error', 'debug'];

function stringifyArg(arg: unknown): string {
  if (typeof arg === 'string') {
    return arg;
  }

  if (arg instanceof Error) {
    return arg.stack || `${arg.name}: ${arg.message}`;
  }

  try {
    return JSON.stringify(arg);
  } catch {
    return String(arg);
  }
}

function sendRendererLog(source: string, level: RendererLogLevel, args: unknown[]): void {
  try {
    const message = args.map(stringifyArg).join(' ');
    window.electronAPI?.rendererLog(message, level, source);
  } catch {
    // Ignore logging transport failures inside the renderer.
  }
}

export function installRendererLogging(source: string): void {
  const marker = `__voicepaste_logger_installed__${source}`;
  const taggedWindow = window as unknown as Record<string, unknown>;
  if (taggedWindow[marker]) {
    return;
  }
  taggedWindow[marker] = true;

  const originalConsole: Record<RendererLogLevel, (...args: unknown[]) => void> = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    debug: console.debug.bind(console),
  };

  for (const level of LEVELS) {
    console[level] = (...args: unknown[]) => {
      originalConsole[level](...args);
      sendRendererLog(source, level, args);
    };
  }

  window.addEventListener('error', (event) => {
    sendRendererLog(source, 'error', [
      'Window error',
      event.message,
      event.filename,
      `line=${event.lineno}`,
      `col=${event.colno}`,
      event.error instanceof Error ? event.error : '',
    ]);
  });

  window.addEventListener('unhandledrejection', (event) => {
    sendRendererLog(source, 'error', ['Unhandled rejection', event.reason]);
  });

  sendRendererLog(source, 'info', ['Renderer logging installed']);
}
