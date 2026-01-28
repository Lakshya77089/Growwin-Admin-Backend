import mongoose from "mongoose";

const gwcCoinHistorySchema = new mongoose.Schema({
    email: { type: String, required: true },
    member: { type: String }, // Optional, as some transactions might not have a second member
    transactionType: { type: String, required: true },
    amount: { type: Number, required: true },
    coinValue: { type: Number, required: true },
    usdAmount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
}, { timestamps: true, collection: "gwccoinhistories" });

gwcCoinHistorySchema.index({ email: 1 });

const GwcCoinHistoryModel = mongoose.model("GwcCoinHistory", gwcCoinHistorySchema);
export default GwcCoinHistoryModel;
