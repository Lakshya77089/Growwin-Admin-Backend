import mongoose from "mongoose";

const investmentLotSchema = new mongoose.Schema({
    email: { type: String, required: true },
    plan: { type: String, required: true, enum: ['NORMAL', 'PLATINUM'] },
    subscription: { type: String, required: true, enum: ['Basic', 'Classic', 'Platinum'] },
    amount: { type: String, required: true },
    investDate: { type: Date, required: true },
    incomeDate: { type: Date, required: true },
    closingDate: { type: Date },
    lotIndex: { type: Number, required: true },
    source: { type: String, default: 'new', enum: ['new', 'reinvest', 'migration'] },
    refBonusesApplied: { type: Boolean, default: false },
    closed: { type: Boolean, default: false },
}, { timestamps: true, collection: "investmentlots" });

investmentLotSchema.index({ email: 1, createdAt: -1 });
investmentLotSchema.index({ email: 1, lotIndex: 1 }, { unique: true });

const InvestmentLotModel = mongoose.model("InvestmentLot", investmentLotSchema);
export default InvestmentLotModel;
