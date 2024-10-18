import express from "express";
import { authorizeJwt } from "middlewares/auth.middleware";
import {
  BarCodeAdd,
  BarCodeDelete,
  BarCodeGet,
  BarCodeGetById,
  BarCodeUpdate,
  getBarCodeWithProduct,
  getLatesBarCodeInSeries,
} from "v1/controllers/barcode.controller";
const router = express.Router();

router.post("/", authorizeJwt, BarCodeAdd);
router.get("/", BarCodeGet);
router.get("/getBarCodeWithProduct", getBarCodeWithProduct);
router.get("/getById/:id", BarCodeGetById);
router.get("/getLatesBarCodeInSeries", getLatesBarCodeInSeries);
router.patch("/updateById/:id", authorizeJwt, BarCodeUpdate);
router.delete("/deleteById/:id", authorizeJwt, BarCodeDelete);

export default router;
