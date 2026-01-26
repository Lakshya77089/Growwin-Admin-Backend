import mongoose from "mongoose";

const connectDB = async () => {
    // Return early if already connected
    if (mongoose.connection.readyState >= 1) return;

    const dbUser = process.env["DB_USERNAME"];
    const dbPass = process.env["DB_PASSWORD"];
    const dbName = process.env["DB_NAME"];

    if (!dbUser || !dbPass) {
        console.error("Missing DB credentials in environment variables");
        return;
    }

    const dbUri = `mongodb+srv://${dbUser}:${dbPass}@cluster0.qp9lkym.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;

    try {
        await mongoose.connect(dbUri, {
            serverSelectionTimeoutMS: 5000 // Timeout faster so the function doesn't hang
        });
        console.log("Connected to MongoDB successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        // Do NOT call process.exit(1) here as it crashes serverless functions
    }
};

export default connectDB;
