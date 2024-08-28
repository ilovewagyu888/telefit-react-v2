// deleteWorkout.js in /netlify/functions/

import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const app = initializeApp();
const db = getFirestore(app);

export async function handler(event) {
  if (event.httpMethod !== 'DELETE') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { token, workoutId } = JSON.parse(event.body);

    if (!token || !workoutId) {
      return { statusCode: 400, body: 'Missing required fields' };
    }

    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const workoutRef = db.collection('workouts').doc(workoutId);
    const workout = await workoutRef.get();

    if (!workout.exists || workout.data().userId !== userId) {
      return { statusCode: 404, body: 'Workout not found or unauthorized' };
    }

    await workoutRef.delete();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Workout deleted successfully' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Failed to delete workout: ${error.message}` }),
    };
  }
}
