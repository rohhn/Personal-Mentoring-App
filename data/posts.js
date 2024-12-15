import { forums, mentees, mentors, admin } from "../config/mongoCollections.js";
import axios from "axios";
import * as helper from "../helpers.js";
import { ObjectId, ReturnDocument } from "mongodb";
import * as replies from "../data/replies.js";
import * as adminData from "./admin.js";
import * as menteeData from "./mentees.js";
import * as mentorData from "./mentors.js";

export const createForum = async (subjectId, title) => {
    helper.checkStringParams(subjectId);

    subjectId = subjectId.trim();

    if (!ObjectId.isValid(subjectId)) {
        throw "Invalid object ID.";
    }

    helper.checkStringParams(title);

    let forumCollection = await forums();

    let newForum = {
        subject_id: subjectId,
        title: title,
        created_at: new Date(),
    };

    const result = await forumCollection.insertOne(newForum);

    if (!result.acknowledged || !result.insertedId)
        throw "Could not create the Forum.";

    const newId = result.insertedId.toString();

    const forum = await getForums(newId);

    forum._id = forum._id.toString();

    return forum;
};

export const getForums = async (forum_id) => {
    let forumCollection = await forums();
    let forum = await forumCollection.findOne({
        _id: ObjectId.createFromHexString(forum_id),
    });
    if (!forum) {
        const errorObj = new Error("Page not found!");
        errorObj.statusCode = 404;
        throw errorObj;
        // throw "Error, no posts in this forum, sorry";
    }
    return {
        _id: forum._id.toString(),
        title: forum.title,
        posts: forum.posts || [],
    };
};

export const getAllForums = async () => {
    try {
        let forumCollection = await forums();
        let allForums = await forumCollection.find({}).toArray();
        if (!allForums) {
            throw new Error("No forums found in the database.");
        }
        return allForums.map((forum) => ({
            _id: forum._id.toString(),
            title: forum.title,
            postCount: forum.posts ? forum.posts.length : 0,
        }));
    } catch (error) {
        throw new Error("Error fetching all forums: " + error);
    }
};

export const makePost = async (forum_id, userId, userType, title, content) => {
    helper.postVerify(content);
    helper.postVerify(title);
    title = title.trim();
    content = content.trim();

    let forumCollection = await forums();

    let newPost = {
        _id: new ObjectId(),
        // subject_id: forum_id,
        author: userId,
        userType,
        title,
        content,
        created_at: new Date(),
        replies: [],
    };

    let updatedForum = await forumCollection.findOneAndUpdate(
        { _id: ObjectId.createFromHexString(forum_id) },
        { $push: { posts: newPost } },
        { returnDocument: "after" }
    );

    if (!updatedForum) {
        throw "Error: Unable to create the post.";
    }

    return {
        postId: newPost._id,
    };
};

export const getPost = async (postId) => {
    let forumCollection = await forums();
    let forum = await forumCollection.findOne({
        "posts._id": ObjectId.createFromHexString(postId),
    });
    if (!forum) throw "Post not found1";

    let post = forum.posts.find((p) =>
        p._id.equals(ObjectId.createFromHexString(postId))
    );
    if (!post) throw "Post not found2";

    let userData;
    if (post.userType === "mentee") {
        userData = await menteeData.getMenteeById(post.author);
    } else if (post.userType === "mentor") {
        userData = await mentorData.getMentorById(post.author);
    } else if (post.userType === "admin") {
        userData = await adminData.getAdminById(post.author);
    } else {
        throw "Not a valid user type";
    }
    post.author = {
        _id: userData._id.toString(),
        name: `${userData.first_name} ${userData.last_name}`,
        profile_image: userData.profile_image,
    };
    post._id = post._id.toString();
    post.forum_id = forum._id.toString();
    post.forum_title = forum.title;

    return post;
};

export const editPost = async (postId, sessionUserId, newContent, newTitle) => {
    try {
        helper.postVerify(newContent);
        helper.postVerify(newTitle);

        let forumCollection = await forums();

        let forum = await forumCollection.findOne({
            "posts._id": ObjectId.createFromHexString(postId),
        });

        if (!forum) {
            throw new Error("Forum or post not found.");
        }

        let post = forum.posts.find((p) =>
            p._id.equals(ObjectId.createFromHexString(postId))
        );
        if (!post) {
            throw new Error("Post not found.");
        }

        if (String(post.author) !== String(sessionUserId)) {
            throw new Error("Unauthorized action. You cannot edit this post.");
        }

        let updatedForum = await forumCollection.findOneAndUpdate(
            { "posts._id": ObjectId.createFromHexString(postId) },
            {
                $set: {
                    "posts.$.content": newContent,
                    "posts.$.title": newTitle,
                },
            },
            { returnDocument: "after" }
        );

        if (!updatedForum) {
            throw new Error("Unable to update the post.");
        }

        return true; //updatedForum.posts;
    } catch (error) {
        throw error;
    }
};

export const deletePost = async (post_id, sessionUserId) => {
    try {
        if (!post_id || !sessionUserId) {
            throw new Error("Post ID, and User ID are required.");
        }

        let forumCollection = await forums();

        let forum = await forumCollection.findOne({
            "posts._id": ObjectId.createFromHexString(post_id),
        });

        if (!forum) {
            throw new Error("Forum or post not found.");
        }

        let post = forum.posts.find((p) =>
            p._id.equals(ObjectId.createFromHexString(post_id))
        );
        if (!post) {
            throw new Error("Post not found.");
        }

        if (String(post.author) !== String(sessionUserId)) {
            throw new Error(
                "Unauthorized action. You cannot delete this post."
            );
        }

        let deleteResult = await forumCollection.updateOne(
            { "posts._id": ObjectId.createFromHexString(post_id) },
            { $pull: { posts: { _id: ObjectId.createFromHexString(post_id) } } }
        );

        if (deleteResult.modifiedCount === 0) {
            throw new Error("Unable to delete the post.");
        }

        return { forumId: forum._id };
    } catch (error) {
        throw error;
    }
};
