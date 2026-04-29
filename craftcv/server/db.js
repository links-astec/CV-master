import pg from 'pg';

const { Pool } = pg;

// Render provides DATABASE_URL as a standard Postgres connection string.
// SSL is required on Render — rejectUnauthorized:false accepts Render's self-signed cert.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL
    ? { rejectUnauthorized: false }
    : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Postgres pool error:', err.message);
});

// Convenience wrapper — always releases the client back to the pool
export async function query(sql, params) {
  const client = await pool.connect();
  try {
    return await client.query(sql, params);
  } finally {
    client.release();
  }
}

export default pool;