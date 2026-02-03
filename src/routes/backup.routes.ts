import { Router } from "express";
import { BackupController } from "../controllers/backup.controller.js";
import { protect, restrictTo } from "../middleware/rbac.middleware.js";

const router = Router();
const backupController = new BackupController();

router.use(protect);
router.use(restrictTo('Super Admin'));

router.get("/status", backupController.getStatus.bind(backupController));
router.get("/list", backupController.listBackups.bind(backupController));
router.post("/settings", backupController.updateSettings.bind(backupController));
router.post("/trigger", backupController.triggerManualBackup.bind(backupController));

// Frontend Specific Aliases
router.post("/toggle", backupController.toggleAutoBackup.bind(backupController));
router.post("/manual", backupController.triggerManualBackup.bind(backupController));
router.post("/schedule", backupController.updateSchedule.bind(backupController));

export default router;
