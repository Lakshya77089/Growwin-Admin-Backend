import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    number?: string;
    password?: string;
    role: string;
    active: boolean;
    investmentAllowed: boolean;
    refree?: string;
    loginAttempts: number;
    lockUntil?: number;
    twoFactorSecret?: string;
    twoFactorEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    number: { type: String },
    password: { type: String },
    role: { type: String, default: "user" },
    active: { type: Boolean, default: true },
    investmentAllowed: { type: Boolean, default: true },
    refree: { type: String },
    loginAttempts: { type: Number, required: true, default: 0 },
    lockUntil: { type: Number },
    twoFactorSecret: { type: String },
    twoFactorEnabled: { type: Boolean, default: false },
}, { timestamps: true, collection: "Users" });

const UserModel = mongoose.model<IUser>("User", userSchema);
export default UserModel;
