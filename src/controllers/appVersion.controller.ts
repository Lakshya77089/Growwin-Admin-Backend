
import type { Request, Response } from 'express';
import AppVersionModel from '../models/AppVersion.model.js';
import { createAuditLog } from '../utils/auditLogger.js';

export const createOrUpdateVersion = async (req: any, res: Response): Promise<void> => {
    try {
        const { platform, version, minRequiredVersion, updateUrl, updateMessage, isForceUpdate } = req.body;

        const oldData = await AppVersionModel.findOne({ platform }).lean();
        const result = await AppVersionModel.findOneAndUpdate(
            { platform },
            { platform, version, minRequiredVersion, updateUrl, updateMessage, isForceUpdate },
            { new: true, upsert: true }
        );

        await createAuditLog(req, 'UPDATE', 'AppVersion', `Updated app version for ${platform} to ${version}`, result!._id.toString(), null, undefined, oldData, result);

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getVersions = async (req: Request, res: Response): Promise<void> => {
    try {
        const versions = await AppVersionModel.find();
        res.json({ success: true, data: versions });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getVersionByPlatform = async (req: Request, res: Response): Promise<void> => {
    try {
        const { platform } = req.params;
        const version = await AppVersionModel.findOne({ platform: platform as string });
        if (!version) {
            res.status(404).json({ success: false, message: 'Version not found' });
            return;
        }
        res.json({ success: true, data: version });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
