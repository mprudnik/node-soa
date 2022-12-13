({
  dependsOn: dependencies(['db', 'AppError', 'crypt']),
  input: { required: ['token'], properties: { token: { type: 'string' } } },
  output: { required: ['token'], properties: { token: { type: 'string' } } },
  handler: async ({ token }) => {
    const session = await db.session.findUnique({ where: { token } });
    if (!session) throw new AppError('Not found');

    const newToken = crypt.random();
    await db.session.update({
      where: { id: session.id },
      data: { token: newToken },
    });

    return { token: newToken };
  },
});
