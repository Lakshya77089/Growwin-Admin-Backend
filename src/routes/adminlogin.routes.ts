import { Router } from 'express';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { Secret, SignOptions } from 'jsonwebtoken';
import UserModel from '../models/user.model.js';
import AdminImpersonationLog from '../models/adminImpersonationLog.model.js';

import { protect, restrictTo } from '../middleware/rbac.middleware.js';

const router = Router();

router.post('/impersonate', protect, restrictTo('Super Admin', 'Manager'), async (req: any, res: Response) => {
    try {
        const { email } = req.body;
        const admin = req.user; // Use req.user from protect middleware

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const secret: Secret = process.env['ADMIN_IMPERSONATION_SECRET'] || 'default-impersonation-secret';
        const expire = process.env['ADMIN_IMPERSONATION_EXPIRE'] || '1h';

        const signOptions: SignOptions = {
            expiresIn: expire as any
        };

        const impersonationToken = jwt.sign(
            {
                type: "impersonation",
                adminId: admin.id,
                userId: user._id.toString(),
                email: user.email
            },
            secret,
            signOptions
        );

        // Save audit log
        try {
            await AdminImpersonationLog.create({
                adminId: admin.id,
                userId: user._id.toString(),
                userEmail: user.email,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });
        } catch (logError) {
            console.error("Failed to save impersonation log:", logError);
        }

        const clientAppUrl = process.env['CLIENT_APP_URL'] || 'https://liveaccounttesting.growwincapital.com';

        res.json({
            success: true,
            redirectUrl: `${clientAppUrl}/admin-login?token=${impersonationToken}`
        });

    } catch (error) {
        console.error("Impersonation error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
