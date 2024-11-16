import { ObjectId } from 'mongodb';
import { mentees, mentors } from '../config/mongoCollections.js';
import { validateRating as isValidRating } from '../helpers.js';

export const addReviewAndUpdateRating = async (sessionId, userId, rating, review, userType, author) => {
    if (!userId || !sessionId || !isValidRating(rating) || (userType !== 'mentor' && userType !== 'mentee')) {
        throw new Error('Invalid input');
    }
    const collection = userType === 'mentor' ? await mentors() : await mentees();
    const user = await collection.findOne({ _id: new ObjectId(userId) });
    if (!user) throw new Error('User not found');
    const reviewId = new ObjectId();

    const newReview = {
        _id: reviewId,
        sessionId,
        userId,
        rating: rating,
        feedback: review || 'N/A',
        author,
        created_at: new Date().toISOString()
    };
    const updateResult = await collection.updateOne(
        { _id: new ObjectId(userId) },
        { $push: { reviews: newReview } }
    );
    if (updateResult.modifiedCount === 0) throw new Error('Failed to add review');
    let sum = 0;
    const updatedUser = await collection.findOne({ _id: new ObjectId(userId) });
    for (let i = 0; i < updatedUser.reviews.length; i++) {
        sum += updatedUser.reviews[i].rating;
    }
    const avgRating = sum / updatedUser.reviews.length;

    await collection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { averageRating: avgRating } }
    );

    return { averageRating: avgRating, newReview };
};

export const getReviewById = async (userId, reviewId, userType) => {
    console.log("Reached here")
    if (!userId || !reviewId || (userType !== 'mentor' && userType !== 'mentee')) {
        throw new Error('Invalid input');
    }

    const collection = userType === 'mentor' ? await mentors() : await mentees();
    const user = await collection.findOne(
        { _id: new ObjectId(userId), "reviews._id": new ObjectId(reviewId) },
        { projection: { "reviews.$": 1 } }
    );

    if (!user || !user.reviews || user.reviews.length === 0) {
        throw new Error('Review not found');
    }

    return user.reviews[0];
};
export const deleteReviewById = async (userId, reviewId, userType) => {
    if (!userId || !reviewId || (userType !== 'mentor' && userType !== 'mentee')) {
        throw new Error('Invalid input');
    }

    const collection = userType === 'mentor' ? await mentors() : await mentees();
    const user = await collection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
        throw new Error('User not found');
    }

    console.log("User ID:", userId);
    console.log("Reviews Array:", user.reviews);

    // Check if reviews array exists
    if (!Array.isArray(user.reviews)) {
        throw new Error('No reviews found for this user');
    }

    // Find the index of the review safely
    const reviewIndex = user.reviews.findIndex(
        (review) => review?._id?.toString() === reviewId // Ensure safe access to _id
    );

    console.log("Review Index:", reviewIndex);

    if (reviewIndex === -1) {
        throw new Error('Review not found');
    }

    // Remove the review from the array
    user.reviews.splice(reviewIndex, 1);

    // Recalculate the average rating
    let totalRatings = 0;
    for (const review of user.reviews) {
        totalRatings += review.rating;
    }

    const avgRating = user.reviews.length > 0 ? totalRatings / user.reviews.length : 0;

    // Update the user document in the database
    const updateResult = await collection.updateOne(
        { _id: new ObjectId(userId) },
        {
            $set: {
                reviews: user.reviews,
                averageRating: avgRating
            }
        }
    );

    if (updateResult.modifiedCount === 0) {
        throw new Error('Failed to delete review');
    }

    return { message: 'Review deleted successfully', averageRating: avgRating };
};
