
import express from 'express';
import * as MailerController from '../controllers/mailer.controller.js';

const router = express.Router();

router.get('/templates', MailerController.getTemplates);
router.post('/templates', MailerController.createTemplate);
router.put('/templates/:id', MailerController.updateTemplate);
router.delete('/templates/:id', MailerController.deleteTemplate);

router.get('/history', MailerController.getHistory);
router.post('/send', MailerController.sendEmail);

router.get('/active-investors', MailerController.getActiveInvestors);
router.get('/inactive-investors', MailerController.getInactiveInvestors);
router.get('/all-investors', MailerController.getAllInvestors);

export default router;
