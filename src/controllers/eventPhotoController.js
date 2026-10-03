import Opportunity from "../models/opportunity.js";
import User from "../models/user.js";
import uploadFile from "../utils/supabaseStorage.js";

export const uploadEventPhoto = async (req, res) => {
    try {
        // Find the logged-in user
        const user = await User.findOne({
            firebaseUid: req.user.uid
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Only organizations can upload event photos
        if (user.role !== "organization") {
            return res.status(403).json({
                message: "Only organizations can upload event photos"
            });
        }

        // Check if a photo was provided
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload an event photo"
            });
        }

        // Find the event
        const opportunity = await Opportunity.findById(
            req.params.id
        );

        if (!opportunity) {
            return res.status(404).json({
                message: "Opportunity not found"
            });
        }

        // Make sure the organization owns this event
        if (
            opportunity.organization.toString() !==
            user._id.toString()
        ) {
            return res.status(403).json({
                message: "You can only upload photos to your own events"
            });
        }

        // Upload photo to Supabase
        const uploadedFile = await uploadFile(
            req.file,
            "events"
        );

        // Save Supabase information in MongoDB
        opportunity.photoUrl = uploadedFile.fileUrl;
        opportunity.photoPath = uploadedFile.filePath;

        await opportunity.save();

        res.json({
            message: "Event photo uploaded successfully",
            photoUrl: opportunity.photoUrl
        });

    } catch (error) {
        console.error("Event photo upload failed:");
        console.error(error.message);

        res.status(500).json({
            message: "Failed to upload event photo",
            error: error.message
        });
    }
};