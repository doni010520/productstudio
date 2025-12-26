import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res, next) => {
    try {
        const result = await query(
            `SELECT id, email, name, credits, trial_used, trial_expires_at, created_at 
             FROM users WHERE id = $1`,
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            throw new AppError('User not found', 404);
        }

        const user = result.rows[0];

        // Check if trial expired
        if (user.trial_expires_at && new Date() > new Date(user.trial_expires_at) && user.credits > 0) {
            await query('UPDATE users SET credits = 0 WHERE id = $1', [user.id]);
            user.credits = 0;
        }

        res.json({ user });
    } catch (err) {
        next(err);
    }
});

// Get user generation history
router.get('/history', authenticateToken, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const result = await query(
            `SELECT g.id, g.original_image_url, g.generated_image_url, 
                    g.style_preset, g.custom_prompt, g.cost_credits, 
                    g.status, g.created_at, s.name as style_name
             FROM generations g
             LEFT JOIN style_presets s ON g.style_preset = s.slug
             WHERE g.user_id = $1
             ORDER BY g.created_at DESC
             LIMIT $2 OFFSET $3`,
            [req.user.userId, limit, offset]
        );

        const countResult = await query(
            'SELECT COUNT(*) FROM generations WHERE user_id = $1',
            [req.user.userId]
        );

        res.json({
            generations: result.rows,
            pagination: {
                page,
                limit,
                total: parseInt(countResult.rows[0].count),
                totalPages: Math.ceil(countResult.rows[0].count / limit)
            }
        });
    } catch (err) {
        next(err);
    }
});

// Get credit transaction history
router.get('/credits/history', authenticateToken, async (req, res, next) => {
    try {
        const result = await query(
            `SELECT id, amount, transaction_type, description, created_at
             FROM credit_transactions
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT 50`,
            [req.user.userId]
        );

        res.json({ transactions: result.rows });
    } catch (err) {
        next(err);
    }
});

// Add credits (for admin or payment integration)
router.post('/credits/add', authenticateToken, async (req, res, next) => {
    try {
        const { amount, description } = req.body;

        if (!amount || amount <= 0) {
            throw new AppError('Invalid amount', 400);
        }

        // Update user credits
        const result = await query(
            'UPDATE users SET credits = credits + $1 WHERE id = $2 RETURNING credits',
            [amount, req.user.userId]
        );

        // Log transaction
        await query(
            `INSERT INTO credit_transactions (user_id, amount, transaction_type, description)
             VALUES ($1, $2, 'purchase', $3)`,
            [req.user.userId, amount, description || 'Credits purchased']
        );

        res.json({
            message: 'Credits added successfully',
            newBalance: result.rows[0].credits
        });
    } catch (err) {
        next(err);
    }
});

export default router;
