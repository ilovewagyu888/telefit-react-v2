import { useState } from 'react';
import PropTypes from 'prop-types';

const WorkoutForm = ({ onSave, existingWorkout }) => {
    const [name, setName] = useState(existingWorkout ? existingWorkout.name : '');
    const [exercises, setExercises] = useState(existingWorkout ? existingWorkout.exercises : [{ name: '', reps: '', sets: '' }]);

    const handleExerciseChange = (index, field, value) => {
        const newExercises = exercises.slice();
        newExercises[index][field] = value;
        setExercises(newExercises);
    };

    const addExercise = () => {
        setExercises([...exercises, { name: '', reps: '', sets: '' }]);
    };

    const removeExercise = (index) => {
        const newExercises = exercises.slice();
        newExercises.splice(index, 1);
        setExercises(newExercises);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ name, exercises });
    };

    return (
        <form onSubmit={handleSubmit} className="mt-8">
            <div className="mb-6">
                <label className="block font-bold mb-2">Workout Name:</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
            <h3 className="text-xl font-semibold mb-4 bg-base-100">Exercises:</h3>
            {exercises.map((exercise, index) => (
                <div key={index} className="mb-4 p-4 border rounded bg-base-100">
                    <div className="bg-base-100 mb-2">
                        <input
                            type="text"
                            placeholder="Exercise Name"
                            value={exercise.name}
                            onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                            required
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="flex space-x-4">
                        <input
                            type="number"
                            placeholder="Reps"
                            value={exercise.reps}
                            onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                            required
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                        <input
                            type="number"
                            placeholder="Sets"
                            value={exercise.sets}
                            onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                            required
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => removeExercise(index)}
                        className="mt-2 text-red-500 hover:text-red-700"
                    >
                        Remove Exercise
                    </button>
                </div>
            ))}
            <div className="mb-6">
                <button
                    type="button"
                    onClick={addExercise}
                    className="bg-gray-700 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Add Exercise
                </button>
            </div>
            <div>
                <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Save Workout
                </button>
            </div>
        </form>
    );
};

WorkoutForm.propTypes = {
    onSave: PropTypes.func.isRequired,
    existingWorkout: PropTypes.shape({
        name: PropTypes.string,
        exercises: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string.isRequired,
                reps: PropTypes.string.isRequired,
                sets: PropTypes.string.isRequired,
            })
        ),
    }),
};

export default WorkoutForm;
