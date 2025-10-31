export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type ConsoleMethod = (message?: string, ...optionalParams: unknown[]) => void;

type LogFn = (message: string, meta?: unknown) => void;

const consoleMethods: Record<LogLevel, ConsoleMethod> = {
  debug: console.debug.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
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
