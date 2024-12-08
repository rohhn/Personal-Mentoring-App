import { forums } from "../config/mongoCollections.js";
import { ObjectId, ReturnDocument } from "mongodb";
import * as helper from "../helpers.js";
import * as post from "./posts.js";


export const makeReply = async (post_id, sessionUserId, content) => {
    try {
        helper.postVerify(content);

        let forumCollection = await forums();

        let newReply = {
            _id: new ObjectId(),
            authorId: sessionUserId,
            content: content.trim(),
            created_at: new Date(),
        };

        let updatedInfo = await forumCollection.updateOne(
            { "posts._id": ObjectId.createFromHexString(post_id) },
            { $push: { "posts.$.replies": newReply } }
        );

        if (updatedInfo.modifiedCount === 0) throw new Error("Could not add reply.");

        return newReply;
    } catch (error) {
        throw error;
    }
};

export const getReply = async (post_id, replyId) => {
    try {
        let forumCollection = await forums();
        let forum = await forumCollection.findOne({ "posts._id": ObjectId.createFromHexString(post_id) });
        if (!forum) throw new Error("Post not found.");
        let post = forum.posts.find((p) => p._id.equals(ObjectId.createFromHexString(post_id)));
        if (!post) throw new Error("Post not found.");
        let reply = post.replies.find((r) => r._id.equals(ObjectId.createFromHexString(replyId)));
        if (!reply) throw new Error("Reply not found.");
        return reply;
    } catch (error) {
        console.error("Error in getReply:", error.message);
        throw error;
    }
};


export const editReply = async (post_id, reply_id, sessionUserId, updatedContent) => {
    try {
        helper.postVerify(updatedContent);
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

        let reply = post.replies.find((r) =>
            r._id.equals(ObjectId.createFromHexString(reply_id))
        );

        if (!reply) {
            throw new Error("Reply not found.");
        }

        if (String(reply.authorId) !== String(sessionUserId)) {
            throw new Error("Unauthorized action. You cannot edit this reply.");
        }

        let updatedForum = await forumCollection.findOneAndUpdate(
            {
                "posts._id": ObjectId.createFromHexString(post_id),
                "posts.replies._id": ObjectId.createFromHexString(reply_id),
            },
            {
                $set: {
                    "posts.$.replies.$[replyElem].content": updatedContent.trim(),
                },
            },
            {
                arrayFilters: [
                    { "replyElem._id": ObjectId.createFromHexString(reply_id) },
                ],
                returnDocument: "after",
            }
        );
        if (!updatedForum) {
            throw new Error("Unable to update the reply.");
        }
        let updatedPost = updatedForum.posts.find((p) =>
            p._id.equals(ObjectId.createFromHexString(post_id))
        );
        let updatedReply = updatedPost.replies.find((r) =>
            r._id.equals(ObjectId.createFromHexString(reply_id))
        );
        return updatedReply;
    } catch (error) {
        console.error("Error in editReply:", error.message);
        throw error;
    }
};




export const deleteReply = async (post_id, reply_id, sessionUserId) => {
    try {
        let forumCollection = await forums();
        let forum = await forumCollection.findOne({
            "posts._id": ObjectId.createFromHexString(post_id),
            "posts.replies._id": ObjectId.createFromHexString(reply_id),
        });

        if (!forum) {
            throw new Error("Forum or post not found.");
        }

        let post = forum.posts.find((p) => p._id.equals(ObjectId.createFromHexString(post_id)));
        if (!post) {
            throw new Error("Post not found.");
        }

        let reply = post.replies.find((r) => r._id.equals(ObjectId.createFromHexString(reply_id)));
        if (!reply) {
            throw new Error("Reply not found.");
        }

        if (String(reply.authorId) !== String(sessionUserId)) {
            throw new Error("Unauthorized action. You cannot delete this reply.");
        }

        let deleteResult = await forumCollection.updateOne(
            { "posts._id": ObjectId.createFromHexString(post_id) },
            { $pull: { "posts.$.replies": { _id: ObjectId.createFromHexString(reply_id) } } }
        );

        if (deleteResult.modifiedCount === 0) {
            throw new Error("Unable to delete the reply.");
        }

        return { message: "Reply deleted successfully." };
    } catch (error) {
        throw error;
    }
};
