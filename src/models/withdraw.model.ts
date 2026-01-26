import mongoose from "mongoose";

const withdrawSchema = new mongoose.Schema({
    email: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: "Pending" },
}, { timestamps: true, collection: "withdraws" });

const WithdrawModel = mongoose.model("Withdraw", withdrawSchema);
export default WithdrawModel;
