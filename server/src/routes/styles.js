import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// Get all active style presets
router.get('/', async (req, res, next) => {
    try {
        const result = await query(
            `SELECT id, name, slug, category, prompt_template, thumbnail_url, display_order
             FROM style_presets
             WHERE is_active = TRUE
             ORDER BY display_order ASC`,
            []
        );

        // Group by category
        const groupedStyles = result.rows.reduce((acc, style) => {
            if (!acc[style.category]) {
                acc[style.category] = [];
            }
            acc[style.category].push(style);
            return acc;
        }, {});

        res.json({
            styles: result.rows,
            grouped: groupedStyles
        });
    } catch (err) {
        next(err);
    }
});

// Get single style preset
router.get('/:slug', async (req, res, next) => {
    try {
        const result = await query(
            `SELECT id, name, slug, category, prompt_template, thumbnail_url
             FROM style_presets
             WHERE slug = $1 AND is_active = TRUE`,
            [req.params.slug]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Style preset not found' });
        }

        res.json({ style: result.rows[0] });
    } catch (err) {
        next(err);
    }
});

export default router;
