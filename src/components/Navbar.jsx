import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { auth } from "../config/firebase";

export default function Navbar() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const location = useHistory();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        setIsLoggedIn(!!user); // Set to true if user is logged in, false otherwise
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  async function signout() {
    await signOut(auth);
    location.push("/login");
  }

  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <Link to="/" className="text-2xl text-blue-700 font-bold">TeleFit</Link>
      </div>
      {isLoggedIn ? (
        <div className="flex-none">
          <Link 
            to="/settings" 
            className="border border-blue-700 px-3 py-2 rounded-md text-sm text-blue-700 me-2 hover:bg-blue-50"
          >
            Settings
          </Link>
          <button 
            type="button" 
            className="border border-blue-700 px-3 py-2 rounded-md text-sm text-blue-700 me-2 hover:bg-blue-50"
            onClick={signout}
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex-none">
          <Link to="/login" className="bg-blue-700 px-3 py-2 rounded-md text-sm text-white me-2">
            Login
          </Link>
          <Link to="/register" className="bg-blue-100 px-3 py-2 rounded-md text-sm text-black">
            Register
          </Link>
        </div>
      )}
    </div>
  )
}
