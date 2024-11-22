import { ObjectId } from "mongodb";
import { sessions, mentees, mentors } from "../config/mongoCollections.js";
import { checkDate, checkNumber, checkStringParams } from "../helpers.js";
import axios from "axios";
// import jsonwebtoken from "jsonwebtoken";

const clientId = "xVOOK02JTwSW6xEvYeU5Gw";
const clientSecret = 'zrfgF41GpvGzQFcbpRUfSZlLMYpr4NVf'; 

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

const createZoomMeeting = async (start_time, duration) => {
    const accessToken = await getAccessToken();

    const meetingDetails = {
        topic: 'Test Meeting',
        type: 2, 
        start_time: start_time,
        duration: duration/60,
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

        // console.log('Meeting created successfully:', response.data);
        return response.data;
    } catch (e) {
        console.error('Error creating Zoom meeting:', e.response.data);
        // return response.status(500).json({error:e.response.data});
    }
}


export const createSession = async (
    mentor_id,
    mentee_id,
    subject_area,
    time,
    duration
) => {
    checkStringParams(mentor_id);
    checkStringParams(mentee_id);
    checkStringParams(subject_area);
    checkDate(time);
    checkNumber(duration);

    mentor_id = mentor_id.trim();
    mentee_id = mentee_id.trim();
    subject_area = subject_area.trim();

    if(!ObjectId.isValid(mentor_id)){
        throw `${mentor_id} is not a valid ObjectID.`;
    }

    if(!ObjectId.isValid(mentee_id)){
        throw `${mentee_id} is not a valid ObjectID.`;
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

    
    let meeting = await createZoomMeeting(time, duration);

    // console.log(meeting);

    //TODO Availability Logic to be worked on

    let newSession = {
        mentor_id: mentor_id,
        mentee_id: mentee_id,
        subject_area: subject_area,
        time: time,
        duration: duration,
        status: "scheduled",
        meeting_link: meeting.join_url,
        created_at: new Date().toISOString()
    }

    const sessionCollection = await sessions();
    
    const result = await sessionCollection.insertOne(newSession);

    if (!result.acknowledged || !result.insertedId)
      throw 'Could not create the mentee.';
  
    const newId = result.insertedId.toString();


    const session = await sessionCollection.findOne({_id: new ObjectId(newId)});

  
    session._id = session._id.toString();
  
    return session;
}