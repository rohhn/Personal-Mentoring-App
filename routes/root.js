import express from "express";
import bcrypt from "bcrypt";
import { mentorData } from "../data/index.js";
import { menteeData } from "../data/index.js";

const router = express.Router();

router.route("/").get(async (req, res) => {
    const mentorsList = await mentorData.getAllMentors();

    res.render("landing/landing-page", {
        pageTitle: "Personal Mentoring App",
        headerOptions: req.headerOptions,
        mentors: mentorsList,
    });
});

router
    .route("/login")
    .get(async (req, res) => {
        res.render("users/login-page", {
            pageTitle: "Login",
            headerOptions: req.headerOptions,
        });
    })
    .post(async (req, res) => {
        const userType = req.body.user_type;
        const email = req.body.email;
        const password = req.body.password;

        try {
            if (userType === "mentee") {
                console.log("Logging in as mentee");

                const userData = await menteeData.getMenteeByEmail(email).catch((error) => {
                    console.log(error);
                    const errorObj = new Error("Incorrect E-mail or password.");
                    errorObj.name = "Unauthorized";
                    throw errorObj;
                });

                const comparePwd = await bcrypt.compare(password, userData.pwd_hash);

                if (comparePwd) {
                    req.session.user = {
                        email,
                        userId: userData._id,
                        userType,
                    };
                } else {
                    const errorObj = new Error("Incorrect E-mail or password.");
                    errorObj.name = "Unauthorized";
                    throw errorObj;
                }
            } else if (userType == "mentor") {
                console.log("Logging in as mentor");

                const userData = await mentorData.getMentorByEmail(email).catch((error) => {
                    console.log(error);
                    const errorObj = new Error("Incorrect E-mail or password.");
                    errorObj.name = "Unauthorized";
                    throw errorObj;
                });

                const comparePwd = await bcrypt.compare(password, userData.pwd_hash);

                if (comparePwd) {
                    req.session.user = {
                        email,
                        userId: userData._id,
                        userType,
                    };
                } else {
                    const errorObj = new Error("Incorrect E-mail or password.");
                    errorObj.name = "Unauthorized";
                    throw errorObj;
                }
            } else {
                const errorObj = new Error("Please select one of mentee/mentor.");
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

            res.status(statusCode).render("users/login-page", {
                pageTitle: "Login",
                headerOptions: req.headerOptions,
                error: errorMessage,
            });
        }
    });

router
    .route("/signup")
    .get(async (req, res) => {
        res.render("users/signup-page", {
            pageTitle: "Sign Up",
            headerOptions: req.headerOptions,
        });
    })
    .post(async (req, res) => {
        const firstName = req.body.first_name;
        const lastName = req.body.last_name;
        const userType = req.body.user_type;
        const email = req.body.email;
        const dob = req.body.dob;
        const password = req.body.password;

        try {
            const pwdHash = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS));

            if (userType === "mentee") {
                console.log("Creating mentee");

                const parentEmail = req.body.parentEmail || null;

                const createdUser = await menteeData.createMentee(
                    firstName,
                    lastName,
                    dob,
                    email,
                    pwdHash,
                    parentEmail
                );

                req.session.user = {
                    email,
                    userId: createdUser._id,
                    userType,
                };
            } else if (userType == "mentor") {
                console.log("Creating mentor");
                const createdUser = await mentorData.createMentor(firstName, lastName, dob, email, pwdHash);
                req.session.user = {
                    email,
                    userId: createdUser._id,
                    userType,
                };
            } else {
                const errorObj = new Error("Please select one of mentee/mentor.");
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

            res.status(statusCode).render("users/signup-page", {
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
    console.log("dashboard - ", req.session.user);

    const userType = req.session.user.userType;
    const userId = req.session.user.userId;

    try {
        let userData = {};
        if (userType === "mentee") {
            console.log("mentee dashboard");

            userData = await menteeData.getMenteeById(userId).catch((error) => {
                console.log(error);
                const errorObj = new Error(error);
                errorObj.name = "ServerError";
                throw errorObj;
            });
        } else if (userType == "mentor") {
            console.log("mentor dashboard");
            userData = await mentorData.getMentorById(userId).catch((error) => {
                console.log(error);
                const errorObj = new Error(error);
                errorObj.name = "ServerError";
                throw errorObj;
            });
        } else {
            res.status(500).redirect("/");
        }

        res.render("users/dashboard", {
            pageTitle: "Dashboard",
            headerOptions: req.headerOptions,
            userData,
        });
    } catch (error) {}
});
export { router as rootRoutes };
