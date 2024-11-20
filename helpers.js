// You can add and export any helper functions you want here - if you aren't using any, then you can just leave this file as is
import { mentors, mentees } from "./config/mongoCollections.js";

export const postVerify=async (content)=>
{
    if(content=="")
    {
        throw "Error, please enter something";
    }
    if(content==null)
    {
        throw "Error, please enter something";
    }
    if(typeof content !== "string")
    {
        throw "Erorr, post body must be a string";
    }
    content=content.trim();
    if(content.length==0)
    {
        throw "Error, post body cannot be empty";
    }
    if(content=="")
    {
        throw "Error, post body cannot be just empty spaces";
    }
}

export function validateRating(rating) {
    if (typeof rating !== 'number' || rating < 1 || rating > 5 || rating % 1 !== 0) {
      throw new Error('Rating must be a whole number between 1 and 5');
    }
    return true;
  }

export const checkStringParams = (param) => {
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

export const checkBoolean = (param) => {
    if(typeof param !== 'boolean'){
        throw `The input should be a boolean. : ${param}`;
    }
} 

export const checkObject = (param) => {
  if(Array.isArray(param) || param === null || param === undefined){
      throw `The input should be an object.`;
      }

      if(typeof param !== 'object'){
      throw `The input should be an object.`;
      }

      if(Object.keys(param).length === 0){
        throw `The imput is an empty Object.`
      }
}

export const checkDate = (inputDate) => {
  checkStringParams(inputDate);
  let dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;

  if(!dateRegex.test(inputDate)){
    throw `The Input Date is not in mm/dd/yyyy format. : ${inputDate}`;
  }

  let [month, day, year] = inputDate.split('/').map(Number);

  let date = new Date(year, month - 1, day);

  if(date.getFullYear() !== year || date.getMonth() !== month -1 || date.getDate() !== day){
    throw `Invalid Date.`
  }
  
  let today = new Date();

  if(date > today){
    throw `Date cannot be in the future.`
  }
}

export const checkYears = (years) =>{
  if(typeof years !== 'number' || Number.isNaN(years)){
    throw `The Year input should be a number.`;
  }

  let currYear = new Date().getFullYear();

  if(years > currYear){
    throw `Year cannot be in future.`;
  }

}

export const checkEducation = (education) => {
  if(!Array.isArray(education)){
    throw `${education} is not an array`;
  }

  for(let i = 0; i < education.length; i++){
    let ed = education[i];
    checkObject(ed);

    if(!Object.keys(ed).includes('degree') || !Object.keys(ed).includes('institution') || !Object.keys(ed).includes('year')){
      throw `The Education Object should contain degree, institution and year keys.`;
    }

    checkStringParams(ed.degree);
    checkStringParams(ed.institution);
    checkYears(ed.year);

    ed.degree = ed.degree.trim();
    ed.institution = ed.institution.trim();
    
  }
  return education;
}

export const checkExperience = (experience) => {
  if(!Array.isArray(experience)){
    throw `${experience} is not an array`;
  }

  for(let i = 0; i < experience.length; i++){
    let ex = experience[i];
    checkObject(ex);

    if(!Object.keys(ex).includes('title') || !Object.keys(ex).includes('institution') || !Object.keys(ex).includes('years')){
      throw `The Experience Object should contain title, institution and years keys.`;
    }


    checkStringParams(ex.title);
    checkStringParams(ex.institution);
    checkYears(ex.years);

    ex.title = ex.title.trim();
    ex.institution = ex.institution.trim();
      
  }
  return experience;
}

export const checkArrayOfStrings = (array) =>{
  if(!Array.isArray(array)){
    throw `${array} is not an array`;
  }
  
  for(let i = 0; i <+array.length; i++){
    checkStringParams(array[i]);

    array[i] = array[i].trim();
  }

  return array;
}

export const checkAvailability = (availability) => {
  checkObject(availability);
  let days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  let keys = Object.keys(availability);
  // console.log(keys);
  for(let i = 0; i < keys.length; i++){
    let key = keys[i];
    
    // console.log(key);

    if(!days.includes(key)){
      throw `${key} not a valid day.`
    }

    //I am marking this as this can be an Array.
    let avail = availability[key];

    if(!Object.keys(avail).includes("start_time") || !Object.keys(avail).includes("end_time")){
      throw `The Availability Object should have a start time and an end time.`
    }

    avail.start_time = avail.start_time.trim();
    avail.end_time = avail.end_time.trim();

  }

  return availability;
}


export const checkEmail = async (email, user) => {
  checkStringParams(email);

  let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if(!emailRegex.test(email)){
    throw `Please Enter a Valid Email Id.`;
  }

  let collection = undefined;

  if(user === "mentee"){
    collection = await mentees();
  }else if(user === "mentor"){
    collection = await mentors();
  }

  const emailId = await collection.findOne({email: email});

  if(emailId){
    throw `This email already Exists. Please Provide another email.`;
  }
}