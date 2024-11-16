import express from 'express';
import { awardBadgeBasedOnSessions, getUserBadges } from '../data/badges.js';

const router = express.Router();

// Route to award badges based on session counts
router.post('/awardBadge', async (req, res) => {
    const { userId, userType } = req.body;

    // Input validation
    if (!userId || !userType) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const result = await awardBadgeBasedOnSessions(userId, userType);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to get a user's badges
router.get('/getUserBadges/:userType/:userId', async (req, res) => {
    const { userId, userType } = req.params;

    // Input validation
    if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing userId' });
    }
    if (!userType || (userType !== 'mentor' && userType !== 'mentee')) {
        return res.status(400).json({ error: 'Invalid userType, must be "mentor" or "mentee"' });
    }

    try {
        const badges = await getUserBadges(userId, userType);
        res.status(200).json(badges);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

export { router as badgesRoutes };
