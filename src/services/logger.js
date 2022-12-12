import { pino } from 'pino';

export const options = (extendWith = {}) => ({
  level: 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      ignore: 'pid,hostname',
    },
  },
  ...extendWith,
});

export const init = (options) => pino(options);
