export const authCheck = (deps, { rotutingSchema, fastifyRoute }) => {
  const { server, bus } = deps;
  const { authDefinition } = rotutingSchema;
  fastifyRoute.onRequest = server.auth([
    async (req) => {
      const token = server.getAuthToken(req);
      const session = await bus.command('auth.verify', {
        token,
        definition: authDefinition,
      });
      req.session = session;
    },
  ]);
};
