import { ObjectId } from "mongodb";
import { mentees, mentors } from "../config/mongoCollections.js";
import { validateRating as isValidRating } from "../helpers.js";

export const addReviewAndUpdateRating = async (
    sessionId,
    userId,
    rating,
    review,
    userType,
    author
) => {
    if (
        !userId ||
        !sessionId ||
        !isValidRating(rating) ||
        !userType ||
        !author
    ) {
        throw new Error("Invalid input");
    }

    let recipientCollection, authorCollection;
    if (userType === "mentee") {
        recipientCollection = await mentors();
        authorCollection = await mentees();
    } else {
        recipientCollection = await mentees();
        authorCollection = await mentors();
    }

    try {
        const recipient = await recipientCollection.findOne({
            _id: new ObjectId(userId),
        });
        if (!recipient) {
            throw new Error("Recipient not found");
        }
        const existingReview = await recipientCollection.findOne({
            _id: new ObjectId(userId),
            "reviews.sessionId": sessionId,
        });

        if (existingReview) {
            throw new Error(
                "A review for this session has already been posted"
            );
        }

        const reviewId = new ObjectId();
        const newReview = {
            _id: reviewId,
            sessionId,
            userId,
            rating,
            feedback: review || "N/A",
            author,
            created_at: new Date().toISOString(),
        };

        const updateResult = await recipientCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $push: { reviews: newReview } }
        );

        if (updateResult.modifiedCount === 0) {
            throw new Error("Failed to add review");
        }

        const updatedRecipient = await recipientCollection.findOne({
            _id: new ObjectId(userId),
        });
        const sum = updatedRecipient.reviews.reduce(
            (acc, cur) => acc + cur.rating,
            0
        );
        const avgRating = sum / updatedRecipient.reviews.length;

        await recipientCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { averageRating: avgRating } }
        );

        return { averageRating: avgRating, newReview };
    } catch (error) {
        console.error(`Database operation failed: ${error}`);
        throw new Error(`${error.message}`);
    }
};

export const getReviewById = async (userId, reviewId, userType) => {
    if (
        !userId ||
        !reviewId ||
        (userType !== "mentor" && userType !== "mentee")
    ) {
        throw new Error("Invalid input");
    }

    const collection =
        userType === "mentor" ? await mentors() : await mentees();
    const user = await collection.findOne(
        { _id: new ObjectId(userId), "reviews._id": new ObjectId(reviewId) },
        { projection: { "reviews.$": 1 } }
    );

    if (!user || !user.reviews || user.reviews.length === 0) {
        throw new Error("Review not found");
    }

    return user.reviews[0];
};
export const deleteReviewById = async (userId, reviewId, userType) => {
    if (
        !userId ||
        !reviewId ||
        (userType !== "mentor" && userType !== "mentee")
    ) {
        throw new Error("Invalid input");
    }
    const collection =
        userType === "mentor" ? await mentors() : await mentees();
    const user = await collection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
        throw new Error("User not found");
    }
    if (!Array.isArray(user.reviews)) {
        throw new Error("No reviews found for this user");
    }
    const reviewIndex = user.reviews.findIndex(
        (review) => review?._id?.toString() === reviewId
    );

    if (reviewIndex === -1) {
        throw new Error("Review not found");
    }
    user.reviews.splice(reviewIndex, 1);
    let totalRatings = 0;
    for (const review of user.reviews) {
        totalRatings += review.rating;
    }
    const avgRating =
        user.reviews.length > 0 ? totalRatings / user.reviews.length : 0;
    const updateResult = await collection.updateOne(
        { _id: new ObjectId(userId) },
        {
            $set: {
                reviews: user.reviews,
                averageRating: avgRating,
            },
        }
    );

    if (updateResult.modifiedCount === 0) {
        throw new Error("Failed to delete review");
    }

    return { message: "Review deleted successfully", averageRating: avgRating };
};
