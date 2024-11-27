import { ObjectId } from "mongodb";
import { mentees } from "../config/mongoCollections.js";
import { checkArrayOfStrings, checkDate, checkEmail, checkStringParams } from "../helpers.js";


export const createMentee = async (
    first_name,
    last_name,
    dob,
    email,
    pwd_hash,
    parent_email = null,
    profile_image = null,
    summary = null,
    skills = null
) => {

    checkStringParams(first_name);
    checkStringParams(last_name);
    checkDate(dob);
    await checkEmail(email, "mentee"); 
    checkStringParams(pwd_hash);
  
    // TODO: These must be optional params
    // checkStringParams(parent_email);
    // checkStringParams(profile_image);
    // checkStringParams(summary);
    // skills = checkArrayOfStrings(skills);

    first_name = first_name.trim();
    last_name = last_name.trim();
    dob = dob.trim();
    email = email.trim();
    pwd_hash = pwd_hash.trim();

    // parent_email = parent_email.trim();
    // profile_image = profile_image.trim();
    summary = summary.trim();

    let newMentee = {
      first_name: first_name,
      last_name: last_name,
      dob: dob,
      email: email,
      pwd_hash: pwd_hash,
      parent_email: parent_email,
      profile_image: profile_image,
      created_at: new Date(),
      summary: summary,
      skills: skills,
      reviews: [],
      badges: []
    }


    const menteeCollection = await mentees();

    const result = await menteeCollection.insertOne(newMentee);

    if (!result.acknowledged || !result.insertedId) throw "Could not create the mentee.";

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

    mentee._id = mentee._id.toString();
    return mentee;
};

export const getMenteeByEmail = async (email) => {
    checkStringParams(email);

    email = email.trim();

    const menteeCollection = await mentees();

    const mentee = await menteeCollection.findOne({ email });

    if (!mentee) {
        throw `Mentee with the email ${email} does not exist.`;
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
        console.log("Update function reached");
        console.log("Mentee ID:", id);

        if (!id || typeof id !== "string") throw new Error("ID must be a non-empty string.");
        if (!ObjectId.isValid(id)) throw new Error(`Invalid Object ID: ${id}`);
        id = id.trim();

        checkStringParams(first_name, "First Name");
        checkStringParams(last_name, "Last Name");
        checkStringParams(email, "Email");

        if (dob) checkDate(dob, "Date of Birth");
        if (parent_email) checkStringParams(parent_email, "Parent Email");
        if (summary) checkStringParams(summary, "Summary");
        if (skills) skills = checkArrayOfStrings(skills);

        let profileImageBinary = null;
        if (profileImageBase64) {
            if (typeof profileImageBase64 === "string") {
                profileImageBinary = Buffer.from(profileImageBase64, "base64");
            } else {
                throw new Error("Invalid image format. Expected a Base64 string.");
            }
        }

        const menteeUpdate = {
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            dob: dob ? dob.trim() : null,
            email: email.trim(),
            parent_email: parent_email ? parent_email.trim() : null,
            profile_image: profileImageBinary,
            summary: summary ? summary.trim() : null,
            skills,
        };


        const menteeCollection = await mentees();

        const result = await menteeCollection.findOneAndUpdate(
            { _id: new ObjectId(id) }, 
            { $set: menteeUpdate },    
            { returnDocument: "after" } 
        );

        console.log("Update result:", result);

        if (!result) {
            throw new Error(`Could not update the mentee. No document found with ID: ${id}`);
        }

        return result;
    } catch (error) {
        console.error("Error in updateMentee:", error.message);
        throw error;
    }
};