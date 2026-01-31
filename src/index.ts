import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./utils/connectDB.js";
import userRoutes from "./routes/user.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

import appVersionRoutes from "./routes/appVersion.routes.js";
import bannerRoutes from "./routes/banner.routes.js";
import popupRoutes from "./routes/popup.routes.js";
import mailerRoutes from "./routes/mailer.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import kycRoutes from "./routes/kyc.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import adminRoleRoutes from "./routes/adminRole.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import adminloginRoutes from "./routes/adminlogin.routes.js";
import auditLogRoutes from "./routes/auditLog.routes.js";

const app = express();
const PORT = process.env["PORT"] || 3000;

app.use(express.json());
// CORS Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve uploads folder
app.use('/uploads', express.static('uploads'));

// Routes
app.use("/users", userRoutes);
app.use("/api/user", userRoutes); // For compatibility with frontend /api/user/getUsers
app.use("/api", dashboardRoutes);
app.use("/api/appVersion", appVersionRoutes);
app.use("/api/banner", bannerRoutes);
app.use("/api/popUp", popupRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/adminTicket", ticketRoutes);
app.use("/api/roles", adminRoleRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/adminlogin", adminloginRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/email", mailerRoutes);
app.use("/", notificationRoutes);

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// Connect to Database and Start Server
const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
    }
};

startServer();
