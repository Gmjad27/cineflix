import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("https://backend-f7cf.vercel.app/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || `Welcome to Cineflix, ${name}! Account created.`);
        navigate("/login");
      } else {
        setError(data.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07070a] relative overflow-hidden p-4">
      {/* Dark Ambient Mesh & Glowing Orbs */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(229,9,20,0.18),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1925&q=80')] bg-cover bg-center opacity-[0.06] pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-transparent to-transparent pointer-events-none"></div>

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cine-red/20 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/25 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md px-4 sm:px-6">
        {/* Glass Mirror Card */}
        <div className="glass-modal rounded-3xl p-6 sm:p-10 shadow-glass-lg border border-white/15 relative overflow-hidden">
          {/* Specular Top Glow */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          {/* Logo */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-[0_0_25px_rgba(229,9,20,0.4)]">
              CINE<span className="text-[#E50914]">FLIX</span>
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-2 font-medium">Create your account</p>
          </div>

          <form className="space-y-4 sm:space-y-5" onSubmit={handleSignup}>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Sign Up</h2>

            {error && (
              <div className="bg-red-500/10 border border-red-500/40 text-red-400 px-4 py-2.5 rounded-xl text-sm animate-shake backdrop-blur-md">
                {error}
              </div>
            )}

            <div className="space-y-3.5 sm:space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 glass-input rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-200 text-sm sm:text-base"
              />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 glass-input rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-200 text-sm sm:text-base"
              />
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 glass-input rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-200 text-sm sm:text-base"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 glass-input rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-200 text-sm sm:text-base"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 glass-btn-primary text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-neon-red text-sm sm:text-base flex items-center justify-center cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Account...
                </span>
              ) : (
                "Register"
              )}
            </button>

            {/* Password strength indicator */}
            <div className="text-[11px] sm:text-xs text-gray-400 space-y-1.5 pt-1">
              <p className="flex items-center gap-2">
                <span className={`inline-block w-2.5 h-2.5 rounded-full transition-colors ${password.length >= 6 ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-gray-600'}`}></span>
                <span>Minimum 6 characters</span>
              </p>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-white/[0.08] text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-white hover:text-[#E50914] font-bold transition-colors">
                Sign in now
              </Link>
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-4 leading-relaxed">
              By clicking Register, you agree to our Terms of Use and Privacy Policy.
            </p>
          </div>
        </div>
      </div>

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

export default Signup;