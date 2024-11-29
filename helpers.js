// You can add and export any helper functions you want here - if you aren't using any, then you can just leave this file as is
import fs from "fs";
import { google } from "googleapis";
import path from "path";
import { mentees, mentors } from "./config/mongoCollections.js";
import dotenv from 'dotenv';
dotenv.config();


export const postVerify = async (content) => {
    if (content == "") {
        throw "Error, please enter something";
    }
    if (content == null) {
        throw "Error, please enter something";
    }
    if (typeof content !== "string") {
        throw "Erorr, post body must be a string";
    }
    content = content.trim();
    if (content.length == 0) {
        throw "Error, post body cannot be empty";
    }
    if (content == "") {
        throw "Error, post body cannot be just empty spaces";
    }
};

export const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}/${day}/${year}`;
};

export function validateRating(rating) {
    if (
        typeof rating !== "number" ||
        rating < 1 ||
        rating > 5 ||
        rating % 1 !== 0
    ) {
        throw new Error("Rating must be a whole number between 1 and 5");
    }
    return true;
}

export const checkStringParams = (param, allowEmpty = false) => {
    if (!param && !allowEmpty) {
        throw `The input is an empty paramter.`;
    }
    if (typeof param !== "string") {
        throw `The input is not a string: ${param}.`;
    }

    if (param.trim() === "" && !allowEmpty) {
        throw `The input is an empty string: ${param}.`;
    }
};

export const checkBoolean = (param) => {
    if (typeof param !== "boolean") {
        throw `The input should be a boolean. : ${param}`;
    }
};

export const checkNumber = (number) => {
    if (typeof number !== "number" || Number.isNaN(number)) {
        throw `Invalid Input, Expected Number.`;
    }
};

export const checkObject = (param) => {
    if (Array.isArray(param) || param === null || param === undefined) {
        throw `The input should be an object.`;
    }

    if (typeof param !== "object") {
        throw `The input should be an object.`;
    }

    if (Object.keys(param).length === 0) {
        throw `The imput is an empty Object.`;
    }
};

export const checkDate = (inputDate) => {
    // checkStringParams(inputDate);
    let dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

    if (!dateRegex.test(inputDate)) {
        throw `The Input Date is not in mm/dd/yyyy format. : ${inputDate}`;
    }

    // let [month, day, year] = inputDate.split("/").map(Number);
    let [year, month, day] = inputDate.split("T")[0].split("-").map(Number);

    let date = new Date(year, month - 1, day);

    console.log(day);
    console.log(month - 1);
    console.log(year);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        throw `Invalid Date.`;
    }

    let today = new Date();

    if (date > today) {
        throw `Date cannot be in the future.`;
    }
};

export const checkYears = (years) => {
    if (typeof years !== "number" || Number.isNaN(years)) {
        throw `The Year input should be a number.`;
    }

    let currYear = new Date().getFullYear();

    if (years > currYear) {
        throw `Year cannot be in future.`;
    }
};

export const checkEducation = (education) => {
    if (!Array.isArray(education)) {
        throw `${education} is not an array`;
    }

    for (let i = 0; i < education.length; i++) {
        let ed = education[i];
        checkObject(ed);

        if (
            !Object.keys(ed).includes("degree") ||
            !Object.keys(ed).includes("institution") ||
            !Object.keys(ed).includes("year")
        ) {
            throw `The Education Object should contain degree, institution and year keys.`;
        }

        checkStringParams(ed.degree, "degree");
        checkStringParams(ed.institution, "institution");
        checkYears(ed.year);

        ed.degree = ed.degree.trim();
        ed.institution = ed.institution.trim();
    }
    return education;
};

export const checkExperience = (experience) => {
    if (!Array.isArray(experience)) {
        throw `${experience} is not an array`;
    }

    for (let i = 0; i < experience.length; i++) {
        let ex = experience[i];
        checkObject(ex);

        if (
            !Object.keys(ex).includes("title") ||
            !Object.keys(ex).includes("institution") ||
            !Object.keys(ex).includes("years")
        ) {
            throw `The Experience Object should contain title, institution and years keys.`;
        }

        checkStringParams(ex.title, "title");
        checkStringParams(ex.institution, "institution");
        checkYears(ex.years);

        ex.title = ex.title.trim();
        ex.institution = ex.institution.trim();
    }
    return experience;
};

export const checkArrayOfStrings = (array) => {
    if (!Array.isArray(array)) {
        throw `${array} is not an array`;
    }

    for (let i = 0; i < +array.length; i++) {
        checkStringParams(array[i], "String");

        array[i] = array[i].trim();
    }

    return array;
};

export const validateAvailability = (availability) => {
    checkObject(availability);
    let days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ];

    let keys = Object.keys(availability);
    // console.log(keys);
    for (let i in availability) {
        if (
            !Object.keys(availability[i]).includes("days") ||
            !Object.keys(availability[i]).includes("start_time") ||
            !Object.keys(availability[i]).includes("end_time")
        ) {
        }

        let day = availability[i].day;
        let start_time = availability[i].start_time;
        let end_time = availability[i].end_time;

        checkStringParams(day, "day");
        checkDate(start_time);
        checkDate(end_time);

        availability[i].day = day.trim();
        availability[i].start_time = new Date(start_time.trim());
        availability[i].end_time = new Date(end_time.trim());

        avail.start_time = avail.start_time.trim();
        avail.end_time = avail.end_time.trim();
    }
    return availability;
};

export const checkEmail = async (email, user) => {
    checkStringParams(email, "email");

    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        throw `Please Enter a Valid Email Id.`;
    }

    let collection = undefined;

    if (user === "mentee") {
        collection = await mentees();
    } else if (user === "mentor") {
        collection = await mentors();
    }

    const emailId = await collection.findOne({ email: email });

    if (emailId) {
        throw `This email already Exists. Please Provide another email.`;
    }
};

const keyFilePath = process.env.KEYFILECONTENT;

let keyFileContent;
try {
    keyFileContent = JSON.parse(keyFilePath);
} catch (err) {
    console.error("Error reading or parsing the key file:", err.message);
    process.exit(1);
}

const calendar = google.calendar("v3");

const auth = new google.auth.GoogleAuth({
    credentials: keyFileContent.web,
    scopes: ["https://www.googleapis.com/auth/calendar"],
});

export const getAuthClient = async () => {
    // console.log(keyFileContent);
    return await auth.getClient();
};

export const createCalendarForMentor = async () => {
    const authClient = await getAuthClient();

    const response = await calendar.calendars.insert({
        auth: authClient,
        requestBody: {
            summary: `Mentor's Calendar`,
            description: `Calendar for mentor mentor`,
            timeZone: "UTC",
        },
    });

    const calendarId = response.data.id;

    return calendarId;
};

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
    const daysUntilNext = (targetDay - currentDay + 7) % 7 || 7;

    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntilNext);
    return nextDate.toISOString().split("T")[0]; // Return the date part (YYYY-MM-DD)
};

export const addAvailability = async (
    calendarId,
    weekday,
    startTime,
    endTime
) => {
    const authClient = await getAuthClient();

    const day = getNextWeekdayDate(weekday);

    // console.log(weekday);

    const event = {
        summary: "Available",
        start: {
            dateTime: `${day}T${startTime}:00Z`,
            timeZone: "UTC",
        },
        end: {
            dateTime: `${day}T${endTime}:00Z`,
            timeZone: "UTC",
        },
        recurrence: [
            `RRULE:FREQ=WEEKLY;BYDAY=${weekday.slice(0, 2).toUpperCase()}`,
        ],
    };

    try {
        const calendar = google.calendar({ version: "v3", auth: authClient });
        const response = await calendar.events.insert({
            calendarId,
            requestBody: event,
        });
        return response.data;
    } catch (error) {
        console.error("Error adding availability:", error.message);
        throw error;
    }
};

export const checkAvailability = async (calendarId, startTime, endTime) => {
    const authClient = await getAuthClient();

    const response = await calendar.freebusy.query({
        auth: authClient,
        requestBody: {
            timeMin: startTime,
            timeMax: endTime,
            timeZone: "UTC",
            items: [{ id: calendarId }],
        },
    });

    const busySlots = response.data.calendars[calendarId].busy;

    const isAvailable = busySlots.length === 0;
    return isAvailable;
};

export const bookSession = async (calendarId, subject, startTime, endTime) => {
    const authClient = await getAuthClient();

    const event = {
        summary: `Session with menteexew`,
        description: `Subject: ${subject}`,
        start: {
            dateTime: startTime, // e.g., 2024-11-20T10:00:00Z
            timeZone: "UTC",
        },
        end: {
            dateTime: endTime, // e.g., 2024-11-20T10:30:00Z
            timeZone: "UTC",
        },
    };

    const response = await calendar.events.insert({
        auth: authClient,
        calendarId: calendarId,
        requestBody: event,
    });

    return response.data;
};

export const updateSessionOnCalendar = async (
    calendarId,
    eventId,
    start_time,
    end_time
) => {
    const authClient = await getAuthClient();

    const updatedEvent = {
        start: {
            dateTime: new Date(start_time).toISOString(),
            timeZone: "UTC",
        },
        end: {
            dateTime: new Date(end_time).toISOString(),
            timeZone: "UTC",
        },
    };

    try {
        const response = await calendar.events.update({
            auth: authClient,
            calendarId: calendarId,
            eventId: eventId,
            requestBody: updatedEvent,
        });

        return response.data;
    } catch (e) {
        // console.error('e updating session on calendar:', error.message);
        throw new Error("Could not update session on calendar.");
    }
};

export const deleteSessionFromCalendar = async (calendarId, eventId) => {
    // Get authenticated client
    const authClient = await getAuthClient();

    try {
        await calendar.events.delete({
            auth: authClient,
            calendarId: calendarId,
            eventId: eventId,
        });

        return {
            success: true,
            message: `Event with ID ${eventId} successfully deleted.`,
        };
    } catch (error) {
        console.error("Error deleting event from calendar:", error.message);
        throw new Error(
            `Could not delete the event with ID ${eventId} on the calendar.`
        );
    }
};
