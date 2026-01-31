import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditLog.controller.js';
import { protect, restrictTo } from '../middleware/rbac.middleware.js';

const router = Router();

router.get('/', protect, restrictTo('Super Admin'), getAuditLogs);

export default router;
