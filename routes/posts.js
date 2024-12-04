import express from "express";
import * as postData from "../data/posts.js";
import * as repliesData from "../data/replies.js";

const router = express.Router();

router
    .route("/:subject_id")
    .get(async (req, res) => {
        try {
            let forum = await postData.getForums(req.params.subject_id);
            res.status(200).render("forum", { forum });
        } catch (e) {
            res.status(500).json({ error: e });
        }
    })

    .post(async (req, res) => {
        let { authorID, title, content } = req.body;

        if (!authorID || !title || !content) {
            return res.status(400).json({
                error: "Missing required fields: authorID, title, or content.",
            });
        }

        try {
            let newPost = await postData.makePost(
                req.params.subject_id,
                authorID,
                title,
                content
            );
            res.status(201).json({success: true, post: newPost});
        } catch (e) {
            res.status(500).json({ error: e });
        }
    });

router
    .route("/:subject_id/:post_id")
    .patch(async (req, res) => {
        let { authorID, updatedContent } = req.body;

        if (!authorID || !updatedContent) {
            return res.status(400).json({
                error: "Missing required fields: authorID or updatedContent.",
            });
        }

        try {
            let updatedPost = await postData.editPost(
                req.params.post_id,
                authorID,
                updatedContent
            );
            res.status(200).json({ success: true, updatedPost });
            } 
        catch (e) {
            res.status(404).json({ error: e });
        }
    })

    .delete(async (req, res) => {
        let { authorID } = req.body;

        if (!authorID) {
            return res
                .status(400)
                .json({ error: "Missing required field: authorID." });
        }

        try {
            let updatedPosts = await postData.deletePost(
                req.params.post_id,
                authorID
            );
            res.status(200).json({ success: true, posts: updatedPosts });
        } catch (e) {
            res.status(404).json({ error: e });
        }
    });

router
    .route("/:subject_id/:post_id/replies")
    .get(async (req, res) => {
        try {
            let replies = await repliesData.getReplies(req.params.post_id);
            res.status(200).json({ replies });
        } catch (e) {
            res.status(404).json({ error: e });
        }
    })

    .post(async (req, res) => {
        let { authorID, content } = req.body;

        if (!authorID || !content) {
            return res
                .status(400)
                .json({
                    error: "Missing required fields: authorID or content.",
                });
        }

        try {
            let updatedPost = await repliesData.makeReply(
                req.params.post_id,
                authorID,
                content
            );
            res.status(201).json({ success: true, updatedPost });
        } catch (e) {
            res.status(500).json({ error: e });
        }
    });

router
    .route("/:subject_id/:post_id/replies/:reply_id")
    .patch(async (req, res) => {
        let { authorID, updatedContent } = req.body;

        if (!authorID || !updatedContent) {
            return res
                .status(400)
                .json({
                    error: "Missing required fields: authorID or updatedContent.",
                });
        }

        try {
            let updatedReply = await repliesData.editReply(
                req.params.post_id,
                req.params.reply_id,
                authorID,
                updatedContent
            );
            res.status(200).json({ success: true, updatedReply });
        } catch (e) {
            res.status(404).json({ error: e });
        }
    })

    .delete(async (req, res) => {
        let { authorID } = req.body;

        if (!authorID) {
            return res
                .status(400)
                .json({ error: "Missing required field: authorID." });
        }

        try {
            let updatedPost = await repliesData.deleteReply(
                req.params.post_id,
                req.params.reply_id,
                authorID
            );
            res.status(200).json({ success: true, updatedPost });
        } catch (e) {
            res.status(404).json({ error: e });
        }
    });

export {router as postRoutes};
