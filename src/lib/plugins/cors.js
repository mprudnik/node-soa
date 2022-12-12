import fp from 'fastify-plugin';
import cors from '@fastify/cors';

export default (options) =>
  fp(async (fastify) => {
    await fastify.register(cors, options);
  });
