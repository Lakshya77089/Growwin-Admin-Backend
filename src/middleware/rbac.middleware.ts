import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import AdminRoleModel from '../models/adminRole.model.js';

export const protect = async (req: any, res: Response, next: NextFunction) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token || token === 'undefined' || token === 'null') {
            return res.status(401).json({
                status: 'fail',
                message: 'Not logged in',
                debug: { hasHeader: !!req.headers.authorization, tokenValue: token }
            });
        }

        const secret = process.env['JWT_SECRET'] || 'growwin-dashboard-secret-key-2024';
        const decoded: any = jwt.verify(token, secret);

        req.user = decoded;
        next();
    } catch (error: any) {
        console.error("JWT Verification Error:", error.message);
        res.status(401).json({ status: 'fail', message: 'Invalid token', error: error.message });
    }
};

export const restrictTo = (...allowedRoles: string[]) => {
    return async (req: any, res: Response, next: NextFunction) => {
        try {
            const user = req.user;
            if (!user || (!allowedRoles.includes(user.role) && user.role !== 'Super Admin')) {
                return res.status(403).json({
                    status: 'fail',
                    message: 'You do not have permission to perform this action'
                });
            }
            next();
        } catch (error) {
            res.status(500).json({ status: 'error', message: 'Authorization error' });
        }
    };
};
