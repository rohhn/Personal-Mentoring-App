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
import {
    adminDashboardMiddleware,
    adminLoginMiddleware,
    allowAdminOnly,
} from "./middleware/admin.js";
import moment from "moment";
import { format } from "date-fns";

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
        isNotEqual: (a, b) => {
            return a !== b;
        },
        formatDateTime: (datetime) => {
            const dateTimeObj = moment(datetime);
            if (dateTimeObj.isValid()) {
                // return dateTimeObj.format("MM-DD-YYYY hh:mm");
                return format(datetime, "MM-dd-yyyy HH:mm");
            } else {
                return datetime;
            }
        },
        formatDate: (date) => {
            const dateObj = moment(date);
            if (dateObj.isValid()) {
                // return dateObj.format("MM-DD-YYYY");
                return format(datetime, "MM-dd-yyyy");
            } else {
                return datetime;
            }
        },
        beforeNow: (date) => {
            const dateObj = moment(date);
            if (dateObj.isValid()) {
                return dateObj.isBefore(moment());
            }
            return;
        },
        afterNow: (date) => {
            const dateObj = moment(date);
            if (dateObj.isValid()) {
                return dateObj.isAfter(moment());
            }
            return;
        },
        happeningNow: (start, end) => {
            start = moment(start);
            end = moment(end);
            if (start.isValid() && end.isValid()) {
                return moment().isBetween(start, end);
            }
            return;
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
app.use("/dashboard", adminDashboardMiddleware);

app.use("/login", loginMiddleware);
app.use("/signup", loginMiddleware);

// app.use("/admin/dashboard", allowAdminOnly);
app.use(/\/admin\/((?!login).)*/, allowAdminOnly);
app.use("/admin/login", adminLoginMiddleware);

app.use("/sessions*", privateRouteMiddleware);
app.use("/mentor/availability/*", allowMentorsOnly);
app.use("/sessions/booking/*", allowMenteesOnly);

app.use("/forum*", privateRouteMiddleware);

app.engine("handlebars", handlebarsInstance.engine);
app.set("view engine", "handlebars");

constructorMethod(app);

app.listen(3000, () => {
    console.log("We have now got a server");
    console.log("your routes will be running on http://localhost:3000");
});
