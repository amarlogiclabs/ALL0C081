// Mock In-Memory Database
// This is a simple in-memory database for development when MySQL is not available
// 
// SECURITY NOTE: This mock database is intended for DEVELOPMENT ONLY.
// Do NOT use this in production or with any user-controlled input.
// The SQL parsing mechanism uses regex and string manipulation which is NOT
// safe against SQL injection. Always use the real MySQL connection with
// parameterized queries for production environments.

class MockDatabase {
  constructor() {
    this.tables = {
      user_profiles: [],
      problems: [],
      battles: [],
      submissions: [],
      battle_events: [],
      match_rooms: [],
      room_participants: [],
      match_scores: [],
    };
  }

  // Query method that simulates SQL queries
  async query(sql, params = []) {
    // Normalize SQL
    const normalizedSql = sql.trim().toUpperCase();

    // SELECT queries
    if (normalizedSql.startsWith('SELECT')) {
      return this.handleSelect(sql, params);
    }

    // INSERT queries
    if (normalizedSql.startsWith('INSERT')) {
      return this.handleInsert(sql, params);
    }

    // UPDATE queries
    if (normalizedSql.startsWith('UPDATE')) {
      return this.handleUpdate(sql, params);
    }

    // DELETE queries
    if (normalizedSql.startsWith('DELETE')) {
      return this.handleDelete(sql, params);
    }

    // DESCRIBE table
    if (normalizedSql.startsWith('DESCRIBE')) {
      return this.handleDescribe(sql);
    }

    // SHOW TABLES
    if (normalizedSql.includes('SHOW TABLES')) {
      return Object.keys(this.tables).map(name => ({ 
        Tables_in_codeverse: name 
      }));
    }

    throw new Error(`Unsupported query type: ${sql}`);
  }

  handleSelect(sql, params) {
    const upper = sql.toUpperCase();

    // Parse table name - handles "FROM table_name" or "FROM table_name WHERE"
    const tableMatch = sql.match(/FROM\s+(\w+)/i);
    if (!tableMatch) throw new Error('Cannot parse table name from SELECT');

    const tableName = tableMatch[1].toLowerCase();
    if (!this.tables[tableName]) {
      throw new Error(`Table ${tableName} does not exist`);
    }

    let results = [...this.tables[tableName]];

    // Handle WHERE clause for basic queries
    if (upper.includes('WHERE')) {
      results = this.filterByWhere(results, sql, params);
    }

    return results;
  }

  filterByWhere(results, sql, params) {
    // Extract WHERE clause
    const whereMatch = sql.match(/WHERE\s+(.*?)(?:LIMIT|ORDER BY|$)/i);
    if (!whereMatch) return results;

    const whereClause = whereMatch[1].trim();

    // Handle simple conditions with ? placeholders
    let conditionIndex = 0;
    
    // Split by AND
    const conditions = whereClause.split(/\s+AND\s+/i).map(c => c.trim());

    return results.filter(row => {
      return conditions.every(condition => {
        // Handle "column = ?" format
        if (condition.includes('=')) {
          const [column, operator] = condition.split(/\s*=\s*/);
          const value = params[conditionIndex++];
          return row[column.trim()] === value;
        }

        // Handle "column != ?" format
        if (condition.includes('!=')) {
          const [column, operator] = condition.split(/\s*!=\s*/);
          const value = params[conditionIndex++];
          return row[column.trim()] !== value;
        }

        return true;
      });
    });
  }

  handleInsert(sql, params) {
    // Parse table name and columns
    const insertMatch = sql.match(/INSERT INTO\s+(\w+)\s*\((.*?)\)\s*VALUES/i);
    if (!insertMatch) throw new Error('Invalid INSERT syntax');

    const tableName = insertMatch[1].toLowerCase();
    const columns = insertMatch[2].split(',').map(c => c.trim());

    if (!this.tables[tableName]) {
      throw new Error(`Table ${tableName} does not exist`);
    }

    // Create row object
    const row = {};
    columns.forEach((col, idx) => {
      row[col] = params[idx];
    });

    this.tables[tableName].push(row);
    return { insertId: row.id, affectedRows: 1 };
  }

  handleUpdate(sql, params) {
    const tableMatch = sql.match(/UPDATE\s+(\w+)/i);
    if (!tableMatch) throw new Error('Invalid UPDATE syntax');

    const tableName = tableMatch[1].toLowerCase();
    if (!this.tables[tableName]) {
      throw new Error(`Table ${tableName} does not exist`);
    }

    // Parse SET clause
    const setMatch = sql.match(/SET\s+(.*?)\s+WHERE/i);
    if (!setMatch) throw new Error('Invalid UPDATE syntax');

    const setClauses = setMatch[1].split(',').map(c => c.trim());
    const updates = {};

    let paramIdx = 0;
    setClauses.forEach(clause => {
      const [column] = clause.split('=').map(c => c.trim());
      updates[column] = params[paramIdx++];
    });

    // Parse WHERE clause for update condition
    const whereMatch = sql.match(/WHERE\s+(.*?)$/i);
    if (!whereMatch) throw new Error('Invalid UPDATE WHERE clause');

    const whereValue = params[paramIdx];
    const whereColumn = whereMatch[1].split('=')[0].trim();

    let updated = 0;
    this.tables[tableName].forEach(row => {
      if (row[whereColumn] === whereValue) {
        Object.assign(row, updates);
        updated++;
      }
    });

    return { affectedRows: updated };
  }

  handleDelete(sql, params) {
    const tableMatch = sql.match(/DELETE FROM\s+(\w+)/i);
    if (!tableMatch) throw new Error('Invalid DELETE syntax');

    const tableName = tableMatch[1].toLowerCase();
    if (!this.tables[tableName]) {
      throw new Error(`Table ${tableName} does not exist`);
    }

    const whereMatch = sql.match(/WHERE\s+(.*?)$/i);
    if (!whereMatch) throw new Error('Invalid DELETE WHERE clause');

    const whereValue = params[0];
    const whereColumn = whereMatch[1].split('=')[0].trim();

    const beforeLength = this.tables[tableName].length;
    this.tables[tableName] = this.tables[tableName].filter(
      row => row[whereColumn] !== whereValue
    );

    return { affectedRows: beforeLength - this.tables[tableName].length };
  }

  handleDescribe(sql) {
    // Parse table name
    const tableMatch = sql.match(/DESCRIBE\s+(\w+)/i);
    if (!tableMatch) throw new Error('Invalid DESCRIBE syntax');

    const tableName = tableMatch[1].toLowerCase();

    const tableSchemas = {
      user_profiles: [
        { Field: 'id', Type: 'VARCHAR(255)', Null: 'NO', Key: 'PRI' },
        { Field: 'email', Type: 'VARCHAR(255)', Null: 'NO', Key: 'UNI' },
        { Field: 'username', Type: 'VARCHAR(100)', Null: 'NO', Key: 'UNI' },
        { Field: 'password_hash', Type: 'VARCHAR(255)', Null: 'NO', Key: '' },
        { Field: 'elo', Type: 'INT', Null: 'YES', Key: '' },
        { Field: 'tier', Type: 'VARCHAR(50)', Null: 'YES', Key: '' },
        { Field: 'total_matches', Type: 'INT', Null: 'YES', Key: '' },
        { Field: 'wins', Type: 'INT', Null: 'YES', Key: '' },
        { Field: 'avatar', Type: 'VARCHAR(500)', Null: 'YES', Key: '' },
        { Field: 'created_at', Type: 'TIMESTAMP', Null: 'NO', Key: '' },
        { Field: 'updated_at', Type: 'TIMESTAMP', Null: 'NO', Key: '' },
      ],
      problems: [
        { Field: 'id', Type: 'VARCHAR(255)', Null: 'NO', Key: 'PRI' },
        { Field: 'title', Type: 'VARCHAR(255)', Null: 'NO', Key: '' },
        { Field: 'description', Type: 'LONGTEXT', Null: 'NO', Key: '' },
        { Field: 'difficulty', Type: 'VARCHAR(20)', Null: 'NO', Key: '' },
        { Field: 'tags', Type: 'JSON', Null: 'YES', Key: '' },
        { Field: 'examples', Type: 'JSON', Null: 'YES', Key: '' },
        { Field: 'constraints', Type: 'JSON', Null: 'YES', Key: '' },
        { Field: 'test_cases', Type: 'JSON', Null: 'YES', Key: '' },
        { Field: 'created_at', Type: 'TIMESTAMP', Null: 'NO', Key: '' },
      ],
      battles: [
        { Field: 'id', Type: 'VARCHAR(255)', Null: 'NO', Key: 'PRI' },
        { Field: 'player1_id', Type: 'VARCHAR(255)', Null: 'NO', Key: '' },
        { Field: 'player2_id', Type: 'VARCHAR(255)', Null: 'NO', Key: '' },
        { Field: 'problem_id', Type: 'VARCHAR(255)', Null: 'NO', Key: '' },
        { Field: 'status', Type: 'VARCHAR(50)', Null: 'YES', Key: '' },
        { Field: 'winner_id', Type: 'VARCHAR(255)', Null: 'YES', Key: '' },
        { Field: 'player1_verdict', Type: 'VARCHAR(50)', Null: 'YES', Key: '' },
        { Field: 'player2_verdict', Type: 'VARCHAR(50)', Null: 'YES', Key: '' },
        { Field: 'created_at', Type: 'TIMESTAMP', Null: 'NO', Key: '' },
        { Field: 'ended_at', Type: 'TIMESTAMP', Null: 'YES', Key: '' },
      ],
      match_rooms: [
        { Field: 'id', Type: 'VARCHAR(255)', Null: 'NO', Key: 'PRI' },
        { Field: 'room_code', Type: 'VARCHAR(4)', Null: 'NO', Key: 'UNI' },
        { Field: 'host_id', Type: 'VARCHAR(255)', Null: 'NO', Key: '' },
        { Field: 'match_type', Type: 'VARCHAR(10)', Null: 'NO', Key: '' },
        { Field: 'max_participants', Type: 'INT', Null: 'NO', Key: '' },
        { Field: 'problem_id', Type: 'VARCHAR(255)', Null: 'YES', Key: '' },
        { Field: 'language', Type: 'VARCHAR(50)', Null: 'YES', Key: '' },
        { Field: 'level', Type: 'VARCHAR(20)', Null: 'YES', Key: '' },
        { Field: 'timing', Type: 'INT', Null: 'YES', Key: '' },
        { Field: 'status', Type: 'VARCHAR(20)', Null: 'NO', Key: '' },
        { Field: 'created_at', Type: 'TIMESTAMP', Null: 'NO', Key: '' },
        { Field: 'expires_at', Type: 'TIMESTAMP', Null: 'NO', Key: '' },
        { Field: 'started_at', Type: 'TIMESTAMP', Null: 'YES', Key: '' },
        { Field: 'ended_at', Type: 'TIMESTAMP', Null: 'YES', Key: '' },
      ],
      room_participants: [
        { Field: 'id', Type: 'VARCHAR(255)', Null: 'NO', Key: 'PRI' },
        { Field: 'room_id', Type: 'VARCHAR(255)', Null: 'NO', Key: '' },
        { Field: 'user_id', Type: 'VARCHAR(255)', Null: 'NO', Key: '' },
        { Field: 'team_number', Type: 'INT', Null: 'YES', Key: '' },
        { Field: 'status', Type: 'VARCHAR(20)', Null: 'NO', Key: '' },
        { Field: 'code', Type: 'LONGTEXT', Null: 'YES', Key: '' },
        { Field: 'joined_at', Type: 'TIMESTAMP', Null: 'NO', Key: '' },
        { Field: 'submitted_at', Type: 'TIMESTAMP', Null: 'YES', Key: '' },
      ],
      match_scores: [
        { Field: 'id', Type: 'VARCHAR(255)', Null: 'NO', Key: 'PRI' },
        { Field: 'room_id', Type: 'VARCHAR(255)', Null: 'NO', Key: '' },
        { Field: 'user_id', Type: 'VARCHAR(255)', Null: 'NO', Key: '' },
        { Field: 'score', Type: 'INT', Null: 'YES', Key: '' },
        { Field: 'test_cases_passed', Type: 'INT', Null: 'YES', Key: '' },
        { Field: 'test_cases_total', Type: 'INT', Null: 'YES', Key: '' },
      ],
    };

    return tableSchemas[tableName] || [];
  }
}

const mockDb = new MockDatabase();

// Add some sample test users (passwords are hashed with bcryptjs)
// Note: These are sample data for development only
mockDb.tables.user_profiles.push({
  id: 'user_demo_001',
  email: 'demo@codearea.com',
  username: 'demouser',
  password_hash: '$2a$10$MgeilCIeYNMa/XXcQ7DKLu1hOw8mvVSCIbtD4M5I8rY9Uq2c37gjC', // Password: CodeArena123!
  elo: 1200,
  tier: 'Silver',
  total_matches: 5,
  wins: 3,
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demouser',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

// Add some sample problems
mockDb.tables.problems.push({
  id: 'two-sum',
  title: 'Two Sum',
  description: 'Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.',
  difficulty: 'Easy',
  tags: ['array', 'hash-table'],
  examples: [{ input: '[2,7,11,15], 9', output: '[0,1]' }],
  constraints: '[2, 10^5]',
  test_cases: [],
  created_at: new Date().toISOString(),
});

mockDb.tables.problems.push({
  id: 'median-of-two-sorted',
  title: 'Median of Two Sorted Arrays',
  description: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.',
  difficulty: 'Hard',
  tags: ['array', 'binary-search', 'divide-and-conquer'],
  examples: [],
  constraints: '[0, 10^6]',
  test_cases: [],
  created_at: new Date().toISOString(),
});

export default mockDb;
