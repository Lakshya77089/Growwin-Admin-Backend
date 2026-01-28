import mongoose from "mongoose";

const platinumIncomeSchema = new mongoose.Schema({
    email: { type: String, required: true },
    income: { type: String, required: true },
}, { timestamps: true, collection: "platinumincomes" });
platinumIncomeSchema.index({ createdAt: -1 });

const PlatinumIncomeModel = mongoose.model("PlatinumIncome", platinumIncomeSchema);
export default PlatinumIncomeModel;
