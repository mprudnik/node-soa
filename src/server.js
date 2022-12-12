import { fastify } from 'fastify';
import cors from '@fastify/cors';
import services from './services/index.js';
import routes from './routes/index.js';

export const options = (extendWith = {}) => ({
  host: '0.0.0.0',
  port: '9000',
  ...extendWith,
});

export const deps = async (replaceWith = {}) => {
  const logger =
    replaceWith.logger || services.logger.init(services.logger.options());
  const db =
    replaceWith.db ||
    (await services.db.init({ logger }, services.db.options()));
  return { logger, db };
};

export const init = async ({ logger, db }, options = {}) => {
  const server = fastify({ logger, ...options });

  await server.register(cors);
  await server.register(routes.auth({ db, logger }), { prefix: '/api/auth' });

  return server;
};

export const listen = async ({ logger }, server, options) => {
  const { host, port } = options;
  await server.listen({ host, port });
  logger.info(`Server listens to ${host}:${port}`);
};

export const teardown = async ({ logger }, server) => {
  await server.close();
  logger.info('Server closed');
};
