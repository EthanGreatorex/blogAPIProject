import { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import "./Posts.css";
import PostList from "./PostList";
import type { Post } from "../../src/types/types";

export default function Posts() {
  const [loading, setLoading] = useState(false);
  const [postData, setPostData] = useState<Post[] | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("public");

  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:4000/posts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(response)

      setPostData(response.data);
      setLoading(false);
    } catch (err) {
      console.error("error fetching data:", err);
      navigate("/");
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const handleAddPost = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:4000/posts",
        {
          title,
          content,
          published: visibility === "public",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Post added!");
      setShowModal(false);
      setTitle("");
      setContent("");
      setVisibility("public");
      fetchData();
    } catch (error) {
      console.error("Add post error:", error);
      alert("Failed to add post");
    }
  };

  return (
    <>
      <div
        className="container mt-4 rounded-3 p-4 text-white"
        style={{ backgroundColor: "#212121ff" }}
      >
        <h1 className="text-center">Welcome To Posts!</h1>
        <h5 className="text-center text-white-50">
          Browse through posts made by other users on the platform!
        </h5>
      </div>

      <div className="container mt-5">
        <Button
          className="bg-dark text-white-50"
          onClick={() => setShowModal(true)}
        >
          Add Post
        </Button>
      </div>

      {loading ? <h3>Loading...</h3> : <PostList data={postData} />}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Visibility</Form.Label>
              <Form.Select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="dark" onClick={handleAddPost}>
            Add Post
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
