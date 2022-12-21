import type { PrismaClient, Prisma } from '@prisma/client';
import type { Logger } from './logger';

export type DB = PrismaClient;
export type Options = Prisma.PrismaClientOptions;
export function init(deps: { logger: Logger }, options: Options): Promise<DB>;
export function teardown(deps: { db: DB, logger: Logger }): Promise<void>;