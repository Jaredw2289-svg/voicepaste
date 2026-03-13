import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import util from 'util';

export type LoggerLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

const LEVELS: LoggerLevel[] = ['log', 'info', 'warn', 'error', 'debug'];

let initialized = false;
let logFilePath = '';
let logStream: fs.WriteStream | null = null;
let isWriting = false;

const originalConsole: Record<LoggerLevel, (...args: unknown[]) => void> = {
  log: console.log.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
  debug: console.debug.bind(console),
};

function stringifyArg(arg: unknown): string {
  if (typeof arg === 'string') {
    return arg;
  }

  if (arg instanceof Error) {
    return arg.stack || `${arg.name}: ${arg.message}`;
  }

  return util.inspect(arg, {
    depth: 5,
    breakLength: 120,
    maxArrayLength: 50,
    maxStringLength: 10_000,
  });
}

function formatLine(level: LoggerLevel, scope: string, args: unknown[]): string {
  const message = args.map(stringifyArg).join(' ');
  return `${new Date().toISOString()} [pid:${process.pid}] [${scope}] [${level.toUpperCase()}] ${message}\n`;
}

function writeRawLine(line: string): void {
  if (!logFilePath || isWriting) {
    return;
  }

  try {
    isWriting = true;
    if (logStream) {
      logStream.write(line);
      return;
    }

    fs.appendFileSync(logFilePath, line, 'utf8');
  } catch (error) {
    originalConsole.error('[Logger] Failed to write log line:', error);
  } finally {
    isWriting = false;
  }
}

function resolveLogFilePath(): string {
  try {
    app.setAppLogsPath();
    return path.join(app.getPath('logs'), 'runtime.log');
  } catch {
    const fallbackDir = path.join(app.getPath('userData'), 'logs');
    fs.mkdirSync(fallbackDir, { recursive: true });
    return path.join(fallbackDir, 'runtime.log');
  }
}

function patchConsole(): void {
  for (const level of LEVELS) {
    console[level] = (...args: unknown[]) => {
      originalConsole[level](...args);
      writeRawLine(formatLine(level, 'main', args));
    };
  }
}

export function logMessage(level: LoggerLevel, scope: string, ...args: unknown[]): void {
  writeRawLine(formatLine(level, scope, args));
}

export function logDiagnostic(scope: string, label: string, data: unknown): void {
  logMessage('info', scope, `${label}: ${stringifyArg(data)}`);
}

export function initializeAppLogging(): string {
  if (initialized) {
    return logFilePath;
  }

  logFilePath = resolveLogFilePath();
  fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
  logStream = fs.createWriteStream(logFilePath, {
    flags: 'a',
    encoding: 'utf8',
  });
  logStream.on('error', (error) => {
    originalConsole.error('[Logger] Stream error:', error);
  });

  patchConsole();

  process.on('uncaughtException', (error) => {
    writeRawLine(formatLine('error', 'process', ['Uncaught exception', error]));
  });

  process.on('unhandledRejection', (reason) => {
    writeRawLine(formatLine('error', 'process', ['Unhandled rejection', reason]));
  });

  initialized = true;
  logMessage('info', 'logger', `Runtime logging initialized at ${logFilePath}`);
  return logFilePath;
}

export function getAppLogFilePath(): string {
  if (!initialized) {
    return initializeAppLogging();
  }

  return logFilePath;
}
