import mongoose from "mongoose";

const opportunitySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true
        },

        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        location: {
            type: String,
            required: true
        },

        date: {
            type: Date,
            required: true
        },

        startTime: {
            type: String,
            required: true,
            trim: true
        },

        endTime: {
            type: String,
            required: true,
            trim: true
        },

        requiredVolunteers: {
            type: Number,
            default: 1
        },

        category: {
            type: String,
            default: "General"
        },

        status: {
            type: String,
            enum: ["open", "closed"],
            default: "open"
        },

        // Event photo stored in Supabase Storage
        photoUrl: {
            type: String,
            default: ""
        },

        photoPath: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const Opportunity = mongoose.model(
    "Opportunity",
    opportunitySchema
);

export default Opportunity;