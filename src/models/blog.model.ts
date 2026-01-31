
import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
    title: string;
    slug: string;
    author: string;
    excerpt: string;
    image: string;
    category: string;
    readTime: string;
    content: any[];
    status: 'draft' | 'published';
    rating?: number;
    commentCount?: number;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const BlogSchema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    author: { type: String, required: true },
    excerpt: { type: String },
    image: { type: String }, // Featured image
    category: { type: String },
    readTime: { type: String },
    content: { type: Schema.Types.Mixed }, // Array of blocks
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    rating: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    tags: [{ type: String }],
    publishedAt: { type: Date }
}, { timestamps: true, collection: 'blogs' });

// Automated slug generation index
BlogSchema.index({ title: 'text', excerpt: 'text', tags: 'text' });

const BlogModel = mongoose.model<IBlog>('Blog', BlogSchema);
export default BlogModel;
