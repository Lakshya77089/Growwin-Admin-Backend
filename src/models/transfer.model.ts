import mongoose from "mongoose";

const transferSchema = new mongoose.Schema({
    owner: { type: String, required: true },
    member: { type: String, required: true },
    amount: { type: Number, required: true },
}, { timestamps: true, collection: "transfers" });

const TransferModel = mongoose.model("Transfer", transferSchema);
export default TransferModel;
