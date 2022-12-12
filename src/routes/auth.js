import * as crypto from '../lib/crypto.js';
import * as schema from '../lib/schema.js';
import { AppError, handleError } from '../lib/error.js';

export default function ({ db, logger }) {
  return async (server) => {
    server.route({
      method: 'POST',
      url: '/sign-up',
      schema: {
        body: schema.toObject({
          required: ['email', 'password', 'firstName', 'lastName'],
          properties: {
            email: { type: 'string' },
            password: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
          },
        }),
      },
      handler: async (req, res) => {
        try {
          const { email, password, ...rest } = req.body;

          const exists = await db.user.findUnique({ where: { email } });
          if (exists) throw new AppError('Already exists');

          const passwordHash = await crypto.hash(password);

          const { id: userId } = await db.user.create({
            data: { email, passwordHash, ...rest },
          });

          const token = crypto.random();
          await db.session.create({ data: { userId, token } });

          res.code(200).send({ userId, token });
        } catch (error) {
          const [status, message, level, stack] = handleError(error);

          logger[level]({ stack }, `auth/sign-up error - ${message}`);
          res.code(status).send({ message });
        }
      },
    });

    server.route({
      method: 'POST',
      url: '/sign-in',
      schema: {
        body: schema.toObject({
          required: ['email', 'password'],
          properties: {
            email: { type: 'string' },
            password: { type: 'string' },
          },
        }),
      },
      handler: async (req, res) => {
        try {
          const { email, password } = req.body;

          const user = await db.user.findUnique({ where: { email } });
          if (!user) throw new AppError('Invalid credentials');

          const valid = await crypto.compare(password, user.passwordHash);
          if (!valid) throw new AppError('Invalid credentials');

          const { id: userId } = user;
          const token = crypto.random();
          await db.session.create({ data: { userId, token } });

          res.code(200).send({ userId, token });
        } catch (error) {
          const [status, message, level, stack] = handleError(error);

          logger[level]({ stack }, `auth/sign-in error - ${message}`);
          res.code(status).send({ message });
        }
      },
    });

    server.route({
      method: 'POST',
      url: '/refresh',
      schema: {
        body: schema.toObject({
          required: ['token'],
          properties: { token: { type: 'string' } },
        }),
      },
      handler: async (req, res) => {
        try {
          const { token } = req.body;

          const session = await db.session.findUnique({ where: { token } });
          if (!session) throw new AppError('Not found');

          const newToken = crypto.random();
          await db.session.update({
            where: { id: session.id },
            data: { token: newToken },
          });

          res.code(200).send({ token: newToken });
        } catch (error) {
          const [status, message, level, stack] = handleError(error);

          logger[level]({ stack }, `auth/sign-in error - ${message}`);
          res.code(status).send({ message });
        }
      },
    });

    server.route({
      method: 'POST',
      url: '/sign-out',
      schema: {
        body: schema.toObject({
          required: ['token'],
          properties: { token: { type: 'string' } },
        }),
      },
      handler: async (req, res) => {
        try {
          const { token } = req.body;

          const exists = await db.session
            .delete({ where: { token } })
            .catch(() => false);
          if (!exists) throw new AppError('Not found');

          res.code(204).send();
        } catch (error) {
          const [status, message, level, stack] = handleError(error);

          logger[level]({ stack }, `auth/sign-in error - ${message}`);
          res.code(status).send({ message });
        }
      },
    });
  };
}
