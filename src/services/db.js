'use strict';

const { PrismaClient } = require('@prisma/client');

module.exports.options = (extendWith = {}) => ({
  log: ['info', 'query'],
  errorFormat: 'minimal',
  ...extendWith,
});

module.exports.init = async ({ logger }, options = {}) => {
  const client = new PrismaClient(options);
  await client.$connect();
  logger.info('DB connected');
  return client;
};

module.exports.teardown = async ({ db, logger }) => {
  await db.$disconnect();
  logger.info('DB disconnected');
};
