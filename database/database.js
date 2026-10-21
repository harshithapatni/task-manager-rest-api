const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Define database file path inside the database directory
const dbPath = path.resolve(__dirname, 'task_manager.db');

// Connect to SQLite database (creates file automatically if it doesn't exist)
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to the SQLite database at:', dbPath);
  }
});

// Enable foreign key constraints in SQLite
db.run('PRAGMA foreign_keys = ON');

/**
 * Initialize database tables: users and tasks.
 * Called automatically when server starts up.
 */
const initDatabase = () => {
  db.serialize(() => {
    // 1. Create users table
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      (err) => {
        if (err) {
          console.error('Error creating users table:', err.message);
        } else {
          console.log('Users table verified/created successfully.');
        }
      }
    );

    // 2. Create tasks table
    db.run(
      `CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,
      (err) => {
        if (err) {
          console.error('Error creating tasks table:', err.message);
        } else {
          console.log('Tasks table verified/created successfully.');
        }
      }
    );
  });
};

/**
 * Helper function for INSERT, UPDATE, DELETE queries using Promises.
 * Returns an object with the inserted id and number of affected rows.
 */
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        return reject(err);
      }
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

/**
 * Helper function for single-row SELECT queries using Promises.
 * Returns a single row object or undefined if not found.
 */
const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        return reject(err);
      }
      resolve(row);
    });
  });
};

/**
 * Helper function for multi-row SELECT queries using Promises.
 * Returns an array of row objects.
 */
const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
};

module.exports = {
  db,
  initDatabase,
  dbRun,
  dbGet,
  dbAll,
};
