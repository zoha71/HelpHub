import User from "../models/user.js";
import Signup from "../models/signup.js";
import Hour from "../models/hour.js";
import Opportunity from "../models/opportunity.js";
import Certificate from "../models/certificate.js";

import uploadFile from "../utils/supabaseStorage.js";
import generateCertificatePDF from "../utils/certificateGenerator.js";

export const generateCertificate = async (req, res) => {
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

        // Only volunteers can generate certificates
        if (user.role !== "volunteer") {
            return res.status(403).json({
                message: "Only volunteers can generate certificates"
            });
        }

        // Find the opportunity
        const opportunity = await Opportunity.findById(
            req.params.opportunityId
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
                message: "You are not registered for this event"
            });
        }

        // Check that the signup is completed
        if (signup.status !== "completed") {
            return res.status(400).json({
                message: "You must complete the event before generating a certificate"
            });
        }

        // Find volunteer hours for this event
        const hourRecord = await Hour.findOne({
            volunteer: user._id,
            opportunity: opportunity._id
        });

        if (!hourRecord) {
            return res.status(400).json({
                message: "Volunteer hours have not been recorded for this event"
            });
        }

        if (hourRecord.hours <= 0) {
            return res.status(400).json({
                message: "Volunteer hours must be greater than zero"
            });
        }

        // Check if a certificate already exists
        const existingCertificate = await Certificate.findOne({
            volunteer: user._id,
            opportunity: opportunity._id
        });

        if (existingCertificate) {
            return res.json({
                message: "Certificate already exists",
                certificate: existingCertificate
            });
        }

        // Generate the PDF
        const pdfBuffer = await generateCertificatePDF({
            volunteerName: user.name,
            eventTitle: opportunity.title,
            hours: hourRecord.hours
        });

        // Create a PDF-like file object for Supabase upload
        const certificateFile = {
            buffer: pdfBuffer,
            originalname: `${user.name}-${opportunity.title}-certificate.pdf`,
            mimetype: "application/pdf"
        };

        // Upload certificate to Supabase
        const uploadedFile = await uploadFile(
            certificateFile,
            "certificates"
        );

        // Save certificate information in MongoDB
        const certificate = await Certificate.create({
            volunteer: user._id,
            opportunity: opportunity._id,
            volunteerName: user.name,
            eventTitle: opportunity.title,
            hours: hourRecord.hours,
            certificateUrl: uploadedFile.fileUrl,
            certificatePath: uploadedFile.filePath
        });

        res.status(201).json({
            message: "Certificate generated successfully",
            certificate
        });

    } catch (error) {
        console.error("Certificate generation failed:");
        console.error(error.message);

        res.status(500).json({
            message: "Failed to generate certificate",
            error: error.message
        });
    }
};

export const getCertificate = async (req, res) => {
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

        // Only volunteers can view their certificates
        if (user.role !== "volunteer") {
            return res.status(403).json({
                message: "Only volunteers can view certificates"
            });
        }

        // Find the certificate
        const certificate = await Certificate.findOne({
            volunteer: user._id,
            opportunity: req.params.opportunityId
        });

        if (!certificate) {
            return res.status(404).json({
                message: "Certificate not found"
            });
        }

        res.json({
            certificate
        });

    } catch (error) {
        console.error("Certificate lookup failed:");
        console.error(error.message);

        res.status(500).json({
            message: "Failed to fetch certificate",
            error: error.message
        });
    }
};