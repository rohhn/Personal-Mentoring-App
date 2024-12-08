import express from "express";
import * as postData from "../data/posts.js";
import * as repliesData from "../data/replies.js";

const router = express.Router();

router
    .route("/:subject_id")
    .get(async (req, res) => {
        if (!req.session || !req.session.user) {
            return res.redirect('/login');
        }
        try {
            let forum = await postData.getForums(req.params.subject_id);
            res.render("forum/forum", {
                subject_id: req.params.subject_id,
                title: forum.title,
                posts: forum.posts || [],
            });
        } catch (e) {
            res.status(500).render("error", {
                errorTitle: "Internal Server Error",
                errorMessage: e.message || "Something went wrong while fetching the forum.",
            });
        }
    })

    .post(async (req, res) => {
        let { title, content, authorName } = req.body;

        if (!req.session || !req.session.user) {
            return res.redirect('/login');
        }

        if (!title || !content || !authorName) {
            return res.status(400).render("error", {
                errorTitle: "Bad Request",
                errorMessage: "Missing required fields: title, content, or authorName.",
            });
        }

        title = title.trim();
        content = content.trim();
        authorName = authorName.trim();

        try {
            const newPost = await postData.makePost(
                req.params.subject_id,
                req.session.user.userId,
                authorName,
                title,
                content,
            );

            let forum = await postData.getForums(req.params.subject_id);

            res.render("forum/forum", {
                subject_id: req.params.subject_id,
                authorName: forum.authorName,
                title: forum.title,
                posts: forum.posts || [],
            });
        } catch (e) {
            res.status(e.code === 11000 ? 409 : 500).render("error", {
                errorTitle: e.code === 11000 ? "Duplicate Key Error" : "Internal Server Error",
                errorMessage: e.message || "An error occurred while creating the post.",
            });
        }
    });


router
    .route("/:subject_id/:post_id")
    .get(async (req, res) => {
        if (!req.session || !req.session.user) {
            return res.redirect('/login');
        }
        try {
            let post = await postData.getPost(req.params.post_id);
            res.render("forum/post", {
                subject_id: req.params.subject_id,
                post_id: post._id,
                title: post.title,
                content: post.content,
                author: post.author,
            });
        } catch (e) {
            res.status(404).render("error", {
                errorTitle: "Post Not Found",
                errorMessage: e.message || "The requested post could not be found.",
            });
        }
    })
    .patch(async (req, res) => {
        let { updatedContent, updatedTitle } = req.body;

        if (!req.session || !req.session.user) {
            return res.status(401).render("error", {
                errorTitle: "Unauthorized",
                errorMessage: "You must be logged in to edit a post.",
            });
        }

        if (!updatedContent && !updatedTitle) {
            return res.status(400).render("error", {
                errorTitle: "Bad Request",
                errorMessage: "Missing required fields: updatedContent or updatedTitle.",
            });
        }

        try {
            const updatedPost = await postData.editPost(
                req.params.post_id,
                req.session.user.userId,
                updatedContent,
                updatedTitle
            );

            res.redirect(`/forum/${req.params.subject_id}`);
        } catch (e) {
            if (e == "Error: Unauthorized action. You cannot edit this post.") {
                return res.status(403).render("error", {
                    errorTitle: "Unauthorized",
                    errorMessage: e.message,
                });
            } else if (e == "Error: Forum or post not found.") {
                return res.status(404).render("error", {
                    errorTitle: "Not Found",
                    errorMessage: e.message,
                });
            } else {
                console.error("Unhandled error:", e.message || e);
                return res.status(500).render("error", {
                    errorTitle: "Internal Server Error",
                    errorMessage: "Something went wrong. Please try again later.",
                });
            }
        }

    })

    .delete(async (req, res) => {
        if (!req.session || !req.session.user) {
            return res.status(401).render("error", {
                errorTitle: "Unauthorized",
                errorMessage: "You must be logged in to delete a post.",
            });
        }

        try {
            const result = await postData.deletePost(
                req.params.subject_id,
                req.params.post_id,
                req.session.user.userId
            );

            res.redirect(`/forum/${req.params.subject_id}`);
        } catch (e) {
            if (e == "Error: Unauthorized action. You cannot delete this post.") {
                return res.status(403).render("error", {
                    errorTitle: "Unauthorized",
                    errorMessage: e.message,
                });
            } else if (e == "Error: Forum or post not found.") {
                return res.status(404).render("error", {
                    errorTitle: "Not Found",
                    errorMessage: e.message,
                });
            } else {
                console.error("Unhandled error:", e.message || e);
                return res.status(500).render("error", {
                    errorTitle: "Internal Server Error",
                    errorMessage: "Something went wrong. Please try again later.",
                });
            }
        }
    });

router
    .route("/:subject_id/:post_id/reply")
    .get(async (req, res) => {
        if (!req.session || !req.session.user) {
            return res.redirect('/login');
        }
        try {
            let post = await postData.getPost(req.params.post_id);

            res.render("forum/makeReply", {
                subject_id: req.params.subject_id,
                post_id: req.params.post_id,
                postTitle: post.title,
                authorName: req.session.user.userName || "",
            });
        } catch (e) {
            res.status(404).render("error", {
                errorTitle: "Post Not Found",
                errorMessage: e.message || "The requested post could not be found.",
            });
        }
    })
    .post(async (req, res) => {
        if (!req.session || !req.session.user) {
            return res.redirect('/login');
        }
        let { authorName, content } = req.body;

        if (!authorName || !content) {
            return res.status(400).render("error", {
                errorTitle: "Bad Request",
                errorMessage: "Missing required fields: authorName or content.",
            });
        }

        try {
            const newReply = await repliesData.makeReply(
                req.params.post_id,
                req.session.user.userId,
                content
            );
            res.redirect(`/forum/${req.params.subject_id}`);
        }
        catch (e) {
            res.status(500).render("error", {
                errorTitle: "Internal Server Error",
                errorMessage: e.message || "An error occurred while creating the reply.",
            });
        }
    })

router
    .route("/:subject_id/:post_id/:reply_id/edit")
    .get(async (req, res) => {

        try {
            const reply = await repliesData.getReply(
                req.params.post_id,
                req.params.reply_id
            );

            res.render("forum/editReply", {
                subject_id: req.params.subject_id,
                post_id: req.params.post_id,
                reply_id: req.params.reply_id,
                authorName: reply.authorName,
                content: reply.content,
            });
        } catch (e) {
            res.status(404).render("error", {
                errorTitle: "Reply Not Found",
                errorMessage: e.message || "The requested reply could not be found.",
            });
        }
    })

    .patch(async (req, res) => {
        if (!req.session || !req.session.user) {
            return res.redirect('/login');
        }

        let { updatedContent } = req.body;

        if (!updatedContent || updatedContent.trim().length === 0) {
            return res.status(400).render("error", {
                errorTitle: "Bad Request",
                errorMessage: "Missing or invalid content for the reply.",
            });
        }


        try {
            let updatedReply = await repliesData.editReply(
                req.params.post_id,
                req.params.reply_id,
                req.session.user.userId,
                updatedContent
            );

            res.redirect(`/forum/${req.params.subject_id}`);
        } catch (e) {
            if (e.message.includes("Unauthorized")) {
                res.status(403).render("error", {
                    errorTitle: "Unauthorized",
                    errorMessage: e.message,
                });
            } else if (e.message.includes("not found")) {
                res.status(404).render("error", {
                    errorTitle: "Reply Not Found",
                    errorMessage: e.message,
                });
            } else if (e.message.includes("Could not edit reply")) {
                res.status(404).render("error", {
                    errorTitle: "Reply Not Found",
                    errorMessage: "Unable to locate or edit the reply.",
                });
            } else {
                res.status(500).render("error", {
                    errorTitle: "Internal Server Error",
                    errorMessage: "An error occurred while updating the reply.",
                });
            }
        }
    });



router
    .route("/:subject_id/:post_id/:reply_id")
    .delete(async (req, res) => {
        if (!req.session || !req.session.user) {
            return res.status(401).render("error", {
                errorTitle: "Unauthorized",
                errorMessage: "You must be logged in to delete a reply.",
            });
        }

        try {
            let result = await repliesData.deleteReply(
                req.params.post_id,
                req.params.reply_id,
                req.session.user.userId
            );

            if (!result) {
                console.log("Reply not found or unauthorized.");
                return res.status(404).render("error", {
                    errorTitle: "Reply Not Found",
                    errorMessage: "Unable to locate or delete the reply.",
                });
            }

            console.log("Reply deleted successfully. Redirecting to forum:", req.params.subject_id);
            res.redirect(`/forum/${req.params.subject_id}`);
        } catch (e) {
            console.error("Error deleting reply:", e.message || e);

            if (e.message.includes("not authorized")) {
                res.status(403).render("error", {
                    errorTitle: "Unauthorized",
                    errorMessage: e.message,
                });
            } else if (e.message.includes("does not exist") || e.message.includes("not found")) {
                res.status(404).render("error", {
                    errorTitle: "Reply Not Found",
                    errorMessage: e.message,
                });
            } else {
                res.status(500).render("error", {
                    errorTitle: "Internal Server Error",
                    errorMessage: "An error occurred while deleting the reply.",
                });
            }
        }
    });


export { router as postRoutes };
