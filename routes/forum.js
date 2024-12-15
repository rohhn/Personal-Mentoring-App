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
import { fileUpload } from "../middleware/common.js";
import { extractProfileImage } from "../helpers/common.js";
import moment from "moment";

const router = express.Router();

router.route("/").get();

export { router as forumRoutes };
