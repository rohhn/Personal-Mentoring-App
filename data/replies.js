import { forums } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import * as helper from "../helpers.js";


export const makeReply = async (postId, authorID, content) => {
    helper.postVerify(content);

    let forumCollection = await forums();
    let newReply = {
        _id: new ObjectId(),
        author: authorID,
        content: content.trim(),
        created_at: new Date()
    };

    let updateInfo = await forumCollection.findOneAndUpdate(
        { "posts._id": ObjectId.createFromHexString(postId) },
        { $push: { "posts.$.replies": newReply } },
        { returnDocument: "after" }
    );

    if (!updateInfo.value) throw "Error, unable to add reply.";

    return updateInfo.value;
};

export const getReplies = async (postId) => {
    let forumCollection = await forums();
    let forum = await forumCollection.findOne({ "posts._id": ObjectId.createFromHexString(postId) });

    if (!forum) throw "Error, post not found.";

    let post = forum.posts.find(post => post._id.toString() === postId);
    if (!post) throw "Error, post not found.";

    return post.replies || [];
};

export const editReply = async (postId, replyId, authorID, updatedContent) => {
    helper.postVerify(updatedContent);

    let forumCollection = await forums();
    let updateInfo = await forumCollection.findOneAndUpdate(
        {
            "posts._id": ObjectId.createFromHexString(postId),
            "posts.replies._id": ObjectId.createFromHexString(replyId),
            "posts.replies.author": authorID
        },
        { $set: { "posts.$.replies.$[replyElement].content": updatedContent.trim() } },
        {
            arrayFilters: [{ "replyElement._id": ObjectId.createFromHexString(replyId) }],
            returnDocument: "after"
        }
    );

    if (!updateInfo.value) throw "Error, unable to edit reply. Ensure you are the original author.";

    return updateInfo.value;
};

export const deleteReply = async (postId, replyId, authorID) => {
    let forumCollection = await forums();
    let updateInfo = await forumCollection.findOneAndUpdate(
        {
            "posts._id": ObjectId.createFromHexString(postId),
            "posts.replies._id": ObjectId.createFromHexString(replyId),
            "posts.replies.author": authorID
        },
        {
            $pull: { "posts.$.replies": { _id: ObjectId.createFromHexString(replyId) } }
        },
        { returnDocument: "after" }
    );

    if (!updateInfo.value) throw "Error, unable to delete reply. Ensure you are the original author.";

    return updateInfo.value;
};
