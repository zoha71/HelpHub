import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import authRoutes from "./routes/authRoutes.js";
import opportunityRoutes from "./routes/opportunityRoutes.js";
import signupRoutes from "./routes/signupRoutes.js";
import hourRoutes from "./routes/hourRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";

import swaggerDocument from "./swagger.js";

const app = express();

app.use(cors());
app.use(express.json());

// Swagger API documentation
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/signups", signupRoutes);
app.use("/api/hours", hourRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/certificates", certificateRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to HelpHub API"
    });
});

export default app;