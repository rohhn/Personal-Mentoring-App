// Import the express router as shown in the lecture code

import express from 'express';
import { ratingData } from '../data/index.js';

const router = express.Router();

router.post('/addRating', async (req, res) => {
  const { userId, rating, userType } = req.body;
  
  try {
    const result = await ratingData.addRating(userId, rating, userType);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getUserRatings/:userType/:userId', async (req, res) => {
  const { userId, userType } = req.params;
  try {
    const userRatings = await ratingData.getUserRatings(userId, userType);
    res.json(userRatings);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

export { router as ratingsRoutes };
