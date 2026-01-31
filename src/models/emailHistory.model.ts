
import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailHistory extends Document {
    templateId: mongoose.Types.ObjectId | null;
    subject: string;
    recipients: string[];
    status: 'sent' | 'failed' | 'pending';
    sentAt: Date;
    error?: string;
    messageId?: string;
    createdAt: Date;
}

const EmailHistorySchema: Schema = new Schema({
    templateId: { type: Schema.Types.ObjectId, ref: 'EmailTemplate', default: null },
    subject: { type: String, required: true },
    recipients: [{ type: String, required: true }],
    status: { type: String, enum: ['sent', 'failed', 'pending'], default: 'pending' },
    sentAt: { type: Date },
    error: { type: String },
    messageId: { type: String },
}, { timestamps: true });

export default mongoose.model<IEmailHistory>('EmailHistory', EmailHistorySchema);
