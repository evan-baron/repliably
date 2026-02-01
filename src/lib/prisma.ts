import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

// Use API URL for runtime (readwrite role), fallback for compatibility
const connectionString = process.env.DATABASE_API_URL || process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error('Database connection string not configured. Set DATABASE_API_URL or DATABASE_URL.');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
