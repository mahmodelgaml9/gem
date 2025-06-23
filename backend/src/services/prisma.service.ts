
import { PrismaClient } from '@prisma/client';

// Add prisma.$on to log queries in development
// See https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/logging
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

export default prisma;
