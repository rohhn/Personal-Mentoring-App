
import { ObjectId } from "mongodb";
import * as collections from "./config/mongoCollections.js";
import { closeConnection, dbConnection } from "./config/mongoConnection.js";

const seedDatabase = async () => {
    const db = await dbConnection();
    await db.dropDatabase(); // Clear existing data to avoid duplicates

    try {
        const adminCollection = await collections.admin();
        const badgesCollection = await collections.badges();
        const forumsCollection = await collections.forums();
        const menteeCollection = await collections.mentees();
        const mentorCollection = await collections.mentors();
        const sessionsCollection = await collections.sessions();
        const subject_areasCollection = await collections.subject_areas();
        const forumCollection = await collections.forums();

        // example on how to insert
        // const mentor1 = await mentorCollection.insertOne(document)

        // Arrays to store the created _ids
        const mentorIds = [];
        const menteeIds = [];
        const subjectAreaIds = [];
        const badgeIds = [];
        const forumIds = [];
        const sessionIds = [];

        // Seed mentors collection
        for (let i = 0; i < 10; i++) {
            const mentor = {
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
                reviews: [], // Will be populated with session references after session insertion
                badges: [], // Will be populated with badge references
                subject_areas: [], // Will be populated with subject area references
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
            };
            const result = await mentorCollection.insertOne(mentor);
            mentorIds.push(result.insertedId); // Store the inserted mentor _id
        }

        // Seed mentees collection
        for (let i = 0; i < 10; i++) {
            const mentee = {
                _id: new ObjectId(),
                first_name: `Mentee${i + 1}`,
                last_name: `LastName${i + 1}`,
                email: `mentee${i + 1}@example.com`,
                dob: `199${i}-11-05`,
                pwd_hash: `hashed_password${i + 1}`,
                created_at: new Date().toISOString(),
                parent_email: i % 2 === 0 ? `parent${i + 1}@example.com` : null,
                profile_image: `https://example.com/mentee${i + 1}.png`,
                summary: `MSCS student at XYZ University, interested in field ${i + 1}`,
                skills: [`Skill ${i + 1}`],
                reviews: [], // Will be populated with session references
                badges: [], // Will be populated with badge references
            };
            const result = await menteeCollection.insertOne(mentee);
            menteeIds.push(result.insertedId); // Store the inserted mentee _id
        }

        // Seed subject_areas collection
        for (let i = 0; i < 10; i++) {
            const subject_area = {
                _id: new ObjectId(),
                name: `Subject Area ${i + 1}`,
                description: `Description for Subject Area ${i + 1}`,
                created_at: new Date().toISOString(),
            };
            const result = await subject_areasCollection.insertOne(subject_area);
            subjectAreaIds.push(result.insertedId); // Store the inserted subject area _id
        }

        // Seed badges collection
        for (let i = 0; i < 10; i++) {
            const badge = {
                _id: new ObjectId(),
                name: `Badge ${i + 1}`,
                description: `Awarded for achievement ${i + 1}`,
                icon: new ObjectId(), // Reference to icon or other collection
            };
            const result = await badgesCollection.insertOne(badge);
            badgeIds.push(result.insertedId); // Store the inserted badge _id
        }

        // Seed sessions collection with references to mentor and mentee
        for (let i = 0; i < 10; i++) {
            const session = {
                _id: new ObjectId(),
                mentor_id: mentorIds[i], // Reference to mentor _id
                mentee_id: menteeIds[i], // Reference to mentee _id
                subject_area: subjectAreaIds[i % subjectAreaIds.length], // Reference to subject area _id
                time: new Date().toISOString(),
                duration: 1800,
                status: i % 2 === 0 ? "completed" : "pending",
                meeting_link: `https://meetinglink${i + 1}.com`,
                created_at: new Date().toISOString(),
            };
            const result = await sessionsCollection.insertOne(session);
            sessionIds.push(result.insertedId); // Store the inserted session _id

            // Update mentor and mentee reviews with the session reference
            const mentorReview = {
                session_id: result.insertedId, // Reference to session
                rating: 5,
                feedback: `Review for session ${i + 1} from mentee`,
                author: menteeIds[i], // Reference to mentee _id
                created_at: new Date().toISOString(),
            };
            await mentorCollection.updateOne({ _id: mentorIds[i] }, { $push: { reviews: mentorReview } });

            const menteeReview = {
                session_id: result.insertedId, // Reference to session
                rating: 5,
                feedback: `Review for session ${i + 1} from mentor`,
                author: mentorIds[i], // Reference to mentor _id
                created_at: new Date().toISOString(),
            };
            await menteeCollection.updateOne({ _id: menteeIds[i] }, { $push: { reviews: menteeReview } });
        }

        // Seed forums collection
        for (let i = 0; i < 10; i++) {
            const forum = {
                _id: new ObjectId(),
                subject_id: subjectAreaIds[i % subjectAreaIds.length], // Reference to subject area _id
                title: `Forum Title ${i + 1}`,
                created_at: new Date().toISOString(),
                posts: [
                    {
                        _id: new ObjectId(),
                        authorName: testMentor1, // Reference to mentor _id
                        content: `This is post content for forum ${i + 1}`,
                        created_at: new Date().toISOString(),
                        replies: []
                    },
                    {
                        _id: new ObjectId(),
                        authorName: testMentee1, // Reference to mentee _id
                        content: `This is post content from mentee for forum ${i + 1}`,
                        created_at: new Date().toISOString(),
                        replies: []
                    },
                ],
            };
            const result = await forumsCollection.insertOne(forum);
            forumIds.push(result.insertedId); // Store the inserted forum _id
        }

        console.log("Database seeded successfully!");
    } catch (error) {
        console.error("Error seeding database:", error);
    } finally {
        await closeConnection();
    }
};

seedDatabase();
