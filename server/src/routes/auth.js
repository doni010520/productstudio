import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).max(100).required()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

// Register
router.post('/register', async (req, res, next) => {
    try {
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        const { email, password, name } = value;

        // Check if user exists
        const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            throw new AppError('Email already registered', 409);
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user with trial credits (e.g., 3 free generations for 7 days)
        const trialCredits = 3;
        const trialDays = 7;
        const trialExpiresAt = new Date();
        trialExpiresAt.setDate(trialExpiresAt.getDate() + trialDays);

        const result = await query(
            `INSERT INTO users (email, password_hash, name, credits, trial_used, trial_expires_at) 
             VALUES ($1, $2, $3, $4, TRUE, $5) 
             RETURNING id, email, name, credits, trial_expires_at`,
            [email, passwordHash, name, trialCredits, trialExpiresAt]
        );

        const user = result.rows[0];

        // Log trial credit transaction
        await query(
            `INSERT INTO credit_transactions (user_id, amount, transaction_type, description)
             VALUES ($1, $2, 'trial', 'Trial credits')`,
            [user.id, trialCredits]
        );

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                credits: user.credits,
                trialExpiresAt: user.trial_expires_at
            }
        });
    } catch (err) {
        next(err);
    }
});

// Login
router.post('/login', async (req, res, next) => {
    try {
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        const { email, password } = value;

        // Get user
        const result = await query(
            'SELECT id, email, password_hash, name, credits, trial_expires_at FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            throw new AppError('Invalid credentials', 401);
        }

        const user = result.rows[0];

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            throw new AppError('Invalid credentials', 401);
        }

        // Check if trial expired and remove expired credits
        if (user.trial_expires_at && new Date() > new Date(user.trial_expires_at)) {
            await query(
                'UPDATE users SET credits = 0 WHERE id = $1 AND credits > 0',
                [user.id]
            );
            user.credits = 0;
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                credits: user.credits,
                trialExpiresAt: user.trial_expires_at
            }
        });
    } catch (err) {
        next(err);
    }
});

export default router;
