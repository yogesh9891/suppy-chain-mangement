import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategory,
  getCategoryById,
  getNestedCategory,
  updateCategory,
} from "v1/controllers/category.controller";

const router = express.Router();

router.post("/", createCategory);
router.get("/", getCategory);
router.get("/getNestedCategory", getNestedCategory);
router.get("/getById/:id", getCategoryById);
router.patch("/updateById/:id", updateCategory);
router.delete("/deleteById/:id", deleteCategory);

export default router;
