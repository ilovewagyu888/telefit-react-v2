import admin from 'firebase-admin';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from '../../src/config/serviceAccountKey.json';

if (!admin.apps.length) {
    initializeApp({
        credential: cert(serviceAccount),
    });
}

const db = getFirestore();

export async function handler(event) {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const userToken = event.headers.authorization?.split('Bearer ')[1];

        if (!userToken) {
            return { statusCode: 401, body: 'Unauthorized: Missing token' };
        }

        const decodedToken = await admin.auth().verifyIdToken(userToken);
        const userId = decodedToken.uid;

        if (!userId) {
            return { statusCode: 400, body: 'User ID required' };
        }

        const foodsSnapshot = await db.collection('users').doc(userId).collection('foods').get();

        if (foodsSnapshot.empty) {
            return {
                statusCode: 200,
                body: JSON.stringify({ success: true, foods: [] }),
            };
        }

        const foods = foodsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, foods }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, error: error.message }),
        };
    }
}
