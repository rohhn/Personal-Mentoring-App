import express from "express";
import * as adminData from "../data/admin.js";
import * as helper from "../helpers.js";
import { extractProfileImage } from "../helpers/common.js";
import { fileUpload } from "../middleware/common.js";
import bcrypt from "bcrypt";
import { adminOnly } from "../middleware/users.js";
import { admin } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import * as applicationData from "../data/applications.js";
import { file } from "googleapis/build/src/apis/file/index.js";

const router = express.Router();

router
    .route("/signup")
    .get((req, res) => {
        try {
            res.render("admin/admin-signup", {
                pageTitle: "Admin Sign-Up",
                headerOptions: req.headerOptions,
            });
        } catch (e) {
            res.status(500).render("error", {
                errorTitle: "Internal Server Error",
                errorMessage:
                    "Unable to load the admin signup page. Please try again later.",
                headerOptions: req.headerOptions,
            });
        }
    })
    .post(async (req, res) => {
        let { first_name, last_name, email, password } = req.body;

        try {
            let hashedPassword = await bcrypt.hash(
                password,
                parseInt(process.env.SALT_ROUNDS)
            );

            let newAdmin = await adminData.createAdmin(
                first_name,
                last_name,
                email,
                hashedPassword
            );

            req.session.admin = {
                email: newAdmin.email,
                adminId: newAdmin._id,
            };

            res.redirect("/admin/dashboard");
        } catch (e) {
            console.error("Error during admin sign-up:", e);
            res.status(400).render("error", {
                pageTitle: "Admin Sign-Up",
                headerOptions: req.headerOptions,
                errorMessage:
                    e || "Unable to complete sign-up. Please try again.",
            });
        }
    });

router
    .route("/login")
    .get((req, res) => {
        try {
            res.render("admin/admin-login", {
                pageTitle: "Admin Login",
                headerOptions: req.headerOptions,
            });
        } catch (e) {
            console.error("Error rendering admin login page:", e);
            res.status(500).render("error", {
                errorTitle: "Internal Server Error",
                headerOptions: req.headerOptions,
                errorMessage:
                    "Unable to load the admin login page. Please try again later.",
            });
        }
    })
    .post(async (req, res) => {
        let { email, password } = req.body;

        try {
            let admin = await adminData.getAdminByEmail(email);
            if (!admin) {
                throw new Error("Wrong email or password");
            }
            let comparePwd = await bcrypt.compare(password, admin.passHash);
            if (!comparePwd) {
                throw new Error("Wrong email or password");
            }

            if (admin && comparePwd) {
                req.session.admin = {
                    _id: admin._id.toString(),
                    email: admin.email,
                    isAdmin: admin.isAdmin,
                };
                res.redirect("/admin/dashboard");
            } else {
                throw new Error("Invalid email or password.");
            }
        } catch (e) {
            res.status(401).render("error", {
                pageTitle: "Admin Login",
                headerOptions: req.headerOptions,
                errorMessage: e || "Invalid credentials. Please try again.",
            });
        }
    });

router
    .route("/dashboard")
    .get(async (req, res) => {
        if (!req.session || !req.session.admin) {
            return res.redirect("/admin/login");
        }

        try {
            let admin = await adminData.getAdminById(req.session.admin._id);

            res.render("admin/dashboard", {
                pageTitle: "Admin Dashboard",
                headerOptions: req.headerOptions,
                firstName: admin.firstName,
                lastName: admin.lastName,
                email: admin.email,
                profileImage: admin.profile_image,
                summary: admin.summary,
            });
        } catch (e) {
            console.error("Error loading admin dashboard:", e);
            res.status(500).render("error", {
                errorTitle: "Internal Server Error",
                headerOptions: req.headerOptions,
                errorMessage:
                    "Unable to load the admin dashboard. Please try again later.",
            });
        }
    })

    .post(fileUpload.any(), async (req, res) => {
        let { email, password } = req.body;

        try {
            let admin = await adminData.getAdminByEmail(email);
            if (!admin) {
                throw new Error("Wrong email or password");
            }
            let comparePwd = await bcrypt.compare(password, admin.pwd_hash);
            if (!comparePwd) {
                throw new Error("Wrong email or password");
            }

            if (admin && comparePwd) {
                req.session.admin = admin;
                res.redirect("/admin/dashboard");
            } else {
                throw new Error("Invalid email or password.");
            }
        } catch (e) {
            res.status(401).render("error", {
                pageTitle: "Admin Login",
                headerOptions: req.headerOptions,
                errorMessage: e || "Invalid credentials. Please try again.",
            });
        }
    });

router
    .route("/dashboard/edit")
    .get(async (req, res) => {
        if (!req.session || !req.session.admin) {
            return res.redirect("/admin/login");
        }

        try {
            let adminId = req.session.admin._id;

            const admin = await adminData.getAdminById(adminId);

            res.render("admin/edit-dashboard", {
                pageTitle: "Edit Admin Profile",
                headerOptions: req.headerOptions,
                profileInfo: admin,
            });
        } catch (error) {
            console.error("Error handling admin edit route:", error);

            res.status(500).render("error", {
                errorTitle: "Internal Server Error",
                headerOptions: req.headerOptions,
                errorMessage:
                    "Unable to process your request. Please try again later.",
            });
        }
    })
    .post(async (req, res) => {
        if (!req.session || !req.session.admin) {
            return res.redirect("/admin/login");
        }

        let adminId = req.session.admin._id;

        let { firstName, lastName, password } = req.body;

        let updates = {
            firstName: firstName?.trim(),
            lastName: lastName?.trim(),
        };

        if (password && password.trim().length > 0) {
            updates.pwd_hash = await bcrypt.hash(
                password.trim(),
                parseInt(process.env.SALT_ROUNDS)
            );
        }

        await adminData.updateAdmin(adminId, updates);

        return res.redirect("/admin/dashboard");
    });

router.route("/applications").get(async (req, res) => {
    if (!req.session || !req.session.admin) {
        return res.redirect("/admin/login");
    }

    try {
        let pendingApplications =
            await applicationData.getPendingMentorApplications();
        res.render("admin/applications", {
            pageTitle: "Pending Mentor Applications",
            headerOptions: req.headerOptions,
            applications: pendingApplications,
        });
    } catch (e) {
        console.error("Error fetching applications:", e);
        res.status(500).render("error", {
            errorTitle: "Internal Server Error",
            headerOptions: req.headerOptions,
            errorMessage:
                "Unable to load applications. Please try again later.",
        });
    }
});

router.route("/applications/:id/approve").post(async (req, res) => {
    if (!req.session || !req.session.admin) {
        return res.redirect("/admin/login");
    }

    try {
        let mentorId = req.params.id;
        await applicationData.updateMentorApproval(mentorId, true);
        res.redirect("/admin/applications");
    } catch (e) {
        console.error("Error approving mentor:", e);
        res.status(500).render("error", {
            errorTitle: "Internal Server Error",
            headerOptions: req.headerOptions,
            errorMessage:
                "Unable to approve application. Please try again later.",
        });
    }
});

router.route("/applications/:id/reject").post(async (req, res) => {
    if (!req.session || !req.session.admin) {
        return res.redirect("/admin/login");
    }

    try {
        let mentorId = req.params.id;
        await applicationData.updateMentorApproval(mentorId, false);
        res.redirect("/admin/applications");
    } catch (e) {
        console.error("Error rejecting mentor:", e);
        res.status(500).render("error", {
            errorTitle: "Internal Server Error",
            headerOptions: req.headerOptions,
            errorMessage:
                "Unable to reject application. Please try again later.",
        });
    }
});

export { router as adminRoutes };
