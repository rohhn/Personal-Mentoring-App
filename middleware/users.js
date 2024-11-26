export const profileMiddleware = (req, res, next) => {
    const userType = req.params.userType;
    const userId = req.params.userId;

    next();
};
