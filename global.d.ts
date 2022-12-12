import { PrismaClient } from '@prisma/client';
import { Logger } from 'pino'
import Entities from './prisma/json-schema.json';
import * as Crypt from './src/dependencies/crypt';

type Dependency = 'entities' | 'logger' | 'AppError' | 'db' | 'crypt';

declare global {
  const entities: typeof Entities;
  const logger: Pick<Logger, 'debug' | 'info' | 'warn' | 'error'>;
  class AppError { constructor(message: string); }
  const db: PrismaClient;
  const crypt: typeof Crypt;
  function dependencies(deps: Dependency[]): void;
}
