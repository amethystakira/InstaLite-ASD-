
import { Router } from "express";
import {
  create,
  list,
  getById,
  update,
  remove,
  getPostLikesController,
  unlikePostController,
  likePostController,
} from "../controllers/posts.controller.js";

const router = Router();

router.post("/", create);
router.get("/", list);
router.post("/:id/likes", likePostController);
router.get("/:id/likes", getPostLikesController);
router.delete("/:id/likes/:userId", unlikePostController);
router.get("/:id", getById);
router.patch("/:id", update);
router.delete("/:id", remove);

export default router;
