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
    };
};

export const getPost = async (postId) => {
    let forumCollection = await forums();
    let forum = await forumCollection.findOne({ "posts._id": ObjectId.createFromHexString(postId) });
    if (!forum) throw "Post not found1";

    const post = forum.posts.find((p) => p._id.equals(ObjectId.createFromHexString(postId)));
    if (!post) throw "Post not found2";
    return post;
};


export const editPost = async (id, newContent, authorID, newTitle) => {
    helper.postVerify(newContent);
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
        { $set: { "posts.$.title": newTitle } },        
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

export const deletePost = async (subject_id, post_id, authorID) => {
    if (!subject_id || !post_id || !authorID) {
        throw "Error, Subject ID, Post ID, and Author ID are required.";
      }
  
    let forumCollection = await forums();

    try{
        let specForum = await forumCollection.findOne({
            _id: ObjectId.createFromHexString(subject_id),
            "posts._id": ObjectId.createFromHexString(post_id),
        });

        if (!specForum) {
            throw "Error, Unable to find the forum or post.";
        }

        let post = specForum.posts.find((p) => p._id.equals(ObjectId.createFromHexString(post_id)));

        if (!post) {
            throw "Error, Post not found.";
        }

        if (post.author !== authorID) {
            throw "Error, Unauthorized action. You cannot delete this post.";
        }

        let deletedInformation = await forumCollection.updateOne(
            { _id: ObjectId.createFromHexString(subject_id) },
            { $pull: { posts: { _id: ObjectId.createFromHexString(post_id) } } },
            // { returnDocument: "after" }
        );
        if (!deletedInformation) {
            throw "Error, Unable to delete the post.";
        }

        return { message: "Post deleted successfully.", updatedPosts: specForum.posts };
    }
    catch(e)
    {
        throw `Error, unable to delete post: ${e}`;
    }
};

