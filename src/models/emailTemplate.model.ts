
import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailTemplate extends Document {
    title: string;
    subject: string;
    htmlContent: string;
    design: any;
    createdBy: mongoose.Types.ObjectId | string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const EmailTemplateSchema = new Schema<IEmailTemplate>({
    title: { type: String, required: true, unique: true, trim: true },
    subject: { type: String, required: true, trim: true },
    htmlContent: { type: String, required: true },
    design: { type: Schema.Types.Mixed, required: true },
    createdBy: { type: Schema.Types.Mixed, required: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IEmailTemplate>('EmailTemplate', EmailTemplateSchema);
