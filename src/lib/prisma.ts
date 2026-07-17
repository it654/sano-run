import { PrismaClient } from '@prisma/client';

// Tránh việc Next.js tạo ra quá nhiều kết nối database khi hot-reload trong môi trường Dev
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}