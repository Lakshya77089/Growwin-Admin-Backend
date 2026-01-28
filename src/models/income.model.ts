import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema({
    email: { type: String, required: true },
    income: { type: String, required: true },
}, { timestamps: true, collection: "incomes" });
incomeSchema.index({ createdAt: -1 });

const IncomeModel = mongoose.model("Income", incomeSchema);
export default IncomeModel;
