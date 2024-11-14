import express from 'express';
import { menteeData, mentorData } from '../data/index.js';
import {dbConnection, closeConnection} from '../config/mongoConnection.js';
import { ObjectId }  from 'mongodb';
import { mentees } from '../config/mongoCollections.js';

const router = express.Router();

router
    .route('/')
    .get(
        async (req, res) => {
            try{
              let mentees = await menteeData.getAllMentees();
              return res.status(200).json(mentees);
            }catch(e){
              return res.status(500).json({e});
            }
        }
    )
    .post(async(req, res) => {
        const newMentee = req.body;

        //Error Handling Will be done here

        try{
            let menteeCreate = await menteeData.createMentee(newMentee.first_name, newMentee.last_name, newMentee.dob, newMentee.email, newMentee.pwd_hash, newMentee.parent_email, newMentee.profile_image, newMentee.created_at, newMentee.summary, newMentee.skills);

            return res.status(200).json(menteeCreate);
        }catch(e){
            return res.status(500).json({error: e});
        }
    }
    );

router
    .route('/:menteeId')
    .get(async (req, res) => {
        try{
            let menteeId = req.params.menteeId.trim();

            //Error Handling Will be done

            let mentee = await menteeData.getMenteeById(menteeId);
            return res.status(200).json(mentee);

        }catch(e){
            return res
            .status(404)
            .json({error: e});
        }
    }
    )
    .delete(async (req, res) => {
        try{
            let menteeId = req.params.menteeId.trim();

            //Error Handling Will be done

            let mentee = await menteeData.removeMentee(menteeId);
            return res.status(200).json({_id: menteeId, deleted: "true"});

        }catch(e){
            return res
            .status(404)
            .json({error: e});
        }
    })
    .put(async (req, res) =>{
        try{
            let menteeId = req.params.menteeId.trim();
            //Error Handling Will be done here

            const updatedMentee = req.body;

            // Error Handling Will be done here

            const mentee = await menteeData.createMentee(menteeId,updatedMentee.first_name, updatedMentee.last_name, updatedMentee.dob, updatedMentee.email, updatedMentee.pwd_hash, updatedMentee.parent_email, updatedMentee.profile_image, updatedMentee.created_at, updatedMentee.skills, updatedMentee.summary);

            return res.status(200).json(mentee);
        }catch(e){
            console.log(e);
            return res.status(500).json({error: e});
        }
    }
    );

export {router as menteeRoutes};
    