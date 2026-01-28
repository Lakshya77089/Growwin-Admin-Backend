import mongoose from "mongoose";

const referalIncomeSchema = new mongoose.Schema({
    owner: { type: String, required: true },
    member: { type: String, required: true },
    ownerReferal: { type: String, required: true },
    referalIncome: { type: String, required: true },
    level: { type: String, required: true },
}, { timestamps: true, collection: "referalincomes" });

const ReferalIncomeModel = mongoose.model("ReferalIncome", referalIncomeSchema);
export default ReferalIncomeModel;
