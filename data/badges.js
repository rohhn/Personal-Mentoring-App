import { ObjectId } from 'mongodb';
import { mentees, mentors } from '../config/mongoCollections.js';
import { getSessionsByMentee, getSessionsByMentor } from './sessions.js';

const badgeMilestones = [
    { sessions: 5, badge: { badge_id: 'Beginner', name: 'Beginner', description: 'Awarded for completing 5 sessions', icon: 'badge_3_icon.png' } },
    { sessions: 10, badge: { badge_id: 'Intermediate', name: 'Intermediate', description: 'Awarded for completing 10 sessions', icon: 'badge_10_icon.png' } },
    { sessions: 12, badge: { badge_id: 'Advance', name: 'Advanced', description: 'Awarded for completing 12 sessions', icon: 'badge_100_icon.png' } },
];

export const countSessions = async (userId, userType) => {
    if (!userId || typeof userId !== 'string' || !ObjectId.isValid(userId)) {
        throw new Error('Invalid userId');
    }

    if (userType !== 'mentor' && userType !== 'mentee') {
        throw new Error('Invalid userType, must be "mentor" or "mentee"');
    }

    let sessions = [];
    if (userType === 'mentor') {
        sessions = await getSessionsByMentor(userId, 'previous'); 
    } else if (userType === 'mentee') {
        sessions = await getSessionsByMentee(userId, 'previous');
    }
    const sessionCount = sessions.length;

    console.log(`Session count for userId: ${userId}, userType: ${userType} is ${sessionCount}`);
    return sessionCount;
};


export const awardBadgeBasedOnSessions = async (userId, userType) => {
    if (!userId || typeof userId !== 'string' || !ObjectId.isValid(userId)) {
        throw new Error('Invalid userId');
    }
    if (userType !== 'mentor' && userType !== 'mentee') {
        throw new Error('Invalid userType, must be "mentor" or "mentee"');
    }

    const collection = userType === 'mentor' ? await mentors() : await mentees();
    const sessionCount = await countSessions(userId, userType);
    const existingBadges = await getUserBadges(userId, userType);
    console.log(sessionCount)

    let latestBadge = null;
    for (const milestone of badgeMilestones) {
        if (sessionCount >= milestone.sessions) {
            latestBadge = { ...milestone.badge, created_at: new Date().toISOString() };
        }
    }

    if (!latestBadge) {
        return { sessionCount, badge: null }; 
    }
    const existingBadge = existingBadges?.[0];
    if (!existingBadge || existingBadge.name !== latestBadge.name) {
        await collection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { badges: [latestBadge] } }
        );
    }

    return { sessionCount, badge: latestBadge };
};



export const getUserBadges = async (userId, userType) => {
    if (!userId || typeof userId !== 'string' || !ObjectId.isValid(userId)) {
        throw new Error('Invalid userId');
    }
    if (userType !== 'mentor' && userType !== 'mentee') {
        throw new Error('Invalid userType, must be "mentor" or "mentee"');
    }

    const collection = userType === 'mentor' ? await mentors() : await mentees();
    const user = await collection.findOne({ _id: new ObjectId(userId) }, { projection: { badges: 1 } });
    if (!user) throw new Error('No badges for this user');

    return user.badges || [];
};
