import mongoose from "mongoose";

const depositSchema = new mongoose.Schema({
    email: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: "Processing" },
    mode: { type: String, default: "deposit" },
}, { timestamps: true, collection: "deposites" }); // Explicit collection name and spelling

const DepositModel = mongoose.model("Deposit", depositSchema);
export default DepositModel;
