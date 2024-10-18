import express from "express";
import { authorizeJwt } from "middlewares/auth.middleware";
import {
  PaymentAdd,
  PaymentDelete,
  PaymentGet,
  PaymentGetById,
  PaymentUpdate,
  getPaymentWithProduct,
} from "v1/controllers/payment.controller";
const router = express.Router();

router.post("/", authorizeJwt, PaymentAdd);
router.get("/", PaymentGet);
router.get("/getPaymentWithProduct", getPaymentWithProduct);
router.get("/getById/:id", PaymentGetById);
router.patch("/updateById/:id", authorizeJwt, PaymentUpdate);
router.delete("/deleteById/:id", authorizeJwt, PaymentDelete);

export default router;
