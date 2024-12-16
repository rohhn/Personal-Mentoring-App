import { ObjectId } from "mongodb";
import { mentors } from "../config/mongoCollections.js";
import { subjectData } from "./index.js";
import {
    checkArrayOfStrings,
    checkAvailability,
    checkBoolean,
    checkDate,
    checkEducation,
    checkExperience,
    checkStringParams,
    checkEmail,
    createCalendarForMentor,
    addAvailability,
    validateAvailability,
    getAuthClient,
} from "../helpers.js";
import { google } from "googleapis";

export const createMentor = async (
    first_name,
    last_name,
    dob,
    email,
    summary,
    pwd_hash,
    options
) => {
    first_name = checkStringParams(first_name);
    last_name = checkStringParams(last_name);
    summary = checkStringParams(summary);
    checkDate(dob);

    dob = new Date(dob.trim());

    let approved = "pending";

    let newMentorObj = {
        first_name,
        last_name,
        dob,
        pwd_hash,
        summary,
        approved,
    };

    email = checkEmail(email).toLowerCase();
    const mentorExists = await getMentorByEmail(email).catch((error) => {
        console.log("User doesn't exist.");
    });
    if (mentorExists) {
        const errObj = new Error("User already exists!");
        errObj.statusCode = 400;
        throw errObj;
    } else {
        newMentorObj.email = email;
    }

    let { profile_image, education, experience, subject_areas, availability } =
        options; // Optional params

    if (profile_image !== undefined) {
        newMentorObj.profile_image = profile_image;
    }

    const calendarId = await createCalendarForMentor();
    newMentorObj.calendarId = calendarId;

    const mentorCollection = await mentors();

    const result = await mentorCollection.insertOne(newMentorObj);

    if (!result.acknowledged || !result.insertedId)
        throw "Could not create the mentor.";

    const newId = result.insertedId.toString();

    const mentor = await getMentorById(newId);

    mentor._id = mentor._id.toString();

    delete mentor.pwd_hash;

    delete mentor.pwd_hash;

    return mentor;
};

export const getAllMentors = async () => {
    const mentorCollection = await mentors();

    let allMentors = await mentorCollection
        .find({ approved: "approved" })
        .toArray();

    if (!allMentors) {
        return [];
    }

    allMentors = allMentors.map((mentor) => ({
        _id: mentor._id.toString(),
        name: `${mentor.first_name} ${mentor.last_name}`,
        summary: mentor.summary,
        profile_image: mentor.profile_image,
        subject_areas: mentor.subject_areas,
    }));

    for (let mentorIdx = 0; mentorIdx < allMentors.length; mentorIdx++) {
        const mentor = allMentors[mentorIdx];
        if (mentor.subject_areas) {
            let subject_ids = mentor.subject_areas;

            let subject_areas = [];

            if (subject_ids.length > 0) {
                for (
                    let subjectIdx = 0;
                    subjectIdx < subject_ids.length;
                    subjectIdx++
                ) {
                    let subject = await subjectData.getSubjectById(
                        subject_ids[subjectIdx]
                    );
                    subject_areas.push(subject);
                }
            }

            mentor.subject_areas = subject_areas;
        }
    }

    return allMentors;
};

export const getMentorById = async (id) => {
    checkStringParams(id);

    id = id.trim();

    if (!ObjectId.isValid(id)) {
        throw "Invalid object ID.";
    }

    const mentorCollection = await mentors();

    const mentor = await mentorCollection.findOne({ _id: new ObjectId(id) });

    if (!mentor) {
        throw `Mentor with the id ${id} does not exist.`;
    }

    mentor._id = mentor._id.toString();

    if (mentor.dob && mentor.dob instanceof Date) {
        mentor.dob = mentor.dob.toISOString().split("T")[0];
    }

    if (mentor.subject_areas) {
        let subject_ids = mentor.subject_areas;

        let subject_areas = [];

        if (subject_ids.length > 0) {
            for (let i = 0; i < subject_ids.length; i++) {
                let subject = await subjectData.getSubjectById(subject_ids[i]);
                subject_areas.push(subject);
            }
        }

        mentor.subject_areas = subject_areas;
    }

    return mentor;
};

export const getMentorByEmail = async (email) => {
    checkStringParams(email, "email");

    email = email.trim().toLowerCase();

    const mentorCollection = await mentors();

    const mentor = await mentorCollection.findOne({ email });

    if (!mentor) {
        throw `Mentor with the email ${email} does not exist.`;
    }

    if (mentor.dob && mentor.dob instanceof Date) {
        mentor.dob = mentor.dob.toISOString().split("T")[0];
    }

    mentor._id = mentor._id.toString();

    if (mentor.subject_areas) {
        let subject_ids = mentor.subject_areas;

        let subject_areas = [];

        if (subject_ids.length > 0) {
            for (let i = 0; i < subject_ids.length; i++) {
                let subject = await subjectData.getSubjectById(subject_ids[i]);
                subject_areas.push(subject);
            }
        }

        mentor.subject_areas = subject_areas;
    }

    return mentor;
};

export const removeMentor = async (id) => {
    checkStringParams(id, "id");
    id = id.trim();

    if (!ObjectId.isValid(id)) {
        throw `${id} is not a valid ObjectID.`;
    }

    const mentorCollection = await mentors();

    const mentor = await mentorCollection.findOne({ _id: new ObjectId(id) });

    if (!mentor) {
        throw `Mentor with the id ${id} does not exist.`;
    }

    let result = await mentorCollection.deleteOne({ _id: new ObjectId(id) });
    if (!result === 0) {
        throw `Mentor with the id ${id} does not exist, Hence could not delete.`;
    }

    return `${mentor.name} have been successfully deleted!`;
};

export const updateMentor = async (
    id,
    first_name,
    last_name,
    profileImageBase64 = null,
    summary,
    email,
    education,
    experience,
    subject_areas
) => {
    checkStringParams(id, "id");

    id = id.trim();

    if (!ObjectId.isValid(id)) {
        throw `${id} is not a valid ObjectID.`;
    }

    checkStringParams(first_name, "first_name");
    checkStringParams(last_name, "last name");
    checkEmail(email, "mentor");
    checkStringParams(summary, "summary");
    // education = checkEducation(education);
    experience = checkExperience(experience);
    subject_areas = checkArrayOfStrings(subject_areas);
    // console.log(subject_areas);

    first_name = first_name.trim();
    last_name = last_name.trim();
    // profile_image = profile_image.trim();
    summary = summary.trim();

    let subject_areas_arr = [];

    const mentorCollection = await mentors();

    const mentor = await mentorCollection.findOne({ _id: new ObjectId(id) });

    subject_areas_arr = mentor.subject_areas;

    let newSubjects = [];

    for (let i = 0; i < subject_areas.length; i++) {
        let subject = await subjectData.getSubjectByName(subject_areas[i]);
        newSubjects.push(subject._id.toString());
    }

    let mentorUpdate = {
        first_name: first_name,
        last_name: last_name,
        email: email,
        summary: summary,
        education: education,
        experience: experience,
        subject_areas: newSubjects,
    };

    if (profileImageBase64) {
        mentorUpdate.profile_image = profileImageBase64;
    }

    // const mentorCollection = await mentors();

    const result = await mentorCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: mentorUpdate },
        { returnDocument: "after" }
    );

    if (!result) {
        throw `Could not Update the Mentor.`;
    }

    result._id = result._id.toString();

    if (result.dob && result.dob instanceof Date) {
        result.dob = result.dob.toISOString().split("T")[0];
    }

    return result;
};

export const toAddAvailability = async (id, availability) => {
    checkStringParams(id, "id");
    availability = validateAvailability(availability);

    id = id.trim();

    if (!ObjectId.isValid(id)) {
        throw `${id} is not a valid ObjectID.`;
    }

    const mentorCollection = await mentors();

    const mentor = await mentorCollection.findOne({ _id: new ObjectId(id) });
    if (!mentor) {
        throw `Mentor with ID ${id} not found.`;
    }

    const existingAvailability = mentor.availability || [];

    // Process the availability array to update or append
    const updatedAvailability = [...existingAvailability];

    for (const newEntry of availability) {
        const existingEntryIndex = updatedAvailability.findIndex(
            (entry) => entry.day === newEntry.day
        );

        if (existingEntryIndex !== -1) {
            // Update existing entry for the same day
            updatedAvailability[existingEntryIndex].start_time =
                newEntry.start_time;
            updatedAvailability[existingEntryIndex].end_time =
                newEntry.end_time;
        } else {
            // Append new entry for the day
            updatedAvailability.push(newEntry);
        }
    }

    // Update the database
    const result = await mentorCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { availability: updatedAvailability } },
        { returnDocument: "after" }
    );

    if (!result) {
        throw `Could not update the mentor's availability.`;
    }

    // Ensure the updated availability is also reflected on Google Calendar
    const calendarId = mentor.calendarId;
    if (!calendarId) {
        throw `Mentor with ID ${id} does not have a calendar associated.`;
    }

    const authClient = await getAuthClient();
    const calendar = google.calendar({ version: "v3", auth: authClient });

    // Sync availability to Google Calendar
    for (const entry of updatedAvailability) {
        await addAvailability(
            calendarId,
            entry.day,
            entry.start_time,
            entry.end_time
        );
    }

    console.log(
        "Availability updated successfully on both MongoDB and Google Calendar."
    );

    return {
        _id: result._id.toString(),
        availability: updatedAvailability,
        calendarId: calendarId,
    };
};

export const updateSubjectAreaToMentor = async (id, subjectId) => {
    checkStringParams(id);
    checkStringParams(subjectId);

    id = id.trim();
    subjectId = subjectId.trim();
    console.log("subjectId", subjectId);

    if (!ObjectId.isValid(subjectId)) {
        throw `${id} is not a valid ObjectID.`;
    }

    if (!ObjectId.isValid(subjectId)) {
        throw `${subjectId} is not a valid ObjectID.`;
    }

    const mentorCollection = await mentors();

    const mentor = await mentorCollection.findOne({ _id: new ObjectId(id) });

    let subject_areas = mentor.subject_areas;

    // console.log("Outside subject_areas, ", subject_areas);

    if (!subject_areas.includes(subjectId)) {
        // throw `You already have the subject area.`;
        subject_areas.push(subjectId);

        let updateDoc = {
            subject_areas: subject_areas,
        };

        const mentorCollection = await mentors();

        const result = await mentorCollection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updateDoc },
            { returnDocument: "after" }
        );

        if (!result) {
            throw `Could not Update the Mentor.`;
        }

        result._id = result._id.toString();
    }
    // return result;
};

export const updateSubjectAreaToMentorByName = async (id, subjectName) => {
    checkStringParams(id);
    checkStringParams(subjectName);

    id = id.trim();
    subjectName = subjectName.trim();

    // if (!ObjectId.isValid(subjectId)) {
    //     throw `${subjectId} is not a valid ObjectID.`;
    // }

    const mentorCollection = await mentors();

    const mentor = await mentorCollection.findOne({ _id: new ObjectId(id) });

    let subject = await subjectData.getSubjectByName(subjectName);

    let subjectId = subject._id.toString();

    let subject_areas = mentor.subject_areas;

    if (!subject_areas.includes(subjectId)) {
        // throw `You already have the subject area.`;
        subject_areas.push(subjectId);
    }

    let updateDoc = {
        subject_areas: subject_areas,
    };

    const result = await mentorCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateDoc },
        { returnDocument: "after" }
    );

    if (!result) {
        throw `Could not Update the Mentor.`;
    }

    result._id = result._id.toString();

    return result;
};

export const removeSubjectAreaFromMentor = async (id, subjectId) => {
    checkStringParams(id);
    checkStringParams(subjectId);

    id = id.trim();
    subjectId = subjectId.trim();

    if (!ObjectId.isValid(subjectId)) {
        throw `${id} is not a valid ObjectID.`;
    }

    if (!ObjectId.isValid(subjectId)) {
        throw `${subjectId} is not a valid ObjectID.`;
    }

    const mentorCollection = await mentors();

    const mentor = await mentorCollection.findOne({ _id: new ObjectId(id) });

    let subject_areas = mentor.subject_areas;

    if (!subject_areas.includes(subjectId)) {
        throw `Subject Area is not in your profile.`;
    }

    subject_areas = subject_areas.filter((value) => value !== subjectId);

    let updateDoc = {
        subject_areas: subject_areas,
    };

    const result = await mentorCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateDoc },
        { returnDocument: "after" }
    );

    if (!result) {
        throw `Could not Update the Mentor.`;
    }

    result._id = result._id.toString();

    return result;
};

export const removeSubjectAreaToMentorByName = async (id, subjectName) => {
    checkStringParams(id);
    checkStringParams(subjectName);

    id = id.trim();
    subjectName = subjectName.trim();

    if (!ObjectId.isValid(subjectId)) {
        throw `${subjectId} is not a valid ObjectID.`;
    }

    const mentorCollection = await mentors();

    const mentor = await mentorCollection.findOne({ _id: new ObjectId(id) });

    let subject = await subjectData.getSubjectByName(subjectName);

    let subjectId = subject._id.toString();

    let subject_areas = mentor.subject_areas;

    if (subject_areas.includes(subjectId)) {
        throw `You already have the subject area.`;
    }

    subject_areas = subject_areas.filter((value) => value !== subjectId);

    let updateDoc = {
        subject_areas: subject_areas,
    };

    const result = await mentorCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateDoc },
        { returnDocument: "after" }
    );

    if (!result) {
        throw `Could not Update the Mentor.`;
    }

    result._id = result._id.toString();

    return result;
};

export const getMentorsAboveRating = async (averageRating) => {
    if (
        typeof averageRating !== "number" ||
        averageRating < 0 ||
        averageRating > 5
    ) {
        throw "Invalid average rating. It must be a number between 0 and 5.";
    }

    // Fetch all mentors
    const mentorCollection = await mentors();

    // let allMentors = await mentorCollection.find({}).toArray();

    // if (!allMentors || allMentors.length === 0) {
    //     return [];
    // }

    // Filter mentors based on average rating
    const mentorsAboveRating = await mentorCollection
        .find({
            $and: [
                { averageRating: { $gt: averageRating } }, // Mentors with averageRating greater than the input
                { approved: "approved" }, // Mentors with "approved" status
            ],
        })
        .toArray();

    if (mentorsAboveRating.length === 0) {
        return [];
    }

    // Format the result
    return mentorsAboveRating.map((mentor) => ({
        _id: mentor._id,
        name: `${mentor.first_name} ${mentor.last_name}`,
        // average_rating: (mentor.reviews.reduce((sum, review) => sum + review.rating, 0) / mentor.reviews.length).toFixed(2), // Calculate average rating for display
        reviews_count: mentor.reviews.length,
        profile_image: mentor.profile_image,
        summary: mentor.summary,
    }));
};
