import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
    registerUser,
    loginUser
} from "../controllers/authController.js";

const router = express.Router();

// Register a user
router.post("/register", authMiddleware, registerUser);

// Login a user
router.post("/login", authMiddleware, loginUser);

export default router;