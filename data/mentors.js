import { ObjectId } from "mongodb";
import { mentors } from "../config/mongoCollections.js";


const checkStringParams = (param) => {
    if(!param){
      throw `The input is an empty paramter.`;
    }
    if(typeof param !== 'string'){
      console.log(param);
      throw `The input is not a string: ${param}.`;
    }
    
    if(param.trim() === ''){
      throw `The input is an empty string: ${param}.`;
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
  first_name,
  last_name,
  dob,
  email,
  pwd_hash,
  profile_image,
  created_at,
  summary,
  education,
  experience,
  availability,
  approved,
  subject_areas
) =>{
    checkStringParams(first_name);
    checkStringParams(last_name);
    checkStringParams(dob);
    checkStringParams(email);
    checkStringParams(pwd_hash);
    checkStringParams(profile_image);
    checkStringParams(created_at);
    checkStringParams(summary);
    checkBoolean(approved)

    first_name = first_name.trim();
    last_name = last_name.trim();
    dob = dob.trim();
    email = email.trim();
    pwd_hash = pwd_hash.trim();
    profile_image = profile_image.trim();
    created_at = created_at.trim();
    summary = summary.trim();

    let newMentor = {
      first_name: first_name,
      last_name: last_name,
      dob: dob,
      email: email,
      pwd_hash: pwd_hash,
      profile_image: profile_image,
      created_at: created_at,
      education: education,
      availability: availability,
      approved: approved,
      experience: experience,
      subject_areas: subject_areas,
      reviews: [],
      badges: []
    }

    const mentorCollection = await mentors();
    
    const result = await mentorCollection.insertOne(newMentor);

    if (!result.acknowledged || !result.insertedId)
      throw 'Could not create the mentor.';
  
    const newId = result.insertedId.toString();
  
    const mentor = await getMentorById(newId);
  
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
  first_name,
  last_name,
  dob,
  email,
  pwd_hash,
  profile_image,
  created_at,
  education,
  experience,
  availability,
  approved,
  subject_areas
) => {
  checkStringParams(id);

  id = id.trim();

  if(!ObjectId.isValid(id)){
    throw `${id} is not a valid ObjectID.`;
  }

  checkStringParams(first_name);
  checkStringParams(last_name);
  checkStringParams(dob);
  checkStringParams(email);
  checkStringParams(pwd_hash);
  checkStringParams(profile_image);
  checkStringParams(created_at);
  checkBoolean(approved);

  first_name = first_name.trim();
  last_name = last_name.trim();
  dob = dob.trim();
  email = email.trim();
  pwd_hash = pwd_hash.trim();
  profile_image = profile_image.trim();
  created_at = created_at.trim();

  let mentorUpdate = {
    first_name: first_name,
    last_name: last_name,
    dob: dob,
    email: email,
    pwd_hash: pwd_hash,
    profile_image: profile_image,
    created_at: created_at,
    education: education,
    experience: experience,
    availability: availability,
    approved: approved,
    subject_areas: subject_areas
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