import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/index.js';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('ERROR: JWT_SECRET environment variable is not set!');
  process.exit(1);
}

// Generate user ID
export const generateUserId = () => {
  return 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// Hash password with bcrypt
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Verify password
export const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Sign up
export const signup = async (email, password, username) => {
  try {
    // Check if user exists
    const existing = await query(
      'SELECT id FROM user_profiles WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existing.length > 0) {
      return { success: false, error: 'Email or username already exists' };
    }

    // Hash password
    const passwordHash = await hashPassword(password);
    const userId = generateUserId();
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

    // Insert user with proper initial values
    await query(
      `INSERT INTO user_profiles (id, email, username, password_hash, avatar, elo, tier, total_matches, wins) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, email, username, passwordHash, avatar, 1000, 'Nova', 0, 0]
    );

    return { success: true, userId, message: 'User created successfully' };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: 'Failed to create user' };
  }
};

// Sign in
export const signin = async (email, password) => {
  try {
    const users = await query(
      'SELECT * FROM user_profiles WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      console.log(`❌ Signin failed: User not found for email '${email}'`);
      return { success: false, error: 'Invalid email or password' };
    }

    const user = users[0];
    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      console.log(`❌ Signin failed: Invalid password for user '${email}'`);
      return { success: false, error: 'Invalid email or password' };
    }

    // Generate JWT token
    const token = generateToken(user.id);

    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        elo: user.elo,
        tier: user.tier,
        avatar: user.avatar,
      },
    };
  } catch (error) {
    console.error('Signin error:', error);
    return { success: false, error: 'Authentication failed' };
  }
};

// Get user by ID
export const getUser = async (userId) => {
  try {
    const users = await query(
      `SELECT id, email, username, elo, tier, total_matches, wins, avatar, created_at 
       FROM user_profiles WHERE id = ?`,
      [userId]
    );

    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

export default {
  generateUserId,
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  signup,
  signin,
  getUser,
};
