
import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminRole extends Document {
    userId: mongoose.Types.ObjectId;
    email: string;
    name: string;
    role: 'Super Admin' | 'Manager';
    permissions: string[];
    active: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

const AdminRoleSchema = new Schema<IAdminRole>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: {
        type: String,
        enum: ['Super Admin', 'Manager'],
        default: 'Manager'
    },
    permissions: { type: [String], default: [] },
    active: { type: Boolean, default: true },
    createdBy: { type: String, default: '' }
}, { timestamps: true, collection: "adminroles" });

const AdminRoleModel = mongoose.model<IAdminRole>('AdminRole', AdminRoleSchema);
export default AdminRoleModel;
