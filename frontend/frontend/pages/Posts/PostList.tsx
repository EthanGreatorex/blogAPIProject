import type { Post } from "../../src/types/types";
import { useState } from "react";
import axios from "axios";
import { Modal, Button, Form, FormGroup } from "react-bootstrap";

type Props = {
  data?: Post[] | null;
};

export default function PostList({ data }: Props) {
  const [show, setShow] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selected, setSelected] = useState("public");
  const [published, setPublished] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
 
  if (!data || data.length === 0) {
    return <p>No posts available.</p>;
  }

  const openEditModal = (post: Post) => {
    setSelectedPost(post);
    setTitle(post.title);
    setContent(post.content);
    setShow(true);
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
      // Optionally refresh or filter out the deleted post from `data`
    } catch (error) {
      console.error("Delete error:", error);
      alert("Not authorised");
    }
  };


  return (
    <>
      <div className="container w-100 text-white">
        <div className="row mt-5">
          {data.map((post) => (
            <div
              key={post.id}
              className="col-lg-12 mb-4 rounded-5 p-4 m-1"
              style={{
                backgroundColor: "#212121ff",
                boxShadow: "10px 10px 0px #171717ff",
              }}
            >
              <h4>{post.title}</h4>
              <p>{post.content}</p>
              <p className="text-white-50">
                Posted by {post.author.username}{" "}
                {new Date(post.createdAt).toLocaleDateString()} {""}Last edited
                on {new Date(post.updatedAt).toLocaleDateString()}
              </p>
              <button
                className="btn text-white-50"
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
    </>
  );
}
