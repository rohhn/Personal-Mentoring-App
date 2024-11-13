// This file will import both route files and export the constructor method as shown in the lecture code
import { ratingsRoutes } from './rating.js';

const constructorMethod = (app) => {
    app.use('/ratings', ratingsRoutes);
    // app.use('/games', gamesRoutes);
    app.use('*', (req, res) => {
      res.status(404).json({ error: 'Not found' });
    });
  };
  
  export default constructorMethod;