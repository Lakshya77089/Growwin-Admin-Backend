import { getFirestore, getMessaging } from './firebase.js';
import admin from 'firebase-admin';

const db = getFirestore();
const messaging = getMessaging();

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

        await messaging.send(message);

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
