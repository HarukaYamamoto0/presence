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

export interface Logger {
	debug: (msg: string, ...args: any[]) => void;
	info: (msg: string, ...args: any[]) => void;
	warn: (msg: string, ...args: any[]) => void;
	error: (msg: string, ...args: any[]) => void;
	trace?: (msg: string, ...args: any[]) => void;
}

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
