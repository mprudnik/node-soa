/** @type function(Services): Promise<void> */
export const auth = async ({ application: { server, auth } }) => {
  server.route({
    method: 'POST',
    url: '/sign-up',
    schema: /** @type {const} */ ({
      body: {
        type: 'object',
        additionalProperties: false,
        required: ['email', 'password', 'firstName', 'lastName'],
        properties: {
          email: { type: 'string' },
          password: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
        },
      },
    }),
    handler: async (req, res) => {
      const data = req.body;

      const { userId, token } = await auth.signUp(data);

      res.code(200).send({ userId, token });
    },
  });

  server.route({
    method: 'POST',
    url: '/sign-in',
    schema: /** @type {const} */ ({
      body: {
        type: 'object',
        additionalProperties: false,
        required: ['email', 'password'],
        properties: {
          email: { type: 'string' },
          password: { type: 'string' },
        },
      },
    }),
    handler: async (req, res) => {
      const { email, password } = req.body;

      const { userId, token } = await auth.signIn({ email, password });

      res.code(200).send({ userId, token });
    },
  });

  server.route({
    method: 'POST',
    url: '/refresh',
    schema: /** @type {const} */ ({
      body: {
        type: 'object',
        additionalProperties: false,
        required: ['token'],
        properties: { token: { type: 'string' } },
      },
    }),
    handler: async (req, res) => {
      const { token } = req.body;

      const { token: newToken } = await auth.refresh({ token });

      res.code(200).send({ token: newToken });
    },
  });

  server.route({
    method: 'POST',
    url: '/sign-out',
    schema: /** @type {const} */ ({
      body: {
        type: 'object',
        additionalProperties: false,
        required: ['token'],
        properties: { token: { type: 'string' } },
      },
    }),
    handler: async (req, res) => {
      const { token } = req.body;

      await auth.signOut({ token });

      res.code(204).send();
    },
  });
};
