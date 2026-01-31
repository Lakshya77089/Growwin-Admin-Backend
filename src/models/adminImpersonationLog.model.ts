import mongoose from 'mongoose';

const adminImpersonationLogSchema = new mongoose.Schema({
    adminId: { type: String, required: true },
    userId: { type: String, required: true },
    userEmail: { type: String, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const AdminImpersonationLog = mongoose.model('AdminImpersonationLog', adminImpersonationLogSchema);
export default AdminImpersonationLog;
