import mongoose from "mongoose";

const connectDB = async () => {
    const dbUser = process.env["DB_USERNAME"];
    const dbPass = process.env["DB_PASSWORD"];
    const dbName = process.env["DB_NAME"];

    const dbUri = `mongodb+srv://${dbUser}:${dbPass}@cluster0.qp9lkym.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;

    try {
        await mongoose.connect(dbUri);
        console.log("Connected to MongoDB successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

export default connectDB;
