import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
    {
        volunteer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        opportunity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Opportunity",
            required: true
        },

        volunteerName: {
            type: String,
            required: true
        },

        eventTitle: {
            type: String,
            required: true
        },

        hours: {
            type: Number,
            required: true,
            min: 0
        },

        certificateUrl: {
            type: String,
            required: true
        },

        certificatePath: {
            type: String,
            required: true
        },

        generatedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

const Certificate = mongoose.model(
    "Certificate",
    certificateSchema
);

export default Certificate;