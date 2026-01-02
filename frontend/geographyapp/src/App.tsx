import { useState } from "react";
import "./App.css";
import axios from "axios";
import Cookies from "universal-cookie";

function App() {
  const cookies = new Cookies();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    event.preventDefault();
    try {
      const response = await axios({
        method: "POST",
        url: `http://127.0.0.1:5000/login`,
        data: {
          username: username,
          password: password,
        },
      });
      cookies.set("jwt_authorization", response.data["token"]);
      return response.data;
    } catch (error) {
      console.error("Error logging in", error);
    }
  };

  const handleRegister = async () => {
    event.preventDefault();
    try {
      const response = await axios({
        method: "POST",
        url: `http://localhost:5000/register`,
        data: {
          username: username,
          password: password,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error signing up", error);
    }
  };

  const testRequest = async () => {
    event.preventDefault();
    const jwt_authorization = cookies.get("jwt_authorization");
    const auth_header = "Bearer " + jwt_authorization;
    try {
      const response = await axios({
        method: "POST",
        url: `http://localhost:5000/test`,
        headers: {
          Authorization: auth_header,
        },
        data: {
          username: username,
          password: password,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error signing up", error);
    }
  };

  return (
    <>
      <div className="card">
        <form className="login-form">
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
          <button onClick={() => handleLogin()} className="login-button">
            Login
          </button>
          <button onClick={() => handleRegister()} className="login-button">
            Register
          </button>
          <button onClick={() => testRequest()}>Test Request</button>
        </form>
      </div>
    </>
  );
}

export default App;
