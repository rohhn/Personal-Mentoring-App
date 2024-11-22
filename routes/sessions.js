import express from 'express';

import { ObjectId } from 'mongodb';
import { sessions, mentees, mentors } from "../config/mongoCollections.js";
import { checkDate, checkNumber, checkStringParams } from "../helpers.js";

import { menteeData, mentorData, sessionsData } from '../data/index.js';

const router = express.Router();

router
.route("/")
.post(
    async(req, res) => {
        //TODO Error Handling in routes

        let newSession = req.body;


        try{
            let session = await sessionsData.createSession(newSession.mentor_id, newSession.mentee_id, newSession.subject_area, newSession.time, newSession.duration);
            return res.status(200).json(session);
        }catch(e){
            console.log(e);
            return res.status(500).json({error: e});
        }
       
        
    }
);

router
.route('/:sessionId')
.put(
    async(req, res) => {
        let sessionId = req.params.sessionId.trim();

        // TODO Error Handling to be done

        let reschedSession = req.body;

        try{
            const session = await sessionsData.rescheduleSession(sessionId, reschedSession.time, reschedSession.duration, reschedSession.status);
            return res.status(200).json(session);
        }catch(e){
            console.log(e);
            return res.status(500).json({error: e});
        }
    }
);

export { router as sessionRoutes };