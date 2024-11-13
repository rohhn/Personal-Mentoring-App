// You can add and export any helper functions you want here - if you aren't using any, then you can just leave this file as is
export function validateRating(rating) {
    if (typeof rating !== 'number' || rating < 1 || rating > 5 || rating % 1 !== 0) {
      throw new Error('Rating must be a whole number between 1 and 5');
    }
    return true;
  }