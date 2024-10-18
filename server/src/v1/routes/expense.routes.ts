import express from "express";
import { authorizeJwt } from "middlewares/auth.middleware";
import {
  ExpenseAdd,
  ExpenseDelete,
  ExpenseGet,
  ExpenseGetById,
  ExpenseUpdate,
} from "v1/controllers/expense.controller";
const router = express.Router();

router.post("/", authorizeJwt, ExpenseAdd);
router.get("/", ExpenseGet);
router.get("/getById/:id", ExpenseGetById);
router.patch("/updateById/:id", authorizeJwt, ExpenseUpdate);
router.delete("/deleteById/:id", authorizeJwt, ExpenseDelete);

export default router;
