import Signup from "../models/signup.js";
import User from "../models/user.js";
import Opportunity from "../models/opportunity.js";
import Hour from "../models/hour.js";

export const getOpportunitySignups = async (req, res) => {
    try {
        // Find the logged-in organization
        const organization = await User.findOne({
            firebaseUid: req.user.uid
        });

        if (!organization) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Only organizations can view volunteer registrations
        if (organization.role !== "organization") {
            return res.status(403).json({
                message: "Only organizations can view event volunteers"
            });
        }

        // Find the event
        const opportunity = await Opportunity.findById(
            req.params.opportunityId
        );

        if (!opportunity) {
            return res.status(404).json({
                message: "Opportunity not found"
            });
        }

        // Make sure this organization owns the event
        if (
            opportunity.organization.toString() !==
            organization._id.toString()
        ) {
            return res.status(403).json({
                message: "You can only view volunteers for your own events"
            });
        }

        // Get volunteers registered for this event
        const signups = await Signup.find({
            opportunity: opportunity._id
        }).populate(
            "volunteer",
            "name email phone"
        );

        res.json(signups);

    } catch (error) {
        console.error("Fetching event volunteers failed:");
        console.error(error.message);

        res.status(500).json({
            message: "Failed to fetch event volunteers",
            error: error.message
        });
    }
};

export const completeVolunteerSignup = async (req, res) => {
    try {
        // Find the logged-in user
        const organization = await User.findOne({
            firebaseUid: req.user.uid
        });

        if (!organization) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Only organizations can mark volunteers as completed
        if (organization.role !== "organization") {
            return res.status(403).json({
                message: "Only organizations can complete volunteer attendance"
            });
        }

        // Find the signup
        const signup = await Signup.findById(
            req.params.signupId
        );

        if (!signup) {
            return res.status(404).json({
                message: "Signup not found"
            });
        }

        // Find the event
        const opportunity = await Opportunity.findById(
            signup.opportunity
        );

        if (!opportunity) {
            return res.status(404).json({
                message: "Opportunity not found"
            });
        }

        // Make sure this organization owns the event
        if (
            opportunity.organization.toString() !==
            organization._id.toString()
        ) {
            return res.status(403).json({
                message: "You can only complete volunteers for your own events"
            });
        }

        // Check signup status
        if (signup.status === "completed") {
            return res.status(400).json({
                message: "This volunteer is already marked as completed"
            });
        }

        if (signup.status === "cancelled") {
            return res.status(400).json({
                message: "A cancelled signup cannot be completed"
            });
        }

        // Get volunteer hours from request
        const hours = Number(req.body.hours);

        if (!hours || hours <= 0) {
            return res.status(400).json({
                message: "Please provide valid volunteer hours"
            });
        }

        // Mark signup as completed
        signup.status = "completed";

        await signup.save();

        // Check if an hour record already exists
        const existingHour = await Hour.findOne({
            volunteer: signup.volunteer,
            opportunity: signup.opportunity
        });

        let hourRecord;

        if (existingHour) {
            existingHour.hours = hours;
            existingHour.verified = true;

            await existingHour.save();

            hourRecord = existingHour;
        } else {
            hourRecord = await Hour.create({
                volunteer: signup.volunteer,
                opportunity: signup.opportunity,
                hours,
                verified: true
            });
        }

        res.json({
            message: "Volunteer marked as completed successfully",
            signup,
            hours: hourRecord
        });

    } catch (error) {
        console.error("Volunteer completion failed:");
        console.error(error.message);

        res.status(500).json({
            message: "Failed to complete volunteer signup",
            error: error.message
        });
    }
};