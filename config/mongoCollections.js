import { dbConnection } from './mongoConnection.js';

const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};


export const mentors = getCollectionFn('mentors');
export const mentees = getCollectionFn('mentees');
export const forums= getCollectionFn('forums');
export const sessions = getCollectionFn('sessions');


