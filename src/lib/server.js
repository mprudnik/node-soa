import { fastify } from 'fastify';

import cors from './plugins/cors.js';
import AppError from './error.js';

const errorResponse = {
  type: 'object',
  additionalProperties: false,
  required: ['message'],
  properties: {
    message: { type: 'string' },
  },
};

const createSchema = (service, route, auth, input, output) => {
  const routeSchema = {
    description: route.toUpperCase(),
    tags: [service.toUpperCase()],
    response: {
      400: {
        description: 'Client Error',
        ...errorResponse,
      },
      401: {
        description: 'Invalid auth',
        ...errorResponse,
      },
      403: {
        description: 'Invalid role',
        ...errorResponse,
      },
    },
  };

  if (auth) routeSchema.security = [{ token: [] }];

  if (input) {
    routeSchema.body = {
      type: 'object',
      additionalProperties: false,
      required: input.required ?? [],
      properties: input.properties ?? {},
    };
  }

  if (output) {
    routeSchema.response[200] = {
      description: 'Successful',
      type: 'object',
      additionalProperties: false,
      required: output.required ?? [],
      properties: output.properties ?? {},
    };
  } else {
    routeSchema.response[204] = {
      description: 'Successful (no content)',
      type: 'null',
    };
  }

  return routeSchema;
};

const createHandler = (name, handler) => async (req, reply) => {
  try {
    const result = await handler(req.body, req.user);

    if (result) reply.code(200).send(result);
    else reply.code(204).send();
  } catch (error) {
    const [code, message, level, err] =
      error instanceof AppError
        ? [400, error.message, 'warn', {}]
        : [500, 'Internal server error', 'error', error];

    reply.log[level](err, name);
    reply.code(code).send({ message });
  }
};

const registerRoutes = (service, routes) => async (server) => {
  for (const [routeName, route] of Object.entries(routes)) {
    const { auth, input, output, handler } = route;

    const options = {
      method: 'POST',
      url: '/' + routeName,
      schema: createSchema(service, routeName, auth, input, output),
      handler: createHandler(routeName, handler),
    };

    if (auth) options.preParsing = server.authenticate(auth);

    server.route(options);
  }
};

let server;
export const start = async (logger, routing, options) => {
  const { port, cors: corsOptions } = options;

  server = fastify({ logger });

  await server.register(cors(corsOptions));

  server.get('/', async () => 'It works');

  for (const [serviceName, routes] of Object.entries(routing)) {
    server.register(registerRoutes(serviceName, routes), {
      prefix: '/api/' + serviceName,
    });
  }

  await server.listen({ host: '0.0.0.0', port });

  logger.info(`Server listening on port ${port}`);
};

export const stop = async () => {
  if (server) await server.close();
};
