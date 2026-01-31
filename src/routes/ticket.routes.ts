
import express from 'express';
import multer from 'multer';
import * as TicketController from '../controllers/ticket.controller.js';

const upload = multer({ dest: 'uploads/tickets/' });
const router = express.Router();

// Match frontend: /api/adminTicket/tickets/...
router.get('/tickets/all', TicketController.getAllTickets);
router.get('/tickets/:ticketId/conversation', TicketController.getTicketConversation);
router.post('/tickets/:ticketId/reply', upload.array('attachments'), TicketController.adminReply);
router.post('/tickets/:ticketId/close', TicketController.closeTicket);
router.get('/images/:filename', (req, res) => {
    // Basic image serving for tickets
    const path = require('path');
    const fs = require('fs');
    const fullPath = path.resolve(process.cwd(), 'uploads/tickets', req.params.filename);
    if (fs.existsSync(fullPath)) {
        res.sendFile(fullPath);
    } else {
        res.status(404).send('Image not found');
    }
});

export default router;
