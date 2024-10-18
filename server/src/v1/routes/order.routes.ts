import express from "express";
import { createOrder, getOrder, getOrderById, updateOrder } from "v1/controllers/order.controller";

const router = express.Router();

router.post("/", createOrder);
router.get("/", getOrder);
// router.get("/getProductStock", getProductStock);
router.get("/getById/:id", getOrderById);
router.patch("/updateById/:id", updateOrder);

export default router;
