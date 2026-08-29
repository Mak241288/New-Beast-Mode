import { PrismaClient } from '@prisma/client';

declare global {
  // Prevent multiple PrismaClient instances across requests and hot-reloads
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

globalThis.prismaGlobal = prisma;

export default prisma;
