type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isLogLevel = (v: unknown): v is LogLevel =>
  v === 'debug' || v === 'info' || v === 'warn' || v === 'error';

const LEVEL_ENV = process.env.LOG_LEVEL;
const LEVEL: LogLevel = isLogLevel(LEVEL_ENV) ? LEVEL_ENV : 'info';

export function info(...args: unknown[]) {
  if (LEVEL === 'info' || LEVEL === 'debug') console.info('[INFO]', ...args);
}

export function debug(...args: unknown[]) {
  if (LEVEL === 'debug') console.debug('[DEBUG]', ...args);
}

export function warn(...args: unknown[]) {
  if (LEVEL === 'warn' || LEVEL === 'info' || LEVEL === 'debug') console.warn('[WARN]', ...args);
}

export function error(...args: unknown[]) {
  console.error('[ERROR]', ...args);
}

const logger = { info, debug, warn, error };

export default logger;
