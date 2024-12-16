export const rootMiddleware = (req, res, next) => {
    if (req.session && req.session.user) {
        return res.redirect("/dashboard");
    } else {
        next();
    }
};

export const privateRouteMiddleware = (req, res, next) => {
    if (req.session && !req.session.user && !req.session.admin) {
        return res.redirect("/login");
    } else {
        next();
    }
};
