import mongoose from "mongoose";

const coinValueSchema = new mongoose.Schema({
    currentValue: { type: Number, required: true },
    nextMonthValue: { type: Number, required: true },
    afterNextMonthValue: { type: Number, required: true },
}, { timestamps: true, collection: "coinvalues" });

const CoinValueModel = mongoose.model("CoinValue", coinValueSchema);
export default CoinValueModel;
