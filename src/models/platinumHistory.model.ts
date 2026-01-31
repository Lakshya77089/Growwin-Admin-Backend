import mongoose from "mongoose";

const platinumHistorySchema = new mongoose.Schema({
    email: { type: String, required: true },
    totalAmount: { type: String, required: true },
    amount: { type: String, required: true },
    subscription: { type: String, required: true },
    incomeDate: { type: Date },
    investDate: { type: Date },
    action: { type: String, required: true },
    type: { type: String, required: true },
    actionDate: { type: Date },
}, { timestamps: true, collection: "platinuminvetmenthistories" });

platinumHistorySchema.index({ email: 1, createdAt: -1 });

const PlatinumHistoryModel = mongoose.model("PlatinumHistory", platinumHistorySchema);
export default PlatinumHistoryModel;
