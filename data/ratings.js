import { ObjectId } from 'mongodb';
import { mentees, mentors } from '../config/mongoCollections.js';
import { validateRating as isValidRating } from '../helpers.js';

export const addRating = async (userId, rating, userType) => {
    if (!userId || !isValidRating(rating) || (userType !== 'mentor' && userType !== 'mentee')) {
      throw new Error('Invalid input');
    }
    let collection;
    if (userType === 'mentor') {
      collection = await mentors();
    } else {
      collection = await mentees();
    }
    const user = await collection.findOne({ _id: new ObjectId(userId) });
    if (!user) throw new Error('User not found');
    const updateResult = await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $push: { ratings: rating } }
    );
    if (updateResult.modifiedCount === 0) throw new Error('Failed to add rating');
    const updatedUser = await collection.findOne({ _id: new ObjectId(userId) });
    let sum = 0;
    for (let i = 0; i < updatedUser.ratings.length; i++) {
      sum += updatedUser.ratings[i];
    }
    const avgRating = sum / updatedUser.ratings.length;
    await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { averageRating: avgRating } }
    );
    return { averageRating: avgRating, newRating: rating };
  };
