import { ObjectId } from 'mongodb';
import nodemailer from 'nodemailer';
import { mentees, mentors } from '../config/mongoCollections.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password'  
    }
});

export const parentsSessionData = async (mentorId, menteeId, subjectArea, time, duration, meetingLink) => {
    if (!mentorId || !menteeId || !subjectArea || !time || !duration || !meetingLink) {
        throw new Error('Missing required session fields');
    }

    const mentorCollection = await mentors();
    const menteeCollection = await mentees();

    const mentor = await mentorCollection.findOne({ _id: new ObjectId(mentorId) });
    const mentee = await menteeCollection.findOne({ _id: new ObjectId(menteeId) });

    if (!mentor) throw new Error('Mentor not found');
    if (!mentee) throw new Error('Mentee not found');

    const newSession = {
        _id: new ObjectId(),
        mentor_id: mentorId,
        mentee_id: menteeId,
        subject_area: subjectArea,
        time,
        duration,
        status: 'scheduled',
        meeting_link: meetingLink,
        created_at: new Date().toISOString()
    };

    const mentorUpdate = await mentorCollection.updateOne(
        { _id: new ObjectId(mentorId) },
        { $push: { sessions: newSession } }
    );

    if (mentorUpdate.modifiedCount === 0) throw new Error('Failed to add session for mentor');

    if (mentee.parent_email) {
        const mailOptions = {
            from: 'your-email@gmail.com',
            to: mentee.parent_email,
            subject: 'New Mentorship Session Scheduled',
            text: `Dear Parent,

Your child has a new mentorship session scheduled with mentor ${mentor.first_name} ${mentor.last_name} on ${new Date(time).toLocaleString()}.

Meeting Link: ${meetingLink}

Best regards,
Mentorship Team`
        };

        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });
    }

    return newSession;
};
