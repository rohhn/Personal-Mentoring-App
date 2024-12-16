export const loginMiddleware = (req, res, next) => {
    if (req.session && req.session.user) {
        return res.redirect("/dashboard");
    } else {
        //here I',m just manually setting the req.method to post since it's usually coming from a form
        next();
    }
};

export const makeHeaderOptions = (req, res, next) => {
    // req.url = "/signup"

    const headerOptions = {};
    if (req.session.user || req.session.admin) {
        headerOptions.isAuthenticated = true;
    } else {
        headerOptions.isAuthenticated = false;
    }
    if (req.session.admin) {
        headerOptions.isAdmin = true;
    } else {
        headerOptions.isAdmin = false;
    }
    req.headerOptions = headerOptions;
    next();
};
