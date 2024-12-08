import { forums, mentees, mentors } from "../config/mongoCollections.js";
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
    return { title: forum.title, posts: forum.posts || [] };
};

export const makePost = async (subject_id, sessionUserId, authorName, title, content) => {
    helper.postVerify(content);
    helper.postVerify(title);
    helper.postVerify(authorName);
    title = title.trim();
    content = content.trim();
    authorName = authorName.trim();

    let forumCollection = await forums();
    let menteeCollection = await mentees();
    let mentorCollection = await mentors();

    let authorId = null;

    let mentee = await menteeCollection.findOne({ _id: ObjectId.createFromHexString(sessionUserId) });
    if (mentee) {
        authorId = mentee._id;
    } else {
        let mentor = await mentorCollection.findOne({ _id: ObjectId.createFromHexString(sessionUserId) });
        if (mentor) {
            authorId = mentor._id;
        }
    }

    if (!authorId) {
        throw "Error: User not found in either mentors or mentees collection.";
    }

    let newPost = {
        _id: new ObjectId(),
        subject_id: subject_id,
        authorId: authorId,
        authorName: authorName,
        title: title,
        content: content,
        created_at: new Date(),
        replies: [],
    };

    let updatedForum = await forumCollection.findOneAndUpdate(
        { _id: ObjectId.createFromHexString(subject_id) },
        { $push: { posts: newPost } },
        { returnDocument: "after" }
    );

    if (!updatedForum) {
        throw "Error: Unable to create the post.";
    }

    return {
        title: updatedForum.title,
        posts: updatedForum.posts || [],
    };
};


export const getPost = async (postId) => {
    let forumCollection = await forums();
    let forum = await forumCollection.findOne({ "posts._id": ObjectId.createFromHexString(postId) });
    if (!forum) throw "Post not found1";

    let post = forum.posts.find((p) => p._id.equals(ObjectId.createFromHexString(postId)));
    if (!post) throw "Post not found2";
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

        let post = forum.posts.find((p) => p._id.equals(ObjectId.createFromHexString(postId)));
        if (!post) {
            throw new Error("Post not found.");
        }

        if (String(post.authorId) !== String(sessionUserId)) {
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

        return updatedForum.posts;
    } catch (error) {
        throw error;
    }
};



export const deletePost = async (subject_id, post_id, sessionUserId) => {
    try {
        if (!subject_id || !post_id || !sessionUserId) {
            throw new Error("Subject ID, Post ID, and User ID are required.");
        }

        let forumCollection = await forums();

        let forum = await forumCollection.findOne({
            _id: ObjectId.createFromHexString(subject_id),
            "posts._id": ObjectId.createFromHexString(post_id),
        });

        if (!forum) {
            throw new Error("Forum or post not found.");
        }

        let post = forum.posts.find((p) => p._id.equals(ObjectId.createFromHexString(post_id)));
        if (!post) {
            throw new Error("Post not found.");
        }

        if (String(post.authorId) !== String(sessionUserId)) {
            throw new Error("Unauthorized action. You cannot delete this post.");
        }

        let deleteResult = await forumCollection.updateOne(
            { _id: ObjectId.createFromHexString(subject_id) },
            { $pull: { posts: { _id: ObjectId.createFromHexString(post_id) } } }
        );

        if (deleteResult.modifiedCount === 0) {
            throw new Error("Unable to delete the post.");
        }

        return { message: "Post deleted successfully." };
    } catch (error) {
        //console.error("Error in deletePost:", error.message);
        throw error;
    }
};
