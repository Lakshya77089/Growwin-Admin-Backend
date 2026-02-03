import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./utils/connectDB.js";
import { initializeFirebase } from "./utils/firebase.js";

// Routes imports
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
import rankRoutes from "./routes/rank.routes.js";

const app = express();
const PORT = process.env["PORT"] || 3000;

// 1. Pre-flight and CORS must be FIRST
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://liveaccounttesting.growwincapital.com',
    'https://growwin-admin-panel.vercel.app',
    'https://growwincapital.com'
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow all origins by echoing the request's origin or setting it to true
        callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-Admin-Token'],
    credentials: true,
    optionsSuccessStatus: 200
}));

app.options('*', cors());

// 2. Body parsing
app.use(express.json());

// 3. Static files
app.use('/uploads', express.static('uploads'));

// 4. Routes
app.use("/users", userRoutes);
app.use("/api/user", userRoutes);
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
app.use("/api/rank", rankRoutes);
app.use("/api/email", mailerRoutes);
app.use("/", notificationRoutes);

app.get("/health", (req, res) => {
    res.json({ status: "ok", environment: process.env.NODE_ENV || 'development' });
});

// Connect to Database and Start Server
const startServer = async () => {
    try {
        await connectDB();
        initializeFirebase();
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
    }
};

startServer();
