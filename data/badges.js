import { ObjectId } from 'mongodb';
import { mentees, mentors } from '../config/mongoCollections.js';

const badgeMilestones = [
    { sessions: 3, badge: { badge_id: 'badge_3_sessions', name: '3 Sessions Completed', description: 'Awarded for completing 3 sessions', icon: 'badge_3_icon' } },
    { sessions: 5, badge: { badge_id: 'badge_5_sessions', name: '5 Sessions Completed', description: 'Awarded for completing 5 sessions', icon: 'badge_5_icon' } },
    { sessions: 10, badge: { badge_id: 'badge_10_sessions', name: '10 Sessions Completed', description: 'Awarded for completing 10 sessions', icon: 'badge_10_icon' } },
    // Add more milestones as needed
];

export const awardBadgeBasedOnSessions = async (userId, userType) => {
    if (!userId || typeof userId !== 'string' || !ObjectId.isValid(userId)) {
        throw new Error('Invalid userId');
    }
    if (userType !== 'mentor' && userType !== 'mentee') {
        throw new Error('Invalid userType, must be "mentor" or "mentee"');
    }

    // Select the collection based on user type
    const collection = userType === 'mentor' ? await mentors() : await mentees();

    // Fetch user and handle undefined reviews or badges arrays
    const user = await collection.findOne({ _id: new ObjectId(userId) });
    if (!user) throw new Error('User not found');

    const reviews = user.reviews || [];
    const badges = user.badges || [];
    const sessionCount = reviews.length;

    // Check for badge milestones and add badges accordingly
    for (const milestone of badgeMilestones) {
        if (sessionCount >= milestone.sessions) {
            const hasBadge = badges.some(badge => badge.badge_id === milestone.badge.badge_id);
            if (!hasBadge) {
                // Add the badge to the user's badges array
                await collection.updateOne(
                    { _id: new ObjectId(userId) },
                    { $push: { badges: { ...milestone.badge, created_at: new Date().toISOString() } } }
                );
                console.log(`Awarded badge: ${milestone.badge.name} to user ${userId}`);
            }
        }
    }

    return { sessionCount, badges };
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
    if (!user) throw new Error('User not found');

    return user.badges || [];
};
