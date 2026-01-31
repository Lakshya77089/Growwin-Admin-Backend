
import type { Request, Response } from 'express';
import KYCModel from '../models/kyc.model.js';
import UserModel from '../models/user.model.js';
import { createAuditLog } from '../utils/auditLogger.js';
import { sendNotification } from '../utils/notification.util.js';
import path from 'path';
import fs from 'fs';

/**
 * Optimized fetch for KYC requests with pagination and filtering.
 */
export const fetchProcessingKYCRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const search = req.query.search as string;
        const status = req.query.status as string;

        let query: any = {};

        // Frontend search
        if (search) {
            query.email = { $regex: search, $options: 'i' };
        }

        // Frontend status filter (All, processing, verified, rejected)
        if (status && status !== 'All') {
            query.status = status.toLowerCase();
        }

        // Optimization: Use lean() and execute count + find in parallel if possible, 
        // but here we just need them sequential for safety.
        const total = await KYCModel.countDocuments(query);
        const kycRequests = await KYCModel.find(query)
            .sort({ updatedAt: -1 }) // Show latest updates first
            .skip(skip)
            .limit(limit)
            .lean(); // Faster performance for read-only

        res.status(200).json({
            status: 'success',
            data: kycRequests,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        console.error("KYC Fetch error:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const verifyKYC = async (req: any, res: Response): Promise<void> => {
    try {
        const email = req.params['email'] as string;
        const status = req.body['status'] as string;

        if (!['verified', 'rejected'].includes(status)) {
            res.status(400).json({
                status: 'fail',
                message: 'Invalid status. Allowed: verified, rejected',
            });
            return;
        }

        const kycRecord = await KYCModel.findOne({ email: email as any });
        if (!kycRecord) {
            res.status(404).json({ status: 'fail', message: 'KYC record not found' });
            return;
        }

        const user = await UserModel.findOne({ email: email as any });
        if (!user) {
            res.status(404).json({ status: 'fail', message: 'User not found' });
            return;
        }

        const userIdString = user._id.toString();

        if (status === 'verified') {
            kycRecord.status = 'verified';
            kycRecord.completionPercentage = 100;
            await sendNotification(userIdString, "KYC Status", "Your KYC has been approved successfully", "update");
        } else if (status === 'rejected') {
            kycRecord.status = 'rejected';
            kycRecord.completionPercentage = 50;

            // File cleanup logic for rejected KYC
            const filesToDelete = [
                kycRecord.aadhaarFrontImage, kycRecord.aadhaarBackImage,
                kycRecord.panFrontImage, kycRecord.panBackImage,
                kycRecord.nationalIdFrontImage, kycRecord.nationalIdBackImage
            ];

            filesToDelete.forEach(filePath => {
                if (filePath) {
                    const fullPath = path.resolve(process.cwd(), filePath.startsWith('/') ? filePath.slice(1) : filePath);
                    if (fs.existsSync(fullPath)) {
                        fs.unlink(fullPath, (err) => {
                            if (err) console.error(`Error deleting file: ${fullPath}`, err);
                        });
                    }
                }
            });

            // Reset fields on rejection
            kycRecord.aadhaarNumber = '';
            kycRecord.aadhaarFrontImage = '';
            kycRecord.aadhaarBackImage = '';
            kycRecord.panNumber = '';
            kycRecord.panFrontImage = '';
            kycRecord.panBackImage = '';
            kycRecord.nationalIdNumber = '';
            kycRecord.nationalIdFrontImage = '';
            kycRecord.nationalIdBackImage = '';
            kycRecord.address = 'No Address';
            kycRecord.country = 'No Country';

            await sendNotification(userIdString, "KYC Status", "Your KYC has been rejected, please re-submit details again", "update");
        }

        await kycRecord.save();

        await createAuditLog(req, 'UPDATE', 'KYC', `KYC ${status} for user: ${email}`, kycRecord._id.toString());

        res.status(200).json({
            status: 'success',
            data: kycRecord,
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getKycImage = async (req: Request, res: Response): Promise<void> => {
    try {
        const email = req.params['email'] as string;
        const type = req.params['type'] as string;
        const kyc = await KYCModel.findOne({ email: email as any });
        if (!kyc) {
            res.status(404).send('KYC not found');
            return;
        }

        let filePath = '';
        switch (type) {
            case 'aadhaarFront': filePath = kyc.aadhaarFrontImage || ''; break;
            case 'aadhaarBack': filePath = kyc.aadhaarBackImage || ''; break;
            case 'panFront': filePath = kyc.panFrontImage || ''; break;
            case 'panBack': filePath = kyc.panBackImage || ''; break;
            case 'nationalIdFront': filePath = kyc.nationalIdFrontImage || ''; break;
            case 'nationalIdBack': filePath = kyc.nationalIdBackImage || ''; break;
            // Support legacy endpoints if needed
            case 'front': filePath = kyc.aadhaarFrontImage || kyc.nationalIdFrontImage || ''; break;
            case 'back': filePath = kyc.aadhaarBackImage || kyc.nationalIdBackImage || ''; break;
        }

        if (!filePath) {
            res.status(404).send('Image path not found');
            return;
        }

        const fullPath = path.resolve(process.cwd(), filePath.startsWith('/') ? filePath.slice(1) : filePath);
        if (fs.existsSync(fullPath)) {
            res.sendFile(fullPath);
        } else {
            res.status(404).send('File not found');
        }
    } catch (error: any) {
        res.status(500).send(error.message);
    }
};
