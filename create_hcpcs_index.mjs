import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  statement_timeout: 0
});

async function run() {
  console.log('Creating HCPCS covering index (CONCURRENTLY - non-blocking)...');

  try {
    // Serves /api/hcpcs/[code]: getHcpcsAnalysis reads the top 1000 rows by
    // total_paid straight off the index, and getMonthlySpendingByHCPCS becomes
    // an index-only scan (claim_month, total_claims are INCLUDEd).
    await pool.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hcpcs_paid_cov
      ON medicaid_provider_spending (hcpcs_code, total_paid DESC)
      INCLUDE (claim_month, total_claims)
    `);
    console.log('Index created: idx_hcpcs_paid_cov');
  } catch (e) {
    console.log('Index may already exist or error:', e.message);
  }

  // Index-only scans need an up-to-date visibility map
  await pool.query('VACUUM (ANALYZE) medicaid_provider_spending');

  const indexes = await pool.query(`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename = 'medicaid_provider_spending'
  `);
  console.log('\nExisting indexes:');
  indexes.rows.forEach(i => console.log('  -', i.indexname));

  await pool.end();
}

run().catch(console.error);
