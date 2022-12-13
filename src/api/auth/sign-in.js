({
  dependsOn: dependencies(['db', 'AppError', 'crypt']),
  input: {
    required: ['email', 'password'],
    properties: {
      email: { type: 'string' },
      password: { type: 'string' },
    },
  },
  output: {
    required: ['userId', 'token'],
    properties: {
      userId: { type: 'string' },
      token: { type: 'string' },
    },
  },
  handler: async ({ email, password }) => {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) throw new AppError('Invalid credentials');

    const valid = await crypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError('Invalid credentials');

    const { id: userId } = user;
    const token = crypt.random();
    await db.session.create({ data: { userId, token } });

    return { userId, token };
  },
});
