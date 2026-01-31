import mongoose, { Document } from "mongoose";

export interface IKYC extends Document {
    email: string;
    address?: string;
    country?: string;
    completionPercentage: number;
    status: "not verified" | "processing" | "verified" | "rejected";
    aadhaarNumber?: string;
    aadhaarFrontImage?: string;
    aadhaarBackImage?: string;
    panNumber?: string;
    panFrontImage?: string;
    panBackImage?: string;
    nationalIdNumber?: string;
    nationalIdFrontImage?: string;
    nationalIdBackImage?: string;
    username?: string;
    dateOfBirth?: Date;
    age?: number;
    createdAt: Date;
    updatedAt: Date;
}

const kycSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    address: { type: String, default: "No Address" },
    country: { type: String, default: "No Country" },
    completionPercentage: { type: Number, default: 50 },
    status: {
        type: String,
        enum: ["not verified", "processing", "verified", "rejected"],
        default: "not verified"
    },
    aadhaarNumber: { type: String },
    aadhaarFrontImage: { type: String },
    aadhaarBackImage: { type: String },
    panNumber: { type: String },
    panFrontImage: { type: String },
    panBackImage: { type: String },
    nationalIdNumber: { type: String },
    nationalIdFrontImage: { type: String },
    nationalIdBackImage: { type: String },
    username: { type: String },
    dateOfBirth: { type: Date },
    age: { type: Number },
}, { timestamps: true, collection: "kycs" });

const KYCModel = mongoose.model<IKYC>("KYC", kycSchema);
export default KYCModel;
