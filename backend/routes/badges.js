import express from 'express';
import { badgesData } from '../data/index.js';

const router = express.Router();

router.post('/awardBadge', async (req, res) => {
    const { userId, userType } = req.body;
    console.log(req.body)
    if (!userId || !userType) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const result = await badgesData.awardBadgeBasedOnSessions(userId, userType);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/getUserBadges/:userType/:userId', async (req, res) => {
    const { userId, userType } = req.params;
    console.log(req.params)
    if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing userId' });
    }
    if (!userType || (userType !== 'mentor' && userType !== 'mentee')) {
        return res.status(400).json({ error: 'Invalid userType, must be "mentor" or "mentee"' });
    }

    try {
        const badges = await badgesData.getUserBadges(userId, userType);
        res.status(200).json(badges);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

export { router as badgesRoutes };
