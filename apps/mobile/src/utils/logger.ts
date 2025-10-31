export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type ConsoleMethod = (message?: string, ...optionalParams: unknown[]) => void;

type LogFn = (message: string, meta?: unknown) => void;

const consoleMethods: Record<LogLevel, ConsoleMethod> = {
  // eslint-disable-next-line no-console
  debug: console.debug.bind(console),
  // eslint-disable-next-line no-console
  info: console.info.bind(console),
  // eslint-disable-next-line no-console
  warn: console.warn.bind(console),
  // eslint-disable-next-line no-console
  error: console.error.bind(console),
};

const make = (level: LogLevel): LogFn => (message, meta) => {
  // eslint-disable-next-line no-console
  consoleMethods[level](`[${level.toUpperCase()}] ${message}`, meta ?? '');
};

export const log = {
  debug: make('debug'),
  info: make('info'),
  warn: make('warn'),
  error: make('error'),
} as const;
