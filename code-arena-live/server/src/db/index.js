import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise';
import mockDb from './mockDb.js';

let db = null;
let useMockDb = false;

// Helper function to test MySQL connection
const testMySQLConnection = async () => {
  try {
    // Only attempt MySQL connection if password is explicitly set
    if (!process.env.DB_PASSWORD) {
      console.warn('DB_PASSWORD not set - skipping MySQL connection attempt');
      return null;
    }

    const pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'codeverse',
      port: parseInt(process.env.DB_PORT || '3306'),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      timezone: '+00:00'
    });

    // Try to get a connection
    const connection = await pool.getConnection();
    connection.release();
    return pool;
  } catch (error) {
    console.warn('MySQL connection failed:', error.message);
    return null;
  }
};

// Initialize database
export const initializeDatabase = async () => {
  try {
    const mysqlPool = await testMySQLConnection();
    if (mysqlPool) {
      db = mysqlPool;
      useMockDb = false;
      console.log('Database: Connected to MySQL');
      return;
    }
  } catch (error) {
    console.warn('Failed to connect to MySQL');
  }

  // Fallback to mock database
  if (process.env.NODE_ENV === 'production') {
    console.error('ERROR: MySQL connection failed and NODE_ENV is production.');
    console.error('The mock database cannot be used in production.');
    console.error('Please ensure MySQL is running and properly configured.');
    process.exit(1);
  }

  db = mockDb;
  useMockDb = true;
  console.warn('Database: Using in-memory mock database (for development only)');
  console.warn('WARNING: Mock database does not persist data between restarts');
};

// Initialize on import
await initializeDatabase();

// Helper function to execute queries
export const query = async (sql, values = []) => {
  try {
    if (useMockDb) {
      return await db.query(sql, values);
    } else {
      const connection = await db.getConnection();
      try {
        const [results] = await connection.execute(sql, values);
        return results;
      } finally {
        connection.release();
      }
    }
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
};

export default db;
