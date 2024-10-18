import express from "express";
import {
  addProductCompanyOrder,
  createCompanyOrder,
  getCompanyOrder,
  getCompanyOrderById,
  getOrderByProductId,
  getProductStock,
  getStockByProductId,
  inhouseCompanyOrder,
  updateCompanyOrder,
  updateStatus,
} from "v1/controllers/companyOrder.controller";

const router = express.Router();

router.post("/", createCompanyOrder);
router.post("/inhouseCompanyOrder", inhouseCompanyOrder);
router.get("/", getCompanyOrder);
router.get("/getProductStock", getProductStock);
router.get("/getStockByProductId/:id", getStockByProductId);
router.get("/getOrderByProductId/:id", getOrderByProductId);
router.get("/getById/:id", getCompanyOrderById);
router.patch("/updateById/:id", updateCompanyOrder);
router.patch("/addProductCompanyOrder/:id", addProductCompanyOrder);
router.patch("/updateStatus/:id", updateStatus);

export default router;
