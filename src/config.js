const env = process.env.NODE_ENV || 'development';

/** @type Config */
export const config = {
  application: {
    server: {
      host: process.env.HOST || '0.0.0.0',
      port: Number(process.env.PORT) || 9000,
    },
  },
  infrastructure: {
    db: { errorFormat: 'minimal' },
    logger: { env },
  },
};
