import express from "express";
import xss from "xss";
import { ratingData } from "../data/index.js";
import { validateRating as isValidRating } from "../helpers.js";
import { privateRouteMiddleware } from "../middleware/root.js";

const router = express.Router();
router.post("/addRating", privateRouteMiddleware, async (req, res) => {
    let { sessionId, userId, rating, review, userType, author } = req.body;
    sessionId = xss(sessionId);
    userId = xss(userId);
    rating = xss(rating);
    review = xss(review);
    userType = xss(userType);
    author = xss(author);
    if (!userId || typeof userId !== "string") {
        return res.status(400).json({ error: "Invalid or missing userId" });
    }
    if (!sessionId || typeof sessionId !== "string") {
        return res.status(400).json({ error: "Invalid or missing sessionId" });
    }
    if (!isValidRating(rating)) {
        return res.status(400).json({
            error: "Invalid rating, it should be a number between 1 and 5",
        });
    }
    if (!userType || (userType !== "mentor" && userType !== "mentee")) {
        return res
            .status(400)
            .json({ error: 'Invalid userType, must be "mentor" or "mentee"' });
    }
    try {
        const result = await ratingData.addReviewAndUpdateRating(
            sessionId,
            userId,
            rating,
            review || "N/A",
            userType,
            author
        );
        console.log(result);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

router.get(
    "/getUserRatings/:userType/:userId/:reviewId",
    privateRouteMiddleware,
    async (req, res) => {
        let { userId, reviewId, userType } = req.params;
        userId = xss(userId);
        reviewId = xss(reviewId);
        userType = xss(userType);

        if (!userId || typeof userId !== "string") {
            return res.status(400).json({ error: "Invalid or missing userId" });
        }
        if (!userType || (userType !== "mentor" && userType !== "mentee")) {
            return res.status(400).json({
                error: 'Invalid userType, must be "mentor" or "mentee"',
            });
        }
        if (!reviewId || typeof reviewId !== "string") {
            return res
                .status(400)
                .json({ error: "Invalid or missing reviewId" });
        }
        try {
            const userRatings = await ratingData.getReviewById(
                userId,
                reviewId,
                userType
            );
            res.status(200).json(userRatings);
        } catch (error) {
            console.error(error);
            res.status(404).json({ error: error.message });
        }
    }
);
router.delete(
    "/deleteReview/:userType/:userId/:reviewId",
    privateRouteMiddleware,
    async (req, res) => {
        let { userId, reviewId, userType } = req.params;
        userId = xss(userId);
        reviewId = xss(reviewId);
        userType = xss(userType);

        if (!userId || typeof userId !== "string") {
            return res.status(400).json({ error: "Invalid or missing userId" });
        }
        if (!reviewId || typeof reviewId !== "string") {
            return res
                .status(400)
                .json({ error: "Invalid or missing reviewId" });
        }
        if (!userType || (userType !== "mentor" && userType !== "mentee")) {
            return res.status(400).json({
                error: 'Invalid userType, must be "mentor" or "mentee"',
            });
        }

        try {
            const result = await ratingData.deleteReviewById(
                userId,
                reviewId,
                userType
            );
            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(404).json({ error: error.message });
        }
    }
);
export { router as ratingsRoutes };
