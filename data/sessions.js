import { ObjectId } from "mongodb";
import { sessions, mentees, mentors } from "../config/mongoCollections.js";
import { mentorData, subjectData, parentsData } from "./index.js";
import { checkDate, checkNumber, checkStringParams, checkAvailability, bookSession, updateSessionOnCalendar, deleteSessionFromCalendar, checkTimestamp } from "../helpers.js";
import axios from "axios";
import dotenv from 'dotenv';
dotenv.config();


const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET; 

const  getAccessToken = async () => {
    const tokenUrl = 'https://zoom.us/oauth/token?grant_type=account_credentials&account_id=aVTQcRZjQa-0PYowbsqg5A';

    try {
        const response = await axios.post(tokenUrl, null, {
            params: {
                grant_type: 'client_credentials',
            },
            auth: {
                username: clientId,
                password: clientSecret,
            },
        });

        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching access token:', error.response.data);
        throw new Error('Unable to fetch access token');
    }
}

const createZoomMeeting = async (start_time, end_time) => {
    const accessToken = await getAccessToken();

    const meetingDetails = {
        topic: 'Test Meeting',
        type: 2, 
        start_time: start_time,
        end_time: end_time,
        timezone: 'UTC',
        settings: {
            host_video: true,
            participant_video: true,
        },
    };

    try {
        const response = await axios.post(
            'https://api.zoom.us/v2/users/me/meetings',
            meetingDetails,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data;
    } catch (e) {
        console.error('Error creating Zoom meeting:', e.response.data);
    }
}





export const createSession = async (
    mentor_id,
    mentee_id,
    subject_area,
    start_time,
    end_time,
) => {
    checkStringParams(mentor_id);
    checkStringParams(mentee_id);
    checkStringParams(subject_area);
    checkTimestamp(start_time);
    checkTimestamp(end_time);

    mentor_id = mentor_id.trim();
    mentee_id = mentee_id.trim();
    subject_area = subject_area.trim();
    start_time = new Date(start_time.trim()).toISOString();
    end_time = new Date(end_time.trim()).toISOString();

    if(!ObjectId.isValid(mentor_id)){
        throw `${mentor_id} is not a valid ObjectID.`;
    }

    if(!ObjectId.isValid(mentee_id)){
        throw `${mentee_id} is not a valid ObjectID.`;
    }

    if(!ObjectId.isValid(subject_area)){
        throw `${subject_area} is not a valid ObjectID.`;
    }

    const subject = await subjectData.getSubjectById(subject_area);

    if(!subject){
        throw `The subject does not exists.`;
    }

    const mentorCollection = await mentors();

    const mentor = await mentorCollection.findOne({_id: new ObjectId(mentor_id)});

    if (!mentor) {
        throw `Mentor with the id ${mentor_id} does not exist.`;
    }

    const menteeCollection = await mentees();

    const mentee = await menteeCollection.findOne({_id: new ObjectId(mentee_id)});

    if (!mentee) {
        throw `Mentee with the id ${mentee_id} does not exist.`;
    }

    let calendarId = mentor.calendarId;

    let isAvailable = await checkAvailability(calendarId, start_time, end_time);

    if(!isAvailable){
        throw `This Mentor is not available for this slot, please book another slot.`;
    }

    let bookedSession = await bookSession(calendarId, subject_area, start_time, end_time);

    // console.log(bookedSession);

    
    let meeting = await createZoomMeeting(start_time, end_time);

    if(mentee.parent_email){
        let parentEmail = await parentsData.parentsSessionData(mentor_id, mentee_id, subject_area, start_time, end_time, meeting.join_url);
    }

    let newSession = {
        mentor_id: mentor_id,
        mentee_id: mentee_id,
        subject_area: subject_area,
        start_time: start_time,
        end_time: end_time,
        eventId: bookedSession.id,
        status: "scheduled",
        meeting_link: meeting.join_url,
        created_at: new Date().toISOString()
    }

    const sessionCollection = await sessions();
    
    const result = await sessionCollection.insertOne(newSession);

    if (!result.acknowledged || !result.insertedId)
      throw 'Could not create the session.';
  
    const newId = result.insertedId.toString();


    const session = await sessionCollection.findOne({_id: new ObjectId(newId)});

  
    session._id = session._id.toString();
  
    return session;
}

export const rescheduleSession = async (id, start_time, end_time, status) => {
    checkStringParams(id);
    if (!ObjectId.isValid(id)) {
        throw 'Invalid object ID.';
    }


    checkTimestamp(start_time);
    checkTimestamp(end_time);
    checkStringParams(status);



    start_time = new Date(start_time.trim()).toISOString();
    start_time = new Date(end_time.trim()).toISOString();


    let reschedSession = {
        start_time: start_time,
        end_time: end_time,
        status: status
    }

    const sessionCollection = await sessions();

    let session = await getSessionById(id);

    let eventId = session.eventId;

    let mentor = await mentorData.getMentorById(session.mentor_id);

    let calendarId = mentor.calendarId;

    let isAvailable = await checkAvailability(calendarId, start_time, end_time);

    if(!isAvailable){
        throw `This Mentor is not available for this slot, please book another slot.`;
    }

    let seshUpdateOnCal = await updateSessionOnCalendar(calendarId, eventId, start_time, end_time);

  
    const result = await sessionCollection.findOneAndUpdate(
      {_id: new ObjectId(id)},
      {$set: reschedSession},
      {returnDocument: 'after'}
    );
  
    if(!result){
      throw `Could not Reschedule the Session.`;
    }
  
    result._id = result._id.toString();
  
    return result;

}

export const deleteSession = async (id) => {
    checkStringParams(id);
    id = id.trim();

    if(!ObjectId.isValid(id)){
        throw `${id} is not a valid ObjectID.`;
    }

    const sessionCollection = await sessions();

    const session = await sessionCollection.findOne({_id: new ObjectId(id)});

    if (!session) {
        throw `Session with the id ${id} does not exist.`;
    }

    
    const currentTime = new Date();
    const sessionStartTime = new Date(session.start_time);
    const timeDifference = sessionStartTime - currentTime;

    const hoursLeft = timeDifference / (1000 * 60 * 60);

    if (hoursLeft < 24) {
        throw `Cannot delete the session. Only ${hoursLeft.toFixed(1)} hours left until the session starts.`;
    }

    let eventId = session.eventId;

    let mentor = await mentorData.getMentorById(session.mentor_id);

    let calendarId = mentor.calendarId;

    let deleteEvent = await deleteSessionFromCalendar(calendarId, eventId);

    if(!deleteEvent){
        throw `Could not delete session from calendar.`
    }

    let result = await sessionCollection.deleteOne({_id: new ObjectId(id)});
    if(!result === 0){
        throw `Session with the id ${id} does not exist, Hence could not delete.`;
    }

    return `${session} has been successfully deleted!`;
    }

export const getSessionById = async (id) => {
    checkStringParams(id);

    id = id.trim();

    if (!ObjectId.isValid(id)) {
        throw 'Invalid object ID.';
    }

    const sessionCollection = await sessions();

    const session = await sessionCollection.findOne({_id: new ObjectId(id)});

    if (!session) {
        throw `Session with the id ${id} does not exist.`;
    }

    session._id = session._id.toString();
    return session;
}

export const getSessionsByMentee = async (menteeId) => {
    checkStringParams(menteeId);

    menteeId = menteeId.trim();

    if (!ObjectId.isValid(menteeId)) {
        throw 'Invalid object ID.';
    }

    const menteeCollection = await mentees();

    const mentee = await menteeCollection.findOne({_id: new ObjectId(menteeId)});

    if (!mentee) {
        throw `Mentee with the id ${menteeId} does not exist.`;
    }


    const sessionCollection = await sessions();

    const sessionsByMentee = await sessionCollection.find({mentee_id: menteeId}).toArray();


    if(!sessionsByMentee){
        throw `No Sessions scheduled.`;
    }

    return sessionsByMentee;
}


export const getSessionsByMentor = async (mentorId) => {
    checkStringParams(mentorId);

    mentorId = mentorId.trim();

    if (!ObjectId.isValid(mentorId)) {
        throw 'Invalid object ID.';
    }

    const mentorCollection = await mentors();

    const mentor = await mentorCollection.findOne({_id: new ObjectId(mentorId)});

    if (!mentor) {
        throw `Mentor with the id ${mentorId} does not exist.`;
    }


    const sessionCollection = await sessions();

    const sessionsByMentor = await sessionCollection.find({mentor_id: mentorId}).toArray();


    if(!sessionsByMentor){
        throw `No Sessions scheduled.`;
    }

    return sessionsByMentor;
}