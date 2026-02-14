import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 10000,
  max: 4  // Increased for batched chart queries
});

export async function executeQuery(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text: text.substring(0, 50), duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function getStats() {
  // Pre-computed from full 227M row analysis (Feb 13, 2026)
  // Total verified: $1.09 TRILLION across 7 years (2018-2024)
  return {
    unique_providers: '500,000+',
    unique_hcpcs_codes: '10,000+', 
    total_claims: 227083361,
    total_spending: '1093562833512.54'  // $1.09 TRILLION (verified from full data)
  };
}

export async function getProviders(search: string = '', page: number = 1, limit: number = 50) {
  const offset = (page - 1) * limit;
  
  // For search queries, use WHERE clause
  if (search) {
    const sql = `
      SELECT billing_provider_npi, hcpcs_code, claim_month, 
             total_unique_beneficiaries, total_claims, total_paid
      FROM medicaid_provider_spending
      WHERE billing_provider_npi LIKE $3 OR hcpcs_code LIKE $3
      LIMIT $1 OFFSET $2
    `;
    const result = await executeQuery(sql, [limit, offset, `${search}%`]);
    return result.rows;
  }
  
  // Default: just get rows without expensive ORDER BY (fast on 227M rows)
  const sql = `
    SELECT billing_provider_npi, hcpcs_code, claim_month, 
           total_unique_beneficiaries, total_claims, total_paid
    FROM medicaid_provider_spending
    LIMIT $1 OFFSET $2
  `;
  
  const result = await executeQuery(sql, [limit, offset]);
  return result.rows;
}

export async function getProviderByNPI(npi: string) {
  const sql = `
    SELECT 
      billing_provider_npi,
      hcpcs_code,
      claim_month,
      total_unique_beneficiaries,
      total_claims,
      total_paid
    FROM medicaid_provider_spending
    WHERE billing_provider_npi = $1
    ORDER BY claim_month DESC, total_paid DESC
    LIMIT 1000
  `;
  
  const result = await executeQuery(sql, [npi]);
  return result.rows;
}

export async function getHcpcsAnalysis(code: string) {
  const sql = `
    SELECT 
      billing_provider_npi,
      claim_month,
      total_unique_beneficiaries,
      total_claims,
      total_paid
    FROM medicaid_provider_spending
    WHERE hcpcs_code = $1
    ORDER BY total_paid DESC
    LIMIT 1000
  `;
  
  const result = await executeQuery(sql, [code]);
  return result.rows;
}

export async function getMonthlySpendingByNPI(npi: string) {
  const sql = `
    SELECT 
      claim_month,
      SUM(total_paid) as monthly_spending,
      SUM(total_claims) as monthly_claims
    FROM medicaid_provider_spending
    WHERE billing_provider_npi = $1
    GROUP BY claim_month
    ORDER BY claim_month
  `;
  
  const result = await executeQuery(sql, [npi]);
  return result.rows;
}

export async function getMonthlySpendingByHCPCS(code: string) {
  const sql = `
    SELECT 
      claim_month,
      SUM(total_paid) as monthly_spending,
      SUM(total_claims) as monthly_claims
    FROM medicaid_provider_spending
    WHERE hcpcs_code = $1
    GROUP BY claim_month
    ORDER BY claim_month
  `;
  
  const result = await executeQuery(sql, [code]);
  return result.rows;
}

export async function getTotalCount(search: string = '') {
  let whereClause = '';
  let params: any[] = [];
  
  if (search) {
    whereClause = 'WHERE billing_provider_npi ILIKE $1 OR hcpcs_code ILIKE $1';
    params.push(`%${search}%`);
  }
  
  const sql = `SELECT COUNT(*) as count FROM medicaid_provider_spending ${whereClause}`;
  const result = await executeQuery(sql, params);
  return parseInt(result.rows[0]?.count || '0');
}
