// ----IMPORTS----
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router";

// ---CSS----
import "./Home.css";

export default function Home() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  const handleNavigate = useCallback(() => {
    navigate("/posts");
  }, [navigate]);

  // on page load, check to see if the user has a current session
  useEffect(() => {
    if (localStorage.getItem("token")) {
      // redirect the user to the posts page
      handleNavigate();
    }
  }, [handleNavigate]);

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
      handleNavigate();
    } catch (error) {
      console.error("Auth error:", error);
      alert("Authentication failed");
    }
  };

  return (
    <>
      <div className="container text-center bg-dark p-4 mt-4 text-white rounded-2">
        <h1>Welcome to Blogger</h1>
        <button
          className="bg-dark text-white-50 rounded-3 p-2 border-0"
          onClick={() => setShowModal(true)}
        >
          Login/Signup
        </button>
      </div>

      <div className="container text-center p-4 mt-4 text-white rounded-2">
        <button
          className="bg-dark text-white-50 rounded-3 p-2 border-0"
          onClick={handleNavigate}
        >
          View posts
        </button>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton></Modal.Header>
        <Modal.Body>
          <div className="container mt-5 text-black">
            <h2>{isLogin ? "Login" : "Sign Up"}</h2>
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
              <div className="mb-3 text-black">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3 text-black">
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
              className="btn btn-link mt-3 text-black-50"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin
                ? "Need an account? Sign up"
                : "Already have an account? Log in"}
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
