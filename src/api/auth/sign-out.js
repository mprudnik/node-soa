({
  dependsOn: dependencies(['db', 'AppError']),
  input: { required: ['token'], properties: { token: { type: 'string' } } },
  handler: async ({ token }) => {
    const exists = await db.session
      .delete({ where: { token } })
      .catch(() => false);
    if (!exists) throw new AppError('Not found');
  },
});
