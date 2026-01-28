import mongoose from "mongoose";

const teamIncomeSchema = new mongoose.Schema({
    emailOwner: { type: String, required: true },
    emailMember: { type: String, required: true },
    income: { type: String }, // It's string in legacy
}, { timestamps: true, collection: "teamincomes" });

const TeamIncomeModel = mongoose.model("TeamIncome", teamIncomeSchema);
export default TeamIncomeModel;
