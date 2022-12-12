'use strict';

const { pino } = require('pino');

module.exports.options = (extendWith = {}) => ({
  level: 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      ignore: 'pid,hostname',
    },
  },
  ...extendWith,
});

module.exports.init = (options) => pino(options);
