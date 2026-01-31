import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
    adminId?: string;
    adminEmail: string;
    action: string; // 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', etc.
    targetModel: string; // 'User', 'Deposit', 'Blog', etc.
    targetId?: string;
    details: string;
    metadata?: any;
    oldData?: any;
    newData?: any;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
    adminId: { type: String, ref: 'User' },
    adminEmail: { type: String, required: true },
    action: { type: String, required: true },
    targetModel: { type: String, required: true },
    targetId: { type: String },
    details: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    oldData: { type: Schema.Types.Mixed },
    newData: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String }
}, { timestamps: true, collection: "auditlogs" });

const AuditLogModel = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export default AuditLogModel;
