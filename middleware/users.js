export const profileMiddleware = (req, res, next) => {
    const userType = req.params.userType;
    const userId = req.params.userId;

    next();
};

export const allowMenteesOnly = (req, res, next) => {
    if (req.session.userType !== "mentee") {
        res.redirect("/dashboard");
    }

    next();
};

export const allowMentorsOnly = (req, res, next) => {
    if (req.session.userType !== "mentor") {
        res.redirect("/dashboard");
    }

    next();
};
