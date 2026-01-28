import mongoose from "mongoose";

const gwcCoinSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    totalCoins: { type: Number, default: 0 },
}, { timestamps: true, collection: "gwccoins" });

const GwcCoinModel = mongoose.model("GwcCoin", gwcCoinSchema);
export default GwcCoinModel;
