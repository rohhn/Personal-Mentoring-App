import express from 'express';
import { menteeData, mentorData } from '../data/index.js';
import {dbConnection, closeConnection} from '../config/mongoConnection.js';
import { ObjectId }  from 'mongodb';
import { mentees } from '../config/mongoCollections.js';

const router = express.Router();

router
    .route('/mentors')
    .get(
        async (req, res) => {
            try{
              let mentors = await mentorData.getAllMentors();
              return res.status(200).json(mentors);
            }catch(e){
              return res.status(500).json({e});
            }
        }
    )
    .post(async(req, res) => {
        const newMentor = req.body;

        //Error Handling Will be done here

        try{
            let mentorCreate = await menteeData.createMentee(newMentor.name, newMentor.email, newMentor.password_hash, newMentor.profile_image, newMentor.created_at, newMentor.qualifications, newMentor.experience, newMentor.availability, newMentor.approval_status);

            return res.status(200).json(mentorCreate);
        }catch(e){
            return res.status(500).json({error: e});
        }
    }
    );

router
    .route('/mentors/:mentorId')
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
            let mentorId = req.params.v.trim();

            //Error Handling Will be done

            let mentor = await mentorData.removeMentor(mentorId);
            return res.status(200).json({_id: mentorId, deleted: "true"});

        }catch(e){
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

            let mentorCreate = await menteeData.createMentee(updatedMentor.name, updatedMentor.email, updatedMentor.password_hash, updatedMentor.profile_image, updatedMentor.created_at, updatedMentor.qualifications, updatedMentor.experience, updatedMentor.availability, updatedMentor.approval_status);

            return res.status(200).json(mentorCreate);
        }catch(e){
            return res.status(500).json({error: e});
        }
    }
    );
    