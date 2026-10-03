import Signup from "../models/signup.js";
import User from "../models/user.js";
import Opportunity from "../models/opportunity.js";

// Create a signup
export const createSignup = async (req, res) => {
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
                message: "Only volunteers can sign up"
            });
        }

        const { opportunityId } = req.body;

        const opportunity = await Opportunity.findById(opportunityId);

        if (!opportunity) {
            return res.status(404).json({
                message: "Opportunity not found"
            });
        }

        const existingSignup = await Signup.findOne({
            volunteer: user._id,
            opportunity: opportunity._id
        });

        if (existingSignup) {
            return res.status(400).json({
                message: "You are already signed up for this opportunity"
            });
        }

        const signup = await Signup.create({
            volunteer: user._id,
            opportunity: opportunity._id
        });

        res.status(201).json(signup);

    } catch (error) {
        res.status(500).json({
            message: "Failed to sign up",
            error: error.message
        });
    }
};

// Get signups for a volunteer
export const getUserSignups = async (req, res) => {
    try {
        const user = await User.findOne({
            firebaseUid: req.user.uid
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (
            user._id.toString() !==
            req.params.id
        ) {
            return res.status(403).json({
                message: "You can only view your own signups"
            });
        }

        const signups = await Signup.find({
            volunteer: user._id
        }).populate("opportunity");

        res.json(signups);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch user signups",
            error: error.message
        });
    }
};

// Delete a signup
export const deleteSignup = async (req, res) => {
    try {
        const user = await User.findOne({
            firebaseUid: req.user.uid
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const signup = await Signup.findById(req.params.id);

        if (!signup) {
            return res.status(404).json({
                message: "Signup not found"
            });
        }

        if (
            signup.volunteer.toString() !==
            user._id.toString()
        ) {
            return res.status(403).json({
                message: "You can only cancel your own signup"
            });
        }

        await signup.deleteOne();

        res.json({
            message: "Signup deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete signup",
            error: error.message
        });
    }
};