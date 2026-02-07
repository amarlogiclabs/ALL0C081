import express from 'express';
import multer from 'multer';
import path from 'path';
import { authMiddleware } from '../middleware/auth.js';
import { userServiceClient } from '../clients/userServiceClient.js';
import { query } from '../db/index.js';

const router = express.Router();

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${req.userId}-${Date.now()}${path.extname(file.originalname)}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const types = /jpeg|jpg|png|gif/;
    const extName = types.test(path.extname(file.originalname).toLowerCase());
    const mimeType = types.test(file.mimetype);
    if (extName && mimeType) cb(null, true);
    else cb(new Error('Only images are allowed'));
  }
});

/**
 * POST /api/users/profile-image
 * Upload profile image
 */
router.post('/profile-image', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // Construct URL (assuming server is serving /uploads)
    const protocol = req.protocol;
    const host = req.get('host');
    const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    // Update local DB
    await query(`UPDATE user_profiles SET avatar = ? WHERE id = ?`, [imageUrl, req.userId]);

    // Try to update centralized user service as well if possible (optional)
    try {
      // userServiceClient.update(req.userId, { avatar: imageUrl }) 
      // Ignoring failure here as local DB is source of truth for UI
    } catch (e) { }

    res.json({
      success: true,
      message: 'Profile image updated',
      avatar: imageUrl
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

/**
 * GET /api/users/analytics
 * Get current user analytics
 */
router.get('/analytics', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    // 1. Get detailed profile
    const rows = await query(`SELECT * FROM user_profiles WHERE id = ?`, [userId]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    const user = rows[0];

    // 2. Get Match History (last 20)
    // We join from room_participants to include matches that were started but not necessarily finished
    const history = await query(`
        SELECT 
          m.id as match_id,
          m.match_type, 
          m.status as match_status,
          m.created_at, 
          mr.old_elo,
          mr.new_elo, 
          mr.elo_change,
          mr.result,
          q.title as problem_title,
          COALESCE(u2.username, (
            SELECT u3.username FROM room_participants rp2 
            JOIN user_profiles u3 ON rp2.user_id = u3.id
            WHERE rp2.room_id = m.id AND rp2.user_id != ? LIMIT 1
          )) as opponent_name
        FROM room_participants rp
        JOIN match_rooms m ON rp.room_id = m.id
        LEFT JOIN match_results mr ON m.id = mr.match_id AND rp.user_id = mr.user_id
        LEFT JOIN coding_questions q ON m.problem_id = q.id
        LEFT JOIN user_profiles u2 ON mr.opponent_id = u2.id
        WHERE rp.user_id = ?
        ORDER BY m.created_at DESC
        LIMIT 20
     `, [userId, userId]);

    // 2.1 Get Elo History for Chart (last 50 for better trend)
    const eloHistory = await query(`
      SELECT new_elo as elo, created_at as date
      FROM match_results
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `, [userId]);

    // 3. Get Aptitude History
    const aptitudeHistory = await query(`
      SELECT category_id as categoryId, category_title as categoryTitle, score, total, percentage, DATE_FORMAT(created_at, '%b %d, %Y') as date
      FROM user_aptitude_results
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `, [userId]);

    // 4. Calculate Stats
    const totalMatches = user.total_matches || 0;
    const wins = user.wins || 0;
    const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : 0;

    // 5. Next Tier Logic
    const tiers = [
      { name: 'Nebula', limit: 1000 },
      { name: 'Nova', limit: 1200 },
      { name: 'Stellar', limit: 1400 },
      { name: 'Luminary', limit: 1600 },
      { name: 'Cosmic', limit: 1800 },
      { name: 'Galactic', limit: 2000 },
      { name: 'Celestia', limit: 2400 },
      { name: 'Universal', limit: 9999 }
    ];

    let currentTierIdx = tiers.findIndex(t => t.limit > user.elo);
    if (currentTierIdx === -1) currentTierIdx = tiers.length - 1;

    const nextTier = tiers[currentTierIdx + 1] || null;
    const targetElo = tiers[currentTierIdx] ? tiers[currentTierIdx].limit : 9999;
    const prevLimit = currentTierIdx > 0 ? tiers[currentTierIdx - 1].limit : 0;

    const pointsToNext = targetElo - user.elo;
    const progress = ((user.elo - prevLimit) / (targetElo - prevLimit)) * 100;

    res.json({
      success: true,
      analytics: {
        eloHistory: eloHistory.reverse(), // Reverse for chronological plotting (LTR)
        recentMatches: history,
        aptitudeHistory, // Added real aptitude history
        stats: {
          winRate,
          totalMatches,
          wins,
          currentStreak: 0
        },
        progression: {
          currentTier: user.tier,
          nextTier: nextTier?.name || 'Max',
          pointsToNext,
          progress: Math.min(100, Math.max(0, progress))
        },
        achievements: [] // Removed hardcoded achievements
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// ... existing routes ...

/**
 * GET /api/users/leaderboard - Get leaderboard
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await query(
      `SELECT id, username, elo, tier, wins, total_matches, avatar 
       FROM user_profiles 
       ORDER BY elo DESC 
       LIMIT 50`
    );
    res.json({
      success: true,
      data: users,
      message: 'Leaderboard retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve leaderboard'
    });
  }
});

/**
 * GET /api/users - Get all users
 */
router.get('/', async (req, res) => {
  try {
    const users = await userServiceClient.getAllUsers();
    res.json({
      success: true,
      data: users,
      message: 'Users retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve users'
    });
  }
});

/**
 * GET /api/users/:id - Get user by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await userServiceClient.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user'
    });
  }
});

/**
 * GET /api/users/email/:email - Get user by email
 */
router.get('/email/:email', async (req, res) => {
  try {
    const user = await userServiceClient.getUserByEmail(req.params.email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error getting user by email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user'
    });
  }
});

/**
 * GET /api/users/username/:username - Get user by username
 */
router.get('/username/:username', async (req, res) => {
  try {
    const user = await userServiceClient.getUserByUsername(req.params.username);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error getting user by username:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user'
    });
  }
});

/**
 * POST /api/users - Create user
 */
router.post('/', async (req, res) => {
  try {
    const { id, email, username, passwordHash, elo, tier, avatar } = req.body;

    if (!email || !username || !passwordHash) {
      return res.status(400).json({
        success: false,
        error: 'Email, username, and password hash are required'
      });
    }

    const userData = {
      id,
      email,
      username,
      passwordHash,
      elo: elo || 1000,
      tier: tier || 'Bronze',
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
    };

    const user = await userServiceClient.createUser(userData);
    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create user'
    });
  }
});

/**
 * PUT /api/users/:id - Update user
 */
router.put('/:id', async (req, res) => {
  try {
    const user = await userServiceClient.updateUser(req.params.id, req.body);
    res.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
});

/**
 * DELETE /api/users/:id - Delete user
 */
router.delete('/:id', async (req, res) => {
  try {
    await userServiceClient.deleteUser(req.params.id);
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
});

export default router;
