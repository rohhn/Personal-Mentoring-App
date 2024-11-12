import { ObjectId } from "mongodb";
import { mentors } from "../config/mongoCollections.js";


const checkStringParams = (param) => {
    if(!param){
      throw `The input is an empty paramter.`;
    }
    if(typeof param !== 'string'){
      throw `The input is not a string.`;
    }
    
    if(param.trim() === ''){
      throw `The input is an empty string.`;
    }
  }

const checkObject = (param) => {
    if(Array.isArray(param) || param === null || param === undefined){
        throw `The input should be an object.`;
        }

        if(typeof param !== 'object'){
        throw `The input should be an object.`;
        }
}

const checkBoolean = (param) => {
    if(typeof param !== 'boolean'){
        throw 'The input should be a boolean.'
    }
} 
export const createMentor = async (
  name,
  email,
  password_hash,
  profile_image,
  created_at,
  qualifications,
  experience,
  availability,
  approval_status
) =>{
    checkStringParams(name);
    checkStringParams(email);
    checkStringParams(password_hash);
    checkStringParams(profile_image);
    checkStringParams(created_at);
    checkStringParams(qualifications);
    checkStringParams(experience);
    checkObject(availability);
    checkBoolean(approval_status)

    name = name.trim();
    email = email.trim();
    password_hash = password_hash.trim();
    profile_image = profile_image.trim();
    created_at = created_at.trim();

    let newMentor = {
      name: name,
      email: email,
      password_hash: password_hash,
      profile_image: profile_image,
      created_at: created_at,
      qualifications: qualifications,
      experience: experience,
      availability: availability,
      approval_status: approval_status
    }

    const mentorCollection = await mentors();
    
    const result = await mentorCollection.insertOne(newMentor);

    if (!result.acknowledged || !result.insertedId)
      throw 'Could not create the mentor.';
  
    const newId = result.insertedId.toString();
  
    const mentor = await getMenteeById(newId);
  
    mentor._id = mentor._id.toString();
  
    return mentor;
}

export const getAllMentors = async () => {
  const mentorCollection = await mentors();

  let allMentors = await mentorCollection.find({}).toArray();

  if(!allMentors){
    return [];
  }

  allMentors = allMentors.map((mentor) =>({
    _id : mentor._id.toString(),
    name: mentor.name
  }));

  return allMentors;
};


export const getMentorById = async (id) => {
  checkStringParams(id);

  id = id.trim();

  if (!ObjectId.isValid(id)) {
    throw 'Invalid object ID.';
  }

  const mentorCollection = await mentors();

  const mentor = await mentorCollection.findOne({_id: new ObjectId(id)});

  if (!mentor) {
    throw `Mentor with the id ${id} does not exist.`;
  }

  mentor._id = mentor._id.toString();
  return mentor;
};

export const removeMentor = async (id) =>{
  checkStringParams(id);
  id = id.trim();

  if(!ObjectId.isValid(id)){
    throw `${id} is not a valid ObjectID.`;
  }

  const mentorCollection = await mentors();

  const mentor = await mentorCollection.findOne({_id: new ObjectId(id)});

  if (!mentor) {
    throw `Mentor with the id ${id} does not exist.`;
  }

  let result = await mentorCollection.deleteOne({_id: new ObjectId(id)});
  if(!result === 0){
    throw `Mentor with the id ${id} does not exist, Hence could not delete.`;
  }

  return `${mentor.name} have been successfully deleted!`;
}

export const updateMentor = async (
  id,
  name,
  email,
  password_hash,
  profile_image,
  created_at,
  qualifications,
  experience,
  availability,
  approval_status
) => {
  checkStringParams(id);

  id = id.trim();

  if (!ObjectId.isValid(id)) {
    throw 'Invalid object ID.';
  }

  checkStringParams(name);
  checkStringParams(email);
  checkStringParams(password_hash);
  checkStringParams(profile_image);
  checkStringParams(created_at);
  checkStringParams(qualifications);
  checkStringParams(experience);
  checkObject(availability);
  checkBoolean(approval_status);

  name = name.trim();
  email = email.trim();
  password_hash = password_hash.trim();
  profile_image = profile_image.trim();
  created_at = created_at.trim();

  let mentorUpdate = {
    name: name,
    email: email,
    password_hash: password_hash,
    profile_image: profile_image,
    created_at: created_at,
    qualifications: qualifications,
    experience: experience,
    availability: availability,
    approval_status: approval_status
  }

  const mentorCollection = await mentors();
  
  const result = await mentorCollection.findOneAndUpdate(
    {_id: new ObjectId(id)},
    {$set: mentorUpdate},
    {returnDocument: 'after'}
  );

  if(!result){
    throw `Could not Update the Mentor.`;
  }

  result._id = result._id.toString();

  return result;
}