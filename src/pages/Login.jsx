import { onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { useEffect, useState } from "react"
import { auth } from "../config/firebase";
import { useHistory } from "react-router-dom";

export default function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isloading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const location = useHistory();
    function login() {
        setIsLoading(true);
        setErrorMessage("");
        if (email !== "" && password !== "") {
            signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                if (userCredential) {
                    setIsLoading(false);
                    location.push("/dashboard");
                }
            })
            .catch((error) => {
                setIsLoading(false);
                console.error(`Error ${error.code}: ${error.message}`);
                setErrorMessage(`Error ${error.code}: ${error.message}`);
            });
        }
    }

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                location.push("/dashboard");
            }
        });
    });

    function resetPassword() {
        let email = window.prompt("Password reset link will be sent to your email\nEnter email:");
        if (email) {
            sendPasswordResetEmail(auth, email)
            .then(() => {
                alert(`Password reset email sent to ${email}`)
            })
            .catch((error) => {
                console.error(`Error ${error.code}: ${error.message}`);
            });
        }
        else {
            alert("Email is not valid !");
        }
    }

    return (
      <div className="border max-w-lg mx-auto rounded-md p-10 mt-20">
        <form onSubmit={(e) => {
            e.preventDefault();
            login();
        }}>
            <h2 className="text-center text-2xl mb-5">
                Login
            </h2>
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
            {errorMessage && (
                <div className="bg-red-100 text-red-700 px-4 py-3 text-sm rounded-md mb-5">
                    {errorMessage}
                </div>
            )}
            <button
                disabled={isloading}
                className="bg-blue-700 px-3 py-3 rounded-md text-sm text-white me-2 w-full disabled:bg-gray-300 mb-5"
            >
                {isloading ? "Loading..." : "Submit"}
            </button>
            <a className="underline text-sm cursor-pointer" onClick={resetPassword}>
                Forget password
            </a>
        </form>
      </div>
    )
}