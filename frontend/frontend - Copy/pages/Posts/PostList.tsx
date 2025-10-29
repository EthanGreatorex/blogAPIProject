import type { Post, Comment } from "../../src/types/types";
import { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form, FormGroup } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";

type Props = {
  data?: Post[] | null;
};

export default function PostList({ data }: Props) {
  const [show, setShow] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [currentComments, setCurrentComments] = useState<Comment[] | null>(
    null
  );
  const [comment, setComment] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selected, setSelected] = useState("public");
  const [published, setPublished] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
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

  // fetches the comments data for the post the user clicked on
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      setShowComments(false);
    }
    const fetchCommentData = async () => {
      if (showComments && selectedPost !== null) {
        // fetch the comment data
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            `http://localhost:4000/posts/${selectedPost.id}/comments`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log(response.data);
          setCurrentComments(response.data);
        } catch (error) {
          console.error("Update error:", error);
          alert("You must be logged in to view comments!");
        }
      }
    };

    fetchCommentData();
  }, [showComments, selectedPost]);

  if (!data || data.length === 0) {
    return <p>No posts available.</p>;
  }

  const openEditModal = (post: Post) => {
    setSelectedPost(post);
    setTitle(post.title);
    setContent(post.content);
    setShow(true);
  };

  const openCommentModal = (post: Post) => {
    setSelectedPost(post);
    setTitle(post.title);
    setShowComments(true);
  };

  const handleCommentDelete = async () => {
    if (!commentToDelete) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:4000/posts/comments/${commentToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Comment deleted!");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Not authorised");
    }
  };

  const handleEdit = async () => {
    if (!selectedPost) return;
    try {
      if (selected === "private") {
        setPublished(false);
      }
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:4000/posts/${selectedPost.id}`,
        {
          title,
          content,
          published,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Post updated!");
      setShow(false);
    } catch (error) {
      console.error("Update error:", error);
      alert("Not Authorised!");
    }
  };

  const handleDelete = async () => {
    if (!postToDelete) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:4000/posts/${postToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Post deleted!");
      setShowDelete(false);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Not authorised");
    }
  };

  const handleAddComment = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:4000/posts/${selectedPost?.id}/comments`,
        {
          content: comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Comment added!");
      setShowComments(false);
    } catch (error) {
      console.error("Add comment error:", error);
      alert("An error occurred whilst adding your comment");
    }
  };

  return (
    <>
      <div className="container w-100 text-white">
        <div className="row mt-5">
          {data.map((post) => (
            <div
              key={post.id}
              className="col-lg-12 mb-4 rounded-3 p-4 m-1"
              style={{
                backgroundColor: "#212121ff",
                boxShadow: "10px 10px 0px #171717ff",
                textAlign: "center",
              }}
            >
              <img
                src="https://placehold.co/600x400"
                alt="600x400 placeholder image"
              />
              <h4 className="text-center mb-4 mt-3">{post.title}</h4>
              <p className="fw-light fs-5">{post.content}</p>
              <p className="text-white-50 fs-6 fw-light">
                Posted by{" "}
                {currentUserId === post.authorId ? "You" : post.author.username}{" "}
                <br></br>
                Posted {new Date(post.createdAt).toLocaleDateString()}
                <br></br> {""}Last edited on{" "}
                {new Date(post.updatedAt).toLocaleDateString()}
              </p>
              {currentUserId === post.authorId && (
                <>
                  <button
                    className="btn text-white-50 "
                    onClick={() => openEditModal(post)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn text-white-50"
                    onClick={() => {
                      setPostToDelete(post);
                      setShowDelete(true);
                    }}
                  >
                    Delete
                  </button>
                </>
              )}
              <button
                className="btn text-white-50"
                onClick={() => openCommentModal(post)}
              >
                View comments
              </button>
            </div>
          ))}
        </div>
      </div>

      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Post</Modal.Title>
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
            <FormGroup>
              <Form.Label>Visibility</Form.Label>
              <Form.Select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
              >
                <option value="">Public</option>
                <option value="tech">Private</option>
              </Form.Select>
            </FormGroup>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Cancel
          </Button>
          <Button variant="dark" onClick={handleEdit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDelete} onHide={() => setShowDelete(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the post titled "
          <strong>{postToDelete?.title}</strong>"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showComments} onHide={() => setShowComments(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Comments for {title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            {currentComments?.length ?? 0}{" "}
            {currentComments?.length === 1 ? "comment" : "comments"}
          </p>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Add a comment</Form.Label>
              <Form.Control
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </Form.Group>
          </Form>
          {currentComments?.map((comment: Comment, idx: number) => (
            <>
              <div
                className="p-2 rounded-3 text-black mb-2"
                style={{ border: "2px solid black" }}
                key={comment.id ?? idx}
              >
                <p>{comment.content}</p>
                <p style={{ fontSize: "0.9rem" }}>
                  commented by {comment.user.username} on{" "}
                  {new Date(comment.createdAt).toLocaleDateString()}{" "}
                </p>
                {currentUserId === comment.userId ? (
                  <Button
                    className="bg-danger border-0"
                    style={{ fontSize: "12px" }}
                    onClick={() => {
                      setCommentToDelete(comment.id);
                      handleCommentDelete();
                    }}
                  >
                    Delete
                  </Button>
                ) : (
                  ""
                )}
              </div>
            </>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowComments(false)}>
            Close
          </Button>
          <Button variant="dark" onClick={handleAddComment}>
            Add Comment
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
