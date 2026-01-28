import mongoose from "mongoose";

const walletHistorySchema = new mongoose.Schema({
    email: { type: String, required: true },
    previousAmount: { type: String, required: true },
    updatedAmount: { type: String, required: true },
    updateAmount: { type: String, required: true },
    updateType: { type: String, required: true }, // 'credit' or 'debit'
}, { timestamps: true, collection: "wallethistories" });

walletHistorySchema.index({ email: 1 });

const WalletHistoryModel = mongoose.model("WalletHistory", walletHistorySchema);
export default WalletHistoryModel;
