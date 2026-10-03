import Hour from "../models/hour.js";
import User from "../models/user.js";
import Opportunity from "../models/opportunity.js";
import Signup from "../models/signup.js";

export const addHours = async (req, res) => {
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

        const opportunity = await Opportunity.findById(
            opportunityId
        );

        if (!opportunity) {
            return res.status(404).json({
                message: "Opportunity not found"
            });
        }

        // Check that the volunteer actually signed up
        const signup = await Signup.findOne({
            volunteer: user._id,
            opportunity: opportunity._id
        });

        if (!signup) {
            return res.status(403).json({
                message: "You must sign up for the opportunity first"
            });
        }

        // Only completed signups can have verified hours
        if (signup.status !== "completed") {
            return res.status(400).json({
                message: "The opportunity must be completed before adding hours"
            });
        }

        const numericHours = Number(hours);

        if (!numericHours || numericHours <= 0) {
            return res.status(400).json({
                message: "Please provide valid volunteer hours"
            });
        }

        const existingHour = await Hour.findOne({
            volunteer: user._id,
            opportunity: opportunity._id
        });

        let hourRecord;

        if (existingHour) {
            existingHour.hours = numericHours;
            existingHour.verified = true;

            await existingHour.save();

            hourRecord = existingHour;
        } else {
            hourRecord = await Hour.create({
                volunteer: user._id,
                opportunity: opportunity._id,
                hours: numericHours,
                verified: true
            });
        }

        res.status(201).json(hourRecord);

    } catch (error) {
        res.status(500).json({
            message: "Failed to add volunteer hours",
            error: error.message
        });
    }
};

export const getUserHours = async (req, res) => {
    try {
        const user = await User.findOne({
            firebaseUid: req.user.uid
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user._id.toString() !== req.params.id) {
            return res.status(403).json({
                message: "You can only view your own hours"
            });
        }

        const hours = await Hour.find({
            volunteer: user._id
        }).populate("opportunity");

        res.json(hours);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch volunteer hours",
            error: error.message
        });
    }
};