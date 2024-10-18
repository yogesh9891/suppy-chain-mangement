import express from "express";
import { authorizeJwt } from "middlewares/auth.middleware";
import { AreaAdd, AreaDelete, AreaGet, AreaGetById, AreaUpdate } from "v1/controllers/area.controller";
const router = express.Router();

router.post("/", authorizeJwt, AreaAdd);
router.get("/", AreaGet);
router.get("/getById/:id", AreaGetById);
router.patch("/updateById/:id", authorizeJwt, AreaUpdate);
router.delete("/deleteById/:id", authorizeJwt, AreaDelete);

export default router;
