import mongoose from "mongoose";

const referalSchema = new mongoose.Schema({
    email: { type: String, required: true },
    referal: { type: String, required: true },
}, { timestamps: true, collection: "referals" });

const ReferalModel = mongoose.model("Referal", referalSchema);
export default ReferalModel;
