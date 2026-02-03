import mongoose, { Document } from "mongoose";

export interface IRank extends Document {
    email: string;
    rank: string;
    createdAt: Date;
    updatedAt: Date;
}

const rankSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    rank: { type: String, default: 'Silver' },
}, { timestamps: true, collection: "ranks" });

const RankModel = mongoose.model<IRank>("Rank", rankSchema);
export default RankModel;
