
import mongoose, { Document, Schema } from 'mongoose';

export interface IPopup extends Document {
    name: string;
    imageUrl: string;
    isActive: boolean;
    startDate: Date;
    endDate: Date;
    targetUserIds?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const PopupSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        imageUrl: { type: String, required: true },
        isActive: { type: Boolean, default: false },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        targetUserIds: [{ type: String }],
    },
    { timestamps: true, collection: "popups" }
);

export default mongoose.model<IPopup>('Popup', PopupSchema);
