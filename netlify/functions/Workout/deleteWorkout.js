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
  const { id } = JSON.parse(event.body);

  try {
    await db.collection('workouts').doc(id).delete();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Workout deleted successfully' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to delete workout', details: error.message }),
    };
  }
};
