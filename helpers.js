// You can add and export any helper functions you want here - if you aren't using any, then you can just leave this file as is
import { mentors, mentees } from "./config/mongoCollections.js";
import { ObjectId } from "mongodb";
import { google } from "googleapis";
import path from 'path';
import fs from 'fs';

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

export const checkNumber = (number) => {
  if(typeof number !== 'number' || Number.isNaN(number)){
    throw `Invalid Input, Expected Number.`;
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

// export const checkAvailability = (availability) => {
//   checkObject(availability);
//   let days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

//   let keys = Object.keys(availability);
//   // console.log(keys);
//   for(let i = 0; i < keys.length; i++){
//     let key = keys[i];
    
//     // console.log(key);

//     if(!days.includes(key)){
//       throw `${key} not a valid day.`
//     }

//     //I am marking this as this can be an Array.
//     let avail = availability[key];

//     if(!Object.keys(avail).includes("start_time") || !Object.keys(avail).includes("end_time")){
//       throw `The Availability Object should have a start time and an end time.`
//     }

//     avail.start_time = avail.start_time.trim();
//     avail.end_time = avail.end_time.trim();

//   }

//   return availability;
// }


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

const keyFilePath = path.resolve('./secrets/gc_cloud_key.json');

let keyFileContent;
try {
    keyFileContent = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
} catch (err) {
    console.error("Error reading or parsing the key file:", err.message);
    process.exit(1);
}


const calendar = google.calendar('v3');

const auth = new google.auth.GoogleAuth({
    // keyFile: './credentials/client_secret_75435018716-qmbomqrjao2ig97npss6jt2u5mfsne6i.apps.googleusercontent.com.json', // Path to your JSON key file
    credentials: keyFileContent.web,
    scopes: ['https://www.googleapis.com/auth/calendar'], // Calendar scope
});

export const getAuthClient = async () => {
  // console.log(keyFileContent);
    return await auth.getClient();
}

export const createCalendarForMentor = async () => {
  const authClient = await getAuthClient();

  const response = await calendar.calendars.insert({
      auth: authClient,
      requestBody: {
          summary: `Mentor's Calendar`,
          description: `Calendar for mentor mentor`,
          timeZone: 'UTC',
      },
  });

  const calendarId = response.data.id;

  // Save calendarId to the mentor's record in your database
  // console.log(`Calendar created with ID: ${calendarId}`);
  return calendarId;
}

const getNextWeekdayDate = (weekday) => {
    const weekdaysMap = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
    };

    const today = new Date();
    const currentDay = today.getDay();
    const targetDay = weekdaysMap[weekday];
    const daysUntilNext = (targetDay - currentDay + 7) % 7 || 7; // Ensure it's at least 1 day ahead

    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntilNext);
    return nextDate.toISOString().split('T')[0]; // Return the date part (YYYY-MM-DD)
};

export const addAvailability = async (calendarId, weekday, startTime, endTime) => {
    const authClient = await getAuthClient();

    // Get the next date for the input weekday
    const day = getNextWeekdayDate(weekday);

    // console.log(weekday);

    const event = {
        summary: 'Available',
        start: {
            dateTime: `${day}T${startTime}:00Z`, // e.g., 2024-11-20T10:00:00Z
            timeZone: 'UTC',
        },
        end: {
            dateTime: `${day}T${endTime}:00Z`, // e.g., 2024-11-20T12:00:00Z
            timeZone: 'UTC',
        },
        recurrence: [
            `RRULE:FREQ=WEEKLY;BYDAY=${weekday.slice(0, 2).toUpperCase()}`, // Repeat availability weekly on the given weekday
        ],
    };

    try {
        const calendar = google.calendar({ version: 'v3', auth: authClient });
        const response = await calendar.events.insert({
            calendarId,
            requestBody: event,
        });
        console.log('Availability added:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error adding availability:', error.message);
        throw error;
    }
};



export const checkAvailability = async (calendarId, startTime, endTime) => {
  const authClient = await getAuthClient();

  const response = await calendar.freebusy.query({
      auth: authClient,
      requestBody: {
          timeMin: startTime, // ISO string of the start time
          timeMax: endTime,  // ISO string of the end time
          timeZone: 'UTC',
          items: [{ id: calendarId }],
      },
  });

  const busySlots = response.data.calendars[calendarId].busy;

  // If no busy slots overlap, the time slot is free
  const isAvailable = busySlots.length === 0;
  console.log(`Is available: ${isAvailable}`);
  return isAvailable;
}

export const bookSession= async (calendarId, subject, startTime, endTime) => {
  const authClient = await getAuthClient();

  const event = {
      summary: `Session with menteexew`,
      description: `Subject: ${subject}`,
      start: {
          dateTime: startTime, // e.g., 2024-11-20T10:00:00Z
          timeZone: 'UTC',
      },
      end: {
          dateTime: endTime, // e.g., 2024-11-20T10:30:00Z
          timeZone: 'UTC',
      },
  };

  const response = await calendar.events.insert({
      auth: authClient,
      calendarId: calendarId,
      requestBody: event,
  });

  console.log('Session booked:', response.data);
  return response.data; // Return the meeting link
}
