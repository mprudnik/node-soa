import { BaseLogger } from 'pino';

export type Logger = Pick<BaseLogger, 'silent' | 'trace' | 'level' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'>;
export type Options = { env: string };
export function init(options: Options): Logger;
