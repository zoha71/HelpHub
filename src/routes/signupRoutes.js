import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
    createSignup,
    getUserSignups,
    deleteSignup
} from "../controllers/signupController.js";

import {
    getOpportunitySignups,
    completeVolunteerSignup
} from "../controllers/completionController.js";

const router = express.Router();

// Volunteer signs up for an opportunity
router.post(
    "/",
    authMiddleware,
    createSignup
);

// Get a volunteer's signups
router.get(
    "/user/:id",
    authMiddleware,
    getUserSignups
);

// Get volunteers registered for an organization's event
router.get(
    "/opportunity/:opportunityId",
    authMiddleware,
    getOpportunitySignups
);

// Delete/cancel a signup
router.delete(
    "/:id",
    authMiddleware,
    deleteSignup
);

// Organization marks a volunteer as completed
router.post(
    "/:signupId/complete",
    authMiddleware,
    completeVolunteerSignup
);

export default router;