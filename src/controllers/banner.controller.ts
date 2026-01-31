
import type { Request, Response } from 'express';
import BannerModel from '../models/banner.model.js';
import { createAuditLog } from '../utils/auditLogger.js';

export const getBanners = async (req: Request, res: Response): Promise<void> => {
    try {
        const banners = await BannerModel.find();
        res.json({ Banner: banners });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateBanner = async (req: any, res: Response): Promise<void> => {
    try {
        const { type, image } = req.body;
        const oldData = await BannerModel.findOne({ type }).lean();
        const banner = await BannerModel.findOneAndUpdate(
            { type },
            { type, image },
            { new: true, upsert: true }
        );
        await createAuditLog(req, 'UPDATE', 'Banner', `Updated banner for type: ${type}`, banner!._id.toString(), null, undefined, oldData, banner);
        res.json({ success: true, data: banner });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
