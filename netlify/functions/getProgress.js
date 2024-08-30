import admin from 'firebase-admin';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from '../../src/config/serviceAccountKey.json';

// Initialize Firebase Admin if it hasn't been initialized already
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
        // Extract the token from the Authorization header
        const userToken = event.headers.authorization?.split('Bearer ')[1];

        console.log('Received Token:', userToken); // Debug line

        if (!userToken) {
            return { statusCode: 401, body: 'Unauthorized: Missing token' };
        }

        // Verify the token and decode it
        const decodedToken = await admin.auth().verifyIdToken(userToken);
        const userId = decodedToken.uid;

        console.log('Decoded Token:', decodedToken); // Debug line

        if (!userId) {
            return { statusCode: 400, body: 'User ID required' };
        }

        // Extract date from query parameters
        const { date } = event.queryStringParameters || {};

        if (!date) {
            return { statusCode: 400, body: 'Date parameter is required' };
        }

        // Access the Firestore database and retrieve progress data
        const progressRef = db.collection('users').doc(userId).collection('progress').doc(date);
        const progressDoc = await progressRef.get();

        console.log('Progress Document:', progressDoc.exists, progressDoc.data()); // Debug line

        if (!progressDoc.exists) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    date,
                    workouts: [],
                    caloricIntake: [],
                }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(progressDoc.data()),
        };
    } catch (error) {
        console.error('Error retrieving progress:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, error: error.message }),
        };
    }
}
