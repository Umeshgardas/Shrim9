import React, { useState } from "react";

const AuthForm = ({ onAuthSuccess }) => {
  const [currentForm, setCurrentForm] = useState("login");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onAuthSuccess(data.token, data.user);
      } else {
        setErrorMsg(data.message || "Login failed");
      }
    } catch (error) {
      setErrorMsg("Login request failed. Check if server is running.");
      console.error("Login error:", error);
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerForm),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onAuthSuccess(data.token, data.user);
      } else {
        setErrorMsg(data.message || "Registration failed");
      }
    } catch (error) {
      setErrorMsg("Registration request failed. Check if server is running.");
      console.error("Registration error:", error);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="auth-title">Tailor Shop</h1>
        <p className="auth-subtitle">Management System</p>

        {errorMsg && <div className="error-message">{errorMsg}</div>}

        {currentForm === "login" ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              className="form-input"
              value={loginForm.email}
              onChange={(e) =>
                setLoginForm({ ...loginForm, email: e.target.value })
              }
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="form-input"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm({ ...loginForm, password: e.target.value })
              }
              required
            />
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? "Logging in..." : "Login"}
            </button>
            <p className="auth-switch">
              Don't have an account?{" "}
              <button
                type="button"
                className="auth-link"
                onClick={() => setCurrentForm("register")}
              >
                Register
              </button>
            </p>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Full Name"
              className="form-input"
              value={registerForm.name}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, name: e.target.value })
              }
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="form-input"
              value={registerForm.email}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, email: e.target.value })
              }
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="form-input"
              value={registerForm.password}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, password: e.target.value })
              }
              required
            />
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? "Registering..." : "Register"}
            </button>
            <p className="auth-switch">
              Already have an account?{" "}
              <button
                type="button"
                className="auth-link"
                onClick={() => setCurrentForm("login")}
              >
                Login
              </button>
            </p>
          </form>
        )}

        {/* Debug info */}
        {/* <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '5px', fontSize: '12px' }}>
          <strong>Debug Info:</strong><br />
          Login Endpoint: {API_URL}/api/auth/login<br />
          Register Endpoint: {API_URL}/api/auth/register
        </div> */}
      </div>
    </div>
  );
};

export default AuthForm;
