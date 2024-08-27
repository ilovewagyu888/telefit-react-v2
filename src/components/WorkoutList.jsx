import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const WorkoutList = ({ onSelect, onDelete }) => {
    const [workouts, setWorkouts] = useState([]);

    useEffect(() => {
        const fetchWorkouts = async () => {
            try {
                const response = await fetch('/.netlify/functions/getWorkouts');
                const data = await response.json();
                setWorkouts(data.workouts);
            } catch (error) {
                console.error('Error fetching workouts:', error);
            }
        };

        fetchWorkouts();
    }, []);

    const handleSelectChange = (e) => {
        const selectedWorkoutId = e.target.value;
        const selectedWorkout = workouts.find(workout => workout.id === selectedWorkoutId);
        onSelect(selectedWorkout);
    };

    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Select a Workout:</h2>
            <select
                onChange={handleSelectChange}
                defaultValue=""
                className="w-full p-2 border rounded shadow focus:outline-none focus:shadow-outline"
            >
                <option value="" disabled>--Select a Workout--</option>
                {workouts.map((workout) => (
                    <option key={workout.id} value={workout.id}>
                        {workout.name}
                    </option>
                ))}
            </select>
            <button
                onClick={onDelete}
                disabled={!workouts.length}
                className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-300"
            >
                Delete Selected Workout
            </button>
        </div>
    );
};

WorkoutList.propTypes = {
    onSelect: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default WorkoutList;
