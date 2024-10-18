import express from "express";
import {
  createAttribute,
  deleteAttribute,
  getAttribute,
  getAttributeById,
  getAttributeWithValue,
  updateAttribute,
} from "v1/controllers/attribute.controller";

const router = express.Router();

router.post("/", createAttribute);
router.get("/", getAttribute);
router.get("/getAttributeWithValue", getAttributeWithValue);
router.get("/getById/:id", getAttributeById);
router.patch("/updateById/:id", updateAttribute);
router.delete("/deleteById/:id", deleteAttribute);

export default router;
