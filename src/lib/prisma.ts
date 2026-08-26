import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig } from '@neondatabase/serverless'

// Note: Node 22 has native WebSocket, so we don't need 'ws'

const prismaClientSingleton = () => {
  // Gunakan Prisma biasa (tanpa Neon Adapter) jika di CI menggunakan database localhost
  if (process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1')) {
    return new PrismaClient()
  }
  
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL as string })
  return new PrismaClient({ adapter })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export { prisma };
export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
