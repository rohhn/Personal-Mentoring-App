import { ObjectId } from 'mongodb';
import { mentees, mentors, sessions } from './config/mongoCollections.js';
import { closeConnection, dbConnection } from './config/mongoConnection.js';
import { parentsData, ratingData, sessionsData } from './data/index.js';

const seedDatabase = async () => {
  const db = await dbConnection();
  await db.dropDatabase(); // Clear existing data to avoid duplicates

  try {
    const mentorCollection = await mentors();
    const menteeCollection = await mentees();
    const sessionCollection = await sessions();

    // Add sample mentor
    const mentor1 = await mentorCollection.insertOne({
      _id: new ObjectId(),
      first_name: 'Johnny',
      last_name: 'Depp',
      email: 'john.depp@example.com',
      dob: '1985-01-15',
      pwd_hash: 'passwordHash1',
      created_at: new Date().toISOString(),
      profile_image: 'https://example.com/image1.png',
      approved: true,
      summary: 'Expert in Data Science',
      education: [{ degree: 'PhD', institution: 'Stevens Institute of Technology', year: 2018 }],
      experience: [{ title: 'Data Scientist', institution: 'Google', years: 5 }],
      reviews: [],
      badges: [],
      subject_areas: ['Data Science'],
      availability: {
        Monday: { start_time: '09:00', end_time: '17:00' },
        Wednesday: { start_time: '09:00', end_time: '17:00' }
      },
      averageRating: 0
    });

    // Add sample mentee
    const mentee1 = await menteeCollection.insertOne({
      _id: new ObjectId(),
      first_name: 'Janine',
      last_name: 'Smith',
      email: 'jane.smith@example.com',
      dob: '1998-11-05',
      pwd_hash: 'passwordHash2',
      created_at: new Date().toISOString(),
      parent_email: 'parent.smith@example.com',
      profile_image: 'https://example.com/image2.png',
      summary: 'MSCS student interested in Data Science',
      skills: ['Python', 'Machine Learning'],
      reviews: [],
      badges: [],
      averageRating: 0
    });

    // Add sample reviews/ratings
    await ratingData.addReviewAndUpdateRating(
      'session1',
      mentor1.insertedId.toString(), // User ID of mentor
      5, // Valid integer rating
      'Great mentor!', // Feedback
      'mentor', // User type
      mentee1.insertedId.toString() // Author ID (mentee)
    );

    await ratingData.addReviewAndUpdateRating(
      'session2',
      mentee1.insertedId.toString(), // User ID of mentee
      4, // Valid integer rating
      'Very engaging!', // Feedback
      'mentee', // User type
      mentor1.insertedId.toString() // Author ID (mentor)
    );

    // Create a sample session and notify parent
    await parentsData.parentsSessionData(
      mentor1.insertedId.toString(), // Mentor ID
      mentee1.insertedId.toString(), // Mentee ID
      'Data Science', // Subject
      new Date().toISOString(), // Date/time
      3600, // Duration in seconds
      'https://meet.example.com/session1' // Meeting link
    );

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await closeConnection();
  }
};

seedDatabase();
