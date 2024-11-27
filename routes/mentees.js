import express from "express";
import { ObjectId } from "mongodb";
import multer from "multer";
import { mentees } from "../config/mongoCollections.js";
import { menteeData } from "../data/index.js";
import {
    checkArrayOfStrings,
    checkDate,
    checkEmail,
    checkStringParams,
    formatDate,
} from "../helpers.js";
const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(
                new Error(
                    "Unsupported file format. Please upload JPEG or PNG images."
                )
            );
        }
        cb(null, true);
    },
});

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
                errorObj.name = "InvalidID";
                throw errorObj;
            }

            let mentee = await menteeData
                .getMenteeById(menteeId)
                .catch((error) => {
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
    .put(upload.any(), async (req, res) => {
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

            let profileImageBase64 = null;
            if (Array.isArray(req.files) && req.files.length == 1) {
                const profileImgFile = req.files[0];
                // data:image/[format]; base64,

                if (profileImgFile.fieldname == "profile_image") {
                    profileImageBase64 = `data:${
                        profileImgFile.mimetype
                    }; base64,${profileImgFile.buffer.toString("base64")}`;
                }
            }

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
