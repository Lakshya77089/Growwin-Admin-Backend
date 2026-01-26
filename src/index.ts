import "dotenv/config";
import express from "express";
import connectDB from "./utils/connectDB.js";
import userRoutes from "./routes/user.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

const app = express();
const PORT = process.env["PORT"] || 3000;

// Connect to Database
connectDB();

app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api", dashboardRoutes);

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
