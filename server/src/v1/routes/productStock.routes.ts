import express from "express";
import { addProductBranch, deleteProductStock, getProductStock, updateProductStock } from "v1/controllers/productStock.controller";

const router = express.Router();

router.post("/", addProductBranch);
router.get("/", getProductStock);
router.patch("/updateById/:id", updateProductStock);
router.delete("/deleteById/:id", deleteProductStock);



export default router;
