import express from "express";
import multer from "multer";

import authMiddleware from "../middleware/authMiddleware.js";
import { uploadOrganizationLogo } from "../controllers/organizationController.js";

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

router.post(
    "/logo",
    authMiddleware,
    upload.single("logo"),
    uploadOrganizationLogo
);

export default router;