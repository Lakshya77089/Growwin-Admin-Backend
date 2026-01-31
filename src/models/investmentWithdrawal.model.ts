import mongoose from "mongoose";

const investmentWithdrawalSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    referralName: { type: String, required: true },
    referralMail: { type: String, required: true },
    joiningDate: { type: Date, required: true },
    investmentDate: { type: Date, required: true },
    totalAmount: { type: Number, required: true },
    withdrawalAmount: { type: Number, required: true },
    subscriptionPlan: { type: String, required: true },
    status: { type: String, default: 'processing' },
}, { timestamps: true, collection: "investmentwithdrawals" }); // Match the collection name if possible

const InvestmentWithdrawalModel = mongoose.model("InvestmentWithdrawal", investmentWithdrawalSchema);
export default InvestmentWithdrawalModel;
