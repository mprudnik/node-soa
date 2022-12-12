import { PrismaClient } from '@prisma/client';

export default async (options, logger) => {
  const prisma = new PrismaClient(options);

  await prisma.$connect();
  logger.info('DB connected');

  return prisma;
};
