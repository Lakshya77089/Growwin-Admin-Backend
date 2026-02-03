import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const initializeFirebase = (): admin.app.App | null => {
    if (admin.apps.length > 0) return admin.app();

    try {
        let serviceAccount: any;

        // 1. Try environment variable (Best for Vercel/Production)
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            try {
                serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
                console.log('Initializing Firebase from environment variable');
            } catch (err) {
                console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT env var as JSON');
            }
        }

        // 2. Try individual environment variables if the full JSON isn't provided
        if (!serviceAccount && process.env.FIREBASE_PROJECT_ID) {
            serviceAccount = {
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            };
            console.log('Initializing Firebase from individual environment variables');
        }

        // 3. Fallback to file (Best for Local Development)
        if (!serviceAccount) {
            // Try multiple possible paths to find the config file
            const paths = [
                path.resolve(process.cwd(), 'src/config/firebase-service-account.json'),
                path.resolve(process.cwd(), 'dist/config/firebase-service-account.json'),
                path.resolve(__dirname, '../config/firebase-service-account.json'),
                path.resolve(__dirname, '../../src/config/firebase-service-account.json')
            ];

            for (const p of paths) {
                if (fs.existsSync(p)) {
                    serviceAccount = JSON.parse(fs.readFileSync(p, 'utf8'));
                    console.log(`Initializing Firebase from file: ${p}`);
                    break;
                }
            }
        }

        if (serviceAccount) {
            return admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        } else {
            console.warn('Firebase Service Account configuration missing. Notifications may fail.');
            return null;
        }
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        return null;
    }
};

export const getFirestore = (): admin.firestore.Firestore => {
    initializeFirebase();
    return admin.firestore();
};

export const getMessaging = (): admin.messaging.Messaging => {
    initializeFirebase();
    return admin.messaging();
};
