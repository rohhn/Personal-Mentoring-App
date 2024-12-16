import { adminRoutes } from "./admin.js";
import { menteeRoutes } from "./mentees.js";
import { mentorRoutes } from "./mentors.js";
import { parentEmailRoutes } from "./parent.js";
import { postRoutes } from "./posts.js";
import { ratingsRoutes } from "./rating.js";
import { rootRoutes } from "./root.js";
import { sessionRoutes } from "./sessions.js";
import { subjectRoutes } from "./subject_areas.js";

const constructorMethod = (app) => {
    app.use("/", rootRoutes);
    app.use("/mentee", menteeRoutes);
    app.use("/mentor", mentorRoutes);
    app.use("/ratings", ratingsRoutes);
    app.use("/sessions", sessionRoutes);
    app.use("/subjects", subjectRoutes);
    app.use("/parentEmailNotify", parentEmailRoutes);
    app.use("/forum", postRoutes);
    app.use("/admin", adminRoutes);

    app.use("*", (req, res) => {
        return res.status(404).render("error", {
            pageTitle: "Page Not Found!",
            headerOptions: req.headerOptions,
            errorMessage: "This page does not exist.",
            errorTitle: "404 - Not found",
        });
    });
};

export default constructorMethod;
