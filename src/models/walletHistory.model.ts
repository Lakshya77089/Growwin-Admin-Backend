import mongoose from "mongoose";

const walletHistorySchema = new mongoose.Schema({
    email: { type: String, required: true },
    previousAmount: { type: String },
    updatedAmount: { type: String },
    updateAmount: { type: String },
    updateType: { type: String }, // 'credit' or 'debit'

    // Fields expected by dashboard.service.ts
    amount: { type: String },
    type: { type: String }, // e.g. 'Refund', 'Withdrawal'
    description: { type: String },
    status: { type: String },
    prevBalance: { type: String },
    newBalance: { type: String },
}, { timestamps: true, collection: "wallethistories" });

walletHistorySchema.index({ email: 1 });

const WalletHistoryModel = mongoose.model("WalletHistory", walletHistorySchema);
export default WalletHistoryModel;
