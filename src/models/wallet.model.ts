import mongoose from "mongoose";

const walletSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    balance: { type: String, default: "0" },
}, { timestamps: true, collection: "wallets" });

const WalletModel = mongoose.model("Wallet", walletSchema);
export default WalletModel;
