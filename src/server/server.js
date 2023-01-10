/** @typedef {import('./types').init} init */
import { fastify } from 'fastify';
import { cors } from './plugins/cors.js';
import { swagger } from './plugins/swagger.js';
import { websocket } from './plugins/websocket.js';
import { handleError } from '../lib/error.js';

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
      //401: { description: 'Auth error', errorResponse },
    };
  }

  return schema;
};

/** @type init */
export const init = async (router, infra, config) => {
  const { db, logger, bus, ws } = infra;
  const { host, port, instance } = config;

  const server = fastify({ logger, ...instance });

  await server.register(cors(config.cors));
  await server.register(swagger(config.swagger));
  await server.register(websocket({}));

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
    for (const route of routes) {
      const { method, url, schema: schemaDefinition, command } = route;
      const schema = generateSchema(prefix, schemaDefinition);
      server.route({
        method,
        url: `/${prefix}${url}`,
        schema,
        handler: async (req, res) => {
          /** @type object */
          const payload = schema.source ? req[schema.source] : {};
          const result = await bus.command(command, payload);
          const [code, data] = schema.output ? [200, result] : [204, null];
          res.code(code).send(data);
        },
      });
    }
  }

  server.route({
    method: 'GET',
    url: '/ws',
    websocket: true,
    handler: async () => 'WS',
    wsHandler: (connection, req) => {
      const { id: userId } = req.user;
      connection.socket.on('open', () => {
        ws.add(userId, connection.socket);
      });
      connection.socket.on('close', () => {
        ws.remove(userId);
      });
    },
  });

  await server.listen({ host, port });

  return server;
};
