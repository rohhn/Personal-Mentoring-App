import { ObjectId } from 'mongodb';
import { mentees, mentors } from '../config/mongoCollections.js';

const badgeMilestones = [
    { sessions: 5, badge: { badge_id: 'badge_5_sessions', name: 'Beginner', description: 'Awarded for completing 5 sessions', icon: 'public/css/badge_3_icon' } },
    { sessions: 10, badge: { badge_id: 'badge_10_sessions', name: 'Intermediate', description: 'Awarded for completing 10 sessions', icon: 'public/css/badge_10_icon' } },
    { sessions: 12, badge: { badge_id: 'badge_100_sessions', name: 'Advanced', description: 'Awarded for completing 100 sessions', icon: 'public/css/badge_100_icon' } },
];

export const awardBadgeBasedOnSessions = async (userId, userType) => {
    if (!userId || typeof userId !== 'string' || !ObjectId.isValid(userId)) {
        throw new Error('Invalid userId');
    }
    if (userType !== 'mentor' && userType !== 'mentee') {
        throw new Error('Invalid userType, must be "mentor" or "mentee"');
    }

    const collection = userType === 'mentor' ? await mentors() : await mentees();
    const user = await collection.findOne({ _id: new ObjectId(userId) });

    if (!user) throw new Error('User not found');

    const reviews = user.reviews || [];
    const sessionCount = reviews.length;

    let latestBadge = null;
    for (const milestone of badgeMilestones) {
        if (sessionCount >= milestone.sessions) {
            latestBadge = { ...milestone.badge, created_at: new Date().toISOString() };
        }
    }
    if (latestBadge) {
        const existingBadge = user.badges?.[0]; // Assume only one badge is stored
        if (!existingBadge || existingBadge.name !== latestBadge.name) {
            await collection.updateOne(
                { _id: new ObjectId(userId) },
                { $set: { badges: [latestBadge] } }
            );
        }
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
