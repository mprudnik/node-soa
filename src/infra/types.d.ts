import type { PrismaClient, Prisma } from '@prisma/client';
import { BaseLogger } from 'pino';

interface EventHandler {
  (event: object): any;
}

export type Logger = Pick<BaseLogger, 'silent' | 'trace' | 'level' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'>;
export type DB = PrismaClient;
export interface Bus {
  command(commandName: string, payload: object): Promise<object>;
  registerService(name: string, service: object): void;

  subscribe(eventName: string, handler: EventHandler): boolean;
  publish(eventName: string, event: object): boolean;
}
export type Infra = {
  bus: Bus;
  logger: Logger;
  db: DB;
};

export type LoggerConfig = { env: string };
export type DBConfig = Prisma.PrismaClientOptions;
export type InfraConfig = {
  logger: LoggerConfig;
  db: DBConfig;
}
