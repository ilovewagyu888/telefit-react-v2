import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../config/firebase"; // Your Firebase client config
import { doc, setDoc } from "firebase/firestore";
import { useHistory } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [telegramId, setTelegramId] = useState(null); // Optional Telegram ID
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const history = useHistory();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://telegram.org/js/telegram-widget.js?19";
    script.async = true;
    script.setAttribute('data-telegram-login', import.meta.env.VITE_TELEGRAM_BOT_USERNAME);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-auth-url', '/.netlify/functions/telegramAuth');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-onauth', 'TelegramLoginWidgetDataOnauth(user)');
    script.setAttribute('data-userpic', 'false');
    document.getElementById('telegram-login').appendChild(script);

    window.TelegramLoginWidgetDataOnauth = async (user) => {
        try {
          // Construct a query string from all user parameters except the hash
          const params = new URLSearchParams(user);
          params.delete('hash'); // The hash will be sent separately for validation
      
          // Add the hash separately for validation
          params.append('hash', user.hash);
      
          // Fetch the response from your Netlify function
          const response = await fetch(`/.netlify/functions/telegramAuth?${params.toString()}`);
          const result = await response.json();
      
          if (response.status === 409) {
            setErrorMessage("This Telegram account is already linked to another user.");
          } else if (response.status === 200 && result.id) {
            setTelegramId(result.id);
            console.log("Telegram ID captured and is unique:", result.id);
          } else {
            setErrorMessage(`Error: ${result.error}`);
          }
        } catch (error) {
          setErrorMessage(`Failed to link Telegram account: ${error.message}`);
        }
      };      

    return () => {
      document.getElementById('telegram-login')?.removeChild(script);
    };
  }, []);

  const register = async () => {
    if (email === "" || password === "" || confirmPassword === "") {
      setErrorMessage("All fields are required");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
          email,
          telegramId: telegramId || "N/A", // Store Telegram ID if provided, else "N/A"
          createdAt: new Date()
        });
        history.push("/dashboard");
      }
    } catch (error) {
      setErrorMessage(`Registration failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border max-w-lg mx-auto rounded-md p-10 mt-20">
      <h2 className="text-center text-2xl mb-5">Register</h2>
      <form onSubmit={(e) => {
        e.preventDefault();
        register();
      }}>
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
        <div id="telegram-login" className="mb-5"></div>
        {telegramId && (
          <div className="text-green-500">Telegram account linked successfully!</div>
        )}
        {errorMessage && (
          <div className="bg-red-100 text-red-700 px-4 py-3 text-sm rounded-md mb-5">
            {errorMessage}
          </div>
        )}
        <button
          disabled={isLoading}
          className="bg-blue-700 px-3 py-3 rounded-md text-sm text-white w-full disabled:bg-gray-300"
        >
          {isLoading ? "Loading..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
