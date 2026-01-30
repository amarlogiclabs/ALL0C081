import express from 'express';
import { signup, signin, getUser } from '../services/auth.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Validation
    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Email, password, and username are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    const result = await signup(email, password, username);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Auto sign in after signup
    const signInResult = await signin(email, password);
    
    if (!signInResult.success) {
      return res.status(400).json({ error: signInResult.error });
    }

    res.status(201).json({
      success: true,
      token: signInResult.token,
      user: signInResult.user,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Sign in
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await signin(email, password);

    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }

    res.json({
      success: true,
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Signin failed' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await getUser(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
