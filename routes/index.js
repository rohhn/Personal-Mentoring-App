import { menteeRoutes } from "./mentees.js";
import { mentorRoutes } from "./mentors.js";
import { parentEmailRoutes } from "./parent.js";
import { ratingsRoutes } from "./rating.js";
import { rootRoutes } from "./root.js";
import { sessionRoutes } from './sessions.js';
import { subjectRoutes } from "./subject_areas.js";

const constructorMethod = (app) => {
    app.use("/", rootRoutes);
    app.use("/mentee", menteeRoutes);
    app.use("/mentor", mentorRoutes);
    app.use("/ratings", ratingsRoutes);
    app.use('/sessions', sessionRoutes);
    app.use('/subjects', subjectRoutes);
    app.use('/parentEmailNotify',parentEmailRoutes);

    app.use("*", (req, res) => {
        res.status(404).json({ error: "Not found" });
    });
};

export default constructorMethod;
