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
  const [showDelete, setShowDelete] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [commentToEdit, setCommentToEdit] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number>();
  const [showEditComment, setShowEditComment] = useState(false);

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

  useEffect(() => {});

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
    if (!commentToEdit) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:4000/posts/comments/${commentToEdit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Comment deleted!");
      setShowComments(false);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Not authorised");
    }
  };

  const handleEdit = async () => {
    if (!selectedPost) return;
    try {
      const published = selected === "private" ? false : true;
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
      setComment("");
    } catch (error) {
      console.error("Add comment error:", error);
      alert("An error occurred whilst adding your comment");
    }
  };

  // submit a request to edit a comment
  const handleEditComment = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:4000/posts/comments/${commentToEdit}`,
        {
          content: comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Comment edited!");
      setShowEditComment(false);
      setShowComments(false);
      setComment("");
    } catch (error) {
      console.error("Edit comment error:", error);
      alert("An error occurred whilst editing your comment");
    }
  };

  return (
    <>
      <div className="container w-100">
        <div className="row mt-5">
          {data.map((post) => (
            <div key={post.id} className="col-lg-6">
              <div className="post-card text-center">
                <img
                  className="post-image"
                  src="https://placehold.co/600x400"
                  alt="600x400 placeholder image"
                />
                <h4 className="mb-4 mt-3">{post.title}</h4>
                <p className="fw-light fs-5">{post.content}</p>
                <p className="post-meta fs-6 fw-light">
                  Posted by{" "}
                  {currentUserId === post.authorId
                    ? "You"
                    : post.author.username}
                  <br />
                  Posted {new Date(post.createdAt).toLocaleDateString()}
                  <br /> Last edited on{" "}
                  {new Date(post.updatedAt).toLocaleDateString()}
                </p>

                {currentUserId === post.authorId && (
                  <>
                    <button
                      className="btn-accent me-2"
                      onClick={() => openEditModal(post)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-accent me-2"
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
                  className="btn-accent"
                  onClick={() => openCommentModal(post)}
                >
                  View comments
                </button>
              </div>
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
                <option value="private">Private</option>
              </Form.Select>
            </FormGroup>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            className="btn-outline-accent"
            onClick={() => setShow(false)}
          >
            Cancel
          </Button>
          <Button className="btn-accent" onClick={handleEdit}>
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
          <Button
            variant="secondary"
            className="btn-outline-accent"
            onClick={() => setShowDelete(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="btn-accent"
            onClick={handleDelete}
          >
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
            <div className="p-2 rounded-3 mb-2 border" key={comment.id ?? idx}>
              <p>{comment.content}</p>
              <p className="muted" style={{ fontSize: "0.9rem" }}>
                commented by {comment.user.username} on{" "}
                {new Date(comment.createdAt).toLocaleDateString()}
              </p>
              {currentUserId === comment.userId ? (
                <>
                  <Button
                    className="btn btn-accent me-2"
                    style={{ fontSize: "12px" }}
                    onClick={() => {
                      setCommentToEdit(comment.id);
                      handleCommentDelete();
                    }}
                  >
                    Delete
                  </Button>
                  <Button
                    className="btn btn-accent"
                    style={{ fontSize: "12px" }}
                    onClick={() => {
                      setCommentToEdit(comment.id);
                      setShowEditComment(true);
                    }}
                  >
                    Edit
                  </Button>
                </>
              ) : (
                ""
              )}
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowComments(false)}>
            Close
          </Button>
          <Button className="btn-accent" onClick={handleAddComment}>
            Add Comment
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditComment} onHide={() => setShowEditComment(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Comment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Edit comment</Form.Label>
              <Form.Control
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            className="btn-outline-accent"
            onClick={() => setShowEditComment(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="btn-accent"
            onClick={handleEditComment}
          >
            Apply changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
