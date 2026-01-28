import mongoose from "mongoose";

const platinumTeamIncomeSchema = new mongoose.Schema({
    emailOwner: { type: String, required: true },
    emailMember: { type: String, required: true },
    income: { type: String, required: true },
}, { timestamps: true, collection: "platinumteamincomes" });
platinumTeamIncomeSchema.index({ createdAt: -1 });

const PlatinumTeamIncomeModel = mongoose.model("PlatinumTeamIncome", platinumTeamIncomeSchema);
export default PlatinumTeamIncomeModel;
