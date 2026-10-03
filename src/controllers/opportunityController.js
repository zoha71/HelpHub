import Opportunity from "../models/opportunity.js";
import User from "../models/user.js";

// GET /api/opportunities
export const getAllOpportunities = async (req, res) => {
    try {
        const opportunities = await Opportunity.find();

        res.json(opportunities);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch opportunities",
            error: error.message
        });
    }
};


// GET /api/opportunities/search?keyword=cleanup
export const searchOpportunities = async (req, res) => {
    try {
        const keyword = req.query.keyword;

        if (!keyword) {
            return res.status(400).json({
                message: "Please provide a search keyword"
            });
        }

        const opportunities = await Opportunity.find({
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
                { category: { $regex: keyword, $options: "i" } },
                { location: { $regex: keyword, $options: "i" } }
            ]
        });

        res.json(opportunities);
    } catch (error) {
        res.status(500).json({
            message: "Failed to search opportunities",
            error: error.message
        });
    }
};


// GET /api/opportunities/:id
export const getOpportunityById = async (req, res) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id);

        if (!opportunity) {
            return res.status(404).json({
                message: "Opportunity not found"
            });
        }

        res.json(opportunity);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch opportunity",
            error: error.message
        });
    }
};


// POST /api/opportunities
export const createOpportunity = async (req, res) => {
    try {
        // Find the logged-in user using Firebase UID
        const user = await User.findOne({
            firebaseUid: req.user.uid
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Only organizations can create opportunities
        if (user.role !== "organization") {
            return res.status(403).json({
                message: "Only organizations can create opportunities"
            });
        }

        const opportunity = await Opportunity.create({
            title: req.body.title,
            description: req.body.description,
            organization: user._id,
            location: req.body.location,
            date: req.body.date,

            // Manual event time
            startTime: req.body.startTime,
            endTime: req.body.endTime,

            requiredVolunteers: req.body.requiredVolunteers,
            category: req.body.category
        });

        res.status(201).json(opportunity);

    } catch (error) {
        res.status(500).json({
            message: "Failed to create opportunity",
            error: error.message
        });
    }
};


// PUT /api/opportunities/:id
export const updateOpportunity = async (req, res) => {
    try {
        // Find logged-in user
        const user = await User.findOne({
            firebaseUid: req.user.uid
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Only organizations can update opportunities
        if (user.role !== "organization") {
            return res.status(403).json({
                message: "Only organizations can update opportunities"
            });
        }

        // Find opportunity
        const opportunity = await Opportunity.findById(req.params.id);

        if (!opportunity) {
            return res.status(404).json({
                message: "Opportunity not found"
            });
        }

        // Organization can only update its own opportunity
        if (
            opportunity.organization.toString() !==
            user._id.toString()
        ) {
            return res.status(403).json({
                message: "You can only update your own opportunities"
            });
        }

        // Update fields only if new values were provided
        opportunity.title =
            req.body.title ?? opportunity.title;

        opportunity.description =
            req.body.description ?? opportunity.description;

        opportunity.location =
            req.body.location ?? opportunity.location;

        opportunity.date =
            req.body.date ?? opportunity.date;

        // Manual event time
        opportunity.startTime =
            req.body.startTime ?? opportunity.startTime;

        opportunity.endTime =
            req.body.endTime ?? opportunity.endTime;

        opportunity.requiredVolunteers =
            req.body.requiredVolunteers ??
            opportunity.requiredVolunteers;

        opportunity.category =
            req.body.category ?? opportunity.category;

        opportunity.status =
            req.body.status ?? opportunity.status;

        await opportunity.save();

        res.json(opportunity);

    } catch (error) {
        res.status(500).json({
            message: "Failed to update opportunity",
            error: error.message
        });
    }
};


// DELETE /api/opportunities/:id
export const deleteOpportunity = async (req, res) => {
    try {
        // Find logged-in user
        const user = await User.findOne({
            firebaseUid: req.user.uid
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Only organizations can delete opportunities
        if (user.role !== "organization") {
            return res.status(403).json({
                message: "Only organizations can delete opportunities"
            });
        }

        // Find opportunity
        const opportunity = await Opportunity.findById(req.params.id);

        if (!opportunity) {
            return res.status(404).json({
                message: "Opportunity not found"
            });
        }

        // Organization can only delete its own opportunity
        if (
            opportunity.organization.toString() !==
            user._id.toString()
        ) {
            return res.status(403).json({
                message: "You can only delete your own opportunities"
            });
        }

        await opportunity.deleteOne();

        res.json({
            message: "Opportunity deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete opportunity",
            error: error.message
        });
    }
};