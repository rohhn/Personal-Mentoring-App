import express from "express";
import * as adminData from "../data/admin.js";
import * as helper from "../helpers.js";
import { extractProfileImage } from "../helpers/common.js";
import { fileUpload } from "../middleware/common.js";
import bcrypt from "bcrypt";
import { adminOnly } from "../middleware/users.js";
import { admin } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";


const router = express.Router();

router
    .route("/signup")
    .get((req, res) => {
        try {
            res.render("admin/admin-signup", {
                pageTitle: "Admin Sign-Up",
            });
        } catch (e) {
            res.status(500).render("error", {
                errorTitle: "Internal Server Error",
                errorMessage: "Unable to load the admin signup page. Please try again later.",
            });
        }
    })
    .post(fileUpload.any(), async (req, res) => {
        let { first_name, last_name, email, password, dob, summary } = req.body;
        let profile_image = extractProfileImage(req);

        try {
            let hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS));

            let newAdmin = await adminData.createAdmin(
                first_name,
                last_name,
                email,
                hashedPassword,
                {
                    profile_image,
                    dob,
                    summary,
                }
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
                errorMessage: e || "Unable to complete sign-up. Please try again.",
            });
        }
    });

router
    .route("/login")
    .get((req, res) => {
        try {
            res.render("admin/admin-login", {
                pageTitle: "Admin Login",
            });
        } catch (e) {
            console.error("Error rendering admin login page:", e);
            res.status(500).render("error", {
                errorTitle: "Internal Server Error",
                errorMessage: "Unable to load the admin login page. Please try again later.",
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
            let comparePwd = await bcrypt.compare(
                password,
                admin.passHash
            );
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
                firstName: admin.firstName,
                lastName: admin.lastName,
                email: admin.email,
                profileImage: admin.profile_image,
                summary: admin.summary
            });
        } catch (e) {
            console.error("Error loading admin dashboard:", e);
            res.status(500).render("error", {
                errorTitle: "Internal Server Error",
                errorMessage: "Unable to load the admin dashboard. Please try again later.",
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
            let comparePwd = await bcrypt.compare(
                password,
                admin.pwd_hash
            );
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
            let admin = await adminData.getAdminById(req.session.admin._id);

            res.render("admin/edit-dashboard", {
                pageTitle: "Edit Admin Profile",
                admin,
            });
        } catch (e) {
            console.error("Error loading admin edit page:", e);
            res.status(500).render("error", {
                errorTitle: "Internal Server Error",
                errorMessage: "Unable to load the admin edit page. Please try again later.",
            });
        }
    })
    .patch(async (req, res) => {
        try {
            if (!req.session || !req.session.admin || !req.session.admin._id) {
                return res.redirect("/admin/login");
            }
    
            let adminId = req.session.admin._id;
            let { firstName, lastName, password, summary } = req.body;
    
            let updates = {
                firstName: firstName?.trim(),
                lastName: lastName?.trim(),
                summary: summary?.trim(),
            };
    
            if (password && password.trim().length > 0) {
                updates.pwd_hash = await bcrypt.hash(password.trim(), parseInt(process.env.SALT_ROUNDS));
            }
    
            let profile_image = extractProfileImage(req);
            if (profile_image) {
                updates.profile_image = profile_image;
            }
    
            let updatedAdmin = await adminData.updateAdmin(adminId, updates);
    
            req.session.admin = updatedAdmin;
    
            res.redirect("/admin/dashboard");
        } catch (e) {
            console.error("Error updating admin:", e);
            res.status(400).render("admin/edit-dashboard", {
                pageTitle: "Edit Admin Profile",
                admin: req.body,
                errorMessage: e.message || "Unable to update admin details. Please try again.",
            });
        }
    });


export { router as adminRoutes };
