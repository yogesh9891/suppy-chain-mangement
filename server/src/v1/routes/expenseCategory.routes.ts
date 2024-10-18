import express from "express";
import { createxpenseCategory, deletexpenseCategory, getxpenseCategory, getxpenseCategoryById, updatexpenseCategory } from "v1/controllers/expenseCategory.controller";

const router = express.Router();

router.post("/", createxpenseCategory);
router.get("/", getxpenseCategory);
router.get("/getById/:id", getxpenseCategoryById);
router.patch("/updateById/:id", updatexpenseCategory);
router.delete("/deleteById/:id", deletexpenseCategory);

export default router;
