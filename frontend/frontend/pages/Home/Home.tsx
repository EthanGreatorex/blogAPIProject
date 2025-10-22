// ----IMPORTS----
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";

// ---CSS----
import './Home.css'

export default function Home() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isLogin ? "/auth/login" : "/auth/signup";

    try {
      const response = await axios.post(`http://localhost:4000${endpoint}`, {
        email,
        password,
        ...(isLogin ? {} : { username }),
      });

      const { token } = response.data;
      localStorage.setItem("token", token);
      // naviagte the user to /posts
      navigate("/posts")
    } catch (error) {
      console.error("Auth error:", error);
      alert("Authentication failed");
    }
  };

  return (
    <>
      <div className="container text-center bg-dark p-4 mt-4 text-white rounded-2">
        <h1>Welcome to Blogger</h1>
      </div>
      <div className="container mt-5 text-white">
        <h2 >{isLogin ? "Login" : "Sign Up"}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-3">
              <label>Username</label>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}
          <div className="mb-3 text-white">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3 text-white">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-dark">
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>
        <button
          className="btn btn-link mt-3 text-white-50"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin
            ? "Need an account? Sign up"
            : "Already have an account? Log in"}
        </button>
      </div>
    </>
  );
}
