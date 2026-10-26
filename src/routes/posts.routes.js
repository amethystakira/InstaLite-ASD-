
import { Router } from "express";

import {
  create,
  list,
  getById,
  update,
  remove,
} from "../controllers/posts.controller.js";

const router = Router();

router.post("/", create);
router.get("/", list);
router.get("/:id", getById);
router.patch("/:id", update);
router.delete("/:id", remove);

export default router;
