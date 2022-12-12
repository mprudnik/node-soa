import config from './config.js';
import logger from './lib/logger.js';
import * as load from './lib/loader.js';
import * as server from './lib/server.js';
import AppError from './lib/error.js';

export default async () => {
  const entities = await load.entities(config.entitiesPath);
  const deps = await load.deps(logger, config.depsPath, config.depsOptions);

  const sandbox = Object.freeze({
    logger,
    entities,
    AppError,
    ...deps,
  });

  const routing = await load.routing(config.apiPath, sandbox, config.sandbox);

  await server.start(logger, routing, config.server);

  return async () => {
    await server.stop();
  };
};
