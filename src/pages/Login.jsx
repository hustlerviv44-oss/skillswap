import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../firebaseClient";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // ✅ Handle email/password login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem("userEmail", cred.user.email);
      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    }
  };

  // ✅ Handle Google login
  const handleGoogle = async () => {
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      localStorage.setItem("userEmail", result.user.email);
      navigate("/");
    } catch (err) {
      setError(err.message || "Google sign-in failed.");
    }
  };

  return (
    <div className="bg-gray-300 dark:bg-gray-800 font-[Poppins] flex items-center justify-center min-h-screen p-4 sm:p-8 transition-all duration-700">
      <main className="w-full max-w-7xl aspect-[16/9] bg-gradient-to-br from-purple-50 via-pink-50 to-blue-100 dark:from-[#0f0f14] dark:via-purple-950/30 dark:to-blue-950/20 rounded-[1.5rem] shadow-2xl flex flex-col p-8 md:p-12 relative overflow-hidden">
        {/* Soft blur visuals */}
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-purple-200/50 dark:bg-purple-900/40 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-pink-200/50 dark:bg-pink-900/40 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50"></div>

        {/* Header */}
        <header className="flex justify-between items-center text-gray-700 dark:text-gray-200 text-[12px] md:text-sm font-semibold tracking-[0.2em] uppercase z-10">
          <div className="flex items-center gap-x-3">
            <span className="text-lg md:text-xl font-black">SS</span>
            <span>SKILLSWAP</span>
          </div>
        </header>

        {/* Login Card */}
        <section className="flex-grow flex items-center justify-center relative z-10">
          <div className="w-full max-w-sm bg-white/50 dark:bg-black/30 backdrop-blur-lg p-8 rounded-xl shadow-lg border border-gray-200/30 dark:border-gray-700/40">
            <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-2">
              Welcome Back
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm mb-8">
              Login to continue your journey.
            </p>

            {/* Email Login */}
            <form onSubmit={handleEmailLogin} className="space-y-6">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                type="email"
                className="w-full px-4 py-3 bg-white/70 dark:bg-gray-900/40 border-0 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-500 shadow-inner transition-all duration-300"
                required
              />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
                className="w-full px-4 py-3 bg-white/70 dark:bg-gray-900/40 border-0 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-500 shadow-inner transition-all duration-300"
                required
              />
              {error && (
                <p className="text-red-500 text-sm text-center -mt-2">
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="w-full text-white bg-gradient-to-br from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 dark:from-purple-700 dark:to-blue-800 font-semibold py-3 px-4 rounded-lg shadow-md transition-transform hover:scale-[1.02]"
              >
                Log In
              </button>
            </form>

            <div className="mt-5 text-center">
              <a
                href="#"
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-500"
              >
                Forgot Password?
              </a>
            </div>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
              <span className="mx-4 text-xs text-gray-500 dark:text-gray-400">
                OR
              </span>
              <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            </div>

            {/* Google Sign-in */}
            <button
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-x-3 bg-white/90 dark:bg-gray-800/80 text-gray-800 dark:text-gray-100 py-3 px-4 rounded-lg shadow hover:bg-white dark:hover:bg-gray-700 transition-all duration-300"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#4285F4"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l8.35 6.51C12.73 13.72 17.94 9.5 24 9.5z"
                />
                <path
                  fill="#34A853"
                  d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6.02C45.24 39.42 48 32.57 48 24c0-.66-.05-1.32-.15-1.95l-1.02-.5z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.91 28.73c-.28-.84-.44-1.74-.44-2.68s.16-1.84.44-2.68l-8.35-6.51C.73 18.66 0 21.25 0 24s.73 5.34 2.56 7.22l8.35-6.49z"
                />
                <path
                  fill="#EA4335"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.82l-7.73-6.02c-2.11 1.43-4.82 2.26-7.91 2.26-6.06 0-11.27-4.22-13.09-9.98l-8.35 6.51C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              <span className="text-sm font-medium">Sign in with Google</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Login;
