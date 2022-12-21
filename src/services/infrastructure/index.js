import { init as initLogger } from './logger.js';
import { init as initDB, teardown as teardownDB } from './db.js';

/** @type function(Config['infrastructure']): Promise<Services['infrastructure']> */
export const init = async (options) => {
  const logger = await initLogger(options.logger);
  const db = await initDB({ logger }, options.db);

  return { logger, db };
};

/** @type function(Services['infrastructure']): Promise<void> */
export const teardown = async ({ db, logger }) => {
  await teardownDB({ db, logger });
};
