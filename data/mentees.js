import { ObjectId } from "mongodb";
import { mentees } from "../config/mongoCollections.js";
import {
    checkArrayOfStrings,
    checkDate,
    checkEmail,
    checkStringParams,
} from "../helpers.js";
import { isParentEmailRequired } from "../helpers/mentees.js";

export const createMentee = async (
    first_name,
    last_name,
    dob,
    email,
    summary,
    pwd_hash,
    options = {}
) => {
    first_name = checkStringParams(first_name);
    last_name = checkStringParams(last_name);
    summary = checkStringParams(summary);
    
    checkDate(dob);

    let newMenteeObj = {
        first_name: first_name,
        last_name: last_name,
        dob: new Date(dob.trim()),
        pwd_hash: pwd_hash,
        summary: summary,
    };

    email = checkEmail(email).toLowerCase();
    const menteeExists = await getMenteeByEmail(email).catch((error) => {
        console.log("User doesn't exist.");
    });
    if (menteeExists) {
        const errObj = new Error("User already exists!");
        errObj.statusCode = 400;
        throw errObj;
    } else {
        newMenteeObj.email = email;
    }

    // optional params
    let { parent_email, profile_image, skills } = options;

    if (isParentEmailRequired(dob)) {
        checkStringParams(parent_email);
        parent_email = checkEmail(parent_email).toLowerCase();
        newMenteeObj.parent_email = parent_email;
    }

    if (profile_image !== undefined) {
        newMenteeObj.profile_image = profile_image;
    }

    if (skills !== undefined) {
        skills = checkArrayOfStrings(skills);
        newMenteeObj.skills = skills;
    }

    const menteeCollection = await mentees();

    const result = await menteeCollection.insertOne(newMenteeObj);

    if (!result.acknowledged || !result.insertedId)
        throw "Could not create the mentee.";

    const newId = result.insertedId.toString();

    const mentee = await getMenteeById(newId);

    mentee._id = mentee._id.toString();

    return mentee;
};

export const getAllMentees = async () => {
    const menteeCollection = await mentees();

    let allMentees = await menteeCollection.find({}).toArray();

    if (!allMentees) {
        return [];
    }

    allMentees = allMentees.map((mentee) => ({
        _id: mentee._id.toString(),
        name: mentee.name,
    }));

    return allMentees;
};

export const getMenteeById = async (id) => {
    checkStringParams(id);

    id = id.trim();

    if (!ObjectId.isValid(id)) {
        throw "Invalid object ID.";
    }

    const menteeCollection = await mentees();

    const mentee = await menteeCollection.findOne({ _id: new ObjectId(id) });

    if (!mentee) {
        throw `Mentee with the id ${id} does not exist.`;
    }

    if (mentee.dob && mentee.dob instanceof Date) {
        mentee.dob = mentee.dob.toISOString().split('T')[0]; 
    }

    mentee._id = mentee._id.toString();
    return mentee;
};

export const getMenteeByEmail = async (email) => {
    email = checkStringParams(email).toLowerCase();

    const menteeCollection = await mentees();

    const mentee = await menteeCollection.findOne({ email });

    if (!mentee) {
        throw `Mentee with the email ${email} does not exist.`;
    }

    if (mentee.dob && mentee.dob instanceof Date) {
        mentee.dob = mentee.dob.toISOString().split('T')[0]; 
    }

    mentee._id = mentee._id.toString();
    return mentee;
};

export const removeMentee = async (id) => {
    checkStringParams(id);
    id = id.trim();

    if (!ObjectId.isValid(id)) {
        throw `${id} is not a valid ObjectID.`;
    }

    const menteeCollection = await mentees();

    const mentee = await menteeCollection.findOne({ _id: new ObjectId(id) });

    if (!mentee) {
        throw `Mentee with the id ${id} does not exist.`;
    }

    let result = await menteeCollection.deleteOne({ _id: new ObjectId(id) });
    if (!result === 0) {
        throw `Mentee with the id ${id} does not exist, Hence could not delete.`;
    }

    return `${mentee.name} have been successfully deleted!`;
};

export const updateMentee = async (
    id,
    first_name,
    last_name,
    dob,
    email,
    parent_email = null,
    profileImageBase64 = null,
    summary = null,
    skills = []
) => {
    try {
        if (!id || typeof id !== "string")
            throw new Error("ID must be a non-empty string.");
        if (!ObjectId.isValid(id)) throw new Error(`Invalid Object ID: ${id}`);
        id = id.trim();

        checkStringParams(first_name, "First Name");
        checkStringParams(last_name, "Last Name");
        //         checkStringParams(email, "Email");
        await checkEmail(email, "mentee");

        if (dob) checkDate(dob, "Date of Birth");
        if (parent_email) checkStringParams(parent_email, "Parent Email");
        if (summary) checkStringParams(summary, "Summary");
        if (skills) skills = checkArrayOfStrings(skills);

        const menteeUpdate = {
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            dob: dob ? new Date(dob.trim()) : null,
            email: email.trim(),
            parent_email: parent_email ? parent_email.trim() : null,
            summary: summary ? summary.trim() : null,
            skills,
        };

        if (profileImageBase64) {
            menteeUpdate.profile_image = profileImageBase64;
        }

        const menteeCollection = await mentees();

        const result = await menteeCollection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: menteeUpdate },
            { returnDocument: "after" }
        );

        if (!result) {
            throw new Error(
                `Could not update the mentee. No document found with ID: ${id}`
            );
        }
        if (result.dob && result.dob instanceof Date) {
            result.dob = result.dob.toISOString().split('T')[0]; 
        }

        return result;
    } catch (error) {
        console.error("Error in updateMentee:", error.message);
        throw error;
    }
};
