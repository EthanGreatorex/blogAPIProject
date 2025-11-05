import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import "./Posts.css";
import PostList from "./PostList";
import type { Post } from "../../src/types/types";

export default function Posts() {
  const [loading, setLoading] = useState(false);
  const [postData, setPostData] = useState<Post[] | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [currentImage, setCurrentImage] = useState<File | null>(null);
  const [visibility, setVisibility] = useState("public");
  const [search, setSearch] = useState("");
  const [searchPlaceholder, setSearchPlaceholder] = useState(
    "Search for posts or users..."
  );
  const [currentUserId, setCurrentUserId] = useState<number>();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      interface DecodedToken {
        id: number;
      }
      const decoded = jwtDecode<DecodedToken>(token);

      setCurrentUserId(decoded.id);
    }
  }, []);

  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:4000/posts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPostData(response.data);
      setLoading(false);
    } catch (err) {
      console.error("error fetching data:", err);
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // check to see if the user is logged in; they cannot add a post if not logged in
  const authorisePostAction = () => {
    if (localStorage.getItem("token")) {
      // user is logged in
      setShowModal(true);
    } else {
      // user is not logged in
      alert("You must be logged in to make posts!");
    }
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "blogupload");

    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/danu6km5p/image/upload",
      formData
    );
    console.log(response.data.secure_url);
    return response.data.secure_url;
  };

  const handleAddPost = async () => {
    try {
      let imageUrl = "";
      if (currentImage) {
        imageUrl = await uploadImage(currentImage);
      }
      const postTitle = title.trim() === "" ? "Untitled post" : title;
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:4000/posts",
        {
          title: postTitle,
          content,
          imageUrl,
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
      setCurrentImage(null);
      fetchData();
    } catch (error) {
      console.error("Add post error:", error);
      alert("Failed to add post");
    }
  };

  // log the user out by deleting the stored jwt token
  const logoutUser = () => {
    localStorage.removeItem("token");
    alert("You have been successfully logged out!");
    navigate("/");
  };

  // make a new data fetch with the search parameters
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      // if search is empty, just refetch all posts
      if (!q) {
        await fetchData();
        return;
      }

      const response = await axios.get("http://localhost:4000/posts/filtered", {
        params: { q },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      setPostData(response.data);
    } catch (err) {
      console.error("Search error:", err);
      alert("Search failed");
    } finally {
      setLoading(false);
    }
  };

  // this call fetch all posts (public & private) for a user
  const showUserPosts = async () => {
    setSearchPlaceholder("Search through your posts...");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:4000/posts/user/${currentUserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
      setPostData(response.data);
    } catch (err) {
      console.error("Search error:", err);
      alert("Search failed, are you sure you have any posts?");
    } finally {
      setLoading(false);
    }
  };

  const showAllPosts = async () => {
    setSearchPlaceholder("Search for posts or users...");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:4000/posts/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      setPostData(response.data);
    } catch (err) {
      console.error("Search error:", err);
      alert("Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container mt-4 rounded-3 p-4 app-header">
        <h1 className="text-center">Welcome To Posts!</h1>
        <h5 className="text-center muted">
          Browse through posts made by other users on the platform!
        </h5>
      </div>

      {localStorage.getItem("token") ? (
        <div className="container mt-3">
          <Button className="btn-accent" onClick={logoutUser}>
            Log out
          </Button>
        </div>
      ) : (
        <div className="container mt-3">
          <Button className="btn-outline-accent" onClick={() => navigate("/")}>
            Back to Login/Signup
          </Button>
        </div>
      )}

      <div className="container mt-5">
        <Button className="btn-outline-accent me-2" onClick={showAllPosts}>
          View all posts
        </Button>
        {currentUserId ? (
          <Button className="btn-outline-accent me-2" onClick={showUserPosts}>
            View your posts
          </Button>
        ) : (
          ""
        )}

        <Button className="btn-accent" onClick={authorisePostAction}>
          Add Post
        </Button>
      </div>

      <div className="container mt-3">
        <form onSubmit={handleSearch}>
          <input
            type="search"
            className="search-input fs-5 w-100"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
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
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control as="textarea" rows={4} value={content} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files && e.target.files[0];
                  if (file) setCurrentImage(file);
                }}
                accept="image/*"
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
          <Button className="btn-accent" onClick={handleAddPost}>
            Add Post
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
