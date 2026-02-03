import { type Request, type Response } from 'express';
import { backupService } from '../services/backup.service.js';
import { createAuditLog } from '../utils/auditLogger.js';

export class BackupController {
    async getStatus(req: Request, res: Response) {
        try {
            const status = await backupService.getStatus();
            res.json({ status });
        } catch (error: any) {
            res.status(500).json({ status: "error", message: error.message });
        }
    }

    async updateSettings(req: Request, res: Response) {
        try {
            const settings = await backupService.updateSettings(req.body);
            await createAuditLog(req, 'UPDATE', 'BackupSetting', 'Updated backup settings', undefined);
            res.json({ status: "success", data: settings });
        } catch (error: any) {
            res.status(500).json({ status: "error", message: error.message });
        }
    }

    async triggerManualBackup(req: Request, res: Response) {
        try {
            res.json({ status: "success", message: "Backup initiated in background" });
            backupService.performBackup('manual')
                .then(path => createAuditLog(req, 'CREATE', 'Backup', `Manual backup completed: ${path}`, undefined))
                .catch(err => console.error('Manual backup failed:', err));
        } catch (error: any) {
            res.status(500).json({ status: "error", message: error.message });
        }
    }

    async listBackups(req: Request, res: Response) {
        try {
            const backups = await backupService.listBackups();
            res.json({ status: "success", data: backups });
        } catch (error: any) {
            res.status(500).json({ status: "error", message: error.message });
        }
    }

    async toggleAutoBackup(req: Request, res: Response) {
        try {
            const { enabled } = req.body;
            const settings = await backupService.updateSettings({ isEnabled: enabled });
            await createAuditLog(req, 'UPDATE', 'BackupSetting', `${enabled ? 'Enabled' : 'Disabled'} automatic backups`, undefined);
            res.json({ status: "success", data: settings });
        } catch (error: any) {
            res.status(500).json({ status: "error", message: error.message });
        }
    }

    async updateSchedule(req: Request, res: Response) {
        try {
            const { type, time } = req.body;
            const settings = await backupService.updateSettings({ scheduleType: type, time });
            await createAuditLog(req, 'UPDATE', 'BackupSetting', `Updated backup schedule to ${type} at ${time}`, undefined);
            res.json({ status: "success", data: settings });
        } catch (error: any) {
            res.status(500).json({ status: "error", message: error.message });
        }
    }
}
