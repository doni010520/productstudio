import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { AppError } from '../middleware/errorHandler.js';
import aiService from '../services/aiService.js';

const router = express.Router();

// Generate new background for product image
router.post('/', authenticateToken, upload.single('image'), async (req, res, next) => {
    try {
        if (!req.file) {
            throw new AppError('No image file uploaded', 400);
        }

        const { stylePreset, customPrompt } = req.body;

        if (!stylePreset && !customPrompt) {
            throw new AppError('Either stylePreset or customPrompt is required', 400);
        }

        // Get user's current credits
        const userResult = await query(
            'SELECT credits, trial_expires_at FROM users WHERE id = $1',
            [req.user.userId]
        );

        if (userResult.rows.length === 0) {
            throw new AppError('User not found', 404);
        }

        const user = userResult.rows[0];

        // Check if trial expired
        if (user.trial_expires_at && new Date() > new Date(user.trial_expires_at)) {
            await query('UPDATE users SET credits = 0 WHERE id = $1', [req.user.userId]);
            user.credits = 0;
        }

        // Check if user has enough credits
        const costCredits = aiService.estimateCost();
        if (user.credits < costCredits) {
            throw new AppError('Insufficient credits', 402);
        }

        // Create generation record
        const generationResult = await query(
            `INSERT INTO generations (user_id, original_image_url, generated_image_url, 
                                     style_preset, custom_prompt, cost_credits, status)
             VALUES ($1, $2, '', $3, $4, $5, 'processing')
             RETURNING id`,
            [
                req.user.userId,
                `/uploads/${req.file.filename}`,
                stylePreset || null,
                customPrompt || null,
                costCredits
            ]
        );

        const generationId = generationResult.rows[0].id;

        // Build prompt
        let finalPrompt = customPrompt;
        
        if (stylePreset) {
            const styleResult = await query(
                'SELECT prompt_template FROM style_presets WHERE slug = $1',
                [stylePreset]
            );
            
            if (styleResult.rows.length > 0) {
                finalPrompt = styleResult.rows[0].prompt_template;
                
                // If user also provided custom prompt, append it
                if (customPrompt) {
                    finalPrompt = `${finalPrompt}. Additional details: ${customPrompt}`;
                }
            }
        }

        // Process image in background (you might want to use a queue like Bull for production)
        processImageAsync(req.file.path, finalPrompt, generationId, req.user.userId, costCredits);

        res.status(202).json({
            message: 'Generation started',
            generationId,
            status: 'processing'
        });

    } catch (err) {
        next(err);
    }
});

// Get generation status
router.get('/:generationId', authenticateToken, async (req, res, next) => {
    try {
        const result = await query(
            `SELECT id, original_image_url, generated_image_url, style_preset, 
                    custom_prompt, status, error_message, created_at
             FROM generations
             WHERE id = $1 AND user_id = $2`,
            [req.params.generationId, req.user.userId]
        );

        if (result.rows.length === 0) {
            throw new AppError('Generation not found', 404);
        }

        res.json({ generation: result.rows[0] });
    } catch (err) {
        next(err);
    }
});

// Delete a generation
router.delete('/:generationId', authenticateToken, async (req, res, next) => {
    try {
        const result = await query(
            'DELETE FROM generations WHERE id = $1 AND user_id = $2 RETURNING id',
            [req.params.generationId, req.user.userId]
        );

        if (result.rows.length === 0) {
            throw new AppError('Generation not found', 404);
        }

        res.json({ message: 'Generation deleted successfully' });
    } catch (err) {
        next(err);
    }
});

// Async function to process image
async function processImageAsync(imagePath, prompt, generationId, userId, costCredits) {
    try {
        console.log(`Processing generation ${generationId}...`);
        
        // Process the image
        const result = await aiService.processProductImage(imagePath, prompt);

        // Update generation record with result
        await query(
            `UPDATE generations 
             SET generated_image_url = $1, status = 'completed'
             WHERE id = $2`,
            [result.finalUrl, generationId]
        );

        // Deduct credits from user
        await query(
            'UPDATE users SET credits = credits - $1 WHERE id = $2',
            [costCredits, userId]
        );

        // Log credit transaction
        await query(
            `INSERT INTO credit_transactions (user_id, amount, transaction_type, description, generation_id)
             VALUES ($1, $2, 'generation', 'Background generation', $3)`,
            [userId, -costCredits, generationId]
        );

        console.log(`Generation ${generationId} completed successfully`);

    } catch (error) {
        console.error(`Generation ${generationId} failed:`, error);

        // Update generation record with error
        await query(
            `UPDATE generations 
             SET status = 'failed', error_message = $1
             WHERE id = $2`,
            [error.message, generationId]
        );
    }
}

export default router;
