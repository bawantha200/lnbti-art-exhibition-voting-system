
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : undefined,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error);
});

export async function testDatabaseConnection() {
  try {
    const result = await pool.query(`
      SELECT current_database() AS database,
             current_user AS username,
             NOW() AS connected_at
    `);

    console.log('Connected to Neon PostgreSQL:', result.rows[0]);

    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('Database tables:');
    console.table(tables.rows);
    console.log('Total tables:', tables.rowCount);

    return true;
  } catch (error) {
    console.error('Neon database connection failed:', error.message);
    throw error;
  }
}
