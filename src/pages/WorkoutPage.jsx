import { useState, useEffect } from 'react';
import { auth } from '../config/firebase';

export default function WorkoutPage() {
    const [workouts, setWorkouts] = useState([]);
    const [selectedWorkout, setSelectedWorkout] = useState('');
    const [workoutName, setWorkoutName] = useState('');
    const [exercises, setExercises] = useState([]);
    const [newExercise, setNewExercise] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchWorkouts = async () => {
            try {
                const user = auth.currentUser;

                if (!user) {
                    setErrorMessage('User not logged in');
                    return;
                }

                const response = await fetch(`/.netlify/functions/getWorkouts?userId=${user.uid}`);
                const data = await response.json();

                if (response.ok) {
                    setWorkouts(data.workouts);
                    if (data.workouts.length > 0) {
                        setSelectedWorkout(data.workouts[0].id);
                        setExercises(data.workouts[0].exercises || []);
                    }
                } else {
                    setErrorMessage(data.error || 'Failed to fetch workouts');
                }
            } catch (error) {
                setErrorMessage(`Error fetching workouts: ${error.message}`);
            }
        };

        fetchWorkouts();
    }, []);

    const handleWorkoutChange = (e) => {
        const selectedId = e.target.value;
        setSelectedWorkout(selectedId);

        const workout = workouts.find(w => w.id === selectedId);
        if (workout) {
            setExercises(workout.exercises || []);
        } else {
            setExercises([]);
        }
    };

    const handleCreateWorkout = async () => {
        if (!workoutName.trim()) {
            setErrorMessage('Workout name is required');
            return;
        }

        try {
            setIsLoading(true);
            const user = auth.currentUser;

            if (!user) {
                setErrorMessage('User not logged in');
                return;
            }

            const response = await fetch(`/.netlify/functions/saveWorkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.uid,
                    workoutName,
                    exercises: [],
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setWorkouts([...workouts, { id: data.id, name: workoutName, exercises: [] }]);
                setSelectedWorkout(data.id);
                setExercises([]);
                setWorkoutName('');
            } else {
                setErrorMessage(data.error || 'Failed to save workout');
            }
        } catch (error) {
            setErrorMessage(`Error saving workout: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddExercise = async () => {
        if (!newExercise.trim()) {
            setErrorMessage('Exercise name is required');
            return;
        }

        try {
            setIsLoading(true);
            const user = auth.currentUser;

            if (!user) {
                setErrorMessage('User not logged in');
                return;
            }

            const response = await fetch(`/.netlify/functions/saveWorkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.uid,
                    workoutId: selectedWorkout,
                    exercise: newExercise,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setExercises([...exercises, { name: newExercise }]);
                setNewExercise('');
            } else {
                setErrorMessage(data.error || 'Failed to add exercise');
            }
        } catch (error) {
            setErrorMessage(`Error adding exercise: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto rounded-md p-10 mt-20">
            <h1 className="text-center text-2xl mb-5">Your Workouts</h1>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

            <div className="mb-5">
                <label htmlFor="workoutSelect" className="block text-sm mb-2">Select Workout</label>
                <select
                    id="workoutSelect"
                    value={selectedWorkout}
                    onChange={handleWorkoutChange}
                    className="border input-bordered py-2 px-3 rounded-md w-full"
                >
                    {workouts.length > 0 ? (
                        workouts.map(workout => (
                            <option key={workout.id} value={workout.id}>
                                {workout.name}
                            </option>
                        ))
                    ) : (
                        <option value="">No workouts available</option>
                    )}
                </select>
            </div>

            <div className="mb-5">
                <label htmlFor="newWorkout" className="block text-sm mb-2">Create New Workout</label>
                <input
                    type="text"
                    id="newWorkout"
                    value={workoutName}
                    onChange={(e) => setWorkoutName(e.target.value)}
                    className="border input-bordered py-2 px-3 rounded-md w-full"
                    placeholder="Enter workout name"
                />
                <button
                    onClick={handleCreateWorkout}
                    disabled={isLoading}
                    className="bg-blue-700 px-3 py-3 rounded-md text-sm text-white mt-2 w-full"
                >
                    {isLoading ? 'Creating...' : 'Create Workout'}
                </button>
            </div>

            {selectedWorkout && (
                <div>
                    <h2 className="text-xl mb-3">Exercises</h2>
                    {exercises.length > 0 ? (
                        <ul>
                            {exercises.map((exercise, index) => (
                                <li key={index}>{exercise.name}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No exercises added yet.</p>
                    )}

                    <div className="mt-5">
                        <label htmlFor="newExercise" className="block text-sm mb-2">Add Exercise</label>
                        <input
                            type="text"
                            id="newExercise"
                            value={newExercise}
                            onChange={(e) => setNewExercise(e.target.value)}
                            className="border input-bordered py-2 px-3 rounded-md w-full"
                            placeholder="Enter exercise name"
                        />
                        <button
                            onClick={handleAddExercise}
                            disabled={isLoading}
                            className="bg-green-700 px-3 py-3 rounded-md text-sm text-white mt-2 w-full"
                        >
                            {isLoading ? 'Adding...' : 'Add Exercise'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
