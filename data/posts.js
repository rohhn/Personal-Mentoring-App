import { forums } from "../config/mongoCollections";
import axios from "axios";
import * as helper from "../helpers.js"
import { ObjectId, ReturnDocument } from "mongodb";
import * as replies from "../data/replies.js";


export const getForums=async (subject_id)=>
{
    let forumCollection=await forums();
    let posts=forumCollection.findOne(
    {
        _id: ObjectId.createFromHexString(subject_id)
    });
    if(!posts)
    {
        throw "Error, no posts in this forum, sorry";
    }
    return posts;
}

export const makePost=async (subject_id, authorID, content, comment)=>
{
    helper.postVerify(content);
    let forumCollection=await forums();
    let newPost=
    {
        _id:new ObjectId(),
        author: 4,//getUserId
        content: content,
        created_at: new Date(),
        replies:[],
    }
    return forumCollection.posts;
}

export const editPost=async(id, newContent)=>
{
    helper.postVerify(newContent);
    let forumCollection=await forums();
    forumCollection.findOneAndUpdate(
        {
            _id: ObjectId.createFromHexString(id),
            content: newContent
        });
    return forumCollection;
}

export const deletePost=async(id)=>
{
    let forumCollection=await forums();
    forumCollection.findOneAndDelete(id);
    return forumCollection;
}