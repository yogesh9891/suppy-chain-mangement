import express from "express";
import {
  createAttributeValue,
  deleteAttributeValue,
  getAttributeValue,
  getAttributeValueById,
  updateAttributeValue,
} from "v1/controllers/attributeValue.controller";

const router = express.Router();

router.post("/", createAttributeValue);
router.get("/", getAttributeValue);
router.get("/getById/:id", getAttributeValueById);
router.patch("/updateById/:id", updateAttributeValue);
router.delete("/deleteById/:id", deleteAttributeValue);

export default router;
