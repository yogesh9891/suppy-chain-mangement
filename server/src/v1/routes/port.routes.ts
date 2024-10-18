import express from "express";
import { createPort, deletePort, getPort, getPortById, updatePort } from "v1/controllers/port.controller";

const router = express.Router();

router.post("/", createPort);
router.get("/", getPort);
router.get("/getById/:id", getPortById);
router.patch("/updateById/:id", updatePort);
router.delete("/deleteById/:id", deletePort);

export default router;
