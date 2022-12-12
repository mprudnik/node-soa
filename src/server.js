const { fastify } = require('fastify');
const services = require('./services');
const routes = require('./routes');

module.exports.options = (extendWith = {}) => ({
  host: '0.0.0.0',
  port: '9000',
  ...extendWith,
});

module.exports.deps = async (replaceWith = {}) => {
  const logger =
    replaceWith.logger || services.logger.init(services.logger.options());
  const db =
    replaceWith.db ||
    (await services.db.init({ logger }, services.db.options()));
  return { logger, db };
};

module.exports.init = async ({ logger, db }, options = {}) => {
  const server = fastify({ logger, ...options });

  await server.register(routes.auth({ db, logger }), { prefix: '/api/auth' });

  return server;
};

module.exports.listen = async ({ logger }, server, options) => {
  const { host, port } = options;
  await server.listen({ host, port });
  logger.info(`Server listens to ${host}:${port}`);
};

module.exports.teardown = async ({ logger }, server) => {
  await server.close();
  logger.info('Server closed');
};
