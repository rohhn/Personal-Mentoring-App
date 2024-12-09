export const addMenteeIdtoReq = (req, res, next) => {
    req.body.mentee_id = req.session.user.userId;
    next();
};
