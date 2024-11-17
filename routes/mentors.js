import express from 'express';
import { ObjectId } from 'mongodb';
import { mentors } from '../config/mongoCollections.js';
import { mentorData } from '../data/index.js';
import { checkArrayOfStrings, checkAvailability, checkBoolean, checkDate, checkEducation, checkExperience, checkStringParams } from "../helpers.js";

const router = express.Router();

router
    .route('/')
    .get(
        async (req, res) => {
            try{
              let mentors = await mentorData.getAllMentors();
              return res.status(200).json(mentors);
            }catch(e){
                // console.log(e);
              return res.status(500).json({e});
            }
        }
    )
    .post(async(req, res) => {
        const newMentor = req.body;

        try{
            checkStringParams(newMentor.first_name);
            checkStringParams(newMentor.last_name);
            checkDate(newMentor.dob);
            checkStringParams(newMentor.email);
            checkStringParams(newMentor.pwd_hash);
            checkStringParams(newMentor.profile_image);
            checkDate(newMentor.created_at);
            checkStringParams(newMentor.summary);
            checkBoolean(newMentor.approved);
            newMentor.education = checkEducation(newMentor.education);
            newMentor.experience = checkExperience(newMentor.experience);
            newMentor.subject_areas = checkArrayOfStrings(newMentor.subject_areas);
            newMentor.availability = checkAvailability(newMentor.availability);
        }catch(e){
            // console.log(e);
            return res.status(400).json({error: e});
        }


              
        
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
        let mentorId = req.params.mentorId.trim();

        try{
            checkStringParams(mentorId);
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
            return res
            .status(404)
            .json({error: e});
        }

        try{

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
        let mentorId = req.params.mentorId.trim();

        try{
            checkStringParams(mentorId);
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
            return res
            .status(404)
            .json({error: e});
        }

        try{
            let mentor = await mentorData.removeMentor(mentorId);
            return res.status(200).json({_id: mentorId, deleted: "true"});

        }catch(e){
            // console.log(e);
            return res
            .status(404)
            .json({error: e});
        }
    })
    .put(async (req, res) =>{
        let mentorId = req.params.mentorId.trim();
        //Error Handling Will be done here

        try{
            checkStringParams(mentorId);
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
            return res
            .status(404)
            .json({error: e});
        }


        const updatedMentor = req.body;

        try{
            checkStringParams(updatedMentor.first_name);
            checkStringParams(updatedMentor.last_name);
            checkDate(updatedMentor.dob);
            checkStringParams(updatedMentor.email);
            checkStringParams(updatedMentor.pwd_hash);
            checkStringParams(updatedMentor.profile_image);
            checkDate(updatedMentor.created_at);
            checkStringParams(updatedMentor.summary);
            checkBoolean(updatedMentor.approved);
            updatedMentor.education = checkEducation(updatedMentor.education);
            updatedMentor.experience = checkExperience(updatedMentor.experience);
            updatedMentor.subject_areas = checkArrayOfStrings(updatedMentor.subject_areas);
            updatedMentor.availability = checkAvailability(updatedMentor.availability);
        }catch(e){
            // console.log(e);
            return res.status(400).json({error: e});
        }
        
        try{
            let mentorCreate = await mentorData.updateMentor(mentorId, updatedMentor.first_name, updatedMentor.last_name, updatedMentor.dob, updatedMentor.email, updatedMentor.pwd_hash, updatedMentor.profile_image, updatedMentor.created_at, updatedMentor.summary, updatedMentor.education, updatedMentor.experience, updatedMentor.availability, updatedMentor.approved, updatedMentor.subject_areas);

            return res.status(200).json(mentorCreate);
        }catch(e){
            return res.status(500).json({error: e});
        }
    }
    );

    export { router as mentorRoutes };
    