
import type { Request, Response } from 'express';
import EmailTemplateModel from '../models/emailTemplate.model.js';
import EmailHistoryModel from '../models/emailHistory.model.js';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER || 'info@growwincapital.com',
        pass: process.env.SMTP_PASS || 'Bittu@2796',
    },
});

export const getTemplates = async (req: Request, res: Response): Promise<void> => {
    try {
        const templates = await EmailTemplateModel.find({ isActive: true });
        res.json(templates);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
        const template = await EmailTemplateModel.create({
            ...req.body,
            createdBy: 'admin'
        });
        res.json(template);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
        const template = await EmailTemplateModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(template);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
        await EmailTemplateModel.findByIdAndUpdate(req.params.id, { isActive: false });
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const history = await EmailHistoryModel.find().sort({ createdAt: -1 });
        res.json(history);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const sendEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { templateId, recipients, subject, htmlContent } = req.body;

        const history = await EmailHistoryModel.create({
            templateId,
            subject,
            recipients,
            status: 'pending',
            sentAt: new Date()
        });

        const promises = recipients.map((to: string) =>
            transporter.sendMail({
                from: '"Growwin Capital" <info@growwincapital.com>',
                to,
                subject,
                html: htmlContent
            })
        );

        await Promise.all(promises);

        history.status = 'sent';
        await history.save();

        res.json({ success: true });
    } catch (error: any) {
        console.error('Email send error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getActiveInvestors = async (req: Request, res: Response): Promise<void> => {
    res.json([]);
};
export const getInactiveInvestors = async (req: Request, res: Response): Promise<void> => {
    res.json([]);
};
export const getAllInvestors = async (req: Request, res: Response): Promise<void> => {
    res.json([]);
};
