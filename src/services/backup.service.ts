import cron, { type ScheduledTask } from 'node-cron';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import BackupSetting, { type IBackupSetting } from '../models/backupSetting.model.js';
import mongoose from 'mongoose';

export class BackupService {
    private backupDir: string;
    private job: ScheduledTask | null = null;
    private isInitialized: boolean = false;

    constructor() {
        this.backupDir = path.resolve(process.cwd(), 'backups');
        this.init().catch(error => {
            console.error('BackupService initialization failed:', error);
        });
    }

    private async init() {
        try {
            console.log('Initializing BackupService...');

            // Skip directory creation on Vercel
            if (process.env.VERCEL) {
                console.log('Skipping backup directory creation on Vercel');
                this.isInitialized = true;
                return;
            }

            // ensure backup directories exist
            ['manual', 'daily', 'weekly', 'monthly'].forEach(type => {
                const dir = path.join(this.backupDir, type);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                    console.log(`Created backup directory: ${dir}`);
                }
            });

            // Wait for database connection
            await this.waitForDatabase();

            // Load settings from DB
            let setting = await BackupSetting.findOne();
            if (!setting) {
                console.log('Creating default backup settings...');
                setting = new BackupSetting({
                    isEnabled: false,
                    scheduleType: 'daily',
                    time: '02:00', // Default to 2 AM
                    retentionDays: 7
                });
                await setting.save();
                console.log('Default backup settings created');
            }

            if (setting.isEnabled) {
                this.scheduleTask(setting);
            }

            this.isInitialized = true;
            console.log('BackupService initialized successfully');
        } catch (error) {
            console.error('Error initializing BackupService:', error);
            // Retry after 10 seconds
            setTimeout(() => this.init(), 10000);
        }
    }

    private async waitForDatabase(maxRetries: number = 30): Promise<void> {
        for (let i = 0; i < maxRetries; i++) {
            if (mongoose.connection.readyState === 1) {
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        throw new Error('Database connection timeout for BackupService');
    }

    private getCronExpression(type: string, time: string): string {
        const [hour, minute] = time.split(':');
        switch (type) {
            case 'daily': return `${minute} ${hour} * * *`;
            case 'weekly': return `${minute} ${hour} * * 0`;
            case 'monthly': return `${minute} ${hour} 1 * *`;
            default: throw new Error('Invalid schedule type');
        }
    }

    private scheduleTask(setting: IBackupSetting) {
        if (this.job) {
            this.job.stop();
        }

        const expr = this.getCronExpression(setting.scheduleType, setting.time);

        this.job = cron.schedule(expr, async () => {
            console.log(`Running scheduled ${setting.scheduleType} backup...`);
            try {
                await this.performBackup(setting.scheduleType as any);
                await this.cleanupOldBackups(setting.retentionDays);
            } catch (error) {
                console.error(`Scheduled backup failed:`, error);
            }
        });

        console.log(`Backup scheduled: ${setting.scheduleType} at ${setting.time}`);
    }

    public async performBackup(type: 'daily' | 'weekly' | 'monthly' | 'manual'): Promise<string> {
        const dbUser = process.env["DB_USERNAME"] || "";
        const dbPass = process.env["DB_PASSWORD"] || "";
        const dbName = process.env["DB_NAME"] || "MLM";
        const dbUri = `mongodb+srv://${dbUser}:${dbPass}@cluster0.qp9lkym.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;

        const now = new Date();
        const dateStr = now.toISOString().replace(/[:T]/g, '-').split('.')[0] || "unknown";
        const backupPath = path.join(this.backupDir, type, dateStr);

        if (!fs.existsSync(backupPath)) {
            fs.mkdirSync(backupPath, { recursive: true });
        }

        const cmd = `mongodump --uri="${dbUri}" --out="${backupPath}"`;

        return new Promise((resolve, reject) => {
            exec(cmd, async (error, stdout, stderr) => {
                if (error) {
                    console.error(`Backup error: ${stderr}`);
                    return reject(error);
                }

                console.log(`Backup completed: ${backupPath}`);

                // Update last backup date
                await BackupSetting.updateOne({}, { lastBackupDate: new Date() });

                resolve(backupPath);
            });
        });
    }

    private async cleanupOldBackups(retentionDays: number) {
        console.log(`Cleaning up backups older than ${retentionDays} days...`);
        const now = Date.now();
        const threshold = retentionDays * 24 * 60 * 60 * 1000;

        const types = ['daily', 'weekly', 'monthly', 'manual'];
        for (const type of types) {
            const typeDir = path.join(this.backupDir, type);
            if (!fs.existsSync(typeDir)) continue;

            const backups = fs.readdirSync(typeDir);
            for (const backup of backups) {
                const backupPath = path.join(typeDir, backup);
                const stats = fs.statSync(backupPath);
                if (now - stats.mtime.getTime() > threshold) {
                    console.log(`Deleting old backup: ${backupPath}`);
                    fs.rmSync(backupPath, { recursive: true, force: true });
                }
            }
        }
    }

    public async updateSettings(data: Partial<IBackupSetting>) {
        const setting = await BackupSetting.findOne();
        if (!setting) throw new Error('Settings not found');

        Object.assign(setting, data);
        await setting.save();

        if (setting.isEnabled) {
            this.scheduleTask(setting);
        } else if (this.job) {
            this.job.stop();
            this.job = null;
        }

        return setting;
    }

    public async getStatus() {
        return await BackupSetting.findOne();
    }

    public async listBackups() {
        const list: any[] = [];
        const types = ['daily', 'weekly', 'monthly', 'manual'];

        for (const type of types) {
            const typeDir = path.join(this.backupDir, type);
            if (fs.existsSync(typeDir)) {
                const backups = fs.readdirSync(typeDir);
                for (const backup of backups) {
                    const stats = fs.statSync(path.join(typeDir, backup));
                    list.push({
                        name: backup,
                        type: type,
                        created: stats.mtime,
                        path: path.join(type, backup)
                    });
                }
            }
        }

        return list.sort((a, b) => b.created.getTime() - a.created.getTime());
    }
}

export const backupService = new BackupService();
