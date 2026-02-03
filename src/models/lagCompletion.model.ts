import mongoose, { Document } from "mongoose";

export interface ILagCompletion extends Document {
    ownerEmail: string;
    directEmail: string;
    rank: 'Silver' | 'Gold' | 'Platinum';
    lagVolume: number;
    compositeKey: string;
    completedAt: Date;
}

const lagCompletionSchema = new mongoose.Schema({
    ownerEmail: { type: String, required: true, index: true },
    directEmail: { type: String, required: true },
    rank: { type: String, required: true, enum: ['Silver', 'Gold', 'Platinum'] },
    lagVolume: { type: Number, required: true },
    compositeKey: { type: String, unique: true },
    completedAt: { type: Date, default: Date.now }
}, { timestamps: true, collection: "lagcompletions" });

// Pre-save hook to generate compositeKey
lagCompletionSchema.pre<ILagCompletion>('save', function () {
    this.compositeKey = `${this.ownerEmail}#${this.directEmail}#${this.rank}`;
});

const LagCompletionModel = mongoose.model<ILagCompletion>("LagCompletion", lagCompletionSchema);
export default LagCompletionModel;
