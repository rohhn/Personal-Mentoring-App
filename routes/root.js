import bcrypt from "bcrypt";
import express from "express";
import {
    menteeData,
    mentorData,
    sessionsData,
    subjectData,
} from "../data/index.js";
import { checkEmail, checkStringParams, formatDate } from "../helpers.js";
import { isParentEmailRequired } from "../helpers/mentees.js";
import { fileUpload } from "../middleware/common.js";
import { extractProfileImage } from "../helpers/common.js";
import { error } from "console";
import xss from "xss";

const router = express.Router();

router.route("/").get(async (req, res) => {
    const mentorsList = await mentorData.getAllMentors();
    const subjectAreasList = await subjectData.getAllSubjectAreas();
    res.render("landing/landing-page", {
        pageTitle: "Personal Mentoring App",
        headerOptions: req.headerOptions,
        mentors: mentorsList,
        subject_areas: subjectAreasList,
    });
});

router
    .route("/login")
    .get(async (req, res) => {
        res.render("auth/login-page", {
            pageTitle: "Login",
            headerOptions: req.headerOptions,
        });
    })
    .post(async (req, res) => {
        const userType = xss(req.body.user_type);
        const email = xss(req.body.email);
        const password = xss(req.body.password);

        try {
            if (userType === "mentee") {
                console.log("Logging in as mentee");

                const userData = await menteeData
                    .getMenteeByEmail(email)
                    .catch((error) => {
                        console.log(error);
                        const errorObj = new Error(
                            "Incorrect E-mail or password."
                        );
                        errorObj.name = "Unauthorized";
                        throw errorObj;
                    });

                const comparePwd = await bcrypt.compare(
                    password,
                    userData.pwd_hash
                );

                if (comparePwd) {
                    req.session.user = {
                        email,
                        userId: userData._id,
                        userType,
                        userName: userData.first_name,
                    };
                } else {
                    const errorObj = new Error("Incorrect E-mail or password.");
                    errorObj.name = "Unauthorized";
                    throw errorObj;
                }
            } else if (userType == "mentor") {
                console.log("Logging in as mentor");

                const userData = await mentorData
                    .getMentorByEmail(email)
                    .catch((error) => {
                        console.log(error);
                        const errorObj = new Error(
                            "Incorrect E-mail or password."
                        );
                        errorObj.name = "Unauthorized";
                        throw errorObj;
                    });

                const comparePwd = await bcrypt.compare(
                    password,
                    userData.pwd_hash
                );

                if (comparePwd) {
                    req.session.user = {
                        email,
                        userId: userData._id,
                        userType,
                        userName: userData.first_name,
                    };
                } else {
                    const errorObj = new Error("Incorrect E-mail or password.");
                    errorObj.name = "Unauthorized";
                    throw errorObj;
                }
            } else {
                const errorObj = new Error(
                    "Please select one of mentee/mentor."
                );
                errorObj.name = "UserError";
                throw errorObj;
            }

            res.redirect("/dashboard");
        } catch (error) {
            let errorMessage = error.message;
            let statusCode = 500;

            if (error.name === "Unauthorized") {
                statusCode = 401;
            } else if (error.name === "UserError") {
                statusCode = 400;
            } else {
                console.log(error);
                errorMessage = "Unexpected error occurred. Try again.";
            }

            res.status(statusCode).render("auth/login-page", {
                pageTitle: "Login",
                headerOptions: xss(req.headerOptions),
                error: errorMessage,
            });
        }
    });

router
    .route("/signup")
    .get(async (req, res) => {
        res.render("auth/signup-page", {
            pageTitle: "Sign Up",
            headerOptions: req.headerOptions,
        });
    })
    .post(fileUpload.any(), async (req, res) => {
        let {
            first_name,
            last_name,
            user_type,
            summary,
            email,
            dob,
            password,
        } = req.body;

        first_name = xss(first_name);
        last_name = xss(last_name);
        user_type = xss(user_type);
        summary = xss(summary);
        email = xss(email);
        dob = xss(dob);
        password = xss(password);

        try {
            // validations
            try {
                checkStringParams(first_name);
                checkStringParams(last_name);
                checkEmail(email);
                checkStringParams(summary);
                checkStringParams(password); // TODO: replace with password validation
            } catch (error) {
                const errorObj = new Error(error.message || error);
                errorObj.statusCode = 400;
                throw errorObj;
            }

            let profile_image = extractProfileImage(req);

            const pwd_hash = await bcrypt.hash(
                password,
                parseInt(process.env.SALT_ROUNDS)
            );

            // create User
            if (user_type === "mentee") {
                const parent_email = xss(req.body.parent_email) || undefined;

                try {
                    if (isParentEmailRequired(dob)) {
                        checkEmail(parent_email);
                    }
                } catch (error) {
                    const errorObj = new Error(error.message || error);
                    errorObj.statusCode = 400;
                    throw errorObj;
                }

                const createdUser = await menteeData.createMentee(
                    first_name,
                    last_name,
                    dob,
                    email,
                    summary,
                    pwd_hash,
                    {
                        parent_email,
                        profile_image,
                    }
                );

                req.session.user = {
                    email,
                    userId: createdUser._id,
                    userType: user_type,
                };
            } else if (user_type == "mentor") {
                const createdUser = await mentorData.createMentor(
                    first_name,
                    last_name,
                    dob,
                    email,
                    summary,
                    pwd_hash,
                    { profile_image }
                );
                req.session.user = {
                    email,
                    userId: createdUser._id,
                    userType: user_type,
                };
            } else {
                const errorObj = new Error(
                    "Please select one of mentee/mentor."
                );
                errorObj.statusCode = 400;
                throw errorObj;
            }

            // redirect
            res.redirect("/dashboard");
        } catch (error) {
            console.error(error);
            let errorMessage =
                error.message || "Unexpected error occurred. Try again.";
            let statusCode = error.statusCode || 400;

            res.status(statusCode).render("auth/signup-page", {
                pageTitle: "Sign Up",
                headerOptions: req.headerOptions,
                error: errorMessage,
            });
        }
    });

router.route("/logout").get(async (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

router.route("/dashboard").get(async (req, res) => {
    const userType = req.session.user.userType;
    const userId = req.session.user.userId;

    try {
        let userData = {};
        let sessions = {};
        if (userType === "mentee") {
            console.log("mentee dashboard");

            userData = await menteeData.getMenteeById(userId).catch((error) => {
                console.log(error);
                const errorObj = new Error(error);
                errorObj.name = "ServerError";
                throw errorObj;
            });

            sessions = await sessionsData.getSessionsByMentee(
                userId,
                "upcoming"
            );
        } else if (userType == "mentor") {
            console.log("mentor dashboard");
            userData = await mentorData.getMentorById(userId).catch((error) => {
                console.log(error);
                const errorObj = new Error(error);
                errorObj.name = "ServerError";
                throw errorObj;
            });

            sessions = await sessionsData.getSessionsByMentor(
                userId,
                "upcoming"
            );
        } else {
            res.status(500).redirect("/");
        }

        userData.userType = userType;
        console.log(sessions);
        res.render("users/dashboard", {
            pageTitle: "Dashboard",
            headerOptions: req.headerOptions,
            userData,
            sessions,
        });
    } catch (error) {}
});
export { router as rootRoutes };

router.route("/profile/:userType/:userId").get(async (req, res) => {
    const userType = xss(req.params.userType);
    const userId = xss(req.params.userId);

    if (["mentee", "mentor"].includes(userType)) {
        res.redirect(`/${userType}/${userId}`);
    } else {
        res.redirect("/dashboard");
    }
});

router.route("/test").get(async (req, res) => {
    res.render("test");
});
