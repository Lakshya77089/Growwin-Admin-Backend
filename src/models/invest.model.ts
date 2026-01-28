import mongoose from "mongoose";

const investSchema = new mongoose.Schema({
    email: { type: String, required: true },
    totalAmount: { type: String, required: true },
    subscription: { type: String, default: "Classic" },
    incomeDate: { type: Date, required: true },
    isClosed: { type: Boolean, default: false },
}, { timestamps: true, collection: "Invests" }); // Explicit collection name
investSchema.index({ email: 1, isClosed: 1 });

const InvestModel = mongoose.model("Invest", investSchema);
export default InvestModel;
