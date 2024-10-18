import express from "express";
import { createBrand, deleteBrand, getBrand, getBrandById, updateBrand } from "v1/controllers/brand.controller";

const router = express.Router();

router.post("/", createBrand);
router.get("/", getBrand);
router.get("/getById/:id", getBrandById);
router.patch("/updateById/:id", updateBrand);
router.delete("/deleteById/:id", deleteBrand);

export default router;
