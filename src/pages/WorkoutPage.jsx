import { useState } from 'react';
import WorkoutForm from '../components/WorkoutForm';
import WorkoutList from '../components/WorkoutList';

const WorkoutPage = () => {
    const [selectedWorkout, setSelectedWorkout] = useState(null);

    const handleSaveWorkout = async (workout) => {
        try {
            const response = await fetch('/.netlify/functions/saveWorkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(workout),
            });

            if (response.ok) {
                alert('Workout saved successfully!');
                setSelectedWorkout(null);
            } else {
                console.error('Failed to save workout');
            }
        } catch (error) {
            console.error('Error saving workout:', error);
        }
    };

    const handleDeleteWorkout = async () => {
        if (!selectedWorkout) return;

        try {
            const response = await fetch('/.netlify/functions/deleteWorkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: selectedWorkout.id }),
            });

            if (response.ok) {
                alert('Workout deleted successfully!');
                setSelectedWorkout(null);
            } else {
                console.error('Failed to delete workout');
            }
        } catch (error) {
            console.error('Error deleting workout:', error);
        }
    };

    return (
        <div className="min-h-screen bg-base-100 py-8 px-4">
            <div className="max-w-4xl mx-auto bg-base-100 shadow-lg rounded-md p-8 border border-gray-200">
                <h1 className="text-3xl font-bold text-center text-white-800 mb-8">
                    Manage Your Workouts
                </h1>
                <WorkoutList onSelect={setSelectedWorkout} onDelete={handleDeleteWorkout} />
                <WorkoutForm onSave={handleSaveWorkout} existingWorkout={selectedWorkout} />
            </div>
        </div>
    );
};

export default WorkoutPage;
