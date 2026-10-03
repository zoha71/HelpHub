import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
    generateCertificate,
    getCertificate
} from "../controllers/certificateController.js";

const router = express.Router();

// Generate a certificate
router.post(
    "/:opportunityId",
    authMiddleware,
    generateCertificate
);

// Get an existing certificate
router.get(
    "/:opportunityId",
    authMiddleware,
    getCertificate
);

export default router;