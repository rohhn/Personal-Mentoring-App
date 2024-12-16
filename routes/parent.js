import express from "express";
import { parentsSessionData } from "../data/parent.js";
import { privateRouteMiddleware } from "../middleware/root.js";

const router = express.Router();
router.post("/Session", privateRouteMiddleware, async (req, res) => {
    const { mentorId, menteeId, subjectArea, time, duration, meetingLink } =
        req.body;
    if (
        !mentorId ||
        !menteeId ||
        !subjectArea ||
        !time ||
        !duration ||
        !meetingLink
    ) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    try {
        const session = await parentsSessionData(
            mentorId,
            menteeId,
            subjectArea,
            time,
            duration,
            meetingLink
        );
        res.status(200).json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export { router as parentEmailRoutes };
