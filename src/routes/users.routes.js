
import { Router } from "express";
import {
  create,
  list,
  getOne,
  update,
  remove,
  getUserPostsController,
  getUserLikedPostsController,
} from "../controllers/users.controller.js";

const router = Router();

router.post("/", create);
router.get("/", list);
router.get("/:id/posts", getUserPostsController);
router.get("/:id/liked-posts", getUserLikedPostsController);
router.get("/:id", getOne);
router.patch("/:id", update);
router.delete("/:id", remove);

export default router;
