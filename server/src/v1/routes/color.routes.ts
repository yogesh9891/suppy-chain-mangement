import express from "express";
import { createColor, deleteColor, getColor, getColorById, updateColor } from "v1/controllers/color.controller";

const router = express.Router();

router.post("/", createColor);
router.get("/", getColor);
router.get("/getById/:id", getColorById);
router.patch("/updateById/:id", updateColor);
router.delete("/deleteById/:id", deleteColor);

export default router;
