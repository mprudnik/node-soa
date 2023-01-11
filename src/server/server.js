/** @typedef {import('./types').init} init */
/** @typedef {import('../types').Session} Session */
import { fastify } from 'fastify';
import { auth } from './plugins/auth.js';
import { cors } from './plugins/cors.js';
import { swagger } from './plugins/swagger.js';
import { websocket } from './plugins/websocket.js';
import { handleError } from '../lib/error.js';
import { randomUUID } from 'crypto';

const objectProps = { type: 'object', additionalProperties: false };
const errorResponse = {
  ...objectProps,
  required: ['message'],
  properties: { message: { type: 'string' } },
};

const generateSchema = (prefix, definition) => {
  const schema = { tags: [prefix.toUpperCase()] };
  if (definition.input) {
    schema[definition.source] = { ...objectProps, ...definition.input };
  }

  if (definition.output) {
    schema.response = {
      200: { ...objectProps, ...definition.output },
      400: { description: 'Client error', ...errorResponse },
      401: { description: 'Auth error', ...errorResponse },
    };
  }

  return schema;
};

/** @type init */
export const init = async (router, infra, config) => {
  const { db, logger, bus } = infra;
  const { host, port, instance } = config;

  const server = fastify({ logger, ...instance });
  // decoreate a server with metadata - serverId
  server.serverId = randomUUID();
  server.wsConnections = new Map();

  await server.register(cors(config.cors));
  await server.register(swagger(config.swagger));
  await server.register(websocket({}));
  await server.register(auth({}));

  server.setErrorHandler(server.errorHandler);
  server.setErrorHandler((error, req, res) => {
    const [status, message, level, stack] = handleError(error);

    logger[level]({ stack }, `${req.routerPath} error - ${message}`);
    res.code(status).send({ message });
  });

  server.route({
    method: 'GET',
    url: '/healthcheck',
    handler: async (_req, res) => {
      const dbHealthy = await db.$queryRaw`SELECT 1`.catch(() => false);

      const allGood = dbHealthy;

      return res.code(allGood ? 200 : 503).send();
    },
  });

  for (const [prefix, routes] of Object.entries(router)) {
    // For fastifyRoute initialization better to have this done seperately
    for (const route of routes) {
      const {
        method,
        url,
        schema: schemaDefinition,
        auth: authDefinition,
        command,
      } = route;

      const schema = generateSchema(prefix, schemaDefinition);

      const routeDefinition = {
        method,
        url: `/${prefix}${url}`,
        schema,
        handler: async (req, res) => {
          /** @type object */
          const payload = schemaDefinition.source
            ? req[schemaDefinition.source]
            : {};
          const session = authDefinition // use AsyncLocalStorage
            ? req.session
            : undefined;
          const result = await bus.command(command, payload, session);
          const [code, data] = schema.output ? [200, result] : [204, null];
          res.code(code).send(data);
        },
      };

      // Try do move this as a hook
      if (authDefinition) {
        routeDefinition.onRequest = server.auth([
          async (req) => {
            const token = server.getAuthToken(req);
            /** @type Session */
            const session = await bus.command('auth.verify', {
              token,
              definition: authDefinition,
            });
            // use AsyncLocalStorage
            req.session = session;
          },
        ]);
      }

      server.route(routeDefinition);
    }
  }

  server.route({
    method: 'GET',
    url: '/ws',
    websocket: true,
    onRequest: server.auth([
      async (req) => {
        const token = server.getAuthToken(req);
        /** @type Session */
        const session = await bus.command('auth.verify', { token });
        // use AsyncLocalStorage
        req.session = session;
      },
    ]),
    handler: async () => 'WS',
    wsHandler: (connection, req) => {
      const { userId } = req.session; // use AsyncLocalStorage
      const { serverId } = server;
      const wsId = randomUUID();
      connection.socket.on('open', () => {
        server.wsConnections.set(wsId, connection);
        bus.publish('notification.init.event', {
          metadata: { wsId, serverId },
          data: { userId },
        });
        bus.subscribe(
          `notification.message.${serverId}`,
          ({ metadata, data }) => {
            const { wsId } = metadata;
            const connection = server.wsConnections.get(wsId);
            connection.socket.send(JSON.stringify({ data }));
          },
        );
        // ws.add(userId, connection.socket);
      });
      connection.socket.on('close', () => {
        server.wsConnections.delete(wsId);
        bus.publish('notification.close.event', {
          metadata: { wsId, serverId },
          data: { userId },
        });
        bus.unsubcribe(`notification.message.${serverId}`);
        // ws.remove(userId);
      });
    },
  });

  await server.listen({ host, port });

  return server;
};
