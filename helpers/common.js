export const extractProfileImage = (req) => {
    let profileImageBase64 = undefined;

    if (Array.isArray(req.files) && req.files.length == 1) {
        const file = req.files[0];
        // data:image/[format]; base64,

        if (file.fieldname == "profile_image") {
            profileImageBase64 = `data:${
                file.mimetype
            };base64,${file.buffer.toString("base64")}`;
        }
    }

    return profileImageBase64;
};

export const checkPassword = (password) => {};
