import express from "express";
import {
  createContainer,
  createWareHouse,
  getContainer,
  getContainerById,
  getWareHouseStock,
  getWareHouseStockSlogs,
  updateContainer,
  updateStatus,
} from "v1/controllers/container.controller";

const router = express.Router();

router.post("/", createContainer);
router.post("/warehouse", createWareHouse);
router.get("/", getContainer);
router.get("/getWareHouseStock", getWareHouseStock);
router.get("/getById/:id", getContainerById);
router.get("/getWareHouseStocklogs", getWareHouseStockSlogs);
router.patch("/updateById/:id", updateContainer);
router.patch("/updateStatus/:id", updateStatus);

export default router;
