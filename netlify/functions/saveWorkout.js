
import { adminDb } from '../../src/config/firebaseAdmin.js';
import admin from 'firebase-admin';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
    initializeApp({
        credential: admin.credential.cert(adminDb), // Adjust if using service account
    });
}

const db = getFirestore();

export async function handler(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const data = JSON.parse(event.body);
        const { userId, workoutName, exercises } = data;

        if (!userId || !workoutName) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'userId and workoutName are required' }),
            };
        }

        // Create a new workout document
        const workoutRef = db.collection('users').doc(userId).collection('workouts').doc();
        await workoutRef.set({
            name: workoutName,
            exercises: exercises || [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Respond with the workout ID
        return {
            statusCode: 200,
            body: JSON.stringify({ id: workoutRef.id }),
        };

    } catch (error) {
        console.error('Error saving workout:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `Failed to save workout: ${error.message}` }),
        };
    }
}
