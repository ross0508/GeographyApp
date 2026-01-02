import { useState } from "react";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simple validation (you can add more complex validation here)
    if (!username || !password) {
      setError("Please fill out both fields");
      return;
    }

    // Clear error if validation is passed
    setError("");

    // Normally, you would send this data to an API or server here
    alert("Logged in successfully!");
  };

  return (
    <>
      <div className="card">
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="username"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          {error && <div className="error">{error}</div>}

          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </>
  );
}

export default App;
