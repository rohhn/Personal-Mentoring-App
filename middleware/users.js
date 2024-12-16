export const allowMenteesOnly = (req, res, next) => {
    if (
        req.session &&
        req.session.user &&
        req.session.user.userType !== "mentee"
    ) {
        return res.redirect("/dashboard");
    }

    next();
};

export const allowMentorsOnly = (req, res, next) => {
    if (
        req.session &&
        req.session.user &&
        req.session.user.userType !== "mentor"
    ) {
        return res.redirect("/dashboard");
    }

    next();
};

export const adminOnly = (req, res, next) => {
    if (!req.session || !req.session.user || !req.session.user.isAdmin) {
        return res.status(403).render("error", {
            errorTitle: "Unauthorized",
            errorMessage: "You do not have access to this resource.",
        });
    }
    next();
};
