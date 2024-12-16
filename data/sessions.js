import { ObjectId } from "mongodb";
import { sessions, mentees, mentors } from "../config/mongoCollections.js";
import { mentorData, subjectData, parentsData, menteeData } from "./index.js";
import {
    checkDate,
    checkNumber,
    checkStringParams,
    checkAvailability,
    bookSession,
    updateSessionOnCalendar,
    deleteSessionFromCalendar,
    checkTimestamp,
} from "../helpers.js";
import axios from "axios";
import dotenv from "dotenv";
import moment from "moment";
import { start } from "repl";
dotenv.config();

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

const getAccessToken = async () => {
    const tokenUrl =
        "https://zoom.us/oauth/token?grant_type=account_credentials&account_id=aVTQcRZjQa-0PYowbsqg5A";

    try {
        const response = await axios.post(tokenUrl, null, {
            params: {
                grant_type: "client_credentials",
            },
            auth: {
                username: clientId,
                password: clientSecret,
            },
        });

        return response.data.access_token;
    } catch (error) {
        console.error("Error fetching access token:", error.response.data);
        throw new Error("Unable to fetch access token");
    }
};

const createZoomMeeting = async (start_time, end_time) => {
    const accessToken = await getAccessToken();

    const meetingDetails = {
        topic: "Test Meeting",
        type: 2,
        start_time: start_time,
        end_time: end_time,
        timezone: "UTC",
        settings: {
            host_video: true,
            participant_video: true,
        },
    };

    try {
        const response = await axios.post(
            "https://api.zoom.us/v2/users/me/meetings",
            meetingDetails,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data;
    } catch (e) {
        console.error("Error creating Zoom meeting:", e.response.data);
    }
};

export const createSession = async (
    mentor_id,
    mentee_id,
    subject_area,
    start_time,
    end_time
) => {
    checkStringParams(mentor_id);
    checkStringParams(mentee_id);
    checkStringParams(subject_area);
    checkTimestamp(start_time);
    checkTimestamp(end_time);

    mentor_id = mentor_id.trim();
    mentee_id = mentee_id.trim();
    subject_area = subject_area.trim();
    start_time = moment(start_time.trim());
    end_time = moment(end_time.trim());

    // console.log(start_time);
    // console.log(end_time);

    if(end_time.isBefore(start_time)){
        throw "Please enter a valid time range.";
    }

    if (start_time.isBefore(moment())) {
        throw "Start time cannot be in the past.";
    }

    if (end_time.isBefore(moment())) {
        throw "End time cannot be in the past.";
    }

    // Calculate the difference in minutes
    const durationInMinutes = end_time.diff(start_time, 'minutes');

    // Check if the duration exceeds 60 minutes
    if (durationInMinutes > 60 || durationInMinutes <= 0) {
        throw "The session duration must be more than 0 and no more than 1 hour.";
    }

    const sessionCollection = await sessions();

    const conflicts = await sessionCollection.find({
        mentee_id: mentee_id,
        $or: [
            // Case 1: New session's start_time is between an existing session's time range
            {
                $and: [
                    { start_time: { $lte: new Date(start_time) } },
                    { end_time: { $gte: new Date(start_time) } }
                ]
            },
            // Case 2: New session's end_time is between an existing session's time range
            {
                $and: [
                    { start_time: { $lte: new Date(end_time) } },
                    { end_time: { $gte: new Date(end_time) } }
                ]
            },
            // Case 3: New session completely overlaps an existing session
            {
                $and: [
                    { start_time: { $gte: new Date(start_time) } },
                    { end_time: { $lte: new Date(end_time) } }
                ]
            }
        ]
    }).toArray();

    if (conflicts.length > 0) {
        throw('Conflicting sessions found.');
    }

    if (!ObjectId.isValid(mentor_id)) {
        throw `${mentor_id} is not a valid ObjectID.`;
    }

    if (!ObjectId.isValid(mentee_id)) {
        throw `${mentee_id} is not a valid ObjectID.`;
    }

    if (!ObjectId.isValid(subject_area)) {
        throw `${subject_area} is not a valid ObjectID.`;
    }

    const subject = await subjectData.getSubjectById(subject_area);

    if (!subject) {
        throw `The subject does not exists.`;
    }

    const mentorCollection = await mentors();

    const mentor = await mentorCollection.findOne({
        _id: new ObjectId(mentor_id),
    });

    if (!mentor) {
        throw `Mentor with the id ${mentor_id} does not exist.`;
    }

    const menteeCollection = await mentees();

    const mentee = await menteeCollection.findOne({
        _id: new ObjectId(mentee_id),
    });

    if (!mentee) {
        throw `Mentee with the id ${mentee_id} does not exist.`;
    }

    let calendarId = mentor.calendarId;

    let isAvailable = await checkAvailability(calendarId, start_time, end_time);

    if (!isAvailable) {
        throw `This Mentor is not available for this slot, please book another slot.`;
    }

    let bookedSession = await bookSession(
        calendarId,
        subject_area,
        start_time,
        end_time
    );

    let meeting = await createZoomMeeting(start_time, end_time);

    if (mentee.parent_email) {
        let parentEmail = await parentsData.parentsSessionData(
            mentor_id,
            mentee_id,
            subject_area,
            start_time,
            end_time,
            meeting.join_url
        );
    }

    let newSession = {
        mentor_id: mentor_id,
        mentee_id: mentee_id,
        subject_area: subject_area,
        start_time: start_time.toDate(),
        end_time: end_time.toDate(),
        eventId: bookedSession.id,
        status: "scheduled",
        meeting_link: meeting.join_url,
        created_at: new Date().toISOString(),
    };

    const result = await sessionCollection.insertOne(newSession);

    if (!result.acknowledged || !result.insertedId)
        throw "Could not create the session.";

    const newId = result.insertedId.toString();

    const session = await sessionCollection.findOne({
        _id: new ObjectId(newId),
    });

    session._id = session._id.toString();

    let mentorName = `${mentor.first_name} ${mentor.last_name}`;
    let menteeName = `${mentee.first_name} ${mentee.last_name}`;

    let subjectName = subject.name;

    let returnSession = {
        _id: session._id,
        menteeName: menteeName,
        mentorName: mentorName,
        subject_area: subjectName,
        start_time: session.start_time,
        end_time: session.end_time,
        status: session.status,
        eventId: session.eventId,
        created_at: session.created_at,
    };

    return returnSession;
};

export const rescheduleSession = async (id, start_time, end_time) => {
    checkStringParams(id);
    if (!ObjectId.isValid(id)) {
        throw "Invalid object ID.";
    }


    start_time = moment(start_time.trim());
    end_time = moment(end_time.trim());
    

    if(start_time.isAfter(end_time)){
        throw "Please enter a valid time range.";
    }

    if (start_time.isBefore(moment())) {
        throw "Start time cannot be in the past.";
    }

    if (end_time.isBefore(moment())) {
        throw "End time cannot be in the past.";
    }

    // Calculate the difference in minutes
    const durationInMinutes = end_time.diff(start_time, 'minutes');

    // Check if the duration exceeds 60 minutes
    if (durationInMinutes > 60 || durationInMinutes <= 0) {
        throw "The session duration must be more than 0 and no more than 1 hour.";
    }
    

    let reschedSession = {
        start_time: start_time.toDate(),
        end_time: end_time.toDate(),
    };

    const sessionCollection = await sessions();

    let session = await getSessionById(id);

    let eventId = session.eventId;

    let mentor = await mentorData.getMentorById(session.mentor_id);

    let mentee = await menteeData.getMenteeById(session.mentee_id);

    const conflicts = await sessionCollection.find({
        mentee_id: mentee._id,
        _id: { $ne: id ? new ObjectId(id) : null },
        $or: [
            // Case 1: New session's start_time is between an existing session's time range
            {
                $and: [
                    { start_time: { $lte: new Date(start_time) } },
                    { end_time: { $gte: new Date(start_time) } }
                ]
            },
            // Case 2: New session's end_time is between an existing session's time range
            {
                $and: [
                    { start_time: { $lte: new Date(end_time) } },
                    { end_time: { $gte: new Date(end_time) } }
                ]
            },
            // Case 3: New session completely overlaps an existing session
            {
                $and: [
                    { start_time: { $gte: new Date(start_time) } },
                    { end_time: { $lte: new Date(end_time) } }
                ]
            }
        ]
    }).toArray();

    if (conflicts.length > 0) {
        throw('Conflicting sessions found.');
    }

    let calendarId = mentor.calendarId;

    let isAvailable = await checkAvailability(calendarId, start_time, end_time);

    if (!isAvailable) {
        throw `This Mentor is not available for this slot, please book another slot.`;
    }

    let seshUpdateOnCal = await updateSessionOnCalendar(
        calendarId,
        eventId,
        reschedSession.start_time,
        reschedSession.end_time
    );
    

    const result = await sessionCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: reschedSession },
        { returnDocument: "after" }
    );

    if (!result) {
        throw `Could not Reschedule the Session.`;
    }

    result._id = result._id.toString();

    let mentorName = `${mentor.first_name} ${mentor.last_name}`;
    let menteeName = `${mentee.first_name} ${mentee.last_name}`;

    // let subjectName = subject.name;

    let returnSession = {
        _id: result._id,
        mentee_name: menteeName,
        mentor_name: mentorName,
        // subject_area: subjectName,
        start_time: result.start_time,
        end_time: result.end_time,
        status: result.status,
        eventId: result.eventId,
        created_at: result.created_at,
    };

    return returnSession;
};

export const deleteSession = async (id) => {
    checkStringParams(id);
    id = id.trim();

    if (!ObjectId.isValid(id)) {
        throw `${id} is not a valid ObjectID.`;
    }

    const sessionCollection = await sessions();

    const session = await sessionCollection.findOne({ _id: new ObjectId(id) });

    if (!session) {
        throw `Session with the id ${id} does not exist.`;
    }

    const currentTime = new Date();
    const sessionStartTime = new Date(session.start_time);
    const timeDifference = sessionStartTime - currentTime;

    const hoursLeft = timeDifference / (1000 * 60 * 60);

    if (hoursLeft < 24) {
        throw `Cannot delete the session. Only ${hoursLeft.toFixed(
            1
        )} hours left until the session starts.`;
    }

    let eventId = session.eventId;

    let mentor = await mentorData.getMentorById(session.mentor_id);

    let calendarId = mentor.calendarId;

    let deleteEvent = await deleteSessionFromCalendar(calendarId, eventId);

    if (!deleteEvent) {
        throw `Could not delete session from calendar.`;
    }

    let result = await sessionCollection.deleteOne({ _id: new ObjectId(id) });
    if (!result === 0) {
        throw `Session with the id ${id} does not exist, Hence could not delete.`;
    }

    return `${session} has been successfully deleted!`;
};

export const getSessionById = async (id) => {
    checkStringParams(id);

    id = id.trim();

    if (!ObjectId.isValid(id)) {
        throw "Invalid object ID.";
    }

    const sessionCollection = await sessions();

    const session = await sessionCollection.findOne({ _id: new ObjectId(id) });

    if (!session) {
        throw `Session with the id ${id} does not exist.`;
    }

    session._id = session._id.toString();
    return session;
};

export const getSessionsByMentee = async (menteeId, timeline) => {
    checkStringParams(menteeId);
    checkStringParams(timeline);

    menteeId = menteeId.trim();

    if (!ObjectId.isValid(menteeId)) {
        throw "Invalid object ID.";
    }

    const menteeCollection = await mentees();

    const mentee = await menteeCollection.findOne({
        _id: new ObjectId(menteeId),
    });

    if (!mentee) {
        throw `Mentee with the id ${menteeId} does not exist.`;
    }

    if (
        (timeline !== "all") &
        (timeline !== "previous") &
        (timeline !== "upcoming")
    ) {
        throw `Invalid value for timeline.`;
    }

    const sessionCollection = await sessions();

    let query = { mentee_id: menteeId };

    const now = new Date();

    if (timeline === "upcoming") {
        query.start_time = { $gt: now }; // Sessions with start_time in the future
    } else if (timeline === "previous") {
        query.start_time = { $lt: now }; // Sessions with start_time in the past
    }

    const filteredSessions = await sessionCollection.find(query).toArray();
    // if (!filteredSessions || filteredSessions.length === 0) {
    //     throw `No sessions found for the given timeline.`;
    // }

    let returnList = [];
    for (let i = 0; i < filteredSessions.length; i++) {
        let sessionObj = filteredSessions[i];
        let mentor = await mentorData.getMentorById(sessionObj.mentor_id);

        let mentorName = `${mentor.first_name} ${mentor.last_name}`;
        let menteeName = `${mentee.first_name} ${mentee.last_name}`;

        let subject = await subjectData.getSubjectById(sessionObj.subject_area);

        let subjectName = subject.name;

        let returnSession = {
            _id: sessionObj._id,
            mentee_name: menteeName,
            mentee_id: mentee._id,
            mentor_id: mentor._id,
            mentor_name: mentorName,
            subject_area: subjectName,
            start_time: sessionObj.start_time,
            end_time: sessionObj.end_time,
            status: sessionObj.status,
            eventId: sessionObj.eventId,
            created_at: sessionObj.created_at,
            meeting_link: sessionObj.meeting_link,
        };

        returnList.push(returnSession);
    }

    return returnList;
};

export const getSessionsByMentor = async (mentorId, timeline = "all") => {
    checkStringParams(mentorId, "mentorId");
    checkStringParams(timeline, "timeline");

    mentorId = mentorId.trim();

    if (!ObjectId.isValid(mentorId)) {
        throw "Invalid object ID.";
    }

    const mentorCollection = await mentors();

    const mentor = await mentorCollection.findOne({
        _id: new ObjectId(mentorId),
    });

    if (!mentor) {
        throw `Mentor with the id ${mentorId} does not exist.`;
    }

    if (
        (timeline !== "all") &
        (timeline !== "previous") &
        (timeline !== "upcoming")
    ) {
        throw `Invalid value for timeline.`;
    }

    const sessionCollection = await sessions();

    let query = { mentor_id: mentorId };

    const now = new Date();

    if (timeline === "upcoming") {
        query.start_time = { $gt: now }; // Sessions with start_time in the future
    } else if (timeline === "previous") {
        query.start_time = { $lt: now }; // Sessions with start_time in the past
    }

    const filteredSessions = await sessionCollection.find(query).toArray();

    // if (!filteredSessions || filteredSessions.length === 0) {
    //     throw `No sessions found for the given timeline.`;
    // }

    let returnList = [];

    for (let i = 0; i < filteredSessions.length; i++) {
        let sessionObj = filteredSessions[i];
        let mentee = await menteeData.getMenteeById(sessionObj.mentee_id);

        let mentorName = `${mentor.first_name} ${mentor.last_name}`;
        let menteeName = `${mentee.first_name} ${mentee.last_name}`;

        let subject = await subjectData.getSubjectById(sessionObj.subject_area);

        let subjectName = subject.name;

        let returnSession = {
            _id: sessionObj._id,
            mentee_name: menteeName,
            mentor_name: mentorName,
            mentee_id: mentee._id,
            mentor_id: mentor._id,
            subject_area: subjectName,
            start_time: sessionObj.start_time,
            end_time: sessionObj.end_time,
            status: sessionObj.status,
            eventId: sessionObj.eventId,
            created_at: sessionObj.created_at,
            meeting_link: sessionObj.meeting_link,
        };

        returnList.push(returnSession);
    }

    return returnList;
};
