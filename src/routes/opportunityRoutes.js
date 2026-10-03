import express from "express";
import multer from "multer";

import authMiddleware from "../middleware/authMiddleware.js";

import {
    getAllOpportunities,
    searchOpportunities,
    getOpportunityById,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity
} from "../controllers/opportunityController.js";

import {
    uploadEventPhoto
} from "../controllers/eventPhotoController.js";

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

// Get all opportunities
router.get("/", getAllOpportunities);

// Search opportunities
router.get("/search", searchOpportunities);

// Get one opportunity
router.get("/:id", getOpportunityById);

// Create opportunity
router.post(
    "/",
    authMiddleware,
    createOpportunity
);

// Upload event photo
router.post(
    "/:id/photo",
    authMiddleware,
    upload.single("photo"),
    uploadEventPhoto
);

// Update opportunity
router.put(
    "/:id",
    authMiddleware,
    updateOpportunity
);

// Delete opportunity
router.delete(
    "/:id",
    authMiddleware,
    deleteOpportunity
);

export default router;