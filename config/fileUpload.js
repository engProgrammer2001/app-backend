import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = (uploadPath) =>
    multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadPath);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
            cb(null, uniqueSuffix);
        },
    });

const upload = (uploadPath) => multer({ storage: storage(uploadPath) });
const fileUpload = (uploadPath) => {
    const uploadMiddleware = upload(uploadPath);

    return {
        fields: (fields) => async (req, res, next) => {
            uploadMiddleware.fields(fields)(req, res, (err) => {
                if (err) {
                    return next(err);
                }
                next();
            });
        },
        any: () => async (req, res, next) => {
            uploadMiddleware.any()(req, res, (err) => {
                if (err) {
                    return next(err);
                }
                next();
            });
        },
    };
};

export default fileUpload;
