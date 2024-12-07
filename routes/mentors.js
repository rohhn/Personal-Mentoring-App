import express from "express";
import { ObjectId } from "mongodb";
import { mentors } from "../config/mongoCollections.js";
import {
    checkArrayOfStrings,
    checkBoolean,
    checkDate,
    checkEducation,
    checkExperience,
    checkStringParams,
    checkEmail,
    validateAvailability,
} from "../helpers.js";
import { mentorData } from "../data/index.js";

const router = express.Router();

router
    .route("/")
    .get(async (req, res) => {
        try {
            let mentors = await mentorData.getAllMentors();
            return res.status(200).json(mentors);
        } catch (e) {
            // console.log(e);
            return res.status(500).json({ e });
        }
    })
    .post(async (req, res) => {
        const newMentor = req.body;

        try {
            checkStringParams(newMentor.first_name);
            checkStringParams(newMentor.last_name);
            checkDate(newMentor.dob);
            await checkEmail(newMentor.email, "mentor");
            checkStringParams(newMentor.pwd_hash);
            checkStringParams(newMentor.profile_image);
            checkStringParams(newMentor.summary);
            checkBoolean(newMentor.approved);
            newMentor.education = checkEducation(newMentor.education);
            newMentor.experience = checkExperience(newMentor.experience);
            newMentor.subject_areas = checkArrayOfStrings(
                newMentor.subject_areas
            );
        } catch (e) {
            console.log(e);
            return res.status(400).json({ error: e });
        }
        try {
            let mentorCreate = await mentorData.createMentor(
                newMentor.first_name,
                newMentor.last_name,
                newMentor.dob,
                newMentor.email,
                newMentor.pwd_hash,
                newMentor.profile_image,
                newMentor.summary,
                newMentor.education,
                newMentor.experience,
                newMentor.availability,
                newMentor.approved,
                newMentor.subject_areas
            );

            return res.status(200).json(mentorCreate);
        } catch (e) {
            console.log(e);
            return res.status(500).json({ error: e });
        }
    });

router
    .route("/:mentorId")
    .get(async (req, res) => {
        let mentorId = req.params.mentorId.trim();

        try {
            checkStringParams(mentorId);
            if (!ObjectId.isValid(mentorId)) {
                const errorObj = new Error("Invalid ID.");
                errorObj.name = "InvalidID";
                throw errorObj;
            }

            let mentor = await mentorData
                .getMentorById(mentorId)
                .catch((error) => {
                    console.log(error);
                    const errorObj = new Error("Mentor not found!");
                    errorObj.name = "NotFound";
                    throw errorObj;
                });

            mentor.userType = "mentor";

            // set custom flag for isOwner for edit profile tag
            let isOwner = false;
            if (req.session.user) {
                isOwner = req.session.user.userId === mentor._id;
            }
            res.render("users/mentors/profile", {
                pageTitle: `${mentor.first_name}'s Profile`,
                headerOptions: req.headerOptions,
                profileInfo: mentor,
                isOwner,
            });
        } catch (error) {
            let statusCode = 400;
            let errorMessage = error.message;

            if (error.name === "NotFound") {
                statusCode = 404;
            } else {
                console.log(error);
                errorMessage = "Mentor not found!";
            }

            res.redirect("/dashboard");
        }
    })
    .delete(async (req, res) => {
        let mentorId = req.params.mentorId.trim();

        try {
            checkStringParams(mentorId);
            if (!ObjectId.isValid(mentorId)) {
                throw "Invalid object ID.";
            }
        } catch (e) {
            return res.status(400).json({ error: e });
        }

        mentorId = mentorId.trim();

        try {
            const mentorCollection = await mentors();

            const mentor = await mentorCollection.findOne({
                _id: new ObjectId(mentorId),
            });

            if (!mentor) {
                throw `Mentor with the id ${mentorId} does not exist.`;
            }
        } catch (e) {
            return res.status(404).json({ error: e });
        }

        try {
            let mentor = await mentorData.removeMentor(mentorId);
            return res.status(200).json({ _id: mentorId, deleted: "true" });
        } catch (e) {
            // console.log(e);
            return res.status(404).json({ error: e });
        }
    })
    .put(async (req, res) => {
        let mentorId = req.params.mentorId.trim();

        try {
            checkStringParams(mentorId);
            if (!ObjectId.isValid(mentorId)) {
                throw "Invalid object ID.";
            }
        } catch (e) {
            return res.status(400).json({ error: e });
        }

        mentorId = mentorId.trim();

        try {
            const mentorCollection = await mentors();

            const mentor = await mentorCollection.findOne({
                _id: new ObjectId(mentorId),
            });

            if (!mentor) {
                throw `Mentor with the id ${mentorId} does not exist.`;
            }
        } catch (e) {
            return res.status(404).json({ error: e });
        }

        const updatedMentor = req.body;

        try {
            checkStringParams(updatedMentor.first_name);
            checkStringParams(updatedMentor.last_name);
            checkDate(updatedMentor.dob);
            await checkEmail(updatedMentor.email, "mentor");
            checkStringParams(updatedMentor.pwd_hash);
            checkStringParams(updatedMentor.profile_image);
            checkStringParams(updatedMentor.summary);
            checkBoolean(updatedMentor.approved);
            updatedMentor.education = checkEducation(updatedMentor.education);
            updatedMentor.experience = checkExperience(
                updatedMentor.experience
            );
            updatedMentor.subject_areas = checkArrayOfStrings(
                updatedMentor.subject_areas
            );
            // updatedMentor.availability = checkAvailability(updatedMentor.availability);
        } catch (e) {
            // console.log(e);
            return res.status(400).json({ error: e });
        }

        try {
            let mentorCreate = await mentorData.updateMentor(
                mentorId,
                updatedMentor.first_name,
                updatedMentor.last_name,
                updatedMentor.dob,
                updatedMentor.pwd_hash,
                updatedMentor.profile_image,
                updatedMentor.summary,
                updatedMentor.education,
                updatedMentor.experience,
                updatedMentor.availability,
                updatedMentor.approved,
                updatedMentor.subject_areas
            );

            return res.status(200).json(mentorCreate);
        } catch (e) {
            console.log(e);
            return res.status(500).json({ error: e });
        }
    });

router
    .route("/availability/:mentorId")
    .get(async (req, res) => {
        const mentorId = req.params.mentorId;

        if (req.session.user.userId != mentorId) {
            return res.redirect("/dashboard");
        }

        // TODO: Get existing availability and pass it on
        const dayofWeek = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ];

        return res.render("users/mentors/manage-availability", {
            dayofWeek,
            headerOptions: req.headerOptions,
        });
    })
    .post(async (req, res) => {
        let mentorId = req.params.mentorId.trim();

        try {
            checkStringParams(mentorId);
            if (!ObjectId.isValid(mentorId)) {
                throw "Invalid object ID.";
            }
        } catch (e) {
            return res.status(400).json({ error: e });
        }

        mentorId = mentorId.trim();

        try {
            const mentorCollection = await mentors();

            const mentor = await mentorCollection.findOne({
                _id: new ObjectId(mentorId),
            });

            if (!mentor) {
                throw `Mentor with the id ${mentorId} does not exist.`;
            }
        } catch (e) {
            return res.status(404).json({ error: e });
        }

        let availability = req.body;

        try {
            availability = validateAvailability(availability);
        } catch (e) {
            return res.status(400).json({ error: e });
        }
        try {
            let avail = await mentorData.toAddAvailability(
                mentorId,
                availability.av
            );
            return res.status(200).json(avail);
        } catch (e) {
            console.log(e);
            return res.status(500).json({ error: e });
        }
    });

router.route("/:mentorId/edit").get(async (req, res) => {
    let mentorId = req.params.mentorId.trim();

    if (req.session.user.userId !== mentorId) {
        res.redirect("/dashboard");
    }

    try {
        checkStringParams(mentorId);
        if (!ObjectId.isValid(mentorId)) {
            const errorObj = new Error("Invalid ID.");
            errorObj.name = "InvalidID";
            throw errorObj;
        }

        let mentor = await mentorData.getMentorById(mentorId).catch((error) => {
            console.log(error);
            const errorObj = new Error("User not found!");
            errorObj.name = "NotFound";
            throw errorObj;
        });

        mentor.userType = "mentor";

        // set custom flag for isOwner for edit profile tag
        let isOwner = false;
        if (req.session.user) {
            isOwner = req.session.user.userId === mentor._id;       }

        res.render("users/mentors/edit-profile", {
            pageTitle: `${mentor.first_name}'s Profile`,
            headerOptions: req.headerOptions,
            profileInfo: mentor,
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

export { router as mentorRoutes };
