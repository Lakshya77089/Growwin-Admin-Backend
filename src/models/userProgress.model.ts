import mongoose, { Document } from "mongoose";

export interface ILegProgress {
    legNumber: number;
    memberEmail: string;
    incomeGenerated: number;
    isCompleted: boolean;
    completionDate?: Date;
}

export interface IRankProgress {
    volume: number;
    percentageCompleted: number;
    incomeRequired: number;
    directsRequired: number;
    qualifiedDirects: string[];
    legProgress: ILegProgress[];
    isAchieved: boolean;
    achievementDate?: Date;
}

export interface IGlobalStatus {
    totalVolume: number;
    currentTargetVolume: number;
    volumeLeftForNextRank: number;
    qualifiedDirects: number;
    directsNeededForNextRank: number;
    totalLegsCompleted: number;
    legsNeededForNextRank: number;
}

export interface IUserProgress extends Document {
    email: string;
    currentRank: string;
    globalStatus: IGlobalStatus;
    silverProgress: IRankProgress;
    goldProgress: IRankProgress;
    platinumProgress: IRankProgress;
    globalPercentageCompleted: number;
    globalPercentageLeft: number;
    rewardAmount: number;
    rewardClaimable: boolean;
    rewardClaimed: boolean;
    nextRank: string | null;
    lastUpdateDate: Date;
}

const legProgressSchema = new mongoose.Schema({
    legNumber: { type: Number, required: true },
    memberEmail: { type: String, required: true },
    incomeGenerated: { type: Number, required: true, default: 0 },
    isCompleted: { type: Boolean, required: true, default: false },
    completionDate: { type: Date }
});

const rankProgressSchema = new mongoose.Schema({
    volume: { type: Number, required: true, default: 0 },
    percentageCompleted: { type: Number, required: true, default: 0 },
    incomeRequired: { type: Number, required: true },
    directsRequired: { type: Number, required: true },
    qualifiedDirects: { type: [String], default: [] },
    legProgress: { type: [legProgressSchema], default: [] },
    isAchieved: { type: Boolean, required: true, default: false },
    achievementDate: { type: Date }
});

const globalStatusSchema = new mongoose.Schema({
    totalVolume: { type: Number, required: true, default: 0 },
    currentTargetVolume: { type: Number, required: true, default: 0 },
    volumeLeftForNextRank: { type: Number, required: true, default: 0 },
    qualifiedDirects: { type: Number, required: true, default: 0 },
    directsNeededForNextRank: { type: Number, required: true, default: 0 },
    totalLegsCompleted: { type: Number, required: true, default: 0 },
    legsNeededForNextRank: { type: Number, required: true, default: 0 }
});

const userProgressSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    currentRank: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], default: 'Bronze' },
    globalStatus: { type: globalStatusSchema, required: true },
    silverProgress: { type: rankProgressSchema },
    goldProgress: { type: rankProgressSchema },
    platinumProgress: { type: rankProgressSchema },
    globalPercentageCompleted: { type: Number, required: true, default: 0 },
    globalPercentageLeft: { type: Number, required: true, default: 100 },
    rewardAmount: { type: Number, required: true, default: 0 },
    rewardClaimable: { type: Boolean, required: true, default: false },
    rewardClaimed: { type: Boolean, required: true, default: false },
    nextRank: { type: String, default: null },
    lastUpdateDate: { type: Date, default: Date.now }
}, { timestamps: true, collection: "userprogresses" });

const UserProgressModel = mongoose.model<IUserProgress>("UserProgress", userProgressSchema);
export default UserProgressModel;
