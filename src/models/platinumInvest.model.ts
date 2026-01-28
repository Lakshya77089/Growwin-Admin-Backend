import mongoose from "mongoose";

const platinumInvestSchema = new mongoose.Schema({
    email: { type: String, required: true },
    totalAmount: { type: String, required: true },
    subscription: { type: String, default: "Platinum" },
    incomeDate: { type: Date, required: true },
    isClosed: { type: Boolean, default: false },
}, { timestamps: true, collection: "PlatinumInvests" }); // Explicit collection name
platinumInvestSchema.index({ email: 1, isClosed: 1 });

const PlatinumInvestModel = mongoose.model("PlatinumInvest", platinumInvestSchema);
export default PlatinumInvestModel;
