// This file should set up the express server as shown in the lecture code
import express from "express";

const app = express();

import session from "express-session";
import exphbs from "express-handlebars";
import Handlebars from "handlebars";

import constructorMethod from "./routes/index.js";
import { loginMiddleware, makeHeaderOptions } from "./middleware/auth.js";
import { privateRouteMiddleware, rootMiddleware } from "./middleware/root.js";
import { allowMenteesOnly, allowMentorsOnly } from "./middleware/users.js";
import { adminLoginMiddleware } from "./middleware/admin.js";

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
    // If the user posts to the server with a property called _method, rewrite the request's method
    // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
    // rewritten in this middleware to a PUT route
    if (req.body && req.body._method) {
        req.method = req.body._method;
        delete req.body._method;
    }

    // let the next middleware run:
    next();
};

const handlebarsInstance = exphbs.create({
    defaultLayout: "main",
    partialsDir: ["views/partials/"],
    // Specify helpers which are only registered on this instance.
    helpers: {
        asJSON: (obj, spacing) => {
            if (typeof spacing === "number")
                return new Handlebars.SafeString(
                    JSON.stringify(obj, null, spacing)
                );

            return new Handlebars.SafeString(JSON.stringify(obj));
        },
        isEqual: (a, b) => {
            return a === b;
        },
        partialsDir: ["views/partials/"],
    },
});

app.use(
    session({
        name: "PersonalMentoringApp",
        secret: process.env.EXPRESS_SESSION_SECRET || "fallback",
        saveUninitialized: false,
        resave: false,
        cookie: { maxAge: 60 * 1000 * 60 },
    })
);

// setup public and static directories
app.use("/public", express.static("public"));
app.use("/static", express.static("static"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rewriteUnsupportedBrowserMethods);

// middleware
app.use(makeHeaderOptions);
app.use("/dashboard", privateRouteMiddleware);
app.use("/login", loginMiddleware);
app.use("/signup", loginMiddleware);
app.use("/admin/login", adminLoginMiddleware);
app.use("/admin/signup", adminLoginMiddleware);
app.use("/sessions/*", privateRouteMiddleware);
app.use("/mentor/availability/*", privateRouteMiddleware);
app.use("/sessions/booking/*", allowMenteesOnly);

app.engine("handlebars", handlebarsInstance.engine);
app.set("view engine", "handlebars");

constructorMethod(app);

app.listen(3000, () => {
    console.log("We have now got a server");
    console.log("your routes will be running on http://localhost:3000");
});

// TODO: edit mentor profile
// TODO: reschedule sessions
// TODO: Delete sessions
// TODO: Admin interface
// TODO: Front-end for adding review and rating
