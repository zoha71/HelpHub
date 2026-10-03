import express from "express";
import Hour from "../models/hour.js";
import User from "../models/user.js";
import Opportunity from "../models/opportunity.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Add volunteer hours
router.post("/", authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({
            firebaseUid: req.user.uid
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.role !== "volunteer") {
            return res.status(403).json({
                message: "Only volunteers can add hours"
            });
        }

        const { opportunityId, hours } = req.body;

        const opportunity = await Opportunity.findById(opportunityId);

        if (!opportunity) {
            return res.status(404).json({
                message: "Opportunity not found"
            });
        }

        const signup = await Hour.findOne({
            volunteer: user._id,
            opportunity: opportunity._id
        });

        if (signup) {
            return res.status(400).json({
                message: "Hours already recorded for this opportunity"
            });
        }

        const hour = await Hour.create({
            volunteer: user._id,
            opportunity: opportunity._id,
            hours
        });

        res.status(201).json(hour);

    } catch (error) {
        res.status(500).json({
            message: "Failed to add volunteer hours",
            error: error.message
        });
    }
});

// Get hours for a volunteer
router.get("/user/:id", authMiddleware, async (req, res) => {
    try {
        const hours = await Hour.find({
            volunteer: req.params.id
        }).populate("opportunity");

        res.json(hours);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch volunteer hours",
            error: error.message
        });
    }
});

export default router;