import type { Logger, Options as LoggerOptions } from './logger';
import type { DB, Options as DBOptions } from './db';

export type InfrastructureServices = { logger: Logger, db: DB };
export type InfrastructureOptions = { db: DBOptions, logger: LoggerOptions }

export function init(options: InfrastructureOptions): InfrastructureServices;
export function teardown(deps: InfrastructureServices): Promise<void>;