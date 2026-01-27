import mongoose from "mongoose";

const subteamSchema = new mongoose.Schema({
    owner: { type: String, required: true },
    member: { type: String, required: true },
    name: { type: String },
    number: { type: String },
    level: { type: Number },
}, { timestamps: true, collection: "SubTeams" });

const SubteamModel = mongoose.model("Subteam", subteamSchema);
export default SubteamModel;
