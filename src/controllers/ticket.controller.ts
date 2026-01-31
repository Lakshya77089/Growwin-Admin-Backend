
import type { Request, Response } from 'express';
import { TicketModel } from '../models/ticket.model.js';
import { ConversationModel } from '../models/conversation.model.js';
import mongoose from 'mongoose';
import { createAuditLog } from '../utils/auditLogger.js';

/**
 * Fetch all tickets with pagination and filtering.
 */
export const getAllTickets = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const search = req.query.search as string;
        const status = req.query.status as string;

        let query: any = {};

        // Search by subject or user details
        if (search) {
            query.$or = [
                { subject: { $regex: search, $options: 'i' } },
                { userName: { $regex: search, $options: 'i' } },
                { userEmail: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by status (open, closed)
        if (status && status !== 'all') {
            query.status = status.toLowerCase();
        }

        const total = await TicketModel.countDocuments(query);
        const tickets = await TicketModel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        res.json({
            status: 'success',
            tickets,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        console.error("Ticket Fetch error:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getTicketConversation = async (req: Request, res: Response): Promise<void> => {
    try {
        const ticketId = req.params['ticketId'] as string;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(ticketId)) {
            res.status(400).json({ status: 'error', message: 'Invalid Ticket ID format' });
            return;
        }

        const conversation = await ConversationModel.findOne({
            ticketId: new mongoose.Types.ObjectId(ticketId)
        }).lean();

        res.json({ status: 'success', conversation });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const adminReply = async (req: any, res: Response): Promise<void> => {
    try {
        const ticketId = req.params['ticketId'] as string;
        const message = req.body['message'] as string;

        if (!mongoose.Types.ObjectId.isValid(ticketId)) {
            res.status(400).json({ status: 'error', message: 'Invalid Ticket ID format' });
            return;
        }

        const attachments = req.files ? (req.files as Express.Multer.File[]).map(file => ({
            url: `/uploads/tickets/${file.filename}`,
            filename: file.filename
        })) : [];

        const conversation = await ConversationModel.findOne({
            ticketId: new mongoose.Types.ObjectId(ticketId)
        });

        if (!conversation) {
            res.status(404).json({ status: 'error', message: 'Conversation not found' });
            return;
        }

        const oldData = await ConversationModel.findOne({
            ticketId: new mongoose.Types.ObjectId(ticketId)
        }).lean();

        conversation.messages.push({
            sender: 'admin',
            message,
            attachments,
            timestamp: new Date()
        });
        await conversation.save();

        // Optional: Update ticket's updatedAt timestamp
        await TicketModel.findByIdAndUpdate(ticketId, { updatedAt: new Date() });

        await createAuditLog(req, 'UPDATE', 'Ticket', `Replied to ticket ID: ${ticketId}`, ticketId, null, undefined, oldData, conversation);

        res.json({ status: 'success', message: 'Reply sent' });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const closeTicket = async (req: any, res: Response): Promise<void> => {
    try {
        const ticketId = req.params['ticketId'] as string;

        if (!mongoose.Types.ObjectId.isValid(ticketId)) {
            res.status(400).json({ status: 'error', message: 'Invalid Ticket ID format' });
            return;
        }

        const oldData = await TicketModel.findById(ticketId).lean();
        const updated = await TicketModel.findByIdAndUpdate(ticketId, { status: 'closed' }, { new: true }).lean();
        await createAuditLog(req, 'UPDATE', 'Ticket', `Closed ticket ID: ${ticketId}`, ticketId, null, undefined, oldData, updated);
        res.json({ status: 'success', message: 'Ticket closed' });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
