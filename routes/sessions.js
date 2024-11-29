import express from 'express';

import { ObjectId } from 'mongodb';
import { mentees, mentors, sessions } from "../config/mongoCollections.js";
import { checkDate, checkStringParams } from "../helpers.js";

import { sessionsData } from '../data/index.js';

const router = express.Router();

router
.route("/")
.post(
    async(req, res) => {
        let newSession = req.body;

        try{
            checkStringParams(newSession.mentor_id);
            checkStringParams(newSession.mentee_id);
            checkStringParams(newSession.subject_area);
            // checkDate(newSession.start_time);
            // checkDate(newSession.end_time);

            newSession.mentor_id = newSession.mentor_id.trim();
            newSession.mentee_id = newSession.mentee_id.trim();
            newSession.subject_area = newSession.subject_area.trim();
            newSession.start_time = new Date(newSession.start_time.trim());
            newSession.end_time = new Date(newSession.end_time.trim());
            console.log(newSession.start_time);
        }catch(e){
            return res.status(400).json({error: e});
        }


        try{
            let session = await sessionsData.createSession(newSession.mentor_id, newSession.mentee_id, newSession.subject_area, newSession.start_time, newSession.end_time);
            return res.status(200).json(session);
        }catch(e){
            console.log(e);
            return res.status(500).json({error: e});
        }
       
        
    }
);

router
.route('/mentee/:menteeId')
.get(
    async(req, res) => {
        let menteeId = req.params.menteeId.trim();

        try{
            checkStringParams(menteeId);

            menteeId = menteeId.trim();

            if (!ObjectId.isValid(menteeId)) {
                throw 'Invalid object ID.';
            }
        }catch(e){
            return res.status(400).json({error: e});
        }

        menteeId = menteeId.trim();

        try{
            const menteeCollection = await mentees();

            const mentee = await menteeCollection.findOne({_id: new ObjectId(menteeId)});

            if (!mentee) {
                throw `Mentee with the id ${menteeId} does not exist.`;
            }
        }catch(e){
            return res.status(404).json({error: e});
        }

        try{
            let sessionsByMentee = await sessionsData.getSessionsByMentee(menteeId);
            return res.status(200).json(sessionsByMentee);

        }catch(e){
            console.log(e);
            return res
            .status(404)
            .json({error: e});
        }

    }
);

router
.route('/mentor/:mentorId')
.get(
    async(req, res) => {
        let mentorId = req.params.mentorId.trim();

        try{
            checkStringParams(mentorId);

            mentorId = mentorId.trim();

            if (!ObjectId.isValid(mentorId)) {
                throw 'Invalid object ID.';
            }
        }catch(e){
            return res.status(400).json({error: e});
        }

        mentorId = mentorId.trim();

        try{
            const mentorCollection = await mentors();

            const mentor = await mentorCollection.findOne({_id: new ObjectId(mentorId)});

            if (!mentor) {
                throw `Mentor with the id ${mentorId} does not exist.`;
            }
        }catch(e){
            return res.status(404).json({error: e});
        }

        try{
            let sessionsByMentor = await sessionsData.getSessionsByMentor(mentorId);
            return res.status(200).json(sessionsByMentor);

        }catch(e){
            console.log(e);
            return res
            .status(404)
            .json({error: e});
        }

    }
);

router
.route('/:sessionId')
.put(
    async(req, res) => {
        let sessionId = req.params.sessionId.trim();

        try{
            checkStringParams(sessionId);

            sessionId = sessionId.trim();

            if (!ObjectId.isValid(sessionId)) {
                throw 'Invalid object ID.';
            }
        }catch(e){
            return res.status(400).json({error: e});
        }

        sessionId = sessionId.trim();

        try{
            const sessionCollection = await sessions();

            const session = await sessionCollection.findOne({_id: new ObjectId(sessionId)});

            if (!session) {
                throw `Session with the id ${sessionId} does not exist.`;
            }
        }catch(e){
            return res.status(404).json({error: e});
        }

        let reschedSession = req.body;

        try{
            // checkDate(reschedSession.start_time);
            // checkDate(reschedSession.end_time);
            checkStringParams(reschedSession.status);
        }catch(e){
            return res.status(400).json({error: e});
        }

        try{
            const session = await sessionsData.rescheduleSession(sessionId, reschedSession.start_time, reschedSession.end_time, reschedSession.status);
            return res.status(200).json(session);
        }catch(e){
            console.log(e);
            return res.status(500).json({error: e});
        }
    }
)
.delete(
    async(req, res) => {
        let sessionId = req.params.sessionId.trim();

        try{
            checkStringParams(sessionId);

            sessionId = sessionId.trim();

            if (!ObjectId.isValid(sessionId)) {
                throw 'Invalid object ID.';
            }
        }catch(e){
            return res.status(400).json({error: e});
        }

        sessionId = sessionId.trim();

        try{
            const sessionCollection = await sessions();

            const session = await sessionCollection.findOne({_id: new ObjectId(sessionId)});

            if (!session) {
                throw `Session with the id ${sessionId} does not exist.`;
            }
        }catch(e){
            return res.status(404).json({error: e});
        }

        try{
            let session = await sessionsData.deleteSession(sessionId);
            return res.status(200).json({_id: sessionId, deleted: "true"});

        }catch(e){
            return res
            .status(404)
            .json({error: e});
        }
    }
)
.get(
    async(req, res) => {
        let sessionId = req.params.sessionId.trim();

        try{
            checkStringParams(sessionId);

            sessionId = sessionId.trim();

            if (!ObjectId.isValid(sessionId)) {
                throw 'Invalid object ID.';
            }
        }catch(e){
            return res.status(400).json({error: e});
        }

        sessionId = sessionId.trim();

        try{
            let session = await sessionsData.getSessionById(sessionId);
            return res.status(200).json(session);

        }catch(e){
            return res
            .status(404)
            .json({error: e});
        }
    }
);

export { router as sessionRoutes };
