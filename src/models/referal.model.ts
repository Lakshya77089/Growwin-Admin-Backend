import mongoose from "mongoose";

const referalSchema = new mongoose.Schema({
    email: { type: String, required: true },
    referal: { type: String, required: true },
}, { timestamps: true, collection: "Referal" });

const ReferalModel = mongoose.model("Referal", referalSchema);
export default ReferalModel;
