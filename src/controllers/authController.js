import User from "../models/user.js";

// Register a user
export const registerUser = async (req, res) => {
    try {
        const firebaseUid = req.user.uid;
        const email = req.user.email;

        const { name, phone, role } = req.body;

        if (!name || !role) {
            return res.status(400).json({
                message: "Name and role are required"
            });
        }

        if (!["volunteer", "organization"].includes(role)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        const existingUser = await User.findOne({
            firebaseUid
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const user = await User.create({
            firebaseUid,
            name,
            email,
            phone,
            role
        });

        res.status(201).json(user);

    } catch (error) {
        res.status(500).json({
            message: "Failed to register user",
            error: error.message
        });
    }
};

// Login a user
export const loginUser = async (req, res) => {
    try {
        const firebaseUid = req.user.uid;

        const user = await User.findOne({
            firebaseUid
        });

        if (!user) {
            return res.status(404).json({
                message: "User profile not found. Please register first."
            });
        }

        res.json({
            message: "Login successful",
            user
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to login",
            error: error.message
        });
    }
};