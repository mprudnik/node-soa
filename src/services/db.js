import { PrismaClient } from '@prisma/client';

export const options = (extendWith = {}) => ({
  log: ['info', 'query'],
  errorFormat: 'minimal',
  ...extendWith,
});

export const init = async ({ logger }, options = {}) => {
  const client = new PrismaClient(options);
  await client.$connect();
  logger.info('DB connected');
  return client;
};

export const teardown = async ({ db, logger }) => {
  await db.$disconnect();
  logger.info('DB disconnected');
};
