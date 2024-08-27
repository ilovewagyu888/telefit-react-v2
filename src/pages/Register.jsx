import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import { useHistory } from "react-router-dom";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [telegramId, setTelegramId] = useState(null);  // To store the Telegram ID
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const history = useHistory();

    const register = () => {
        setIsLoading(true);
        setErrorMessage("");

        if (email !== "" && password !== "" && confirmPassword !== "") {
            if (password === confirmPassword) {
                createUserWithEmailAndPassword(auth, email, password)
                    .then((userCredential) => {
                        if (userCredential) {
                            console.log("User registered:", userCredential.user);
                            console.log("Telegram ID:", telegramId);  // Use the Telegram ID as needed
                            setIsLoading(false);
                            history.push("/dashboard");
                        }
                    })
                    .catch((error) => {
                        setIsLoading(false);
                        setErrorMessage(`Error ${error.code}: ${error.message}`);
                    });
            } else {
                setIsLoading(false);
                setErrorMessage("Passwords do not match");
            }
        } else {
            setIsLoading(false);
            setErrorMessage("All fields are required");
        }
    };

    useEffect(() => {
        // Telegram widget callback function
        window.TelegramLoginWidgetCallback = function(user) {
            setTelegramId(user.id);  // Capture only the Telegram ID
            console.log("Telegram ID captured:", user.id);
        };

        // Add Telegram widget script dynamically
        const script = document.createElement('script');
        script.src = "https://telegram.org/js/telegram-widget.js?19";
        script.async = true;
        script.setAttribute('data-telegram-login', import.meta.env.VITE_TELEGRAM_BOT_USERNAME);
        script.setAttribute('data-size', 'large');
        script.setAttribute('data-auth-url', '/.netlify/functions/telegramAuth'); // Temporary placeholder URL
        script.setAttribute('data-request-access', 'write');
        script.setAttribute('data-userpic', 'false');

        const telegramLoginDiv = document.getElementById('telegram-login');
        if (telegramLoginDiv) {
            telegramLoginDiv.appendChild(script);
        }
    }, []);

    return (
        <div className="border max-w-lg mx-auto rounded-md p-10 mt-20">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    register();
                }}
            >
                <h2 className="text-center text-2xl mb-5">Register</h2>
                <label htmlFor="email" className="text-sm">Email</label>
                <input
                    type="text"
                    name="email"
                    className="border input-bordered py-2 px-3 rounded-md w-full block mt-1 mb-5"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    required
                />
                <label htmlFor="password" className="text-sm">Password</label>
                <input
                    type="password"
                    name="password"
                    className="border input-bordered py-2 px-3 rounded-md w-full block mt-1 mb-5"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    required
                />
                <label htmlFor="confirm_password" className="text-sm">Confirm Password</label>
                <input
                    type="password"
                    name="confirm_password"
                    className="border input-bordered py-2 px-3 rounded-md w-full block mt-1 mb-5"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    value={confirmPassword}
                    required
                />
                {errorMessage && (
                    <div className="bg-red-100 text-red-700 px-4 py-3 text-sm rounded-md mb-5">
                        {errorMessage}
                    </div>
                )}
                <button
                    disabled={isLoading}
                    className="bg-blue-700 px-3 py-3 rounded-md text-sm text-white me-2 w-full disabled:bg-gray-300"
                >
                    {isLoading ? "Loading..." : "Submit"}
                </button>
            </form>
            <div id="telegram-login" className="mt-5 text-center">
                <h3 className="text-sm mb-2">Or sign up with Telegram</h3>
                {/* The Telegram login button will be inserted here by the script */}
            </div>
        </div>
    );
}
