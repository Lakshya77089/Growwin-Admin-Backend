import type { Request, Response } from 'express';
import AuditLogModel from '../models/auditLog.model.js';

export const getAuditLogs = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query['page'] as string) || 1;
        const limit = parseInt(req.query['limit'] as string) || 50;
        const skip = (page - 1) * limit;

        const { adminEmail, action, targetModel, search } = req.query;
        let query: any = {};

        if (adminEmail) query.adminEmail = adminEmail;
        if (action) query.action = action;
        if (targetModel) query.targetModel = targetModel;
        if (search) {
            query.$or = [
                { details: { $regex: search, $options: 'i' } },
                { adminEmail: { $regex: search, $options: 'i' } }
            ];
        }

        const logs = await AuditLogModel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await AuditLogModel.countDocuments(query);

        res.status(200).json({
            status: 'success',
            results: logs.length,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            },
            data: { logs }
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
