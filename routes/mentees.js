import express from "express";

import { ObjectId } from "mongodb";
import { mentees } from "../config/mongoCollections.js";
import { checkArrayOfStrings, checkDate, checkStringParams } from "../helpers.js";
import { menteeData, mentorData } from "../data/index.js";
import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import multer from "multer";

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
            checkStringParams(newMentee.email);
            checkStringParams(newMentee.pwd_hash);
            checkStringParams(newMentee.parent_email);
            checkStringParams(newMentee.profile_image);
            checkDate(newMentee.created_at);
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

            res.render("mentees/profile", {
                pageTitle: `${mentee.first_name}'s Profile`,
                headerOptions: req.headerOptions,
                profileInfo: mentee,
                isOwner: req.session.user.userId === mentee._id,
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

            const mentor = await menteeCollection.findOne({ _id: new ObjectId(menteeId) });

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
    .put(multer().none(), async (req, res, next) => {
        //multer().single("profile_image") - middleware for image/file upload

        console.log(req.body);
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

            const updatedMentee = req.body;
            console.dir(req.body, { depth: null });

            checkStringParams(updatedMentee.first_name);
            checkStringParams(updatedMentee.last_name);
            // checkDate(updatedMentee.dob);
            checkStringParams(updatedMentee.email);
            // checkStringParams(updatedMentee.pwd_hash);
            checkStringParams(updatedMentee.parent_email, true);
            // checkStringParams(updatedMentee.profile_image);
            checkStringParams(updatedMentee.summary);
            updatedMentee.skills = checkArrayOfStrings(updatedMentee.skills);
            console.log(updatedMentee.skills);

            // const profileImage = req.file;

            const mentee = await menteeData
                .updateMentee(
                    menteeId,
                    updatedMentee.first_name,
                    updatedMentee.last_name,
                    updatedMentee.dob,
                    updatedMentee.email,
                    updatedMentee.parent_email,
                    // profileImage.buffer,
                    updatedMentee.summary,
                    updatedMentee.skills
                )
                .catch((error) => {
                    console.log(error);
                    const errorObj = new Error("Couldn't update user!");
                    errorObj.name = "ServerError";
                    throw errorObj;
                });

            // res.redirect(303, `/profile/mentee/${menteeId}`);
            return res.status(200).json(true);
        } catch (error) {
            let statusCode = 400;
            let errorMessage = error.message;

            if (error.name === "NotFound") {
                statusCode = 404;
            } else {
                console.log(error);
                errorMessage = "User not found!";
            }

            res.status(statusCode).json(false);
            // res.status(statusCode).redirect(`/profile/mentee/${menteeId}`);
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

        res.render("mentees/edit-profile", {
            pageTitle: `${mentee.first_name}'s Profile`,
            headerOptions: req.headerOptions,
            profileInfo: mentee,
            isOwner: req.session.user.userId === mentee._id,
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
