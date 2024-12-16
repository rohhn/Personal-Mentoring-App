import express from "express";

import { ObjectId } from "mongodb";
import { mentees, mentors, sessions } from "../config/mongoCollections.js";
import { checkStringParams, checkTimestamp } from "../helpers.js";

import { mentorData, sessionsData } from "../data/index.js";
import { addMenteeIdtoReq } from "../middleware/sessions.js";
import { privateRouteMiddleware } from "../middleware/root.js";
import { allowMenteesOnly, allowMentorsOnly } from "../middleware/users.js";
import xss from "xss";

const router = express.Router();

router
    .route("/")
    .post(privateRouteMiddleware, addMenteeIdtoReq, async (req, res, next) => {
        let newSession = req.body;

        try {
            checkStringParams(newSession.mentor_id);
            checkStringParams(newSession.mentee_id);
            checkStringParams(newSession.subject_area);
            checkTimestamp(newSession.start_time);
            checkTimestamp(newSession.end_time);

            newSession.mentor_id = xss(newSession.mentor_id.trim());
            newSession.mentee_id = xss(newSession.mentee_id.trim());
            newSession.subject_area = xss(newSession.subject_area.trim());
            newSession.start_time = xss(newSession.start_time.trim());
            newSession.end_time = xss(newSession.end_time.trim());
            // console.log(newSession.start_time);
        } catch (e) {
            console.log(e);
            return res.status(400).json({ error: e });
        }

        try {
            let session = await sessionsData.createSession(
                newSession.mentor_id,
                newSession.mentee_id,
                newSession.subject_area,
                newSession.start_time,
                newSession.end_time
            );
            return res.status(200).json(session);
        } catch (e) {
            console.log(e);
            return res.status(500).json({ error: e });
        }
    });

router.route("/mentee/:menteeId").get(allowMenteesOnly, async (req, res) => {
    let menteeId = xss(req.params.menteeId.trim());

    try {
        checkStringParams(menteeId);

        menteeId = menteeId.trim();

        if (!ObjectId.isValid(menteeId)) {
            throw "Invalid object ID.";
        }
    } catch (e) {
        return res.status(400).json({ error: e });
    }

    menteeId = menteeId.trim();

    try {
        const menteeCollection = await mentees();

        const mentee = await menteeCollection.findOne({
            _id: new ObjectId(menteeId),
        });

        if (!mentee) {
            throw `Mentee with the id ${menteeId} does not exist.`;
        }
        mentee.userType = "mentee";

        let sessionsByMentee = await sessionsData.getSessionsByMentee(
            menteeId,
            "all"
        );
        // return res.status(200).json(sessionsByMentee);
        return res.render("users/mentees/sessions", {
            userData: mentee,
            sessions: sessionsByMentee,
            headerOptions: req.headerOptions,
        });
    } catch (e) {
        // console.log(e);
        return res.status(404).json({ error: e });
    }
});

router.route("/mentor/:mentorId").get(allowMentorsOnly, async (req, res) => {
    let mentorId = xss(req.params.mentorId.trim());

    try {
        checkStringParams(mentorId);

        mentorId = mentorId.trim();

        if (!ObjectId.isValid(mentorId)) {
            throw "Invalid object ID.";
        }
    } catch (e) {
        return res.status(400).json({ error: e });
    }

    try {
        const mentorCollection = await mentors();

        const mentor = await mentorCollection.findOne({
            _id: new ObjectId(mentorId),
        });

        if (!mentor) {
            throw `Mentor with the id ${mentorId} does not exist.`;
        }
        mentor.userType = "mentor";

        let sessionsByMentor = await sessionsData.getSessionsByMentor(
            mentorId,
            "all"
        );
        // return res.status(200).json(sessionsByMentor);
        return res.render("users/mentors/sessions", {
            userData: mentor,
            sessions: sessionsByMentor,
            headerOptions: req.headerOptions,
        });
    } catch (e) {
        // console.log(e);
        return res.status(404).json({ error: e });
    }
});

router
    .route("/:sessionId")
    .put(allowMenteesOnly, async (req, res) => {
        let sessionId = xss(req.params.sessionId.trim());

        try {
            checkStringParams(sessionId);

            sessionId = sessionId.trim();

            if (!ObjectId.isValid(sessionId)) {
                throw "Invalid object ID.";
            }
        } catch (e) {
            return res.status(400).json({ error: e });
        }

        sessionId = sessionId.trim();

        try {
            const sessionCollection = await sessions();

            const session = await sessionCollection.findOne({
                _id: new ObjectId(sessionId),
            });

            if (!session) {
                throw `Session with the id ${sessionId} does not exist.`;
            }
        } catch (e) {
            return res.status(404).json({ error: e });
        }

        let reschedSession = req.body;

        try {
            checkTimestamp(reschedSession.start_time);
            checkTimestamp(reschedSession.end_time);
        } catch (e) {
            return res.status(400).json({ error: e });
        }

        try {
            const session = await sessionsData.rescheduleSession(
                sessionId,
                xss(reschedSession.start_time),
                xss(reschedSession.end_time)
            );
            return res.status(200).json(session);
        } catch (e) {
            // console.log(e);
            return res.status(500).json({ error: e });
        }
    })
    .delete(privateRouteMiddleware, async (req, res) => {
        let sessionId = xss(req.params.sessionId.trim());

        try {
            checkStringParams(sessionId);

            sessionId = sessionId.trim();

            if (!ObjectId.isValid(sessionId)) {
                throw "Invalid object ID.";
            }
        } catch (e) {
            return res.status(400).json({ error: e });
        }

        sessionId = sessionId.trim();

        try {
            const sessionCollection = await sessions();

            const session = await sessionCollection.findOne({
                _id: new ObjectId(sessionId),
            });

            if (!session) {
                throw `Session with the id ${sessionId} does not exist.`;
            }

            const currentTime = new Date();
            const sessionStartTime = new Date(session.start_time);
            const timeDifference = sessionStartTime - currentTime;

            const hoursLeft = timeDifference / (1000 * 60 * 60);

            if (hoursLeft < 24) {
                throw `Cannot delete the session. Only ${hoursLeft.toFixed(
                    1
                )} hours left until the session starts.`;
            }
        } catch (e) {
            return res.status(404).json({ error: e });
        }

        try {
            let session = await sessionsData.deleteSession(sessionId);
            return res.status(200).json({ _id: sessionId, deleted: "true" });
        } catch (e) {
            return res.status(404).json({ error: e });
        }
    })
    .get(privateRouteMiddleware, async (req, res) => {
        let sessionId = xss(req.params.sessionId.trim());

        try {
            checkStringParams(sessionId);

            sessionId = sessionId.trim();

            if (!ObjectId.isValid(sessionId)) {
                throw "Invalid object ID.";
            }
        } catch (e) {
            // console.log(e);
            return res.status(400).json({ error: e });
        }

        sessionId = sessionId.trim();

        try {
            let session = await sessionsData.getSessionById(sessionId);
            return res.status(200).json(session);
        } catch (e) {
            return res.status(404).json({ error: e });
        }
    });

router.route("/booking/list").get(allowMenteesOnly, async (req, res) => {
    // show mentors list

    const mentors = await mentorData.getAllMentors();
    res.render("users/mentees/list-mentors", {
        headerOptions: req.headerOptions,
        mentors,
    });
});

router
    .route("/booking/book/:mentorId")
    .get(allowMenteesOnly, async (req, res) => {
        let mentorId = xss(req.params.mentorId);

        try {
            mentorId = checkStringParams(mentorId);

            if (!ObjectId.isValid(mentorId)) {
                throw "Invalid object ID.";
            }
        } catch (e) {
            // console.log(e);
            return res.status(400).json({ error: e });
        }

        const mentorInfo = await mentorData.getMentorById(mentorId);

        res.render("users/mentees/book-session", {
            headerOptions: req.headerOptions,
            mentorInfo,
        });
    });

export { router as sessionRoutes };
