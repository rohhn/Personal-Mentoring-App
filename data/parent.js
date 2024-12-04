import { ObjectId } from 'mongodb';
import nodemailer from 'nodemailer';
import { mentees, mentors } from '../config/mongoCollections.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const parentsSessionData = async (mentorId, menteeId, subjectArea, time, end_time, meetingLink) => {
    if (!mentorId || !menteeId || !subjectArea || !time || !end_time || !meetingLink) {
        throw new Error('Missing required session fields');
    }
    if (!ObjectId.isValid(mentorId) || !ObjectId.isValid(menteeId)) {
        throw new Error('Invalid mentor or mentee ID');
    }

    const mentorCollection = await mentors();
    const menteeCollection = await mentees();

    const mentor = await mentorCollection.findOne({ _id: new ObjectId(mentorId) });
    const mentee = await menteeCollection.findOne({ _id: new ObjectId(menteeId) });

    if (!mentor) throw new Error('Mentor not found');
    if (!mentee) throw new Error('Mentee not found');

    const newSession = {
        mentor_id: mentorId,
        mentee_id: menteeId,
        subject_area: subjectArea,
        time,
        end_time,
        status: 'scheduled',
        meeting_link: meetingLink,
        created_at: new Date().toISOString()
    };


    if (mentee.parent_email) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: mentee.parent_email,
            subject: 'New Mentorship Session Scheduled',
            text: `Dear Parent,

Your child has a new mentorship session scheduled with mentor ${mentor.first_name} ${mentor.last_name} on ${new Date(time).toLocaleString()}.

Meeting Link: ${meetingLink}

Best regards,
Mentorship Team`
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log('Email sent successfully');
        } catch (error) {
            console.error('Error sending email:', error.message);
        }
    }

    return newSession;
};
