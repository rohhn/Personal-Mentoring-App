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
    //     email: "mentee1@example.com",
    //     userId: "673d8f2c7d727af137770199",
    //     userType: "mentee",
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
