import { ObjectId } from "mongodb";
import { subject_areas } from "../config/mongoCollections.js";
import { checkStringParams } from "../helpers.js";

export const createSubjectArea = async (name, description = "") => {
    checkStringParams(name);
    checkStringParams(description, true);

    const subjectAreasCollection = await subject_areas();

    try {
        const subjectArea = getSubjectByName(name);
        return subjectArea;
    } catch {
        const newSubjectArea = {
            name: name.toLowerCase().trim(),
            description: description.toLowerCase().trim(),
        };

        const result = subjectAreasCollection.insertOne(newSubjectArea);

        if (!result.acknowledged || !result.insertedId) throw Error("Could not create the subject area.");

        const newId = result.insertedId.toString();

        const subjectArea = await getSubjectById(newId);

        subjectArea._id = subjectArea._id.toString();
        return subjectArea;
    }
};

export const getAllSubjectAreas = async () => {
    const subjectAreasCollection = await subject_areas();

    let allSubjects = await subjectAreasCollection.find({}).toArray();

    if (!allSubjects) {
        return [];
    }

    allSubjects.forEach((element) => {
        element._id = element._id.toString();
    });

    return allSubjects;
};

export const getSubjectById = async (id) => {
    checkStringParams(id);

    id = id.trim();

    if (!ObjectId.isValid(id)) {
        throw "Invalid object ID.";
    }

    const subjectAreasCollection = await subject_areas();

    const subject = await subjectAreasCollection.findOne({ _id: new ObjectId(id) });
    console.log(subject);
    if (!subject) {
        throw `Subject area with the id ${id} does not exist.`;
    }

    subject._id = subject._id.toString();
    return subject;
};

export const getSubjectByName = async (name) => {
    checkStringParams(name);

    name = name.trim().toLowerCase();

    const subjectAreasCollection = await subject_areas();

    const subject = await subjectAreasCollection.findOne({ name });

    if (!subject) {
        throw `Subject with the name ${name} does not exist.`;
    }

    subject._id = subject._id.toString();
    return subject;
};

export const removeSubjectArea = async (id) => {
    checkStringParams(id);
    id = id.trim();

    if (!ObjectId.isValid(id)) {
        throw `${id} is not a valid ObjectID.`;
    }

    const subjectAreasCollection = await mentees();

    const subject = await subjectAreasCollection.findOne({ _id: new ObjectId(id) });

    if (!subject) {
        throw `Subject with the id ${id} does not exist.`;
    }

    let result = await subjectAreasCollection.deleteOne({ _id: new ObjectId(id) });
    if (!result === 0) {
        throw `Subject with the id ${id} does not exist, Hence could not delete.`;
    }

    return `${subject.name} has been successfully deleted!`;
};

export const updateSubjectArea = async (id, name, description) => {
    checkStringParams(id);
    checkStringParams(name);
    checkStringParams(description, true);

    id = id.trim();
    name = name.toLowerCase().trim();
    description = description.toLowerCase().trim();

    if (!ObjectId.isValid(id)) {
        throw "Invalid object ID.";
    }

    let subjectUpdate = {
        name,
        description,
    };

    const subjectAreasCollection = await subject_areas();

    const result = await subjectAreasCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: subjectUpdate },
        { returnDocument: "after" }
    );

    if (!result) {
        throw `Could not Update the Subject.`;
    }

    result._id = result._id.toString();

    return result;
};
