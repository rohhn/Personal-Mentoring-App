import express from "express";

import { ObjectId } from "mongodb";
import { subject_areas } from "../config/mongoCollections.js";
import { checkStringParams } from "../helpers.js";

import { subjectData } from "../data/index.js";
import xss from "xss";
import { allowMentorsOnly } from "../middleware/users.js";

const router = express.Router();

router
    .route("/")
    .post(allowMentorsOnly, async (req, res) => {
        let newSubject = req.body;

        try {
            checkStringParams(newSubject.name);
            checkStringParams(newSubject.description, true);
        } catch (e) {
            return res.status(400).json({ error: e });
        }

        let subject_area = await subjectData.createSubjectArea(
            xss(newSubject.name),
            xss(newSubject.description)
        );
        return res.status(200).json(subject_area);
    })
    .get(async (req, res) => {
        try {
            let subjects = await subjectData.getAllSubjectAreas();
            return res.status(200).json(subjects);
        } catch (e) {
            // console.log(e);
            return res.status(500).json({ e });
        }
    });

router
    .route("/:subjectId")
    .get(async (req, res) => {
        let subjectId = xss(req.params.subjectId.trim());

        try {
            checkStringParams(subjectId);

            if (!ObjectId.isValid(subjectId.trim())) {
                throw "Invalid object ID.";
            }
        } catch (e) {
            return res.status(400).json({ error: e });
        }

        subjectId = subjectId.trim();

        try {
            let subject = await subjectData.getSubjectById(subjectId);
            return res.status(200).json(subject);
        } catch (e) {
            return res.status(404).json({ error: e });
        }
    })
    .delete(allowMentorsOnly, async (req, res) => {
        let subjectId = xss(req.params.subjectId.trim());

        try {
            checkStringParams(subjectId);

            if (!ObjectId.isValid(subjectId.trim())) {
                throw "Invalid object ID.";
            }
        } catch (e) {
            return res.status(400).json({ error: e });
        }

        subjectId = subjectId.trim();

        try {
            const subjectAreasCollection = await subject_areas();

            const subject = await subjectAreasCollection.findOne({
                _id: new ObjectId(subjectId),
            });
            // console.log(subject);
            if (!subject) {
                throw `Subject area with the id ${subjectId} does not exist.`;
            }
        } catch (e) {
            console.log(e);
            return res.status(404).json({ error: e });
        }

        try {
            let subject = await subjectData.removeSubjectArea(subjectId);
            return res.status(200).json({ _id: subjectId, deleted: "true" });
        } catch (e) {
            console.log(e);
            return res.status(500).json({ error: e });
        }
    })
    .put(allowMentorsOnly, async (req, res) => {
        let subjectId = xss(req.params.subjectId.trim());

        try {
            checkStringParams(subjectId);

            if (!ObjectId.isValid(subjectId.trim())) {
                throw "Invalid object ID.";
            }
        } catch (e) {
            return res.status(400).json({ error: e });
        }

        subjectId = subjectId.trim();

        try {
            const subjectAreasCollection = await subject_areas();

            const subject = await subjectAreasCollection.findOne({
                _id: new ObjectId(subjectId),
            });
            // console.log(subject);
            if (!subject) {
                throw `Subject area with the id ${subjectId} does not exist.`;
            }
        } catch (e) {
            console.log(e);
            return res.status(404).json({ error: e });
        }

        let updateSubject = req.body;

        try {
            checkStringParams(updateSubject.name);
            checkStringParams(updateSubject.description, true);
        } catch (e) {
            return res.status(400).json({ error: e });
        }

        updateSubject.name = xss(updateSubject.name.trim());
        updateSubject.description = xss(updateSubject.description.trim());

        try {
            let updatedSubject = await subjectData.updateSubjectArea(
                subjectId,
                updateSubject.name,
                updateSubject.description
            );
            return res.status(200).json(updatedSubject);
        } catch (e) {
            return res.status(500).json({ error: e });
        }
    });

router.route("/name/:subjectName").get(async (req, res) => {
    let name = xss(req.params.subjectName.trim());

    try {
        checkStringParams(name);
    } catch (e) {
        return res.status(400).json({ error: e });
    }

    try {
        let subject = await subjectData.getSubjectByName(name);
        return res.status(200).json(subject);
    } catch (e) {
        return res.status(404).json({ error: e });
    }
});

router.route("/mentors/:subjectId").get(async (req, res) => {
    let subjectId = xss(req.params.subjectId.trim());

    try {
        checkStringParams(subjectId);

        if (!ObjectId.isValid(subjectId.trim())) {
            throw "Invalid object ID.";
        }
    } catch (e) {
        return res.status(400).json({ error: e });
    }

    subjectId = subjectId.trim();

    try {
        const subjectAreasCollection = await subject_areas();

        const subject = await subjectAreasCollection.findOne({
            _id: new ObjectId(subjectId),
        });
        // console.log(subject);
        if (!subject) {
            throw `Subject area with the id ${subjectId} does not exist.`;
        }

        let mentors = await subjectData.searchMentorsBySubjectId(subjectId);
        return res.render("users/mentors/mentors-by-subject-area", {
            headerOptions: req.headerOptions,
            subject_area: subject,
            mentors,
        });
        // return res.status(200).json(mentors);
    } catch (e) {
        return res.status(500).json({ error: e });
    }
});

export { router as subjectRoutes };
