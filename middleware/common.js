import multer from "multer";

export const fileUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(
                new Error(
                    "Unsupported file format. Please upload JPEG or PNG images."
                )
            );
        }
        cb(null, true);
    },
});
