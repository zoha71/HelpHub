import mongoose from "mongoose";

const hourSchema = new mongoose.Schema(
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

        hours: {
            type: Number,
            required: true,
            min: 0
        },

        verified: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const Hour = mongoose.model("Hour", hourSchema);

export default Hour;