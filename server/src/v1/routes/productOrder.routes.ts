import express from "express";
import {
  createProductOrder,
  getProductOrder,
  getProductOrderById,
  getProductStock,
  inhouseProductOrder,
  updateProductOrder,
} from "v1/controllers/productOrder.controller";

const router = express.Router();

router.post("/", createProductOrder);
router.post("/inhouseProductOrder", inhouseProductOrder);
router.get("/", getProductOrder);
router.get("/getProductStock", getProductStock);
router.get("/getById/:id", getProductOrderById);
router.patch("/updateById/:id", updateProductOrder);

export default router;
