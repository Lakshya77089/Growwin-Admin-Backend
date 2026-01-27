import mongoose from "mongoose";

const withdrawSchema = new mongoose.Schema({
    email: { type: String, required: true },
    amount: { type: String, required: true }, // Using String to match potential mixed data in DB
    address: { type: String },
    status: { type: String, default: "Pending" },
}, { timestamps: true, collection: "withdraws" });

const WithdrawModel = mongoose.model("Withdraw", withdrawSchema);
export default WithdrawModel;
