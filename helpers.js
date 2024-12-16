// You can add and export any helper functions you want here - if you aren't using any, then you can just leave this file as is
import dotenv from "dotenv";
import { google } from "googleapis";
import moment from "moment";
import xss from "xss";
dotenv.config();

export const postVerify = (content) => {
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
    const numRating = Number(rating);
    if (
        typeof numRating !== "number" ||
        numRating < 1 ||
        numRating > 5 ||
        numRating % 1 !== 0 ||
        isNaN(numRating)
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
        throw `The input for ${allowEmpty} is not a string: ${param}.`;
    } else {
        if (param.trim() === "" && !allowEmpty) {
            throw `The input is an empty string: ${param}.`;
        }
    }

    return param.trim();
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
    checkStringParams(inputDate);
    // let dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;

    let dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;

    // console.log(inputDate);

    if (!dateRegex.test(inputDate)) {
        throw `The Input Date is not in yyyy-mm-dd format. : ${inputDate}`;
    }

    let [year, month, day] = inputDate.split("-").map(Number);

    let date = new Date(year, month - 1, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        throw `Invalid Date. - ${date}`;
    }

    // let today = new Date();

    // if (date > today) {
    //     throw `Date cannot be in the future.`;
    // }

    // return date;
};

export const checkTimestamp = (inputDate) => {
    checkStringParams(inputDate);
    const date = moment(inputDate, moment.ISO_8601, true);

    if (!date.isValid()) {
        throw `The Input Timestamp is not in ISO format or is invalid: ${inputDate}`;
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

        ex.title = xss(ex.title.trim());
        ex.institution = xss(ex.institution.trim());
    }
    return experience;
};

export const checkArrayOfStrings = (array) => {
    if (!Array.isArray(array)) {
        throw `${array} is not an array`;
    }

    for (let i = 0; i < +array.length; i++) {
        checkStringParams(array[i], "String");

        array[i] = xss(array[i].trim());
    }

    return array;
};

export const checkArray = (array) => {
    if (!Array.isArray(array)) {
        throw `${array} is not an array`;
    }
};

export const validateAvailability = (availability) => {
    // checkArrayOfO(availability);
    // console.log(availability);
    checkArray(availability);
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
    for (let i in availability) {
        if (
            !Object.keys(availability[i]).includes("day") ||
            !Object.keys(availability[i]).includes("start_time") ||
            !Object.keys(availability[i]).includes("end_time")
        ) {
        }

        let day = availability[i].day;
        let start_time = availability[i].start_time;
        let end_time = availability[i].end_time;

        const [startHour, startMinute] = start_time.split(":").map(Number);
        const [endHour, endMinute] = end_time.split(":").map(Number);

        if (
            endHour < startHour ||
            (endHour === startHour && endMinute <= startMinute)
        ) {
            throw `End time cannot be before or equal to start time for availability at index ${i}.`;
        }

        checkStringParams(day, "day");

        availability[i].day = xss(day.trim());
        availability[i].start_time = xss(start_time.trim());
        availability[i].end_time = xss(end_time.trim());
    }
    return availability;
};

export const checkEmail = (email, user) => {
    checkStringParams(email, "email");

    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        throw `Please Enter a Valid Email Id.`;
    }

    return xss(email);
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
        // console.error("Error adding availability:", error.message);
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

        recurrence: [],
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
        // console.error("Error deleting event from calendar:", error.message);
        throw new Error(
            `Could not delete the event with ID ${eventId} on the calendar.`
        );
    }
};
