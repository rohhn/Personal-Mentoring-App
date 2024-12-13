import { admin } from "../config/mongoCollections.js";
import * as helper from "../helpers.js";
import { ObjectId } from "mongodb";
import { fileUpload } from "../middleware/common.js";

const adminCollection = await admin();

export const createAdmin = async (firstName, lastName, email, passHash, options = {}) => {
    helper.checkStringParams(firstName);
    helper.checkStringParams(lastName);
    helper.checkEmail(email);
    helper.checkStringParams(passHash);
    //let adminCollection = await admin();

    let adminExists = await adminCollection.findOne({ email: email.trim().toLowerCase() });
    if (adminExists) {
        throw new Error("Admin with this email already exists.");
    }

    let newAdmin =
    {
        _id: new ObjectId(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        passHash,
        isAdmin: true,
        created_at: new Date()
    }



    if (options.profile_image) {
        newAdmin.profile_image = options.profile_image;
    }

    if (options.summary) {
        helper.checkStringParams(options.summary, "Summary");
        newAdmin.summary = options.summary.trim();
    }

    let addAdmin = await adminCollection.insertOne(newAdmin);

    if (!addAdmin.acknowledged || !addAdmin.insertedId) {
        throw new Error("Could not create the admin account.");
    }

    return addAdmin;
};

export const getAllAdmins = async () => {
    //let adminCollection = await admin();
    let allAdmins = await adminCollection.find({}).toArray();

    if (!allAdmins) return [];

    return allAdmins.map((admin) => ({
        _id: admin._id.toString(),
        name: `${admin.first_name} ${admin.last_name}`,
    }));
};

export const getAdminById = async (id) => {
    //let adminCollection = await admin();
    let admin = await adminCollection.findOne({ _id: ObjectId.createFromHexString(id) });

    if (!admin) {
        throw new Error(`Admin with the ID ${id} does not exist.`);
    }

    admin._id = admin._id.toString();
    return admin;
};

export const getAdminByEmail = async (email) => {
    helper.checkEmail(email).toLowerCase();

    //let adminCollection = await admin();
    let admin = await adminCollection.findOne({ email });

    if (!admin) {
        throw new Error(`Admin with the email ${email} does not exist.`);
    }

    admin._id = admin._id.toString();
    return admin;
};

export const updateAdmin = async (id, updates = {}) => {
    let allowedUpdates = ["firstName", "lastName", "summary", "pwd_hash", "profile_image"];
    let updateFields = {};

    for (let [key, value] of Object.entries(updates)) {
        if (!allowedUpdates.includes(key)) {
            throw new Error(`Invalid field: ${key}`);
        }
        if (key === "email") {
            updateFields[key] = helper.checkEmail(value).toLowerCase();
        } else {
            updateFields[key] = helper.checkStringParams(value, key);
        }
    }

    let adminCollection = await admin();
    let updatedInfo = await adminCollection.findOneAndUpdate(
        { _id: ObjectId.createFromHexString(id) },
        { $set: updateFields },
        { returnDocument: "after" }
    );

    if (!updatedInfo) {
        throw new Error(`Could not update the admin.`);
    }

    updatedInfo._id = updatedInfo._id.toString();
    return updatedInfo;
};
