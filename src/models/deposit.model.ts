import mongoose from "mongoose";

const depositSchema = new mongoose.Schema({
    email: { type: String, required: true },
    amount: { type: String, required: true },
    status: { type: String, default: "Pending" },
    orderid: { type: String },
    chain: { type: String },
    deposit_address: { type: String },
    currency: { type: String },
    mode: { type: String, default: "deposit" },
}, { timestamps: true, collection: "deposites" }); // Explicit collection name and spelling

const DepositModel = mongoose.model("Deposit", depositSchema);
export default DepositModel;
