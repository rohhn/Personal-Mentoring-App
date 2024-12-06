import moment from "moment";
export const isParentEmailRequired = (dob) => {
    try {
        const age = moment().diff(dob, "years");

        return age < 16 ? true : false;
    } catch (error) {
        throw error;
    }
};
