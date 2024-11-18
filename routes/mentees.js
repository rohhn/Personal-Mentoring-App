import express from 'express';
import { menteeData, mentorData } from '../data/index.js';
import {dbConnection, closeConnection} from '../config/mongoConnection.js';
import { ObjectId }  from 'mongodb';
import { mentees } from '../config/mongoCollections.js';
import { checkBoolean, checkStringParams, checkArrayOfStrings, checkDate } from "../helpers.js";

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

        try{
            checkStringParams(newMentee.first_name);
            checkStringParams(newMentee.last_name);
            checkDate(newMentee.dob);
            checkStringParams(newMentee.email);
            checkStringParams(newMentee.pwd_hash);
            checkStringParams(newMentee.parent_email);
            checkStringParams(newMentee.profile_image);
            checkDate(newMentee.created_at);
            checkStringParams(newMentee.summary);
            newMentee.skills = checkArrayOfStrings(newMentee.skills);
        }catch(e){
            return res.status(400).json({error: e});
        }

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
        let menteeId = req.params.menteeId.trim();

        try{
            checkStringParams(menteeId);
            if (!ObjectId.isValid(menteeId)) {
                throw 'Invalid object ID.';
                }
        }catch(e){
            return res.status(400).json({error: e});
        }

        menteeId = menteeId.trim();

        try{
        const menteeCollection = await mentees();

        const mentor = await menteeCollection.findOne({_id: new ObjectId(menteeId)});

        if (!mentor) {
            throw `Mentor with the id ${menteeId} does not exist.`;
        }
        }catch(e){
            return res
            .status(404)
            .json({error: e});
        }

        
        try{
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
        let menteeId = req.params.menteeId.trim();

        try{
            checkStringParams(menteeId);
            if (!ObjectId.isValid(menteeId)) {
                throw 'Invalid object ID.';
                }
        }catch(e){
            return res.status(400).json({error: e});
        }

        menteeId = menteeId.trim();

        try{
        const menteeCollection = await mentees();

        const mentor = await menteeCollection.findOne({_id: new ObjectId(menteeId)});

        if (!mentor) {
            throw `Mentor with the id ${menteeId} does not exist.`;
        }
        }catch(e){
            return res
            .status(404)
            .json({error: e});
        }
        try{
            let mentee = await menteeData.removeMentee(menteeId);
            return res.status(200).json({_id: menteeId, deleted: "true"});

        }catch(e){
            return res
            .status(404)
            .json({error: e});
        }
    })
    .put(async (req, res) =>{
        let menteeId = req.params.menteeId.trim();

        try{
            checkStringParams(menteeId);
            if (!ObjectId.isValid(menteeId)) {
                throw 'Invalid object ID.';
                }
        }catch(e){
            return res.status(400).json({error: e});
        }

        menteeId = menteeId.trim();

        try{
        const menteeCollection = await mentees();

        const mentor = await menteeCollection.findOne({_id: new ObjectId(menteeId)});

        if (!mentor) {
            throw `Mentor with the id ${menteeId} does not exist.`;
        }
        }catch(e){
            return res
            .status(404)
            .json({error: e});
        }

        const updatedMentee = req.body;

        try{
            checkStringParams(updatedMentee.first_name);
            checkStringParams(updatedMentee.last_name);
            checkDate(updatedMentee.dob);
            checkStringParams(updatedMentee.email);
            checkStringParams(updatedMentee.pwd_hash);
            checkStringParams(updatedMentee.parent_email);
            checkStringParams(updatedMentee.profile_image);
            checkDate(updatedMentee.created_at);
            checkStringParams(updatedMentee.summary);
            updatedMentee.skills = checkArrayOfStrings(updatedMentee.skills);
        }catch(e){
            return res.status(400).json({error: e});
        }
        
        
        try{
            const mentee = await menteeData.updateMentee(menteeId, updatedMentee.first_name, updatedMentee.last_name, updatedMentee.dob, updatedMentee.email, updatedMentee.pwd_hash, updatedMentee.parent_email, updatedMentee.profile_image, updatedMentee.created_at, updatedMentee.summary, updatedMentee.skills);

            return res.status(200).json(mentee);
        }catch(e){
            // console.log(e);
            return res.status(500).json({error: e});
        }
    }
    );

export {router as menteeRoutes};
    