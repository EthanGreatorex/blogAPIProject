// ----IMPORTS----
import express, { Express, Request, Response } from "express";
import passport from "../passportConfig.ts";
import { prisma } from "../prismaClient";

// ----VARIABLES----
const router = express.Router();

// ----POSTS----

// list all published posts
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const posts = await prisma.post.findMany({
        where: { published: true },
        include: { author: { select: { username: true } } },
      });
      res.json(posts);
    } catch (err) {
      res.status(500).json({ message: "Error fetching posts" });
    }
  }
);

// get a single post
router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: { author: { select: { username: true } } },
      });

      if (!post || !post.published) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Error fetching post" });
    }
  }
);

// create a post
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { title, content, published } = req.body;
      const user = req.user as { id: number };

      const newPost = await prisma.post.create({
        data: {
          title,
          content,
          authorId: user.id,
          published: published,
        },
      });

      res.status(201).json(newPost);
    } catch (err) {
      res.status(500).json({ message: "Error creating post" });
    }
  }
);

// edit a post
router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const { title, content, published } = req.body;
      const user = req.user as { id: number };

      const post = await prisma.post.findUnique({ where: { id: postId } });

      if (!post || post.authorId !== user.id) {
        return res
          .status(403)
          .json({ message: "Unauthorised or post not found" });
      }

      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: { title, content, published },
      });

      res.json(updatedPost);
    } catch (error) {
      res.status(500).json({ message: "Error updating post" });
    }
  }
);

// delete a post
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const user = req.user as { id: number };

      const post = await prisma.post.findUnique({ where: { id: postId } });

      if (!post || post.authorId !== user.id) {
        return res
          .status(403)
          .json({ message: "Unauthorised or post not found" });
      }

      await prisma.post.delete({ where: { id: postId } });
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      res.status(500).json({ messag: "Error deleting post" });
    }
  }
);

// ----COMMENTS----

// list comments for a post
router.get("/:id/comments", async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        user: { select: { username: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    res.json(comments);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

// add a comment
router.post(
  "/:id/comments",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const { content } = req.body;
      const user = req.user as { id: number };

      const comment = await prisma.comment.create({
        data: {
          content,
          postId,
          userId: user.id,
        },
      });

      res.status(201).json(comment);
    } catch (err) {
      console.error("Error adding comment", err);
      res.status(500).json({ message: "Failed to add comment" });
    }
  }
);

// edit a comment
router.put(
  "/comments/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const commentId = parseInt(req.params.id);
      const user = req.user as { id: number };
      const { content } = req.body;

      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
      });

      if (!comment || comment.userId !== user.id) {
        res.status(403).json({ message: "Unauthorised or comment not found" });
      }

      const updated = await prisma.comment.update({
        where: { id: commentId },
        data: { content },
      });

      res.json(updated);
    } catch (err) {
      console.error("Error editing comment", err);
      res.status(500).json({ message: "Failed to edit comment" });
    }
  }
);

// delete a comment
router.delete(
  "/comments/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const commentId = parseInt(req.params.id);
      const user = req.user as { id: number };

      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
      });

      if (!comment || comment.userId !== user.id) {
        return res
          .status(403)
          .json({ message: "Unauthorised or comment not found" });
      }

      await prisma.comment.delete({
        where: { id: commentId },
      });

      res.json({ message: "Comment deleted successfully" });
    } catch (err) {
      console.error("Error deleting comments:", err);
      res.status(500).json({ message: "Failed to delete comment" });
    }
  }
);

export default router;
