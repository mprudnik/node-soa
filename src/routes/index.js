import { handleError } from '../lib/error.js';
import { auth } from './auth.js';

/** @type Router */
export const routes = async (services) => {
  const { server } = services.application;
  const { logger } = services.infrastructure;

  server.setErrorHandler(server.errorHandler);
  server.setErrorHandler((error, req, res) => {
    const [status, message, level, stack] = handleError(error);

    logger[level]({ stack }, `${req.routerPath} error - ${message}`);
    res.code(status).send({ message });
  });

  await server.register(() => auth(services), { prefix: '/auth' });
};
