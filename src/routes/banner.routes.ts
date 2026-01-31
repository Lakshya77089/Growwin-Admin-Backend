
import express from 'express';
import * as BannerController from '../controllers/banner.controller.js';

const router = express.Router();

router.get('/getBannerall', BannerController.getBanners);
router.post('/updateBanner', BannerController.updateBanner);

export default router;
