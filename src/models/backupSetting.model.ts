import mongoose, { Document, Schema } from 'mongoose';

export interface IBackupSetting extends Document {
    scheduleType: 'daily' | 'weekly' | 'monthly';
    time: string; // 'HH:mm'
    isEnabled: boolean;
    retentionDays: number;
    lastBackupDate?: Date;
    nextBackupDate?: Date;
}

const BackupSettingSchema = new Schema<IBackupSetting>({
    scheduleType: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
    time: { type: String, default: '00:00' },
    isEnabled: { type: Boolean, default: false },
    retentionDays: { type: Number, default: 7 }, // Keep backups for 7 days by default
    lastBackupDate: { type: Date },
    nextBackupDate: { type: Date },
}, { timestamps: true, collection: 'BackupSettings' });

export default mongoose.model<IBackupSetting>('BackupSetting', BackupSettingSchema);
