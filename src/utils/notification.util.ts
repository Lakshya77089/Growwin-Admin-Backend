
import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.resolve(__dirname, '../config/firebase-service-account.json');

if (admin.apps.length === 0) {
    try {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log('Firebase initialized successfully from util');
    } catch (error) {
        console.error('Error initializing Firebase from util:', error);
    }
}

const db = admin.firestore();

export const sendNotification = async (userId: string, title: string, body: string, type: string = 'general', data: any = {}) => {
    try {
        const message: admin.messaging.Message = {
            data: {
                title,
                body,
                type,
                userId,
                timestamp: new Date().toISOString(),
                payload: JSON.stringify({ type, userId, ...data }),
            },
            topic: userId,
        };

        await admin.messaging().send(message);

        await db.collection('users').doc(userId).collection('notifications').add({
            title,
            body,
            type,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            read: false,
            data,
        });

        return true;
    } catch (error) {
        console.error('Error sending notification:', error);
        return false;
    }
};
