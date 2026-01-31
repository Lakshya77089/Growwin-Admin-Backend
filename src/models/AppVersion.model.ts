
import mongoose, { Document, Schema } from 'mongoose';

export interface IAppVersion extends Document {
    platform: string;
    version: string;
    minRequiredVersion: string;
    updateUrl: string;
    updateMessage: string;
    isForceUpdate: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const AppVersionSchema: Schema = new Schema(
    {
        platform: { type: String, enum: ['android', 'ios'], required: true },
        version: { type: String, required: true },
        minRequiredVersion: { type: String, required: true },
        updateUrl: { type: String, required: true },
        updateMessage: { type: String, default: 'Please update to the latest version.' },
        isForceUpdate: { type: Boolean, default: false },
    },
    { timestamps: true, collection: "appversions" }
);

AppVersionSchema.index({ platform: 1 }, { unique: true });

export default mongoose.model<IAppVersion>('AppVersion', AppVersionSchema);
