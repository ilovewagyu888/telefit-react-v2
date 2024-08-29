import { adminDb } from '../../src/config/firebaseAdmin.js';

export async function handler(event) {
    const { workoutId } = JSON.parse(event.body);

    if (!workoutId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Workout ID is required' }),
        };
    }

    try {
        const workoutRef = adminDb.collection('users')
            .doc(event.user.uid)
            .collection('workouts')
            .doc(workoutId);

        await workoutRef.delete();

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true }),
        };
    } catch (error) {
        console.error('Error deleting workout:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to delete workout' }),
        };
    }
}
