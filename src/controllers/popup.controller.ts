
import type { Request, Response } from 'express';
import PopupModel from '../models/popup.model.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createAuditLog } from '../utils/auditLogger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getPopups = async (req: Request, res: Response): Promise<void> => {
    try {
        const popups = await PopupModel.find().sort({ createdAt: -1 });
        res.json({ success: true, data: popups });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createPopup = async (req: any, res: Response): Promise<void> => {
    try {
        const { name, isActive, startDate, endDate, targetUserIds } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

        const targets = targetUserIds ? JSON.parse(targetUserIds) : [];

        const popup = await PopupModel.create({
            name,
            isActive: isActive === 'true',
            startDate,
            endDate,
            imageUrl,
            targetUserIds: targets,
        });
        await createAuditLog(req, 'CREATE', 'Popup', `Created banner popup: ${name}`, popup._id.toString(), null, undefined, null, popup);
        res.json({ success: true, data: popup });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updatePopup = async (req: any, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, isActive, startDate, endDate, targetUserIds } = req.body;

        const updateData: any = {
            name,
            isActive: isActive === 'true',
            startDate,
            endDate,
            targetUserIds: targetUserIds ? JSON.parse(targetUserIds) : [],
        };

        if (typeof req.body.isActive === 'boolean') {
            updateData.isActive = req.body.isActive;
        }

        if (req.file) {
            updateData.imageUrl = `/uploads/${req.file.filename}`;
        }

        const oldData = await PopupModel.findById(id).lean();
        const popup = await PopupModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
        if (!popup) {
            res.status(404).json({ success: false, message: 'Popup not found' });
            return;
        }
        await createAuditLog(req, 'UPDATE', 'Popup', `Updated banner popup: ${name}`, id, null, undefined, oldData, popup);
        res.json({ success: true, data: popup });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deletePopup = async (req: any, res: Response): Promise<void> => {
    try {
        const oldData = await PopupModel.findById(req.params.id).lean();
        if (!oldData) {
            res.status(404).json({ success: false, message: 'Popup not found' });
            return;
        }
        await PopupModel.findByIdAndDelete(req.params.id);
        await createAuditLog(req, 'DELETE', 'Popup', `Deleted banner popup: ${oldData.name}`, req.params.id, null, undefined, oldData, null);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const togglePopupStatus = async (req: any, res: Response): Promise<void> => {
    try {
        const popup = await PopupModel.findById(req.params.id);
        if (popup) {
            const oldData = popup.toObject();
            popup.isActive = !popup.isActive;
            await popup.save();
            await createAuditLog(req, 'UPDATE', 'Popup', `Toggled banner popup status: ${popup.name} to ${popup.isActive ? 'Active' : 'Inactive'}`, popup._id.toString(), null, undefined, oldData, popup);
            res.json({ success: true, data: popup });
        } else {
            res.status(404).json({ success: false, message: 'Popup not found' });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getPopupImage = async (req: Request, res: Response): Promise<void> => {
    try {
        const popup = await PopupModel.findById(req.params.id);
        if (!popup || !popup.imageUrl) {
            res.status(404).send('Image not found');
            return;
        }

        // imageUrl is like /uploads/filename. We need to resolve it to absolute path.
        // Assuming uploads folder is at root of project (one level up from src or same level as src)
        // Adjust logic based on where 'uploads' is.
        // If we are in dist/controllers, uploads might be in root.

        // Remove leading slash to join correctly or handle absolute
        const relativePath = popup.imageUrl.startsWith('/') ? popup.imageUrl.slice(1) : popup.imageUrl;
        // relativePath is uploads/filename

        // Resolve from process.cwd() is usually safest for runtime
        const imagePath = path.resolve(process.cwd(), relativePath);

        if (fs.existsSync(imagePath)) {
            res.sendFile(imagePath);
        } else {
            res.status(404).send('File not found on server');
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
