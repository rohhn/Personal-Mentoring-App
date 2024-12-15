import express from "express";
import * as postData from "../data/posts.js";
import * as repliesData from "../data/replies.js";
import * as adminData from "../data/admin.js";
import xss from "xss";
import * as menteeData from "../data/mentees.js";
import * as mentorData from "../data/mentors.js";
import * as subjectData from "../data/subject_areas.js";

const router = express.Router();

router.route("/").get(async (req, res) => {
    const forumsList = await postData.getAllForums();

    return res.render("forum/landing", {
        headerOptions: req.headerOptions,
        pageTitle: "Forums",
        forumsList,
    });
});

router
    .route("/post")
    .get(async (req, res) => {
        const forumsList = await postData.getAllForums();
        res.render("forum/makePost", {
            forums: forumsList,
            headerOptions: req.headerOptions,
        });
    })
    .post(async (req, res) => {
        let { title, content, forum_id } = req.body;

        let userId;
        let userType;
        if (req.session.admin) {
            userId = req.session.admin._id;
            userType = req.session.admin.userType;
        } else if (req.session.user) {
            userId = req.session.user.userId;
            userType = req.session.user.userType;
        }

        let userData;
        if (userType === "mentee") {
            userData = await menteeData.getMenteeById(userId);
        } else if (userType === "mentor") {
            userData = await mentorData.getMentorById(userId);
        } else if (userType === "admin") {
            userData = await adminData.getAdminById(userId);
        } else {
            throw "Not a valid user type";
        }

        if (!title || !content) {
            return res.status(400).render("error", {
                headerOptions: req.headerOptions,
                errorTitle: "Bad Request",
                errorMessage: "Missing required fields: title or content.",
            });
        }

        title = title.trim();
        content = content.trim();

        try {
            const newPost = await postData.makePost(
                forum_id,
                userId,
                userType,
                title,
                content
            );
            return res.json(newPost);
        } catch (e) {
            console.error("Error while creating a post:", e || e);
            if (e.code === 11000) {
                return res.status(409).render("error", {
                    headerOptions: req.headerOptions,
                    errorTitle: "Duplicate Key Error",
                    errorMessage:
                        e || "A post with the same title already exists.",
                });
            } else {
                return res.status(500).render("error", {
                    headerOptions: req.headerOptions,
                    errorTitle: "Internal Server Error",
                    errorMessage:
                        e || "An error occurred while creating the post.",
                });
            }
        }
    });

router.route("/:forum_id").get(async (req, res) => {
    try {
        let forum = await postData.getForums(req.params.forum_id);

        let userId;
        if (req.session.admin) {
            userId = req.session.admin._id;
        } else if (req.session.user) {
            userId = req.session.user.userId;
        }

        for (let index = 0; index < forum.posts.length; index++) {
            forum.posts[index] = await postData.getPost(
                forum.posts[index]._id.toString()
            );

            if (userId === forum.posts[index].author._id) {
                forum.posts[index].isOwner = true;
            } else forum.posts[index].isOwner = false;
        }
        // we don't show replies on this page

        res.render("forum/forum", {
            headerOptions: req.headerOptions,
            forum_id: req.params.forum_id,
            forum_title: forum.title,
            posts: forum.posts || [],
        });
    } catch (e) {
        res.status(500).render("error", {
            headerOptions: req.headerOptions,
            errorTitle: "Internal Server Error",
            errorMessage: e || "Something went wrong while fetching the forum.",
        });
    }
});

router
    .route("/post/:post_id")
    .get(async (req, res) => {
        try {
            let post = await postData.getPost(req.params.post_id);

            let userId;
            if (req.session.admin) {
                userId = req.session.admin._id;
            } else if (req.session.user) {
                userId = req.session.user.userId;
            }

            if (userId === post.author._id) {
                post.isOwner = true;
            } else post.isOwner = false;

            if (post.replies && Array.isArray(post.replies)) {
                for (let index = 0; index < post.replies.length; index++) {
                    // console.log(post.replies[index]);
                    post.replies[index] = await repliesData.getReply(
                        post._id,
                        post.replies[index]._id.toString()
                    );
                    if (userId === post.replies[index].author._id) {
                        post.replies[index].isOwner = true;
                    } else post.replies[index].isOwner = false;
                }
            }

            res.render("forum/post", {
                headerOptions: req.headerOptions,
                post,
            });
        } catch (e) {
            res.status(404).render("error", {
                headerOptions: req.headerOptions,
                errorTitle: "Post Not Found",
                errorMessage: e || "The requested post could not be found.",
            });
        }
    })
    .delete(async (req, res) => {
        // TODO: deletes but throws errors too
        let userId;
        if (req.session.user) {
            userId = xss(req.session.user.userId);
        } else if (req.session.admin) {
            userId = req.session.admin._id;
        }

        try {
            let result = await postData.deletePost(req.params.post_id, userId);

            return res.json(result);
            // res.redirect(`/forum/${req.params.forum_id}`);
        } catch (e) {
            let errorMessage = e.message || String(e);
            let statusCode;
            if (errorMessage.includes("Unauthorized")) {
                statusCode = 403;
            } else if (errorMessage.includes("not found")) {
                statusCode = 404;
            } else {
                statusCode = 500;
            }
            return res.status(statusCode).json({ error: errorMessage });
        }
    });

router
    .route("/post/:post_id/edit")
    .get(async (req, res) => {
        try {
            let post = await postData.getPost(req.params.post_id);

            let userId;
            let userType;
            if (req.session.admin) {
                userId = req.session.admin._id;
                userType = req.session.admin.userType;
            } else if (req.session.user) {
                userId = req.session.user.userId;
                userType = req.session.user.userType;
            }

            if (userId === post.author._id.toString()) {
                post.isOwner = true;
            } else {
                return res.redirect("/forum");
            }

            res.render("forum/editPost", {
                headerOptions: req.headerOptions,
                post,
            });
        } catch (e) {
            res.status(404).render("error", {
                headerOptions: req.headerOptions,
                errorTitle: "Post Not Found",
                errorMessage: e || "The requested post could not be found.",
            });
        }
    })
    .patch(async (req, res) => {
        let { content, title } = req.body;

        let userId;
        if (req.session.user) {
            userId = req.session.user.userId;
        } else if (req.session.admin) {
            userId = req.session.admin._id;
        }

        if (!content && !title) {
            throw Error(
                "bad request - missing required fields: updatedContent or updatedTitle."
            );
        }

        content = content ? content.trim() : null;
        title = title ? title.trim() : null;

        try {
            let updatedPost = await postData.editPost(
                req.params.post_id,
                userId,
                content,
                title
            );

            return res.json({ postId: req.params.post_id }); //res.redirect(`/forum/post/${req.params.post_id}`);
        } catch (e) {
            let errorMessage = e.message || String(e);
            let statusCode;
            if (errorMessage.includes("Unauthorized")) {
                statusCode = 403;
            } else if (errorMessage.includes("not found")) {
                statusCode = 404;
            } else if (errorMessage.includes("bad request")) {
                statusCode = 400;
            } else {
                statusCode = 500;
            }

            return res.status(statusCode).json({ error: errorMessage });
        }
    });

router
    .route("/post/:post_id/reply")
    .get(async (req, res) => {
        if (!req.session || (!req.session.user && !req.session.admin)) {
            return res.redirect("/login");
        }
        let sessionAuthorName;
        if (req.session.admin) {
            sessionAuthorName = xss(req.session.admin.firstName);
        } else if (req.session.user) {
            sessionAuthorName = xss(req.session.user.userName);
        }
        try {
            let post = await postData.getPost(xss(req.params.post_id));

            res.render("forum/makeReply", {
                headerOptions: req.headerOptions,
                forum_id: req.params.forum_id,
                post_id: req.params.post_id,
                postTitle: post.title,
                replyAuthorName: sessionAuthorName || "",
            });
        } catch (e) {
            res.status(404).render("error", {
                headerOptions: req.headerOptions,
                errorTitle: "Post Not Found",
                errorMessage: e || "The requested post could not be found.",
            });
        }
    })
    .post(async (req, res) => {
        let { content } = req.body;

        let userId;
        let userType;
        if (req.session.user) {
            userId = req.session.user.userId;
            userType = req.session.user.userType;
        } else if (req.session.admin) {
            userId = req.session.admin._id;
            userType = req.session.admin.userType;
        }

        // if (!userId) {
        //     return res.status(401).render("error", {
        //         headerOptions: req.headerOptions,
        //         errorTitle: "Unauthorized",
        //         errorMessage: "You must be logged in to create a post.",
        //     });
        // }

        if (!content) {
            return res.status(400).render("error", {
                headerOptions: req.headerOptions,
                errorTitle: "Bad Request",
                errorMessage: "Missing required fields: content.",
            });
        }

        try {
            let newReply = await repliesData.makeReply(
                req.params.post_id,
                userId,
                userType,
                content
            );
            return res.json(true);
            // res.redirect(`/forum/${req.params.forum_id}`);
        } catch (e) {
            return res.status(500).json({
                error: e || "An error occurred while creating the reply.",
            });
        }
    });

router
    .route("/post/reply/:reply_id/edit")
    .get(async (req, res) => {
        if (!req.session || (!req.session.user && !req.session.admin)) {
            return res.redirect("/login");
        }

        req.session = xss(req.session);
        req.session.user = xss(req.session.user);
        req.session.admin = xss(req.session.admin);

        try {
            let reply = await repliesData.getReply(
                xss(req.params.post_id),
                xss(req.params.reply_id)
            );

            res.render("forum/editReply", {
                headerOptions: req.headerOptions,
                forum_id: req.params.forum_id,
                post_id: req.params.post_id,
                reply_id: req.params.reply_id,
                replyAuthorName: reply.replyAuthorName,
                content: reply.content,
            });
        } catch (e) {
            res.status(404).render("error", {
                headerOptions: req.headerOptions,
                errorTitle: "Reply Not Found",
                errorMessage: e || "The requested reply could not be found.",
            });
        }
    })

    .patch(async (req, res) => {
        if (!req.session || (!req.session.user && !req.session.admin)) {
            return res.redirect("/login");
        }

        let { updatedContent } = req.body;

        let userId;
        if (req.session.user) {
            userId = xss(req.session.user.userId);
        } else if (req.session.admin) {
            userId = xss(req.session.admin._id);
        } else {
            return res.status(401).render("error", {
                headerOptions: req.headerOptions,
                errorTitle: "Unauthorized",
                errorMessage: "You must be logged in to delete a post.",
            });
        }

        if (!updatedContent || updatedContent.trim().length === 0) {
            return res.status(400).render("error", {
                headerOptions: req.headerOptions,
                errorTitle: "Bad Request",
                errorMessage: "Missing or invalid content for the reply.",
            });
        }

        try {
            let updatedReply = await repliesData.editReply(
                xss(req.params.post_id),
                xss(req.params.reply_id),
                userId,
                updatedContent
            );

            res.redirect(`/forum/${req.params.forum_id}`);
        } catch (e) {
            let errorMessage = e.message || String(e);
            if (errorMessage.includes("Unauthorized")) {
                return res.status(403).render("error", {
                    headerOptions: req.headerOptions,
                    errorTitle: "Unauthorized",
                    errorMessage: errorMessage,
                });
            } else if (errorMessage.includes("not found")) {
                return res.status(404).render("error", {
                    headerOptions: req.headerOptions,
                    errorTitle: "Not Found",
                    errorMessage: errorMessage,
                });
            } else {
                return res.status(500).render("error", {
                    headerOptions: req.headerOptions,
                    errorTitle: "Internal Server Error",
                    errorMessage: errorMessage,
                });
            }
        }
    });

router.route("/post/:post_id/reply/:reply_id").delete(async (req, res) => {
    let userId;
    if (req.session.user) {
        userId = req.session.user.userId;
    } else if (req.session.admin) {
        userId = req.session.admin._id;
    } else {
        return res.status(401).render("error", {
            headerOptions: req.headerOptions,
            errorTitle: "Unauthorized",
            errorMessage: "You must be logged in to delete a post.",
        });
    }

    try {
        let result = await repliesData.deleteReply(
            req.params.post_id,
            req.params.reply_id,
            userId
        );

        if (!result) {
            return res.status(404).render("error", {
                headerOptions: req.headerOptions,
                errorTitle: "Reply Not Found",
                errorMessage: "Unable to locate or delete the reply.",
            });
        }

        return res.json(result);
        // res.redirect(`/forum/${req.params.forum_id}`);
    } catch (e) {
        let errorMessage = e.message || String(e);
        let statusCode;
        if (errorMessage.includes("Unauthorized")) {
            statusCode = 403;
        } else if (errorMessage.includes("not found")) {
            statusCode = 404;
        } else {
            statusCode = 500;
        }
        return res.status(statusCode).json({ error: errorMessage });
    }
});

export { router as postRoutes };
