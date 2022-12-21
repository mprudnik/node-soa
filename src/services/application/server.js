import { fastify } from 'fastify';
import cors from '@fastify/cors';

/** @type function(
 *  {
 *    infrastructure: Services['infrastructure'],
 *    application: Omit<Services['application'], 'server'>,
 *    routes: Router
 *  },
 *  Config['application']['server']
 * ): Promise<Services['application']['server']> */
export const init = async (
  { infrastructure, application, routes },
  options,
) => {
  const { logger } = infrastructure;
  /** @type Services['application']['server'] */
  const server = fastify({ logger, ...options.instance });

  await server.register(cors, options.cors);

  await server.register(
    async (/** @type Services['application']['server'] */ server) => {
      const services = {
        infrastructure,
        application: { ...application, server },
      };
      return routes(services);
    },
    { prefix: '/api' },
  );

  const { host, port } = options;
  await server.listen({ host, port });

  return server;
};

export const teardown = async ({ logger, server }) => {
  await server.close();
  logger.info('Server closed');
};
