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
} from "../helpers.js";


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
    // TODO: Implement a proper date check
    // dob = checkDate(dob);

    let newMentorObj = {
        first_name,
        last_name,
        dob,
        pwd_hash,
        summary,
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

    return mentor;
};

export const getAllMentors = async () => {
    const mentorCollection = await mentors();

    let allMentors = await mentorCollection.find({}).toArray();

    if (!allMentors) {
        return [];
    }

    allMentors = allMentors.map((mentor) => ({
        _id: mentor._id.toString(),
        name: `${mentor.first_name} ${mentor.last_name}`,
    }));

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
    return mentor;
};

export const getMentorByEmail = async (email) => {
    checkStringParams(email, "email");

    email = email.trim();

    const mentorCollection = await mentors();

    const mentor = await mentorCollection.findOne({ email });

    if (!mentor) {
        throw `Mentor with the email ${email} does not exist.`;
    }

    mentor._id = mentor._id.toString();
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
    dob,
    pwd_hash,
    profile_image,
    summary,
    education,
    experience,
    availability,
    approved,
    subject_areas
) => {
    checkStringParams(id, "id");

    id = id.trim();

    if (!ObjectId.isValid(id)) {
        throw `${id} is not a valid ObjectID.`;
    }

  checkStringParams(first_name);
  checkStringParams(last_name);
  checkDate(dob);
  await checkEmail(email, "mentor");
  // checkStringParams(pwd_hash);
  // checkStringParams(profile_image);
  // checkStringParams(summary);
  // checkBoolean(approved);
  // education = checkEducation(education);
  // experience = checkExperience(experience);
  // subject_areas = checkArrayOfStrings(subject_areas);

    first_name = first_name.trim();
    last_name = last_name.trim();
    dob = dob.trim();
    pwd_hash = pwd_hash.trim();
    profile_image = profile_image.trim();
    summary = summary.trim();

    let mentorUpdate = {
        first_name: first_name,
        last_name: last_name,
        dob: dob,
        pwd_hash: pwd_hash,
        profile_image: profile_image,
        summary: summary,
        education: education,
        experience: experience,
        approved: approved,
        subject_areas: subject_areas,
    };

    const mentorCollection = await mentors();

    const result = await mentorCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: mentorUpdate },
        { returnDocument: "after" }
    );

    if (!result) {
        throw `Could not Update the Mentor.`;
    }

    result._id = result._id.toString();

    return result;
};

export const toAddAvailability = async (id, availability) => {
    checkStringParams(id, "id");
    availability = validateAvailability(availability);

    id = id.trim();

    if (!ObjectId.isValid(id)) {
        throw `${id} is not a valid ObjectID.`;
    }

    let mentor = await getMentorById(id);

    let calendarId = mentor.calendarId;

    console.log(availability);

    for (let i in availability) {
        let day = availability[i].day;
        let start_time = availability[i].start_time;
        let end_time = availability[i].end_time;

    console.log(av);

  }
}

export const updateSubjectAreaToMentor = async (id, subjectId) => {
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

    let mentor = await getMentorById(id);

    let subject = await subjectData.getSubjectById(subjectId);

    let subject_areas = mentor.subject_areas;

    if (subject_areas.includes(subjectId)) {
        throw `You already have the subject area.`;
    }

    subject_areas.push(subjectId);

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

export const updateSubjectAreaToMentorByName = async (id, subjectName) => {
    checkStringParams(id);
    checkStringParams(subjectName);

    id = id.trim();
    subjectName = subjectName.trim();

    if (!ObjectId.isValid(subjectId)) {
        throw `${subjectId} is not a valid ObjectID.`;
    }

    let mentor = await getMentorById(id);

    let subject = await subjectData.getSubjectByName(subjectName);

    let subjectId = subject._id.toString();

    let subject_areas = mentor.subject_areas;

    if (subject_areas.includes(subjectId)) {
        throw `You already have the subject area.`;
    }

    subject_areas.push(subjectId);

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

    let mentor = await getMentorById(id);

    let subject = await subjectData.getSubjectById(subjectId);

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

    let mentor = await getMentorById(id);

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
