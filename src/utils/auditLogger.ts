import type { Request } from 'express';
import AuditLogModel from '../models/auditLog.model.js';

export const createAuditLog = async (req: any, action: string, targetModel: string, details: string, targetId?: string, metadata?: any, explicitAdmin?: { id: string, email: string }, oldData?: any, newData?: any) => {
    try {
        let adminId = explicitAdmin?.id || req.user?.id;
        let adminEmail = explicitAdmin?.email || req.user?.email;

        // If it's a security/login action and we don't have an ID, we still want to log it
        if (!adminId && (action === 'SECURITY' || action === 'LOGIN')) {
            adminId = 'UNAUTHENTICATED';
        }

        if (!adminEmail && (action === 'SECURITY' || action === 'LOGIN')) {
            adminEmail = explicitAdmin?.email || 'SYSTEM';
        }

        if (!adminId || !adminEmail) {
            console.warn('Attempted to create audit log without identity:', { action, targetModel, adminEmail });
            return;
        }

        // Improved IP detection
        let ipAddress = req.ip ||
            req.headers['x-forwarded-for'] ||
            req.headers['x-real-ip'] ||
            req.connection.remoteAddress;

        if (Array.isArray(ipAddress)) {
            ipAddress = ipAddress[0];
        }

        const logData: any = {
            adminId,
            adminEmail,
            action,
            targetModel,
            details,
            metadata,
            oldData,
            newData,
            ipAddress,
            userAgent: req.headers['user-agent']
        };

        if (targetId) {
            logData.targetId = targetId;
        }

        await AuditLogModel.create(logData);
    } catch (error) {
        console.error('Failed to create audit log:', error);
    }
};
