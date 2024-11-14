import { ObjectId } from "mongodb";
import { mentees } from "../config/mongoCollections.js";
import { checkBoolean, checkStringParams, checkArrayOfStrings, checkDate } from "../helpers.js";


export const createMentee = async (
  first_name,
  last_name,
  dob,
  email,
  pwd_hash,
  parent_email,
  profile_image,
  created_at,
  summary,
  skills
) =>{
    checkStringParams(first_name);
    checkStringParams(last_name);
    checkDate(dob);
    checkStringParams(email);
    checkStringParams(pwd_hash);
    checkStringParams(parent_email);
    checkStringParams(profile_image);
    checkDate(created_at);
    checkStringParams(summary);
    skills = checkArrayOfStrings(skills);

    first_name = first_name.trim();
    last_name = last_name.trim();
    dob = dob.trim();
    email = email.trim();
    pwd_hash = pwd_hash.trim();
    parent_email = parent_email.trim();
    profile_image = profile_image.trim();
    created_at = created_at.trim();
    summary = summary.trim();

    let newMentee = {
      first_name: first_name,
      last_name: last_name,
      dob: dob,
      email: email,
      pwd_hash: pwd_hash,
      parent_email: parent_email,
      profile_image: profile_image,
      created_at: created_at,
      summary: summary,
      skills: skills,
      reviews: [],
      badges: []
    }

    const menteeCollection = await mentees();
    
    const result = await menteeCollection.insertOne(newMentee);

    if (!result.acknowledged || !result.insertedId)
      throw 'Could not create the mentee.';
  
    const newId = result.insertedId.toString();
  
    const mentee = await getMenteeById(newId);
  
    mentee._id = mentee._id.toString();
  
    return mentee;
}

export const getAllMentees = async () => {
  const menteeCollection = await mentees();

  let allMentees = await menteeCollection.find({}).toArray();

  if(!allMentees){
    return [];
  }

  allMentees = allMentees.map((mentee) =>({
    _id : mentee._id.toString(),
    name: mentee.name
  }));

  return allMentees;
};


export const getMenteeById = async (id) => {
  checkStringParams(id);

  id = id.trim();

  if (!ObjectId.isValid(id)) {
    throw 'Invalid object ID.';
  }

  const menteeCollection = await mentees();

  const mentee = await menteeCollection.findOne({_id: new ObjectId(id)});

  if (!mentee) {
    throw `Mentee with the id ${id} does not exist.`;
  }

  mentee._id = mentee._id.toString();
  return mentee;
};

export const removeMentee = async (id) =>{
  checkStringParams(id);
  id = id.trim();

  if(!ObjectId.isValid(id)){
    throw `${id} is not a valid ObjectID.`;
  }

  const menteeCollection = await mentees();

  const mentee = await menteeCollection.findOne({_id: new ObjectId(id)});

  if (!mentee) {
    throw `Mentee with the id ${id} does not exist.`;
  }

  let result = await menteeCollection.deleteOne({_id: new ObjectId(id)});
  if(!result === 0){
    throw `Mentee with the id ${id} does not exist, Hence could not delete.`;
  }

  return `${mentee.name} have been successfully deleted!`;
}

export const updateMentee = async (
  id,
  first_name,
  last_name,
  dob,
  email,
  pwd_hash,
  parent_email,
  profile_image,
  created_at,
  summary,
  skills
) => {
  checkStringParams(id);

  id = id.trim();

  if (!ObjectId.isValid(id)) {
    throw 'Invalid object ID.';
  }

  checkStringParams(first_name);
  checkStringParams(last_name);
  checkDate(dob);
  checkStringParams(email);
  checkStringParams(pwd_hash);
  checkStringParams(parent_email);
  checkStringParams(profile_image);
  checkDate(created_at);
  checkStringParams(summary);
  skills = checkArrayOfStrings(skills);

  name = name.trim();
  email = email.trim();
  pwd_hash = pwd_hash.trim();
  parent_email = parent_email.trim();
  profile_image = profile_image.trim();
  created_at = created_at.trim();
  summary = summary.trim();

  let menteeUpdate = {
    first_name: first_name,
    last_name: last_name,
    dob: dob,
    email: email,
    pwd_hash: pwd_hash,
    parent_email: parent_email,
    profile_image: profile_image,
    created_at: created_at,
    summary: summary,
    skills: skills
  }

  const menteeCollection = await mentees();
  
  const result = await menteeCollection.findOneAndUpdate(
    {_id: new ObjectId(id)},
    {$set: menteeUpdate},
    {returnDocument: 'after'}
  );

  if(!result){
    throw `Could not Update the Mentee.`;
  }

  result._id = result._id.toString();

  return result;
}