import { PrismaClient } from "../generated/prisma";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env";

// Singleton Prisma Client for PostgreSQL
// Note: Prisma 7 requires an adapter when using the new client architecture

const globalForPrisma = global as unknown as { prisma: PrismaClient; pool: Pool };

const poolMax = Number.parseInt(process.env.DATABASE_POOL_MAX || "10", 10) || 10;
const poolTimeout =
  Number.parseInt(process.env.DATABASE_POOL_TIMEOUT || "10000", 10) || 10000;

// Use a single canonical DATABASE_URL for both development and production.
const pool =
  globalForPrisma.pool ||
  new Pool({
    connectionString: env.DATABASE_URL,
    max: poolMax,
    connectionTimeoutMillis: poolTimeout,
  });

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    errorFormat: "pretty",
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
  await pool.end();
});

export default prisma;
