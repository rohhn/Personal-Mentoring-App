import { badgesRoutes } from './badges.js';
import { parentEmailRoutes } from './parent.js';
import { ratingsRoutes } from './rating.js';

const constructorMethod = (app) => {
    app.use('/ratings', ratingsRoutes);
    app.use('/badges', badgesRoutes);
    app.use('/mentees', menteeRoutes);
    app.use('/mentors', mentorRoutes);
    app.use('/sessions', parentEmailRoutes); //yet to implemented

    app.use('*', (req, res) => {
        res.status(404).json({ error: 'Not found' });
    });
};

export default constructorMethod;
