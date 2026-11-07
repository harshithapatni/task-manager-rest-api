const { Pool } = require('pg');

// Create PostgreSQL connection pool
// If DATABASE_URL is provided, enable SSL for remote hosting (e.g. Render)
const isLocal =
  !process.env.DATABASE_URL ||
  process.env.DATABASE_URL.includes('localhost') ||
  process.env.DATABASE_URL.includes('127.0.0.1');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

/**
 * Initialize database tables: users and tasks.
 * Called automatically when server starts up.
 */
const initDatabase = async () => {
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️  DATABASE_URL environment variable is not set. Please set it in your .env or Render environment.');
    return;
  }

  try {
    // 1. Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Create tasks table with foreign key reference to users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ PostgreSQL database tables verified/created successfully.');
  } catch (err) {
    console.error('❌ Error initializing PostgreSQL tables:', err.message);
  }
};

/**
 * Helper to convert standard SQL queries with '?' placeholders to PostgreSQL '$1, $2...' format.
 */
const convertSql = (sql) => {
  let paramIndex = 1;
  return sql.replace(/\?/g, () => `$${paramIndex++}`);
};

/**
 * Helper function for INSERT, UPDATE, DELETE queries using Promises.
 * For INSERT statements, automatically appends RETURNING id to capture the generated ID.
 * Returns an object with the inserted id and number of affected rows.
 */
const dbRun = async (sql, params = []) => {
  let pgSql = convertSql(sql);

  // If this is an INSERT statement and doesn't already have RETURNING, append RETURNING id
  const isInsert = /^\s*INSERT\s+INTO/i.test(pgSql);
  if (isInsert && !/RETURNING/i.test(pgSql)) {
    pgSql += ' RETURNING id';
  }

  const result = await pool.query(pgSql, params);
  const insertedId = isInsert && result.rows.length > 0 ? result.rows[0].id : null;

  return {
    id: insertedId,
    changes: result.rowCount,
  };
};

/**
 * Helper function for single-row SELECT queries using Promises.
 * Returns a single row object or undefined if not found.
 */
const dbGet = async (sql, params = []) => {
  const pgSql = convertSql(sql);
  const result = await pool.query(pgSql, params);
  return result.rows[0];
};

/**
 * Helper function for multi-row SELECT queries using Promises.
 * Returns an array of row objects.
 */
const dbAll = async (sql, params = []) => {
  const pgSql = convertSql(sql);
  const result = await pool.query(pgSql, params);
  return result.rows;
};

module.exports = {
  pool,
  initDatabase,
  dbRun,
  dbGet,
  dbAll,
};
