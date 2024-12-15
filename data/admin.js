import { admin } from "../config/mongoCollections.js";
import * as helper from "../helpers.js";
import { ObjectId } from "mongodb";
import { fileUpload } from "../middleware/common.js";

const adminCollection = await admin();

export const createAdmin = async (
    firstName,
    lastName,
    email,
    passHash,
    options = {}
) => {
    firstName = helper.checkStringParams(firstName);
    lastName = helper.checkStringParams(lastName);
    email = helper.checkEmail(email);
    // helper.checkStringParams(passHash);
    //let adminCollection = await admin();

    let adminExists = await adminCollection.findOne({
        email: email.trim().toLowerCase(),
    });
    if (adminExists) {
        throw new Error("Admin with this email already exists.");
    }

    let newAdmin = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        passHash,
        isAdmin: true,
        created_at: new Date(),
    };

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
    let admin = await adminCollection.findOne({
        _id: new ObjectId(id),
    });

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
    let allowedUpdates = ["firstName", "lastName", "pwd_hash"];
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
        { _id: new ObjectId(id) },
        { $set: updateFields },
        { returnDocument: "after" }
    );

    if (!updatedInfo) {
        throw new Error(`Could not update the admin.`);
    }

    updatedInfo._id = updatedInfo._id.toString();
    return updatedInfo;
};
