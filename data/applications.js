import { mentors } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";

export const getPendingMentorApplications = async () => {
    let mentorCollection = await mentors();
    let pendingApplications = await mentorCollection.find({ approved: false }).toArray();
    return pendingApplications.map(app => ({
        _id: app._id.toString(),
        first_name: app.first_name,
        last_name: app.last_name,
        email: app.email,
        summary: app.summary,
        approved: app.approved
    }));
};

export const updateMentorApproval = async (mentorId, approved) => {

    let mentorCollection = await mentors();
    let result = await mentorCollection.updateOne(
        { _id: ObjectId.createFromHexString(mentorId) },
        { $set: { approved } }
    );

    if (result.matchedCount === 0) {
        throw new Error(`Mentor with ID ${mentorId} not found.`);
    }

    return result;
};
