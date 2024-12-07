export const loginMiddleware = (req, res, next) => {
    if (req.session.user) {
        return res.redirect("/dashboard");
    } else {
        //here I',m just manually setting the req.method to post since it's usually coming from a form
        next();
    }
};

export const makeHeaderOptions = (req, res, next) => {
    // req.url = "/signup"

    // mock sign-in
    // req.session.user = {
    //     email: "rohan@mentor.com",
    //     userId: "67515fa1c5f36059aefefcbf",
    //     userType: "mentor",
    // };

    const headerOptions = {};
    if (req.session.user) {
        headerOptions.isAuthenticated = true;
    } else {
        headerOptions.isAuthenticated = false;
    }
    req.headerOptions = headerOptions;
    next();
};
