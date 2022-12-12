import * as server from './src/server.js';

try {
  const deps = await server.deps();
  const options = server.options();
  const httpServer = await server.init(deps);
  await server.listen(deps, httpServer, options);
  process.on('SIGINT', () => {
    deps.logger.info('caught SIGINT');
    server
      .teardown(deps, httpServer)
      .then(() => {
        process.exit(0);
      })
      .catch((err) => {
        console.error(err);
        process.exit(-1);
      });
  });
} catch (error) {
  console.error(error);
  process.exit(-1);
}
