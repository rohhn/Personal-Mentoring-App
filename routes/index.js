// This file will import both route files and export the constructor method as shown in the lecture code
import { ratingsRoutes } from './rating.js';
import { menteeRoutes } from './mentees.js';
import { mentorRoutes } from './mentors.js';

const constructorMethod = (app) => {
    app.use('/mentees', menteeRoutes);
    app.use('/mentors', mentorRoutes);
    app.use('/ratings', ratingsRoutes);
    
    app.use('*', (req, res) => {
      res.status(404).json({ error: 'Not found' });
    });
  };
  
  export default constructorMethod;