import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    number: { type: String },
    role: { type: String, default: "user" },
    active: { type: Boolean, default: true },
}, { timestamps: true, collection: "Users" }); // Explicit collection name

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
