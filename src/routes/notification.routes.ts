
import express from 'express';
import * as NotificationController from '../controllers/notification.controller.js';

const router = express.Router();

router.post('/send-user-notification', NotificationController.triggerUserNotification);
router.post('/send-broadcast', NotificationController.sendBroadcast);
router.post('/send-special-offer', NotificationController.sendSpecialOffer);

export default router;
