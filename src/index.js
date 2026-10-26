
import express from "express";
import usersRouter from "./routes/users.routes.js";

const app = express();

app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Mount user routes
app.use("/users", usersRouter);

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
