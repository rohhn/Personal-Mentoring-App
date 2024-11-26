import { badgesRoutes } from "./badges.js";
import { parentEmailRoutes } from "./parent.js";
import { ratingsRoutes } from "./rating.js";
import { menteeRoutes } from "./mentees.js";
import { mentorRoutes } from "./mentors.js";
import { rootRoutes } from "./root.js";

const constructorMethod = (app) => {
    app.use("/", rootRoutes);
    app.use("/mentee", menteeRoutes);
    app.use("/mentor", mentorRoutes);
    app.use("/ratings", ratingsRoutes);
    app.use("/badges", badgesRoutes);
    app.use("/sessions", parentEmailRoutes); //yet to implemented

    app.use("*", (req, res) => {
        res.status(404).json({ error: "Not found" });
    });
};

export default constructorMethod;
