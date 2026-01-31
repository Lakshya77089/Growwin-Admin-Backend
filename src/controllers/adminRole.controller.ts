import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import UserModel from '../models/user.model.js';
import AdminRoleModel from '../models/adminRole.model.js';
import { createAuditLog } from '../utils/auditLogger.js';

export const createAdminUser = async (req: any, res: Response): Promise<void> => {
    try {
        const { email, name, password, role, permissions, number } = req.body;

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            res.status(409).json({ status: 'fail', message: 'Email already exists' });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await UserModel.create({
            email,
            name,
            password: hashedPassword,
            number,
            role: 'admin',
            active: true,
            refree: "wingrow2796@gmail.com"
        });

        // Set default permissions based on role if not provided
        let finalPermissions = permissions;
        if (!finalPermissions || finalPermissions.length === 0) {
            if (role === 'Manager') {
                finalPermissions = ['/', '/users', '/deposit', '/withdraw', '/kyc', '/blogs', '/ticket'];
            } else {
                // Super Admin gets all
                finalPermissions = ['*'];
            }
        }

        const adminRole = await AdminRoleModel.create({
            userId: user._id,
            email,
            name,
            role: role || 'Manager',
            permissions: finalPermissions,
            createdBy: req.user?.name || "SuperAdmin"
        });

        await createAuditLog(req, 'CREATE', 'AdminRole', `Created admin user: ${email} with role: ${role || 'Manager'}`, adminRole._id.toString());

        res.status(201).json({ status: 'success', data: { adminRole } });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getAllAdminUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const adminRoles = await AdminRoleModel.find();
        res.status(200).json({
            status: 'success',
            results: adminRoles.length,
            data: { adminRoles }
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const updateAdminUser = async (req: any, res: Response): Promise<void> => {
    try {
        const { permissions, active, role } = req.body;
        const oldData = await AdminRoleModel.findById(req.params.id).lean();
        const adminRole = await AdminRoleModel.findByIdAndUpdate(
            req.params.id,
            { permissions, active, role },
            { new: true }
        );

        if (!adminRole) {
            res.status(404).json({ status: 'fail', message: 'Admin role not found' });
            return;
        }

        if (typeof active !== 'undefined') {
            await UserModel.findByIdAndUpdate(adminRole.userId, { active });
        }

        await createAuditLog(req, 'UPDATE', 'AdminRole', `Updated admin user permissions: ${adminRole.email}. New role: ${role}, Active: ${active}`, adminRole._id.toString(), null, undefined, oldData, adminRole);

        res.status(200).json({ status: 'success', data: { adminRole } });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const deleteAdminUser = async (req: any, res: Response): Promise<void> => {
    try {
        const adminRole = await AdminRoleModel.findById(req.params.id);
        if (!adminRole) {
            res.status(404).json({ status: 'fail', message: 'Admin role not found' });
            return;
        }

        const oldData = adminRole.toObject();
        await AdminRoleModel.findByIdAndDelete(req.params.id);
        await UserModel.findByIdAndUpdate(adminRole.userId, { role: 'user', active: false });

        await createAuditLog(req, 'DELETE', 'AdminRole', `Deleted admin user role for: ${adminRole.email}`, adminRole._id.toString(), null, undefined, oldData, null);

        res.status(204).json({ status: 'success', data: null });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getUserPermissions = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        const adminRole = await AdminRoleModel.findOne({ email });
        res.status(200).json({
            status: 'success',
            data: {
                permissions: adminRole ? adminRole.permissions : []
            }
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
