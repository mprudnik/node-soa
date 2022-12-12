export default {
  server: {
    port: process.env.PORT ?? 8000,
    cors: {
      origin: '*',
      methods: '*',
      allowedHeaders: '*',
      credentials: true,
    },
  },
  sandbox: {
    timeout: 5000,
    displayErrors: false,
  },
  apiPath: 'src/api',
  entitiesPath: 'prisma/json-schema.json',
  depsPath: 'src/dependencies',
  depsOptions: {
    db: { errorFormat: 'minimal' },
  },
};
