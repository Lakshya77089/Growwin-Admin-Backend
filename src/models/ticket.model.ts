
import mongoose, { Schema, Document } from 'mongoose';

interface Attachment {
    url: string;
    filename: string;
}

export interface ITicket extends Document {
    userId: string;
    userName: string;
    userEmail: string;
    subject: string;
    query: string;
    attachments: Attachment[];
    status: 'open' | 'closed';
    createdAt: Date;
    updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>({
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    subject: { type: String, required: true },
    query: { type: String, required: true },
    attachments: [{ url: String, filename: String }],
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
}, { timestamps: true, collection: "tickets" });

export const TicketModel = mongoose.model<ITicket>('Ticket', TicketSchema);
