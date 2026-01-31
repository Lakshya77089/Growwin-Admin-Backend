import express from 'express';
import * as KYCController from '../controllers/kyc.controller.js';
import { protect, restrictTo } from '../middleware/rbac.middleware.js';

const router = express.Router();
router.use(protect);

router.get('/requests', KYCController.fetchProcessingKYCRequests);
router.get('/processing', KYCController.fetchProcessingKYCRequests); // Alias for frontend
router.patch('/verify/:email', restrictTo('Super Admin', 'Manager'), KYCController.verifyKYC);
router.get('/image/:email/:type', KYCController.getKycImage);
router.get('/panimage/:email/:type', KYCController.getKycImage); // Unified image serving

export default router;
