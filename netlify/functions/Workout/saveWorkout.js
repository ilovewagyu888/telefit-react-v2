import admin from 'firebase-admin';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!admin.apps.length) {
  initializeApp({
    credential: cert({
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      clientEmail: import.meta.env.VITE_FIREBASE_CLIENT_EMAIL,
      privateKey: import.meta.env.VITE_FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

export const handler = async (event) => {
  const { id, name, exercises } = JSON.parse(event.body);

  try {
    if (id) {
      // Update existing workout
      await db.collection('workouts').doc(id).update({
        name,
        exercises,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Workout updated successfully' }),
      };
    } else {
      // Create new workout
      const docRef = await db.collection('workouts').add({
        name,
        exercises,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Workout created successfully', workoutId: docRef.id }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to save workout', details: error.message }),
    };
  }
};
