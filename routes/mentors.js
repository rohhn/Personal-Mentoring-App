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
              let mentors = await mentorData.getAllMentors();
              return res.status(200).json(mentors);
            }catch(e){
                console.log(e);
              return res.status(500).json({e});
            }
        }
    )
    .post(async(req, res) => {
        const newMentor = req.body;

        //Error Handling Will be done here

        try{
            let mentorCreate = await mentorData.createMentor(newMentor.first_name, newMentor.last_name, newMentor.dob, newMentor.email, newMentor.pwd_hash, newMentor.profile_image, newMentor.created_at, newMentor.summary, newMentor.education, newMentor.experience, newMentor.availability, newMentor.approved, newMentor.subject_areas);

            return res.status(200).json(mentorCreate);
        }catch(e){
            console.log(e);
            return res.status(500).json({error: e});
        }
    }
    );

router
    .route('/:mentorId')
    .get(async (req, res) => {
        try{
            let mentorId = req.params.mentorId.trim();

            //Error Handling Will be done

            let mentor = await mentorData.getMentorById(mentorId);
            return res.status(200).json(mentor);

        }catch(e){
            return res
            .status(404)
            .json({error: e});
        }
    }
    )
    .delete(async (req, res) => {
        try{
            let mentorId = req.params.mentorId.trim();

            //Error Handling Will be done

            let mentor = await mentorData.removeMentor(mentorId);
            return res.status(200).json({_id: mentorId, deleted: "true"});

        }catch(e){
            console.log(e);
            return res
            .status(404)
            .json({error: e});
        }
    })
    .put(async (req, res) =>{
        try{
            let mentorId = req.params.mentorId.trim();
            //Error Handling Will be done here

            const updatedMentor = req.body;

            // Error Handling Will be done here

            let mentorCreate = await mentorData.updateMentor(mentorId, updatedMentor.first_name, updatedMentor.last_name, updatedMentor.email, updatedMentor.pwd_hash, updatedMentor.profile_image, updatedMentor.created_at, updatedMentor.summary, updatedMentor.education, updatedMentor.experience, updatedMentor.availability, updatedMentor.approved, updatedMentor.subject_areas);

            return res.status(200).json(mentorCreate);
        }catch(e){
            return res.status(500).json({error: e});
        }
    }
    );

    export {router as mentorRoutes};
    