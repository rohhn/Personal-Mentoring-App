export const adminLoginMiddleware = (req, res, next) => {
    if (req.session && req.session.user) {
        return res.redirect("/dashboard");
    } else if (req.session && req.session.admin) {
        return res.redirect("/admin/dashboard");
    } else {
        next();
    }
};

export const adminDashboardMiddleware = (req, res, next) => {
    if (req.session && req.session.admin) {
        return res.redirect("/admin/dashboard");
    } else {
        next();
    }
};

export const allowAdminOnly = (req, res, next) => {
    if (req.session && !req.session.admin) {
        return res.redirect("/admin/login");
    } else {
        next();
    }
};
