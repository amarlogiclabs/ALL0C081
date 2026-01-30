import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
  let connection = null;

  try {
    console.log('\n╔═══════════════════════════════════════════╗');
    console.log('║   DATABASE SETUP - Creating codeverse    ║');
    console.log('╚═══════════════════════════════════════════╝\n');

    // Connect to MySQL without specifying a database
    console.log('Connecting to MySQL server...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root254',
      port: parseInt(process.env.DB_PORT || '3306'),
    });

    console.log('✓ Connected to MySQL\n');

    // Create the database
    console.log('Creating database "codeverse"...');
    await connection.query('CREATE DATABASE IF NOT EXISTS codeverse');
    console.log('✓ Database "codeverse" created\n');

    // Switch to the database
    console.log('Switching to "codeverse" database...');
    await connection.query('USE codeverse');
    console.log('✓ Using "codeverse" database\n');

    // Show tables
    console.log('Checking existing tables...');
    const [tables] = await connection.query('SHOW TABLES');
    if (tables.length === 0) {
      console.log('  No tables yet (Hibernate will create them on startup)\n');
    } else {
      console.log(`  Found ${tables.length} existing tables\n`);
    }

    console.log('╔═══════════════════════════════════════════╗');
    console.log('║   ✓ SETUP COMPLETE!                      ║');
    console.log('║   Database is ready for application       ║');
    console.log('╚═══════════════════════════════════════════╝\n');

    await connection.end();
    process.exit(0);

  } catch (error) {
    console.error('\n✗ ERROR:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure MySQL is running');
    console.error('2. Verify credentials: root / root254');
    console.error('3. Check host: 127.0.0.1:3306\n');
    
    if (connection) {
      try {
        await connection.end();
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    process.exit(1);
  }
}

setupDatabase();
