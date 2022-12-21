import { init as initAuth } from './auth.js';
import { init as initServer, teardown as teardownServer } from './server.js';

/** @type function({ infrastructure: Services['infrastructure'], routes: Router }, Config['application']): Promise<Services['application']> */
export const init = async ({ infrastructure, routes }, options) => {
  const auth = await initAuth({ infrastructure });
  const server = await initServer(
    { infrastructure, application: { auth }, routes },
    options.server,
  );

  return { auth, server };
};

/** @type function(Services): Promise<void>  */
export const teardown = async ({
  infrastructure: { logger },
  application: { server },
}) => {
  await teardownServer({ server, logger });
};
