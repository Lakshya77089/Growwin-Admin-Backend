
import express from 'express';
import multer from 'multer';
import * as PopupController from '../controllers/popup.controller.js';

import os from 'os';
const upload = multer({ dest: process.env.VERCEL ? os.tmpdir() : 'uploads/' });
const router = express.Router();

router.get('/popups', PopupController.getPopups);
router.post('/popups', upload.single('popupImage'), PopupController.createPopup);
router.put('/popups/:id', upload.single('popupImage'), PopupController.updatePopup);
router.delete('/popups/:id', PopupController.deletePopup);
router.patch('/popups/:id/toggle-status', PopupController.togglePopupStatus);
router.get('/popups/image/:id', PopupController.getPopupImage);

export default router;
