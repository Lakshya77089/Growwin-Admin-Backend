import mongoose, { Schema, Document } from 'mongoose';

export interface IShiftHistory extends Document {
    email: string;
    fromPlan: string;
    toPlan: string;
    amount: string;
    fromInvestId?: mongoose.Types.ObjectId;
    toInvestId?: mongoose.Types.ObjectId;
    createdAt: Date;
    status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
    metadata?: {
        originalAmount?: string;
        remainingAmount?: string;
        transferType?: 'FULL' | 'PARTIAL';
        totalLotsTransferred?: number;
        platinumLotsCreated?: number;
        notes?: string;
        error?: string;
    };
}

const ShiftHistorySchema = new Schema<IShiftHistory>({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    fromPlan: {
        type: String,
        required: true,
        enum: ['BASIC', 'CLASSIC', 'NORMAL', 'CLASSIC_PLUS', 'PLATINUM', 'UNKNOWN']
    },
    toPlan: {
        type: String,
        required: true,
        enum: ['PLATINUM', 'BASIC', 'CLASSIC', 'CLASSIC_PLUS', 'NORMAL']
    },
    amount: {
        type: String,
        required: true,
        default: '0'
    },
    fromInvestId: {
        type: Schema.Types.ObjectId,
        ref: 'Invest'
    },
    toInvestId: {
        type: Schema.Types.ObjectId,
        ref: 'PlatinumInvest'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        required: true,
        enum: ['SUCCESS', 'FAILED', 'PARTIAL'],
        default: 'SUCCESS'
    },
    metadata: {
        type: Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true,
    collection: 'ShiftHistories'
});

// Optimized compound indexes
ShiftHistorySchema.index({ email: 1, createdAt: -1 });
ShiftHistorySchema.index({ status: 1, createdAt: -1 });
ShiftHistorySchema.index({ fromPlan: 1, toPlan: 1, createdAt: -1 });
ShiftHistorySchema.index({ createdAt: -1 });

const ShiftHistoryModel = mongoose.model<IShiftHistory>('ShiftHistory', ShiftHistorySchema);
export default ShiftHistoryModel;
