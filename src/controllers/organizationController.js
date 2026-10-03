import User from "../models/user.js";
import uploadFile from "../utils/supabaseStorage.js";

export const uploadOrganizationLogo = async (req, res) => {
    try {
        const user = await User.findOne({
            firebaseUid: req.user.uid
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.role !== "organization") {
            return res.status(403).json({
                message: "Only organizations can upload a logo"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a logo file"
            });
        }

        const uploadedFile = await uploadFile(
            req.file,
            "organizations"
        );

        user.logoUrl = uploadedFile.fileUrl;
        user.logoPath = uploadedFile.filePath;

        await user.save();

        res.json({
            message: "Organization logo uploaded successfully",
            logoUrl: user.logoUrl
        });

    } catch (error) {
        console.error("Organization logo upload failed:");
        console.error(error.message);

        res.status(500).json({
            message: "Failed to upload organization logo",
            error: error.message
        });
    }
};