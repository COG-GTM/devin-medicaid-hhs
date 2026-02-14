/**
 * Database Connection Module
 * 
 * SECURITY: Database credentials are stored in Vercel environment variables.
 * Never commit credentials to the repository.
 * 
 * For local development:
 * 1. Run `vercel link` to connect to your Vercel project
 * 2. Run `vercel env pull .env.local` to get environment variables
 * 3. The .env.local file is gitignored and should never be committed
 */

import { Pool } from 'pg';

// Connection pool using environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.log(`Slow query (${duration}ms):`, text.substring(0, 100));
    }
    return result.rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function getClient() {
  return pool.connect();
}

export default pool;
