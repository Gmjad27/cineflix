import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("https://backend-f7cf.vercel.app/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("Login successful!");
        navigate("/");
      } else {
        setError(data.message || "Invalid email or password.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    localStorage.setItem("token", "guest-token-12345");
    localStorage.setItem(
      "user",
      JSON.stringify({ name: "Guest User", email: "guest@cineflix.com", role: "guest" })
    );
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden p-4">
      {/* Background overlay and decorative orbs – hidden on small screens */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1925&q=80')] bg-cover bg-center opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
      <div className="absolute inset-0 overflow-hidden hidden sm:block">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4 sm:px-6">
        <div className="bg-black/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-800">
          {/* Logo */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              CINE<span className="text-red-600">FLIX</span>
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-2">Sign in to continue watching</p>
          </div>

          <form className="space-y-5 sm:space-y-6" onSubmit={handleLogin}>
            <h2 className="text-xl sm:text-2xl font-semibold text-white">Sign In</h2>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg text-sm animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-3 sm:space-y-4">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200 text-sm sm:text-base"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200 text-sm sm:text-base"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-red-600/20 text-sm sm:text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing In...
                </span>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-black/80 text-gray-400 text-xs sm:text-sm">or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGuestLogin}
              className="w-full py-2.5 sm:py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] border border-gray-700 text-sm sm:text-base"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Continue as Guest
              </span>
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <label className="flex items-center space-x-2 text-xs sm:text-sm text-gray-400 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 bg-gray-800 border-gray-700 rounded focus:ring-red-500" />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">
                Forgot password?
              </a>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm sm:text-base">
              New to Cineflix?{" "}
              <Link to="/signup" className="text-white hover:text-red-500 font-semibold transition-colors">
                Sign up now
              </Link>
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-4">
              This page is protected by Google reCAPTCHA to ensure you're not a bot.
              <br />
              <span className="text-gray-600">Jadav Girish</span>
            </p>
          </div>
        </div>
      </div>

      {/* Shake animation */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
};

export default Login;