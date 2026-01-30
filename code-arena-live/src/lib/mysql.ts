import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: import.meta.env.VITE_MYSQL_HOST || 'localhost',
  user: import.meta.env.VITE_MYSQL_USER || 'root',
  password: import.meta.env.VITE_MYSQL_PASSWORD || '',
  database: import.meta.env.VITE_MYSQL_DATABASE || 'codeverse',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const mysql_db = pool;

// Database connection test
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('MySQL Database connection failed:', error);
    return false;
  }
};

// User authentication
export const authenticateUser = async (email: string, passwordHash: string) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM user_profiles WHERE email = ? AND password_hash = ?',
      [email, passwordHash]
    );
    return rows && rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
};

// Get user profile
export const getUserProfile = async (userId: string) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM user_profiles WHERE id = ?',
      [userId]
    );
    return rows && rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Create user
export const createUser = async (userData: any) => {
  try {
    const { id, email, username, password_hash, elo = 1200, tier = 'Bronze' } = userData;
    
    const query = `
      INSERT INTO user_profiles (id, email, username, password_hash, elo, tier, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    
    await pool.query(query, [id, email, username, password_hash, elo, tier]);
    return { success: true, userId: id };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error };
  }
};

// Get battle
export const getBattle = async (battleId: string) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM battles WHERE id = ?',
      [battleId]
    );
    return rows && rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error fetching battle:', error);
    return null;
  }
};

// Create battle
export const createBattle = async (battleData: any) => {
  try {
    const { id, player1_id, player2_id, problem_id } = battleData;
    
    const query = `
      INSERT INTO battles (id, player1_id, player2_id, problem_id, status, created_at)
      VALUES (?, ?, ?, ?, 'active', NOW())
    `;
    
    await pool.query(query, [id, player1_id, player2_id, problem_id]);
    return { success: true, battleId: id };
  } catch (error) {
    console.error('Error creating battle:', error);
    return { success: false, error };
  }
};

// Get problem
export const getProblem = async (problemId: string) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM problems WHERE id = ?',
      [problemId]
    );
    return rows && rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error fetching problem:', error);
    return null;
  }
};

// Create submission
export const createSubmission = async (submissionData: any) => {
  try {
    const { id, user_id, battle_id, problem_id, code, language, verdict } = submissionData;
    
    const query = `
      INSERT INTO submissions (id, user_id, battle_id, problem_id, code, language, verdict, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    await pool.query(query, [id, user_id, battle_id, problem_id, code, language, verdict]);
    return { success: true, submissionId: id };
  } catch (error) {
    console.error('Error creating submission:', error);
    return { success: false, error };
  }
};

// Get user battles
export const getUserBattles = async (userId: string) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM battles WHERE player1_id = ? OR player2_id = ? ORDER BY created_at DESC LIMIT 10`,
      [userId, userId]
    );
    return rows || [];
  } catch (error) {
    console.error('Error fetching battles:', error);
    return [];
  }
};

// Search for opponents
export const findOpponents = async (userId: string, userElo: number) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM user_profiles 
       WHERE id != ? 
       AND elo BETWEEN ? AND ? 
       LIMIT 5`,
      [userId, userElo - 200, userElo + 200]
    );
    return rows || [];
  } catch (error) {
    console.error('Error finding opponents:', error);
    return [];
  }
};

// Update user ELO
export const updateUserElo = async (userId: string, eloChange: number) => {
  try {
    const query = `
      UPDATE user_profiles 
      SET elo = elo + ? 
      WHERE id = ?
    `;
    
    await pool.query(query, [eloChange, userId]);
    return { success: true };
  } catch (error) {
    console.error('Error updating ELO:', error);
    return { success: false, error };
  }
};

// Get leaderboard
export const getLeaderboard = async (limit = 100) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, username, elo, tier, total_matches, wins 
       FROM user_profiles 
       ORDER BY elo DESC 
       LIMIT ?`,
      [limit]
    );
    return rows || [];
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
};
