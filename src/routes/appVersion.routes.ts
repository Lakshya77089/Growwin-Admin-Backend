
import express from 'express';
import * as AppVersionController from '../controllers/appVersion.controller.js';

const router = express.Router();

router.post('/versions', AppVersionController.createOrUpdateVersion); // General endpoint
router.get('/versions', AppVersionController.getVersions);
router.get('/getversion/:platform', AppVersionController.getVersionByPlatform); // Match reference pattern likely used by mobile app

export default router;
