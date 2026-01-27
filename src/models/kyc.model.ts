import mongoose from "mongoose";

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
}, { timestamps: true, collection: "Kycs" });

const KYCModel = mongoose.model("KYC", kycSchema);
export default KYCModel;
