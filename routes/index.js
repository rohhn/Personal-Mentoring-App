import { menteeRoutes } from "./mentees.js";
import { mentorRoutes } from "./mentors.js";
import { parentEmailRoutes } from "./parent.js";
import { ratingsRoutes } from "./rating.js";
import { rootRoutes } from "./root.js";
import { sessionRoutes } from './sessions.js';

const constructorMethod = (app) => {
    app.use("/", rootRoutes);
    app.use("/mentees", menteeRoutes);
    app.use("/mentors", mentorRoutes);
    app.use("/ratings", ratingsRoutes);
    app.use('/sessions', sessionRoutes);
    app.use('/parentEmailNotify',parentEmailRoutes);

    app.use("*", (req, res) => {
        res.status(404).json({ error: "Not found" });
    });
};

export default constructorMethod;
