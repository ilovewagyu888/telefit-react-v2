import React, { useState } from 'react';

export default function CalorieCalculator() {
    const [image, setImage] = useState(null);
    const [results, setResults] = useState(null);
    const [totalCalories, setTotalCalories] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        setImage(file);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setResults(null);

        const formData = new FormData();
        formData.append('image', image);

        try {
            const response = await fetch('/.netlify/functions/analyze', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to analyze image.');
            }

            const data = await response.json();
            setResults(data.results);
            setTotalCalories(data.totalCalories);
        } catch (error) {
            setError('Error analyzing image.');
            console.error('Error analyzing image:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-base-100 p-8 shadow-md rounded-lg">
                <h1 className="text-2xl font-semibold text-center">Calorie Calculator</h1>
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="flex justify-center">
                        <label className="w-64 flex flex-col items-center px-4 py-6 bg-base-100 rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue-500 hover: text-blue-500 transition-all">
                            <svg className="w-8 h-8" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M16.5 6.6l-4.6 4.6c-.2.2-.4.4-.7.4s-.5-.1-.7-.4L5.5 6.6c-.4-.4-.4-1 0-1.4.4-.4 1-.4 1.4 0l3.8 3.8 3.8-3.8c.4-.4 1-.4 1.4 0s.4 1 0 1.4z" />
                            </svg>
                            <span className="mt-2 text-base leading-normal">Select an image</span>
                            <input type="file" className="hidden" onChange={handleImageUpload} required />
                        </label>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 bg-blue-600  rounded-md font-semibold hover:bg-blue-700 transition-all"
                    >
                        {loading ? "Analyzing..." : "Analyze"}
                    </button>
                </form>

                {error && <p className="mt-4 text-red-500 text-center">{error}</p>}

                {results && (
                    <div id="results" className="mt-8">
                        <h2 className="text-xl font-semibold -900">Calories Information</h2>
                        <table className="mt-4 w-full table-auto border-collapse">
                            <thead>
                                <tr>
                                    <th className="border px-4 py-2 text-left">Ingredient</th>
                                    <th className="border px-4 py-2 text-left">Quantity</th>
                                    <th className="border px-4 py-2 text-left">Calories</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((result, index) => (
                                    <tr key={index}>
                                        <td className="border px-4 py-2">{result.ingredient}</td>
                                        <td className="border px-4 py-2">{result.quantity}</td>
                                        <td className="border px-4 py-2">{result.calories}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="mt-6 text-lg font-semibold -900">
                            Total Calories: <span className="text-blue-600">{totalCalories}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
