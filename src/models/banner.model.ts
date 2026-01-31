
import mongoose, { Document, Schema } from 'mongoose';

export interface IBanner extends Document {
    type: string;
    image: string;
    createdAt: Date;
    updatedAt: Date;
}

const BannerSchema: Schema = new Schema(
    {
        type: { type: String, required: true },
        image: { type: String, required: true },
    },
    { timestamps: true, collection: "banners" }
);

export default mongoose.model<IBanner>('Banner', BannerSchema);
