import { ObjectId } from "bson";
import { serialize } from "bson";
import { writeFileSync } from "fs";

// Generate dummy data
const dummyData = {
    mentors: Array.from({ length: 10 }, (_, i) => ({
        _id: new ObjectId(),
        first_name: `Mentor${i + 1}`,
        last_name: `LastName${i + 1}`,
        email: `mentor${i + 1}@example.com`,
        dob: `198${i}-01-15`,
        pwd_hash: `hashed_password${i + 1}`,
        created_at: new Date().toISOString(),
        profile_image: `https://example.com/mentor${i + 1}.png`,
        approved: i % 2 === 0,
        summary: `Experienced professional in field ${i + 1}.`,
        education: [
            {
                degree: `Degree ${i + 1}`,
                institution: `Institution ${i + 1}`,
                year: 2010 + i,
            },
        ],
        experience: [
            {
                title: `Title ${i + 1}`,
                institution: `Company ${i + 1}`,
                years: 2 + i,
            },
        ],
        reviews: [
            {
                session_id: new ObjectId(),
                rating: 4 + (i % 2),
                feedback: `Feedback for mentor ${i + 1}`,
                author: new ObjectId(),
                created_at: new Date().toISOString(),
            },
        ],
        badges: [
            {
                badge_id: new ObjectId(),
                created_at: new Date().toISOString(),
            },
        ],
        subject_areas: [new ObjectId()],
        availability: {
            Monday: {
                start_time: new Date().toISOString(),
                end_time: new Date().toISOString(),
            },
            Tuesday: {
                start_time: new Date().toISOString(),
                end_time: new Date().toISOString(),
            },
        },
    })),
    mentees: Array.from({ length: 10 }, (_, i) => ({
        _id: new ObjectId(),
        first_name: `Mentee${i + 1}`,
        last_name: `LastName${i + 1}`,
        email: `mentee${i + 1}@example.com`,
        dob: `199${i}-05-10`,
        pwd_hash: `hashed_password${i + 1}`,
        created_at: new Date().toISOString(),
        parent_email: i % 2 === 0 ? `parent${i + 1}@example.com` : null,
        profile_image: `https://example.com/mentee${i + 1}.png`,
        summary: `Learning skills in field ${i + 1}.`,
        skills: [`Skill${i + 1}`],
        reviews: [
            {
                session_id: new ObjectId(),
                rating: 5 - (i % 2),
                feedback: `Feedback for mentee ${i + 1}`,
                author: new ObjectId(),
                created_at: new Date().toISOString(),
            },
        ],
        badges: [
            {
                badge_id: new ObjectId(),
                created_at: new Date().toISOString(),
            },
        ],
    })),
    sessions: Array.from({ length: 10 }, (_, i) => ({
        _id: new ObjectId(),
        mentor_id: new ObjectId(),
        mentee_id: new ObjectId(),
        subject_area: new ObjectId(),
        time: new Date().toISOString(),
        duration: 3600 + i * 100,
        status: ["pending", "scheduled", "completed", "cancelled"][i % 4],
        meeting_link: `https://example.com/session${i + 1}`,
        created_at: new Date().toISOString(),
    })),
    subject_areas: Array.from({ length: 10 }, (_, i) => ({
        _id: new ObjectId(),
        name: `Subject${i + 1}`,
        description: `Description for subject ${i + 1}.`,
        created_at: new Date().toISOString(),
    })),
    badges: Array.from({ length: 10 }, (_, i) => ({
        _id: new ObjectId(),
        name: `Badge${i + 1}`,
        description: `Earned for completing milestone ${i + 1}.`,
        icon: `https://example.com/badge${i + 1}.png`,
    })),
    forums: Array.from({ length: 10 }, (_, i) => ({
        _id: new ObjectId(),
        subject_id: new ObjectId(),
        title: `Forum Topic ${i + 1}`,
        created_at: new Date().toISOString(),
        posts: Array.from({ length: 5 }, (_, j) => ({
            _id: new ObjectId(),
            author: new ObjectId(),
            content: `Post content ${j + 1} for forum ${i + 1}.`,
            created_at: new Date().toISOString(),
        })),
    })),
};

// Function to write BSON files
const convertIdsToExtendedJson = (data) => {
    return data.map((doc) => {
        // Convert _id to the { "$oid": "value" } format
        if (doc._id && doc._id instanceof ObjectId) {
            doc._id = { $oid: doc._id.toString() };
        }
        return doc;
    });
};

// Function to write JSON files with Extended JSON format for _id
const writeJSON = (collectionName, documents) => {
    try {
        const documentsWithExtendedIds = convertIdsToExtendedJson(documents); // Convert _id fields to Extended JSON
        const jsonData = JSON.stringify(documentsWithExtendedIds, null, 2); // Convert to formatted JSON string
        writeFileSync(`${collectionName}.json`, jsonData); // Write to file
        console.log(`${collectionName}.json created!`);
    } catch (error) {
        console.error(`Error writing JSON file for ${collectionName}:`, error);
    }
};

Object.entries(dummyData).forEach(([collectionName, documents]) => {
    writeJSON(collectionName, documents);
});
