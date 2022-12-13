({
  dependsOn: dependencies(['db', 'AppError', 'crypt']),
  input: {
    required: ['email', 'password', 'firstName', 'lastName'],
    properties: {
      email: { type: 'string' },
      password: { type: 'string' },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
    },
  },
  output: {
    required: ['userId', 'token'],
    properties: {
      userId: { type: 'string' },
      token: { type: 'string' },
    },
  },
  handler: async ({ email, password, ...rest }) => {
    const exists = await db.user.findUnique({ where: { email } });
    if (exists) throw new AppError('Already exists');

    const passwordHash = await crypt.hash(password);

    const { id: userId } = await db.user.create({
      data: { email, passwordHash, ...rest },
    });

    const token = crypt.random();
    await db.session.create({ data: { userId, token } });

    return { userId, token };
  },
});
