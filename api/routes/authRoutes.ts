// ----IMPORTS---
import express, { Express, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "../prismaClient";


// ----VARIABLES----
const router = express.Router();
const secret: string = process.env.JWT_SECRET || '';


// ----ROUTES----
// create an account
router.post("/signup",  async(req, res) => {
  try{
    const {email, username, password} = req.body;

    console.log("Create account endpoint reached...")

    // check to make sure the user does not exist
    const existingUser = await prisma.user.findUnique({where : {email}});
    if (existingUser) {
        return res.status(400).json({message: "Email already in use"});
    }

    // hash the password
    const hashedPassword = await bcrypt.hash(password,10);

    // create the user
    const newUser = await prisma.user.create({
        data: {
            email,
            username,
            password: hashedPassword,
            role: "user",
        },
    });

    // Generate JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    // return token and user info
    res.status(201).json({
        message: "User created successfully",
        token,
        user: {
            id: newUser.id,
            email: newUser.email,
            username: newUser.username,
        },
    });
  } catch (err){
    console.error("signup error:", err)
    res.status(500).json({message: "Internal server error"});
  }
});

// login and get JWT
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    secret,
    { expiresIn: "24h" }
  );

  res.json({ token });
});

export default router;
