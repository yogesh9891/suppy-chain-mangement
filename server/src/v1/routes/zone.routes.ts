import express from "express";
import { authorizeJwt } from "middlewares/auth.middleware";
import {
  ZoneAdd,
  ZoneDelete,
  ZoneGet,
  ZoneGetById,
  ZoneUpdate,
} from "v1/controllers/zone.controller";
const router = express.Router();

router.post("/", authorizeJwt, ZoneAdd);
router.get("/", ZoneGet);
router.get("/getById/:id", ZoneGetById);
router.patch("/updateById/:id", authorizeJwt, ZoneUpdate);
router.delete("/deleteById/:id", authorizeJwt, ZoneDelete);

export default router;
