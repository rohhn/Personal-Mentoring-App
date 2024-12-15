import express from "express";
import { ObjectId } from "mongodb";
import { mentees } from "../config/mongoCollections.js";
import { badgesData, menteeData } from "../data/index.js";
import {
    checkArrayOfStrings,
    checkDate,
    checkEmail,
    checkStringParams
} from "../helpers.js";
import { extractProfileImage } from "../helpers/common.js";
import { fileUpload } from "../middleware/common.js";

const router = express.Router();

router
    .route("/")
    .get(async (req, res) => {
        try {
            let mentees = await menteeData.getAllMentees();
            return res.status(200).json(mentees);
        } catch (e) {
            return res.status(500).json({ e });
        }
    })
    .post(async (req, res) => {
        const newMentee = req.body;

        try {
            checkStringParams(newMentee.first_name);
            checkStringParams(newMentee.last_name);
            checkDate(newMentee.dob);
            await checkEmail(newMentee.email, "mentee");
            checkStringParams(newMentee.pwd_hash);
            checkStringParams(newMentee.parent_email);
            checkStringParams(newMentee.profile_image);
            checkStringParams(newMentee.summary);
            newMentee.skills = checkArrayOfStrings(newMentee.skills);
        } catch (e) {
            return res.status(400).json({ error: e });
        }

        try {
            let menteeCreate = await menteeData.createMentee(
                newMentee.first_name,
                newMentee.last_name,
                newMentee.dob,
                newMentee.email,
                newMentee.pwd_hash,
                newMentee.parent_email,
                newMentee.profile_image,
                newMentee.created_at,
                newMentee.summary,
                newMentee.skills
            );

            return res.status(200).json(menteeCreate);
        } catch (e) {
            return res.status(500).json({ error: e });
        }
    });

router
    .route("/:menteeId")
    .get(async (req, res) => {
        let menteeId = req.params.menteeId.trim();

        try {
            checkStringParams(menteeId);
            if (!ObjectId.isValid(menteeId)) {
                const errorObj = new Error("Invalid ID.");
                errorObj.statusCode = 400;
                throw errorObj;
            }

            let mentee = await menteeData
                .getMenteeById(menteeId)
                .catch((error) => {
                    console.log(error);
                    const errorObj = new Error("User not found!");
                    errorObj.statusCode = 404;
                    throw errorObj;
                });

            mentee.userType = "mentee";

            const { sessionCount, badge } = await badgesData.awardBadgeBasedOnSessions(menteeId,mentee.userType);
            console.log(badge)
            // set custom flag for isOwner for edit profile tag
            let isOwner = false;
            if (req.session.user) {
                isOwner = req.session.user.userId === mentee._id;
            }
            res.render("users/mentees/profile", {
                pageTitle: `${mentee.first_name}'s Profile`,
                headerOptions: req.headerOptions,
                profileInfo: mentee,
                latestBadge: badge,
                isOwner,
            });
        } catch (error) {
            let statusCode = error.statusCode || 400;
            let errorMessage = error.message || "Something went wrong!";

            console.error(errorMessage);

            res.status(statusCode).redirect("/dashboard");
        }
    })
    .delete(async (req, res) => {
        let menteeId = req.params.menteeId.trim();

        try {
            checkStringParams(menteeId);
            if (!ObjectId.isValid(menteeId)) {
                throw "Invalid object ID.";
            }
        } catch (e) {
            return res.status(400).json({ error: e });
        }

        menteeId = menteeId.trim();

        try {
            const menteeCollection = await mentees();

            const mentor = await menteeCollection.findOne({
                _id: new ObjectId(menteeId),
            });

            if (!mentor) {
                throw `Mentor with the id ${menteeId} does not exist.`;
            }
        } catch (e) {
            return res.status(404).json({ error: e });
        }
        try {
            let mentee = await menteeData.removeMentee(menteeId);
            return res.status(200).json({ _id: menteeId, deleted: "true" });
        } catch (e) {
            return res.status(404).json({ error: e });
        }
    })
    .put(fileUpload.any(), async (req, res) => {
        try {
            const menteeId = req.params.menteeId.trim();
            if (!menteeId) throw new Error("Mentee ID is required.");

            if (req.session.user.userId !== menteeId) {
                errObj = new Error("Forbidden!");
                errorObj.statusCode = 403;
                throw errObj;
            }

            const {
                first_name,
                last_name,
                dob,
                email,
                parent_email,
                summary,
                skills,
            } = req.body;
            // const dob = formatDate(req.body.dob);

            if (!first_name || !last_name || !email) {
                errorObj = new Error(
                    "First name, last name, and email are required."
                );
                errorObj.statusCode = 400;
            }

            let skillsArray = [];
            if (skills) {
                if (typeof skills === "string") {
                    skillsArray = JSON.parse(skills);
                } else if (Array.isArray(skills)) {
                    skillsArray = skills;
                } else {
                    errorObj = new Error(
                        "Invalid format for skills. Must be a string or an array of strings."
                    );
                    errObj.statusCode = 400;
                }
            }

            let profileImageBase64 = extractProfileImage(req);

            const updatedMentee = await menteeData.updateMentee(
                menteeId,
                first_name,
                last_name,
                dob,
                email,
                parent_email || null,
                profileImageBase64,
                summary || null,
                skillsArray
            );

            return res.status(200).json({ success: true });
        } catch (error) {
            console.error(error);
            const statusCode = error.statusCode || 400;
            return res
                .status(statusCode)
                .json({ success: false, error: error.message });
        }
    });

router.route("/:menteeId/edit").get(async (req, res) => {
    let menteeId = req.params.menteeId.trim();

    if (req.session.user.userId !== menteeId) {
        res.redirect("/dashboard");
    }

    try {
        checkStringParams(menteeId);
        if (!ObjectId.isValid(menteeId)) {
            const errorObj = new Error("Invalid ID.");
            errorObj.name = "InvalidID";
            throw errorObj;
        }

        let mentee = await menteeData.getMenteeById(menteeId).catch((error) => {
            console.log(error);
            const errorObj = new Error("User not found!");
            errorObj.name = "NotFound";
            throw errorObj;
        });

        mentee.userType = "mentee";
        // mentee.dob = moment(mentee.dob).format();

        // set custom flag for isOwner for edit profile tag
        let isOwner = false;
        if (req.session.user) {
            isOwner = req.session.user.userId === mentee._id;
        }

        res.render("users/mentees/edit-profile", {
            pageTitle: `${mentee.first_name}'s Profile`,
            headerOptions: req.headerOptions,
            profileInfo: mentee,
            isOwner,
        });
    } catch (error) {
        let statusCode = 400;
        let errorMessage = error.message;

        if (error.name === "NotFound") {
            statusCode = 404;
        } else {
            console.log(error);
            errorMessage = "User not found!";
        }

        res.redirect("/dashboard");
    }
});

export { router as menteeRoutes };
