export const rootMiddleware = (req, res, next) => {
    if (req.session.user) {
        return res.redirect("/dashboard");
    } else {
        next();
    }
};

export const privateRouteMiddleware = (req, res, next) => {
    if (!req.session.user && !req.session.admin) {
        return res.redirect("/");
    } else {
        next();
    }
};
