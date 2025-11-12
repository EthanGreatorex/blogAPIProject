// ----IMPORTS----
import express, { Express, Request, Response } from "express";
import "dotenv/config";
import blogPostRouter from "./routes/blogPostRoutes";
import authRouter from "./routes/authRoutes";
import passport from "./passportConfig.ts";
import cors from "cors";

// ----SERVER VARIABLES----

const app: Express = express();
const port = process.env.PORT || 4003;

// ----MIDDLEWARE----
// tell the server we will expect json data
app.use(express.json());

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(passport.initialize());

// any /posts request will be sent to our blogPostRouter handler
app.use("/posts", blogPostRouter);

// any /auth request will be sent to our authRouter handler
app.use("/auth", authRouter);

// ----RUNNING THE SERVER----
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
