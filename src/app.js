import { config } from './config.js';
import {
  init as initAppServices,
  teardown as teardownAppServices,
} from './services/application/index.js';
import {
  init as initInfraServices,
  teardown as teardownInfraServices,
} from './services/infrastructure/index.js';
import { routes } from './routes/index.js';

export const init = async () => {
  const infrastructure = await initInfraServices(config.infrastructure);
  const application = await initAppServices(
    { infrastructure, routes },
    config.application,
  );

  const services = { application, infrastructure };

  return async () => {
    services.infrastructure.logger.info('Stopping application');
    await teardownAppServices(services);
    await teardownInfraServices(infrastructure);
  };
};
