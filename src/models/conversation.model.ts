
import mongoose, { Schema, Document } from 'mongoose';

interface IMessage {
    sender: 'user' | 'admin';
    message: string;
    attachments?: { url: string; filename: string }[];
    timestamp: Date;
}

export interface IConversation extends Document {
    ticketId: mongoose.Types.ObjectId;
    messages: IMessage[];
    createdAt: Date;
    updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>({
    ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true },
    messages: [{
        sender: { type: String, enum: ['user', 'admin'], required: true },
        message: { type: String, required: true },
        attachments: [{ url: String, filename: String }],
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true, collection: "conversations" });

export const ConversationModel = mongoose.model<IConversation>('Conversation', ConversationSchema);
