import express from "express";
import * as postData from "../data/posts.js";
import * as repliesData from "../data/replies.js";
import * as adminData from "../data/admin.js";
import xss from "xss";


const router = express.Router();


router
    .route("/:subject_id")
    .get(async (req, res) => {

        
        if (!req.session && !req.session.user || !req.session.admin) {

            return res.redirect("/login");
        }

        req.session = xss(req.session);
        req.session.user = xss(req.session.user);
        req.session.user = xss(req.session.user);


        try {
            req.params.subject_id = xss(req.params.subject_id);
            let forum = await postData.getForums(xss(req.params.subject_id));

            forum.posts.forEach((post) => {
                if (post.replies && Array.isArray(post.replies)) {
                    post.replies.forEach((reply) => {
                        if (!reply.replyAuthorName) {
                            reply.replyAuthorName = reply.replyAuthorName || "Unknown Author";
                        }
                    });
                }
            });

            res.render("forum/forum", {

                subject_id: xss(req.params.subject_id),
                title: forum.title,

                posts: forum.posts || [],
                replies: forum.posts.replies || [],
            });
        } catch (e) {
            res.status(500).render("error", {
                errorTitle: "Internal Server Error",
                errorMessage: e || "Something went wrong while fetching the forum.",
            });
        }
    })

    .post(async (req, res) => {
        let { title, content, authorName } = req.body;

        if (!req.session) {
            return res.redirect('/login');
        }
        let userId;
        let sessionAuthorName
        if (req.session.admin) {
            userId = (xss);
            sessionAuthorName = xss(req.session.admin.firstName);
        } else if (req.session.user) {
            userId = xss(req.session.user.userId);
            sessionAuthorName = xss(req.session.user.userName);
        }

        if (!userId) {
            return res.status(401).render("error", {
                errorTitle: "Unauthorized",
                errorMessage: "You must be logged in to create a post.",
            });
        }

        if (!authorName) {
            authorName = sessionAuthorName;
        }

        if (!title || !content || !authorName) {
            return res.status(400).render("error", {
                errorTitle: "Bad Request",
                errorMessage: "Missing required fields: title, content, or authorName.",
            });
        }

        title = xss(title.trim());
        content = xss(content.trim());
        authorName = xss(authorName.trim());

        try {
            const newPost = await postData.makePost(
                req.params.subject_id,
                userId,
                authorName,
                title,
                content
            );

            let forum = await postData.getForums(req.params.subject_id);

            return res.render("forum/forum", {
                subject_id: req.params.subject_id,
                authorName: xss(forum.authorName),
                title: xss(forum.title),
                posts: xss(forum.posts) || [],
            });
        } catch (e) {
            console.error("Error while creating a post:", e || e);
            if (e.code === 11000) {
                return res.status(409).render("error", {
                    errorTitle: "Duplicate Key Error",
                    errorMessage: e || "A post with the same title already exists.",
                });
            } else {
                return res.status(500).render("error", {
                    errorTitle: "Internal Server Error",
                    errorMessage: e || "An error occurred while creating the post.",
                });
            }
        }
    });



router
    .route("/:subject_id/:post_id")
    .get(async (req, res) => {
        if (!req.session || !req.session.user && !req.session.admin)  {
            return res.redirect("/login");
        }

        req.session = xss(req.session);
        req.session.user = xss(req.session.user);
        req.session.admin = xss(req.session.admin);

        try {
            let post = await postData.getPost(xss(req.params.post_id));
            res.render("forum/post", {
                subject_id: xss(req.params.subject_id),
                post_id: post._id,
                title: post.title,
                content: post.content,
                author: post.author,
            });
        } catch (e) {
            res.status(404).render("error", {
                errorTitle: "Post Not Found",
                errorMessage: e || "The requested post could not be found.",
            });
        }
    })
    .patch(async (req, res) => {
        let { updatedContent, updatedTitle } = req.body;
        
        updatedContent = xss(updatedContent.trim());
        updatedTitle = xss(updatedTitle.trim());

        if (!req.session) {
            return res.redirect('/login');
        }

        req.session = xss(req.session);
        // req.session.user = xss(req.session.user);
        // req.session.admin = xss(req.session.admin);

        let userId;
        if (req.session.user) {
            userId = xss(req.session.user.userId);
        } else if (req.session.admin) {
            userId = xss(req.session.admin._id);
        } else {
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

        updatedContent = updatedContent ? updatedContent.trim() : null;
        updatedTitle = updatedTitle ? updatedTitle.trim() : null;

        try {
            let updatedPost = await postData.editPost(
                xss(req.params.post_id),
                userId,
                updatedContent,
                updatedTitle
            );


            return res.redirect(`/forum/${xss(req.params.subject_id)}`);
        } catch (e) {
            if (e.includes("Unauthorized")) {

                return res.status(403).render("error", {
                    errorTitle: "Unauthorized",
                    errorMessage: errorMessage,
                });
            } else if (errorMessage.includes("not found")) {
                return res.status(404).render("error", {
                    errorTitle: "Not Found",
                    errorMessage: errorMessage,
                });
            } else {
                return res.status(500).render("error", {
                    errorTitle: "Internal Server Error",
                    errorMessage: errorMessage,
                });
            }
        }
    })


    .delete(async (req, res) => {
        if (!req.session || !req.session.user && !req.session.admin)  {
            return res.status(401).render("error", {
                errorTitle: "Unauthorized",
                errorMessage: "You must be logged in to delete a post.",
            });
        }

        req.session = xss(req.session);
        req.session.user = xss(req.session.user);
        req.session.admin = xss(req.session.admin);

        let userId;
        if (req.session.user) {
            userId = xss(req.session.user.userId);
        } else if (req.session.admin) {
            userId = xss(req.session.admin._id);
        } else {
            return res.status(401).render("error", {
                errorTitle: "Unauthorized",
                errorMessage: "You must be logged in to delete a post.",
            });
        }

        try {
            let result = await postData.deletePost(
                xss(req.params.subject_id),
                xss(req.params.post_id),
                userId
            );


            res.redirect(`/forum/${xss(req.params.subject_id)}`);
        } catch (e) {
            if (e == "Error: Unauthorized action. You cannot delete this post.") {

                return res.status(403).render("error", {
                    errorTitle: "Unauthorized",
                    errorMessage: errorMessage,
                });
            } else if (errorMessage.includes("not found")) {
                return res.status(404).render("error", {
                    errorTitle: "Not Found",
                    errorMessage: errorMessage,
                });
            } else {
                return res.status(500).render("error", {
                    errorTitle: "Internal Server Error",
                    errorMessage: errorMessage,
                });
            }
        }
    });

router
    .route("/:subject_id/:post_id/reply")
    .get(async (req, res) => {
        if (!req.session || !req.session.user && !req.session.admin)  {
            return res.redirect("/login");
        }

        req.session = xss(req.session);
        req.session.user = xss(req.session.user);
        req.session.admin = xss(req.session.admin);

        let sessionAuthorName
        if (req.session.admin) {
            sessionAuthorName = xss(req.session.admin.firstName);
        } else if (req.session.user) {
            sessionAuthorName = xss(req.session.user.userName);
        }
        try {
            let post = await postData.getPost(xss(req.params.post_id));

            res.render("forum/makeReply", {
                subject_id: xss(req.params.subject_id),
                post_id: xss(req.params.post_id),
                postTitle: post.title,
                replyAuthorName: sessionAuthorName || "",
            });
        } catch (e) {
            res.status(404).render("error", {
                errorTitle: "Post Not Found",
                errorMessage: e || "The requested post could not be found.",
            });
        }
    })
    .post(async (req, res) => {
        if (!req.session || !req.session.user && !req.session.admin)  {
            return res.redirect("/login");
        }

        req.session = xss(req.session);
        req.session.user = xss(req.session.user);
        req.session.admin = xss(req.session.admin);


        let { replyAuthorName, content } = req.body;

        replyAuthorName = xss(replyAuthorName);
        content = xss(content);

        let userId;
        let sessionAuthorName
        if (req.session.admin) {
            userId = xss(req.session.admin._id);
            sessionAuthorName = xss(req.session.admin.firstName);
        } else if (req.session.user) {
            userId = xss(req.session.user.userId);
            sessionAuthorName = xss(req.session.user.userName);
        }

        if (!userId) {
            return res.status(401).render("error", {
                errorTitle: "Unauthorized",
                errorMessage: "You must be logged in to create a post.",
            });
        }

        if (!replyAuthorName) {
            authorName = sessionAuthorName;
        }

        if (!replyAuthorName || !content) {
            return res.status(400).render("error", {
                errorTitle: "Bad Request",
                errorMessage: "Missing required fields: authorName or content.",
            });
        }

        try {
            let newReply = await repliesData.makeReply(
                xss(req.params.post_id),
                userId,                
                replyAuthorName,
                content
            );
            res.redirect(`/forum/${xss(req.params.subject_id)}`);
        }
        catch (e) {
            res.status(500).render("error", {
                errorTitle: "Internal Server Error",
                errorMessage: e || "An error occurred while creating the reply.",
            });
        }
    })

router
    .route("/:subject_id/:post_id/:reply_id/edit")
    .get(async (req, res) => {
        if (!req.session || !req.session.user && !req.session.admin)  {
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
                subject_id: xss(req.params.subject_id),
                post_id: xss(req.params.post_id),
                reply_id: xss(req.params.reply_id),
                replyAuthorName: reply.replyAuthorName,
                content: reply.content,
            });
        } catch (e) {
            res.status(404).render("error", {
                errorTitle: "Reply Not Found",
                errorMessage: e || "The requested reply could not be found.",
            });
        }
    })

    .patch(async (req, res) => {
        if (!req.session || !req.session.user && !req.session.admin)  {
            return res.redirect("/login");
        }

        req.session = xss(req.session);
        req.session.user = xss(req.session.user);
        req.session.admin = xss(req.session.admin);


        let { updatedContent } = req.body;

        

        let userId;
        if (req.session.user) {
            userId = xss(req.session.user.userId);
        } else if (req.session.admin) {
            userId = xss(req.session.admin._id);
        } else {
            return res.status(401).render("error", {
                errorTitle: "Unauthorized",
                errorMessage: "You must be logged in to delete a post.",
            });
        }

        if (!updatedContent || updatedContent.trim().length === 0) {
            return res.status(400).render("error", {
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

            res.redirect(`/forum/${req.params.subject_id}`);
        } catch(e) {
            let errorMessage = e.message || String(e);
            if (errorMessage.includes("Unauthorized")) {
                return res.status(403).render("error", {
                    errorTitle: "Unauthorized",
                    errorMessage: errorMessage,
                });
            } else if (errorMessage.includes("not found")) {
                return res.status(404).render("error", {
                    errorTitle: "Not Found",
                    errorMessage: errorMessage,
                });
            } else {
                return res.status(500).render("error", {
                    errorTitle: "Internal Server Error",
                    errorMessage: errorMessage,
                });
            }
        }
    });



router
    .route("/:subject_id/:post_id/:reply_id")
    .delete(async (req, res) => {
        if (!req.session || !req.session.user && !req.session.admin)  {
            return res.status(401).render("error", {
                errorTitle: "Unauthorized",
                errorMessage: "You must be logged in to delete a reply.",
            });
        }

        req.session = xss(req.session);
        req.session.user = xss(req.session.user);
        req.session.admin = xss(req.session.admin);

        let userId;
        if (req.session.user) {
            userId = xss(req.session.user.userId);
        } else if (req.session.admin) {
            userId = xss(req.session.admin._id);
        } else {
            return res.status(401).render("error", {
                errorTitle: "Unauthorized",
                errorMessage: "You must be logged in to delete a post.",
            });
        }

        try {
            let result = await repliesData.deleteReply(
                xss(req.params.post_id),
                xss(req.params.reply_id),
                userId
            );

            if (!result) {
                return res.status(404).render("error", {
                    errorTitle: "Reply Not Found",
                    errorMessage: "Unable to locate or delete the reply.",
                });
            }


            res.redirect(`/forum/${xss(req.params.subject_id)}`);
        } catch (e) {
            if (e.includes("not authorized")) {
                res.status(403).render("error", {

                    errorTitle: "Unauthorized",
                    errorMessage: errorMessage,
                });
            } else if (errorMessage.includes("not found")) {
                return res.status(404).render("error", {
                    errorTitle: "Not Found",
                    errorMessage: errorMessage,
                });
            } else {
                return res.status(500).render("error", {
                    errorTitle: "Internal Server Error",
                    errorMessage: errorMessage,
                });
            }
        }
    });


export { router as postRoutes };
