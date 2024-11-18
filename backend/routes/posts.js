import express from "express";
import * as postData from '../data/posts.js';
import * as helper from "../helpers.js";

const router = express.Router();

router.route("/forum/:subject_id")
    .get(async (req, res) => {
        try
        {
            let forum=await postData.getForums(req.params.subject_id);
            res.json(forum);
        }
        catch(e)
        {
            res.status(404).json({e});
        }
    })

    .post(async (req, res) => 
        {
    })

    .patch(async (req, res) => 
        {
    })

    .delete(async (req, res) => 
        {
    })


export default router;
