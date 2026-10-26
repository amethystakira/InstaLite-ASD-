
import express from "express";
import usersRouter from "./routes/users.routes.js";
import postsRouter from "./routes/posts.routes.js";

const app = express();

app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Mount routers
app.use("/users", usersRouter);
app.use("/posts", postsRouter);

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
