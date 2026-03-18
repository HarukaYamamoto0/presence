import pino, { Logger as PinoLogger } from 'pino';

/**
 * Log levels available for the client.
 */
export enum LogLevel {
	Fatal = 'fatal',
	Error = 'error',
	Warn = 'warn',
	Info = 'info',
	Debug = 'debug',
	Trace = 'trace',
	Silent = 'silent',
}

/**
 * Logger interface for the client.
 */
export interface Logger {
	/** Log a message at the debug level. */
	debug: (msg: string, ...args: any[]) => void;
	/** Log a message at the info level. */
	info: (msg: string, ...args: any[]) => void;
	/** Log a message at the warn level. */
	warn: (msg: string, ...args: any[]) => void;
	/** Log a message at the error level. */
	error: (msg: string, ...args: any[]) => void;
	/** Log a message at the trace level (optional). */
	trace?: (msg: string, ...args: any[]) => void;
}

/**
 * Creates a default logger instance using Pino.
 * @param level The log level to use.
 * @returns A Pino logger instance.
 */
export function createDefaultLogger(level: LogLevel = LogLevel.Info): PinoLogger {
	return pino({
		level,
		transport: {
			target: 'pino-pretty',
			options: {
				colorize: true,
				ignore: 'pid,hostname',
				translateTime: 'HH:MM:ss Z',
			},
		},
	});
}
