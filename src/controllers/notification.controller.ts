import type { Request, Response } from 'express';
import { getFirestore, getMessaging } from '../utils/firebase.js';
import { createAuditLog } from '../utils/auditLogger.js';
import admin from 'firebase-admin';

const db = getFirestore();
const messaging = getMessaging();

// Validation helper
const validateNotificationPayload = (
    title: string,
    body: string,
    additionalFields: Record<string, any> = {}
): { isValid: boolean; message?: string } => {
    if (!title?.trim()) {
        return { isValid: false, message: 'Title is required' };
    }
    if (!body?.trim()) {
        return { isValid: false, message: 'Body is required' };
    }
    for (const [key, value] of Object.entries(additionalFields)) {
        if (value === undefined || value === null) {
            return { isValid: false, message: `${key} is required` };
        }
    }
    return { isValid: true };
};

const sendFCMNotification = async (message: admin.messaging.Message): Promise<string> => {
    try {
        return await messaging.send(message);
    } catch (error: any) {
        console.error('FCM send error:', error);
        throw new Error(`Failed to send FCM notification: ${error.message}`);
    }
};

export const triggerUserNotification = async (req: any, res: Response): Promise<void> => {
    try {
        const { userId, title, body, type, data = {} } = req.body;

        const validation = validateNotificationPayload(title, body, { userId });
        if (!validation.isValid) {
            res.status(400).json({ success: false, message: validation.message });
            return;
        }

        const message: admin.messaging.Message = {
            data: {
                title,
                body,
                type: type || 'general',
                userId,
                timestamp: new Date().toISOString(),
                payload: JSON.stringify({ type: type || 'general', userId, ...data }),
            },
            topic: userId,
        };

        await sendFCMNotification(message);

        await db.collection('users').doc(userId).collection('notifications').add({
            title,
            body,
            type,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            read: false,
            data,
        });

        await createAuditLog(req, 'CREATE', 'Notification', `Sent targeted notification to user: ${userId}. Title: ${title}`, userId, null, undefined, null, { title, body, type, data });

        res.status(200).json({ success: true, message: 'Notification sent successfully' });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const sendBroadcast = async (req: any, res: Response): Promise<void> => {
    try {
        const { title, body, type = 'broadcast', data = {} } = req.body;

        const validation = validateNotificationPayload(title, body);
        if (!validation.isValid) {
            res.status(400).json({ success: false, message: validation.message });
            return;
        }

        const message: admin.messaging.Message = {
            data: {
                title,
                body,
                type,
                timestamp: new Date().toISOString(),
                payload: JSON.stringify({ type, ...data }),
            },
            topic: 'all_users',
        };

        await sendFCMNotification(message);

        await createAuditLog(req, 'CREATE', 'Notification', `Sent broadcast notification. Title: ${title}`, undefined, null, undefined, null, { title, body, type, data });

        res.status(200).json({ success: true, message: 'Broadcast sent successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const sendSpecialOffer = async (req: any, res: Response): Promise<void> => {
    try {
        const { title, body, offerDetails } = req.body;

        const validation = validateNotificationPayload(title, body, { offerDetails });
        if (!validation.isValid) {
            res.status(400).json({ success: false, message: validation.message });
            return;
        }

        const message: admin.messaging.Message = {
            data: {
                title,
                body,
                type: 'special_offer',
                timestamp: new Date().toISOString(),
                offerId: offerDetails.offerId,
                payload: JSON.stringify({ type: 'special_offer', ...offerDetails }),
            },
            topic: 'all_users',
        };

        await sendFCMNotification(message);

        await db.collection('special_offers').doc(offerDetails.offerId).set({
            title,
            body,
            ...offerDetails,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'active',
        });

        await createAuditLog(req, 'CREATE', 'Notification', `Sent special offer notification. Title: ${title}`, offerDetails.offerId, null, undefined, null, { title, body, offerDetails });

        res.status(200).json({ success: true, message: 'Special offer sent successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
