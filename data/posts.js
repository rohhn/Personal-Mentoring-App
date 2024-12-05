import { forums } from "../config/mongoCollections.js";
import axios from "axios";
import * as helper from "../helpers.js";
import { ObjectId, ReturnDocument } from "mongodb";
import * as replies from "../data/replies.js";

export const getForums = async (subject_id) => {
    let forumCollection = await forums();
    let forum = await forumCollection.findOne({ _id: ObjectId.createFromHexString(subject_id) });
    if (!forum) {
        throw "Error, no posts in this forum, sorry";
    }
    return{ title: forum.title, posts: forum.posts || []};
};

export const makePost = async (subject_id, authorID, title, content) => {
    helper.postVerify(content);
    helper.postVerify(title);
    title = title.trim();
    content = content.trim();
    let forumCollection = await forums();
    let newPost = {
        _id: new ObjectId(),
        subject_id: subject_id,
        author: authorID,
        title: title,
        content: content,
        created_at: new Date(),
        replies: [],
    };

    let updatedForum = await forumCollection.findOneAndUpdate(
        { _id: ObjectId.createFromHexString(subject_id) },
        { $push: { posts: newPost }},
        { returnDocument: "after"}
    );
    let newForum=await forumCollection;
    if (!updatedForum) {
        throw "Error, unable to make new post";
    }

    return {
        title: updatedForum.title,
        posts: newForum.posts || [],
    };};

export const editPost = async (id, newContent, authorID) => {
    helper.postVerify(newContent);
    let forumCollection = await forums();
    let specPost = await forumCollection.findOne({
        "posts._id": ObjectId.createFromHexString(id),
    });
    if (!specPost) {
        throw "Error, unable to find that form or post";
    }
    let post = specPost.posts.find((post) => post._id.toString() == id);
    if (!post) {
        throw "Error, post not found";
    }
    if (post.author !== authorID) {
        throw "Error, you cannot edit this post";
    }
    let updatedInformation = await forumCollection.fineOneAndUpdate(
        { "posts._id": ObjectId.createFromHexString(id) },
        { $set: { "posts.$.content": newContent } },
        { returnDocument: "after" }
    );
    if (!updatedInformation) {
        throw "Error, upabe to make that edit";
    }
    let updatedForum = await forumCollection.findOne({
        "posts._id": ObjectId.createFromHexString(id),
    });
    if (!updatedForum) {
        throw "Error, unable to retrieve updated post";
    }
    return updatedForum.posts;
};

export const deletePost = async (id, authorID) => {
    let forumCollection = await forums();
    let specPost = await forumCollection.findOne({
        "posts._id": ObjectId.createFromHexString(id),
    });
    if (!specPost) {
        throw "Error, unable to find that form or post";
    }
    let post = specPost.posts.find((post) => post._id.toString() == id);
    if (!post) {
        throw "Error, post not found";
    }
    if (post.author !== authorID) {
        throw "Error, you cannot edit this post";
    }
    let deletedInformation = await forumCollection.fineOneAndUpdate(
        { _id: specPost._id },
        { $pull: { posts: { _id: ObjectId.createFromHexString(id) } } }
    );
    if (!deletedInformation) {
        throw "Error, unable to delete post";
    }
    let updatedForum = await forumCollection.findOne({ _id: specPost._id });
    if (!updatedForum) {
        throw "Error, unable to get the forum after the delete";
    }
    return updatedForum.posts;
};
