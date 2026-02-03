import mongoose, { Document } from "mongoose";

export interface IRankReward {
    isEligible: boolean;
    isClaimed: boolean;
    rewardAmount: string;
    status: 'pending' | 'processing' | 'approved' | 'rejected';
    claimedDate?: Date;
    approvedDate?: Date;
    updatedAt: Date;
    createdAt: Date;
}

export interface IRewardClaimed extends Document {
    email: string;
    silverReward: IRankReward;
    goldReward: IRankReward;
    platinumReward: IRankReward;
    createdAt: Date;
    updatedAt: Date;
}

const rankRewardSchema = new mongoose.Schema({
    isEligible: { type: Boolean, required: true },
    isClaimed: { type: Boolean, required: true, default: false },
    rewardAmount: { type: String, required: true },
    status: {
        type: String,
        required: true,
        default: 'pending',
        enum: ['pending', 'processing', 'approved', 'rejected']
    },
    claimedDate: { type: Date },
    approvedDate: { type: Date }
}, { timestamps: true });

const rewardClaimedSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    silverReward: { type: rankRewardSchema, required: true },
    goldReward: { type: rankRewardSchema, required: true },
    platinumReward: { type: rankRewardSchema, required: true }
}, { timestamps: true, collection: "rewardclaimeds" });

const RewardClaimedModel = mongoose.model<IRewardClaimed>("RewardClaimed", rewardClaimedSchema);
export default RewardClaimedModel;
