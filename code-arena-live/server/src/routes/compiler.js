
import express from 'express';
import { executeCode, judgeSubmission } from '../services/compiler.js';
import { authMiddleware } from '../middleware/auth.js';
import { execSync } from 'child_process';

const router = express.Router();

// Compiler version cache
let compilerVersions = null;

/**
 * GET /api/compiler/info
 * Get available compilers and their versions
 */
router.get('/info', async (req, res) => {
    if (!compilerVersions) {
        compilerVersions = {};
        const checks = [
            { name: 'python', cmd: 'python --version', parse: (s) => s.replace('Python ', '') },
            { name: 'java', cmd: 'java -version 2>&1', parse: (s) => s.match(/version "([^"]+)"/)?.[1] || s },
            { name: 'javascript', cmd: 'node --version', parse: (s) => 'Node.js ' + s },
            { name: 'c', cmd: 'gcc --version', parse: (s) => 'GCC ' + (s.split('\n')[0]?.match(/\d+\.\d+\.\d+/)?.[0] || 'N/A') },
            { name: 'cpp', cmd: 'g++ --version', parse: (s) => 'G++ ' + (s.split('\n')[0]?.match(/\d+\.\d+\.\d+/)?.[0] || 'N/A') }
        ];

        for (const check of checks) {
            try {
                const output = execSync(check.cmd, { encoding: 'utf8', timeout: 5000, stdio: 'pipe' }).trim();
                compilerVersions[check.name] = { available: true, version: check.parse(output) };
            } catch (e) {
                compilerVersions[check.name] = { available: false, version: 'Not installed' };
            }
        }
    }

    res.json({
        useLocal: process.env.USE_LOCAL_COMPILER === 'true',
        compilers: compilerVersions
    });
});

/**
 * POST /api/compiler/run
 * Run code against provided input (Ephemeral)
 */
router.post('/run', authMiddleware, async (req, res) => {
    try {
        const { code, language, input } = req.body;

        console.log('[Compiler] /run request:', { code: code?.slice(0, 50), language });

        if (!code || !language) {
            console.warn('[Compiler] Missing code or language');
            return res.status(400).json({ error: 'Code and language are required' });
        }

        const result = await executeCode(code, language, input || '');
        console.log('[Compiler] /run success:', result);
        res.json(result);
    } catch (error) {
        console.error('[Compiler] /run error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

/**
 * POST /api/compiler/submit
 * Submit code for a problem (Persistent)
 */
router.post('/submit', authMiddleware, async (req, res) => {
    try {
        const { code, language, problemId } = req.body;
        const userId = req.userId; // string from auth middleware

        if (!code || !language || !problemId) {
            return res.status(400).json({ error: 'Code, language, and problemId are required' });
        }

        const result = await judgeSubmission(userId, problemId, code, language);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
