// import { ObjectId } from "mongodb";
// import { mentees } from "../config/mongoCollections.js";


// const checkStringParams = (param) => {
//     if(!param){
//       throw `The input is an empty paramter.`;
//     }
//     if(typeof param !== 'string'){
//       throw `The input is not a string.`;
//     }
    
//     if(param.trim() === ''){
//       throw `The input is an empty string.`;
//     }
//   }

// export const createMentee = async (
//   name,
//   email,
//   password_hash,
//   parent_email,
//   profile_image,
//   created_at
// ) =>{
//     checkStringParams(name);
//     checkStringParams(email);
//     checkStringParams(password_hash);
//     checkStringParams(parent_email);
//     checkStringParams(profile_image);
//     checkStringParams(created_at);

//     name = name.trim();
//     email = email.trim();
//     password_hash = password_hash.trim();
//     parent_email = parent_email.trim();
//     profile_image = profile_image.trim();
//     created_at = created_at.trim();

//     let newMentee = {
//       name: name,
//       email: email,
//       password_hash: password_hash,
//       parent_email: parent_email,
//       profile_image: profile_image,
//       created_at: created_at
//     }

//     const menteeCollection = await mentees();
    
//     const result = await menteeCollection.insertOne(newMentee);

//     if (!result.acknowledged || !result.insertedId)
//       throw 'Could not create the mentee.';
  
//     const newId = result.insertedId.toString();
  
//     const mentee = await getMenteeById(newId);
  
//     mentee._id = mentee._id.toString();
  
//     return mentee;
// }

// export const getAllMentees = async () => {
//   const menteeCollection = await mentees();

//   let allMentees = await menteeCollection.find({}).toArray();

//   if(!allMentees){
//     return [];
//   }

//   allMentees = allMentees.map((mentee) =>({
//     _id : mentee._id.toString(),
//     name: mentee.name
//   }));

//   return allMentees;
// };


// export const getMenteeById = async (id) => {
//   checkStringParams(id);

//   id = id.trim();

//   if (!ObjectId.isValid(id)) {
//     throw 'Invalid object ID.';
//   }

//   const menteeCollection = await mentees();

//   const mentee = await menteeCollection.findOne({_id: new ObjectId(id)});

//   if (!mentee) {
//     throw `Mentee with the id ${id} does not exist.`;
//   }

//   mentee._id = mentee._id.toString();
//   return mentee;
// };

// export const removeMentee = async (id) =>{
//   checkStringParams(id);
//   id = id.trim();

//   if(!ObjectId.isValid(id)){
//     throw `${id} is not a valid ObjectID.`;
//   }

//   const menteeCollection = await mentees();

//   const mentee = await menteeCollection.findOne({_id: new ObjectId(id)});

//   if (!mentee) {
//     throw `Mentee with the id ${id} does not exist.`;
//   }

//   let result = await menteeCollection.deleteOne({_id: new ObjectId(id)});
//   if(!result === 0){
//     throw `Mentee with the id ${id} does not exist, Hence could not delete.`;
//   }

//   return `${mentee.name} have been successfully deleted!`;
// }

// export const updateMentee = async (
//   id,
//   name,
//   email,
//   password_hash,
//   parent_email,
//   profile_image,
//   created_at
// ) => {
//   checkStringParams(id);

//   id = id.trim();

//   if (!ObjectId.isValid(id)) {
//     throw 'Invalid object ID.';
//   }

//   checkStringParams(name);
//   checkStringParams(email);
//   checkStringParams(password_hash);
//   checkStringParams(parent_email);
//   checkStringParams(profile_image);
//   checkStringParams(created_at);

//   name = name.trim();
//   email = email.trim();
//   password_hash = password_hash.trim();
//   parent_email = parent_email.trim();
//   profile_image = profile_image.trim();
//   created_at = created_at.trim();

//   let menteeUpdate = {
//     name: name,
//     email: email,
//     password_hash: password_hash,
//     parent_email: parent_email,
//     profile_image: profile_image,
//     created_at: created_at
//   }

//   const menteeCollection = await mentees();
  
//   const result = await menteeCollection.findOneAndUpdate(
//     {_id: new ObjectId(id)},
//     {$set: menteeUpdate},
//     {returnDocument: 'after'}
//   );

//   if(!result){
//     throw `Could not Update the Mentee.`;
//   }

//   result._id = result._id.toString();

//   return result;
// }