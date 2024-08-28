
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

        // Create a new document in the 'workouts' collection
        const workoutRef = adminDb.collection('workouts').doc();
        await workoutRef.set({
            userId,
            workoutName,
            exercises,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Workout saved successfully' }),
        };
    } catch (error) {
        console.error('Error saving workout:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `Failed to save workout: ${error.message}` }),
        };
    }
}
