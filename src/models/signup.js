import mongoose from "mongoose";

const signupSchema = new mongoose.Schema(
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

        status: {
            type: String,
            enum: ["registered", "cancelled", "completed"],
            default: "registered"
        },

        signupDate: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

const Signup = mongoose.model("Signup", signupSchema);

export default Signup;