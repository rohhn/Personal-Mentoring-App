import express from "express";
import { ObjectId } from "mongodb";
import { mentors, subject_areas } from "../config/mongoCollections.js";
import { badgesData, mentorData, subjectData } from "../data/index.js";
import {
    checkArrayOfStrings,
    checkBoolean,
    checkDate,
    checkEducation,
    checkEmail,
    checkExperience,
    checkStringParams,
} from "../helpers.js";
import { fileUpload } from "../middleware/common.js";
import { extractProfileImage } from "../helpers/common.js";
import xss from "xss";
import { privateRouteMiddleware } from "../middleware/root.js";
import { allowMentorsOnly } from "../middleware/users.js";

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
        let queryParams = req.query;

        let mentorId = xss(req.params.mentorId.trim());

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
            const { sessionCount, badge } =
                await badgesData.awardBadgeBasedOnSessions(
                    mentorId,
                    mentor.userType
                );
            // set custom flag for isOwner for edit profile tag
            let isOwner = false;
            if (req.session.user) {
                isOwner = req.session.user.userId === mentor._id;
            }

            if (queryParams.api) {
                return res.json(mentor);
            } else {
                return res.render("users/mentors/profile", {
                    pageTitle: `${mentor.first_name}'s Profile`,
                    headerOptions: req.headerOptions,
                    profileInfo: mentor,
                    latestBadge: badge,
                    isOwner,
                });
            }
        } catch (error) {
            let statusCode = 400;
            let errorMessage = error.message;

            if (error.name === "NotFound") {
                statusCode = 404;
            } else {
                console.log(error);
                errorMessage = "Mentor not found!";
            }

            if (queryParams.api) {
                return res.status(statusCode).json({ error: errorMessage });
            } else {
                return res.redirect("/dashboard");
            }
        }
    })
    .delete(privateRouteMiddleware, async (req, res) => {
        let mentorId = xss(req.params.mentorId.trim());

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
    .put(privateRouteMiddleware, fileUpload.any(), async (req, res) => {
        let mentorId = xss(req.params.mentorId.trim());

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

        updatedMentor.first_name = xss(updatedMentor.first_name);
        updatedMentor.last_name = xss(updatedMentor.last_name);
        updatedMentor.email = xss(updatedMentor.email);
        updatedMentor.summary = xss(updatedMentor.summary);
        updatedMentor.education = xss(updatedMentor.education);
        updatedMentor.experience = xss(updatedMentor.experience);
        updatedMentor.subject_areas = xss(updatedMentor.subject_areas);
        updatedMentor.first_name = xss(updatedMentor.first_name);

        try {
            checkStringParams(updatedMentor.first_name, "firstname");
            checkStringParams(updatedMentor.last_name, "lastname");
            checkEmail(updatedMentor.email, "mentor");
            // checkStringParams(updatedMentor.profile_image, "profile image");
            checkStringParams(updatedMentor.summary, "summary");
            updatedMentor.education = JSON.parse(updatedMentor.education);
            updatedMentor.education = checkEducation(updatedMentor.education);
            updatedMentor.experience = JSON.parse(updatedMentor.experience);
            updatedMentor.experience = checkExperience(
                updatedMentor.experience
            );
            updatedMentor.subject_areas = JSON.parse(
                updatedMentor.subject_areas
            );
            updatedMentor.subject_areas = checkArrayOfStrings(
                updatedMentor.subject_areas
            );
        } catch (e) {
            console.log(e);
            return res.status(400).json({ error: e });
        }

        // console.log(updatedMentor);

        let profileImageBase64 = extractProfileImage(req);

        try {
            let mentorCreate = await mentorData.updateMentor(
                mentorId,
                updatedMentor.first_name,
                updatedMentor.last_name,
                profileImageBase64,
                updatedMentor.summary,
                updatedMentor.email,
                updatedMentor.education,
                updatedMentor.experience,
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
    .get(allowMentorsOnly, async (req, res) => {
        const mentorId = xss(req.params.mentorId);

        if (req.session.user.userId != mentorId) {
            return res.redirect("/dashboard");
        }

        const mentorInfo = await mentorData.getMentorById(mentorId);
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
            userId: mentorId,
            availability: mentorInfo.availability || [],
        });
    })
    .post(allowMentorsOnly, async (req, res) => {
        let mentorId = xss(req.params.mentorId.trim());

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

router.route("/:mentorId/edit").get(allowMentorsOnly, async (req, res) => {
    let mentorId = xss(req.params.mentorId.trim());

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
            isOwner = req.session.user.userId === mentor._id;
        }

        const allSubjectAreas = await subjectData.getAllSubjectAreas();

        res.render("users/mentors/edit-profile", {
            pageTitle: `${mentor.first_name}'s Profile`,
            headerOptions: req.headerOptions,
            profileInfo: mentor,
            allSubjectAreas,
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

router
    .route("/subject/:mentorId")
    .put(allowMentorsOnly, async (req, res) => {
        let mentorId = xss(req.params.mentorId.trim());

        try {
            checkStringParams(mentorId);
            if (!ObjectId.isValid(mentorId)) {
                throw "Invalid object ID.";
            }
        } catch (e) {
            console.log(e);
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
            console.log(e);
            return res.status(404).json({ error: e });
        }

        let subjectId = xss(req.body.subjectId.trim());

        try {
            checkStringParams(subjectId);

            if (!ObjectId.isValid(subjectId.trim())) {
                throw "Invalid object ID.";
            }
        } catch (e) {
            console.log(e);
            return res.status(400).json({ error: e });
        }

        subjectId = subjectId.trim();

        try {
            const subjectAreasCollection = await subject_areas();

            const subject = await subjectAreasCollection.findOne({
                _id: new ObjectId(subjectId),
            });
            // console.log(subject);
            if (!subject) {
                throw `Subject area with the id ${subjectId} does not exist.`;
            }
        } catch (e) {
            console.log(e);
            return res.status(404).json({ error: e });
        }

        try {
            let updateSubject = await mentorData.updateSubjectAreaToMentor(
                mentorId,
                subjectId
            );
            return res.status(200).json({ success: true });
        } catch (e) {
            console.log(e);
            return res.status(500).json({ error: e });
        }
    })
    .delete(allowMentorsOnly, async (req, res) => {
        let mentorId = xss(req.params.mentorId.trim());

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

        let subjectId = xss(req.body.subjectId.trim());

        try {
            checkStringParams(subjectId);

            if (!ObjectId.isValid(subjectId.trim())) {
                throw "Invalid object ID.";
            }
        } catch (e) {
            return res.status(400).json({ error: e });
        }

        subjectId = subjectId.trim();

        try {
            const subjectAreasCollection = await subject_areas();

            const subject = await subjectAreasCollection.findOne({
                _id: new ObjectId(subjectId),
            });
            // console.log(subject);
            if (!subject) {
                throw `Subject area with the id ${subjectId} does not exist.`;
            }
        } catch (e) {
            console.log(e);
            return res.status(404).json({ error: e });
        }

        try {
            let updateSubject = await mentorData.removeSubjectAreaFromMentor(
                mentorId,
                subjectId
            );
            return res.status(200).json({ success: true });
        } catch (e) {
            return res.status(500).json({ error: e });
        }
    });

router.route("/rating/search").get(async (req, res) => {
    let average_rating = xss(req.body.averageRating);

    // try{
    //     if(isNaN(average_rating) || average_rating.trim() !== ''){
    //         throw `Invalid input for average_rating`;
    //     }
    // }catch(e){
    //     return res.status(400).json({ error: e });
    // }

    // average_rating = parseFloat(average_rating);

    try {
        let mentorsByRating = await mentorData.getMentorsAboveRating(
            average_rating
        );
        return mentorsByRating;
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: e });
    }
});

export { router as mentorRoutes };
