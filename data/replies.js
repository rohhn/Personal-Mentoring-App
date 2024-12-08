import { forums } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import * as helper from "../helpers.js";
import * as post from "./posts.js";


export const makeReply = async (post_id, authorID, content) => {
    let forumCollection = await forums();

    helper.postVerify(content);

    let newReply = {
        _id: new ObjectId(),
        author: authorID,
        content: content.trim(),
        created_at: new Date(),
    };

    let updatedInfo = await forumCollection.updateOne(
        { "posts._id": ObjectId.createFromHexString(post_id) },
        { $push: { "posts.$.replies": newReply } }
    );

    if (updatedInfo.modifiedCount === 0) throw "Could not add reply.";

    return newReply;
};

export const getReply = async (post_id, replyId) => {
    let forumCollection = await forums();
    let forum = await forumCollection.findOne({ "posts._id": ObjectId.createFromHexString(post_id) });
    if (!forum) throw "Post not found.";

    let post = forum.posts.find((p) => p._id.equals(ObjectId.createFromHexString(post_id)));
    if (!post) throw "Post not found.";

    let reply = post.replies.find((r) => r._id.equals(ObjectId.createFromHexString(replyId)));
    if (!reply) throw "Reply not found.";

    return reply;
};


export const editReply = async (post_id, replyId, authorID, updatedContent) => {
    let forumCollection = await forums();

    helper.postVerify(updatedContent);

    let updateInfo = await forumCollection.updateOne(
        {
            "posts._id": ObjectId.createFromHexString(post_id),
            "posts.replies._id": ObjectId.createFromHexString(replyId),
            "posts.replies.author": authorID,
        },
        { $set: { "posts.$.replies.$[replyElem].content": updatedContent.trim() } },
        { arrayFilters: [{ "replyElem._id": ObjectId.createFromHexString(replyId) }] }
    );

    if (updateInfo.modifiedCount === 0) throw "Could not edit reply.";

    return await getReply(post_id, replyId);
};

export const deleteReply = async (post_id, replyId, authorID) => {
    let forumCollection = await forums();

    let updateInfo = await forumCollection.updateOne(
        {
            "posts._id": ObjectId.createFromHexString(post_id),
            "posts.replies._id": ObjectId.createFromHexString(replyId),
            "posts.replies.author": authorID,
        },
        { $pull: { "posts.$.replies": { _id: ObjectId.createFromHexString(replyId) } } }
    );

    if (updateInfo.modifiedCount === 0) throw "Could not delete reply.";

    return { message: "Reply deleted successfully." };
};
