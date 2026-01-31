import mongoose from "mongoose";

const investmentHistorySchema = new mongoose.Schema({
    email: { type: String, required: true },
    totalAmount: { type: String, required: true },
    amount: { type: String, required: true },
    subscription: { type: String, required: true },
    incomeDate: { type: Date },
    investDate: { type: Date },
    action: { type: String, required: true }, // "create" or "update"
    type: { type: String, required: true },   // "credit" or "debit"
    actionDate: { type: Date },
}, { timestamps: true, collection: "investmenthistories" });

investmentHistorySchema.index({ email: 1, createdAt: -1 });

const InvestmentHistoryModel = mongoose.model("InvestmentHistory", investmentHistorySchema);
export default InvestmentHistoryModel;
