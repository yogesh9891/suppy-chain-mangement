import express from "express";
import { createSize, deleteSize, getSize, getSizeById, updateSize } from "v1/controllers/size.controller";

const router = express.Router();

router.post("/", createSize);
router.get("/", getSize);
router.get("/getById/:id", getSizeById);
router.patch("/updateById/:id", updateSize);
router.delete("/deleteById/:id", deleteSize);

export default router;
