import express from "express";
import { badgesData } from "../data/index.js";
import xss from "xss";

const router = express.Router();

router.post("/awardBadge", async (req, res) => {
    let { userId, userType } = req.body;
    userId = xss(userId);
    userType = xss(userType);
    if (!userId || !userType) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const result = await badgesData.awardBadgeBasedOnSessions(
            userId,
            userType
        );
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/getUserBadges/:userType/:userId", async (req, res) => {
    let { userId, userType } = req.params;
    userId = xss(userId);
    userType = xss(userType);
    if (!userId || typeof userId !== "string") {
        return res.status(400).json({ error: "Invalid or missing userId" });
    }
    if (!userType || (userType !== "mentor" && userType !== "mentee")) {
        return res
            .status(400)
            .json({ error: 'Invalid userType, must be "mentor" or "mentee"' });
    }

    try {
        const badges = await badgesData.getUserBadges(userId, userType);
        res.status(200).json(badges);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

export { router as badgesRoutes };
