export const adminLoginMiddleware = (req, res, next) => {
    if (req.session.user) {
        return res.redirect("/dashboard");
    } else if (req.session.admin) {
        return res.redirect("/admin/dashboard");
    } else {
        next();
    }
};