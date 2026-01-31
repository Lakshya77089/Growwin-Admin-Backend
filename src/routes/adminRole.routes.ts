
import express from 'express';
import * as AdminRoleController from '../controllers/adminRole.controller.js';
import { protect, restrictTo } from '../middleware/rbac.middleware.js';

const router = express.Router();

// Match frontend: /api/roles/...
router.use(protect);

// Only Super Admin can manage admin roles
router.get('/', restrictTo('Super Admin'), AdminRoleController.getAllAdminUsers);
router.post('/', restrictTo('Super Admin'), AdminRoleController.createAdminUser);
router.patch('/:id', restrictTo('Super Admin'), AdminRoleController.updateAdminUser);
router.delete('/:id', restrictTo('Super Admin'), AdminRoleController.deleteAdminUser);
router.post('/permissions', AdminRoleController.getUserPermissions);

export default router;
