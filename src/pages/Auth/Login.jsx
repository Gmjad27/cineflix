import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

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
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
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

    // --- NEW: Dedicated Guest Login Handler ---
    const handleGuestLogin = () => {
        // Set dummy credentials so the rest of your app knows a user is active
        localStorage.setItem("token", "guest-token-12345");
        localStorage.setItem("user", JSON.stringify({ 
            name: "Guest User", 
            email: "guest@cineflix.com", 
            role: "guest" 
        }));
        
        navigate("/");
    };

    return (
        <div className="login-page">
            <div className="background-overlay"></div>

            <div className="login-container">
                <div className="logo-area">
                    <h1 className="logo-text">
                        CINE<span className="logo-highlight">FLIX</span>
                    </h1>
                </div>

                <form className="login-form" onSubmit={handleLogin}>
                    <h2>Sign In</h2>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <div className="input-group">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="signin-btn"
                        disabled={loading}
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                    
                    {/* --- FIXED: Added type="button" and attached handler --- */}
                    <button
                        type="button" 
                        className="signin-btn guest-btn" 
                        style={{ marginTop: '10px', backgroundColor: '#333' }} // Optional styling to differentiate it
                        onClick={handleGuestLogin}
                    >
                        GUEST LOGIN
                    </button>

                    <div className="form-help">
                        <div className="remember-me">
                            <input type="checkbox" id="remember" />
                            <label htmlFor="remember">Remember me</label>
                        </div>
                    </div>
                </form>

                <div className="login-footer">
                    <p>
                        New to Cineflix?{" "}
                        <Link to="/signup" className="signup-link">
                            Sign up now
                        </Link>
                    </p>

                    <p className="recaptcha-text">
                        This page is protected by Google reCAPTCHA to ensure
                        you're not a bot.
                        <br />
                        Jadav Girish
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;